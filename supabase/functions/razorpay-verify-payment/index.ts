// Razorpay Verify Payment Edge Function
// Verifies payment and creates subscription
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
import { verifyPaymentSchema } from '../_shared/validation-schemas.ts'

const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Verify Razorpay signature using HMAC SHA256
async function verifySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
  const text = `${orderId}|${paymentId}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(razorpayKeySecret)
  const messageData = encoder.encode(text)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData)
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return expectedSignature === signature
}

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Rate limiting (5 requests per minute for payment verification)
    const userId = await getUserIdForRateLimit(req, supabase)
    const rateLimitResult = await rateLimit(userId, 5, 60000)
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
    const validation = validateRequest(body, verifyPaymentSchema)
    if (!validation.valid) {
      return errorResponse(validation.error || 'Invalid request parameters', 400)
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_key, billing_interval } = validation.data!

    // Verify payment with Razorpay
    const verifyResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
    })

    if (!verifyResponse.ok) {
      throw new Error('Payment verification failed')
    }

    const payment = await verifyResponse.json()

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return new Response(
        JSON.stringify({ error: 'Payment not successful' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify signature
    const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_key', plan_key)
      .single()

    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calculate subscription period
    const now = new Date()
    const periodEnd = new Date(now)
    if (billing_interval === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // Create subscription in database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        plan_type: plan_key,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single()

    if (subError) {
      console.error('Error creating subscription:', subError)
      throw subError
    }

    // Create billing history record
    await supabase.from('billing_history').insert({
      user_id: user.id,
      subscription_id: subscription.subscription_id,
      razorpay_payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      amount: payment.amount,
      currency: payment.currency || 'INR',
      status: 'paid',
      description: `${plan.plan_name} - ${billing_interval} subscription`,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      paid_at: new Date().toISOString(),
    })

    return successResponse({
      success: true,
      subscription: subscription,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    // Don't expose internal error details
    return errorResponse('Payment verification failed. Please contact support.', 500)
  }
})
