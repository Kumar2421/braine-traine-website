// Razorpay Create Order Edge Function
// Creates a Razorpay order for subscription payment
// Includes rate limiting and request validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  rateLimit, 
  validateRequest, 
  sanitizeObject, 
  getUserIdForRateLimit,
  errorResponse,
  successResponse,
  corsHeaders 
} from '../_shared/security.ts'
import { createOrderSchema } from '../_shared/validation-schemas.ts'

const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401)
    }

    // Verify user
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Rate limiting (10 requests per minute per user)
    const userId = await getUserIdForRateLimit(req, supabase)
    const rateLimitResult = await rateLimit(userId, 10, 60000)
    if (!rateLimitResult.allowed) {
      return errorResponse(rateLimitResult.error || 'Rate limit exceeded', 429)
    }

    // Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    // Sanitize input
    body = sanitizeObject(body)

    // Validate request schema
    const validation = validateRequest(body, createOrderSchema)
    if (!validation.valid) {
      return errorResponse(validation.error || 'Invalid request parameters', 400)
    }

    const { plan_key, billing_interval } = validation.data!

    // Get pricing plan from database
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_key', plan_key)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get price in paise (Razorpay uses paise, 1 rupee = 100 paise)
    const pricePaise = billing_interval === 'yearly' 
      ? plan.price_yearly 
      : plan.price_monthly

    if (!pricePaise || pricePaise === 0) {
      return new Response(
        JSON.stringify({ error: 'Plan not available for this billing interval' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get or create Razorpay customer
    let razorpayCustomerId: string | null = null

    // Check if user has existing Razorpay customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('razorpay_customer_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (existingSubscription?.razorpay_customer_id) {
      razorpayCustomerId = existingSubscription.razorpay_customer_id
    } else {
      // Create Razorpay customer via API
      const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        },
        body: JSON.stringify({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
          email: user.email,
          contact: user.user_metadata?.phone || '',
          notes: {
            supabase_user_id: user.id,
          },
        }),
      })

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        throw new Error(errorData.error?.description || 'Failed to create customer')
      }

      const customerData = await customerResponse.json()
      razorpayCustomerId = customerData.id
    }

    // Create Razorpay order
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify({
        amount: pricePaise, // Amount in paise
        currency: 'INR',
        receipt: `order_${user.id}_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan_key: plan_key,
          billing_interval: billing_interval,
          customer_id: razorpayCustomerId,
        },
      }),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      throw new Error(errorData.error?.description || 'Failed to create order')
    }

    const orderData = await orderResponse.json()

    return successResponse({
      order_id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      key_id: razorpayKeyId,
      customer_id: razorpayCustomerId,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    // Don't expose internal error details in production
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return errorResponse('Failed to create payment order. Please try again.', 500)
  }
})
