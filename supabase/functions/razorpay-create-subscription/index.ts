// Razorpay Create Recurring Subscription Edge Function
// Creates a recurring subscription with optional trial period and coupon

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { plan_key, billing_interval, coupon_code, trial_days } = await req.json()

    if (!plan_key || !billing_interval) {
      return new Response(
        JSON.stringify({ error: 'Missing plan_key or billing_interval' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get pricing plan
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

    // Get price in paise
    const pricePaise = billing_interval === 'yearly' 
      ? plan.price_yearly 
      : plan.price_monthly

    if (!pricePaise || pricePaise === 0) {
      return new Response(
        JSON.stringify({ error: 'Plan not available for this billing interval' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate and apply coupon if provided
    let finalAmount = pricePaise
    let discountAmount = 0
    let couponId = null

    if (coupon_code) {
      const { data: couponValid } = await supabase.rpc('is_coupon_valid', {
        coupon_code: coupon_code,
        user_id: user.id,
        plan_key: plan_key,
        amount_paise: pricePaise
      })

      if (couponValid) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', coupon_code)
          .single()

        if (coupon) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.floor((pricePaise * coupon.discount_value) / 100)
          } else {
            discountAmount = coupon.discount_value
          }
          discountAmount = Math.min(discountAmount, pricePaise)
          finalAmount = pricePaise - discountAmount
          couponId = coupon.coupon_id
        }
      }
    }

    // Get or create Razorpay customer
    let razorpayCustomerId: string | null = null

    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('razorpay_customer_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (existingSubscription?.razorpay_customer_id) {
      razorpayCustomerId = existingSubscription.razorpay_customer_id
    } else {
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

    // Create Razorpay plan if not exists
    const planId = billing_interval === 'yearly'
      ? plan.razorpay_plan_id_yearly
      : plan.razorpay_plan_id_monthly

    let razorpayPlanId = planId

    if (!razorpayPlanId) {
      // Create plan in Razorpay
      const planResponse = await fetch('https://api.razorpay.com/v1/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        },
        body: JSON.stringify({
          period: billing_interval === 'yearly' ? 'yearly' : 'monthly',
          interval: 1,
          item: {
            name: `${plan.plan_name} - ${billing_interval === 'yearly' ? 'Annual' : 'Monthly'}`,
            amount: finalAmount,
            currency: 'INR',
            description: plan.description,
          },
        }),
      })

      if (!planResponse.ok) {
        const errorData = await planResponse.json()
        throw new Error(errorData.error?.description || 'Failed to create plan')
      }

      const planData = await planResponse.json()
      razorpayPlanId = planData.id

      // Update pricing_plans table
      if (billing_interval === 'yearly') {
        await supabase
          .from('pricing_plans')
          .update({ razorpay_plan_id_yearly: razorpayPlanId })
          .eq('plan_key', plan_key)
      } else {
        await supabase
          .from('pricing_plans')
          .update({ razorpay_plan_id_monthly: razorpayPlanId })
          .eq('plan_key', plan_key)
      }
    }

    // Calculate trial dates if trial_days > 0
    const now = new Date()
    let trialStart: Date | null = null
    let trialEnd: Date | null = null
    let startAt: Date = now

    if (trial_days && trial_days > 0) {
      trialStart = now
      trialEnd = new Date(now)
      trialEnd.setDate(trialEnd.getDate() + trial_days)
      startAt = trialEnd
    }

    // Create Razorpay subscription
    const subscriptionPayload: any = {
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: billing_interval === 'yearly' ? 1 : 12, // For yearly, 1 payment; monthly, 12 payments
      start_at: Math.floor(startAt.getTime() / 1000),
      notes: {
        user_id: user.id,
        plan_key: plan_key,
        billing_interval: billing_interval,
      },
    }

    if (trial_days && trial_days > 0) {
      subscriptionPayload.start_at = Math.floor(trialEnd!.getTime() / 1000)
      subscriptionPayload.customer_notify = 0 // Don't notify during trial
    }

    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify(subscriptionPayload),
    })

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json()
      throw new Error(errorData.error?.description || 'Failed to create subscription')
    }

    const razorpaySubscription = await subscriptionResponse.json()

    // Calculate period end
    const periodEnd = new Date(startAt)
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
        razorpay_subscription_id: razorpaySubscription.id,
        razorpay_customer_id: razorpayCustomerId,
        razorpay_plan_id: razorpayPlanId,
        plan_type: plan_key,
        status: trial_days && trial_days > 0 ? 'trialing' : 'active',
        billing_interval: billing_interval,
        current_period_start: startAt.toISOString(),
        current_period_end: periodEnd.toISOString(),
        next_billing_at: periodEnd.toISOString(),
        trial_start: trialStart?.toISOString() || null,
        trial_end: trialEnd?.toISOString() || null,
      })
      .select()
      .single()

    if (subError) {
      console.error('Error creating subscription:', subError)
      throw subError
    }

    // Create trial record if applicable
    if (trial_days && trial_days > 0 && trialStart && trialEnd) {
      await supabase.from('trials').insert({
        user_id: user.id,
        subscription_id: subscription.subscription_id,
        plan_type: plan_key,
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        trial_days: trial_days,
      })
    }

    // Record coupon usage if applicable
    if (couponId && discountAmount > 0) {
      await supabase.from('coupon_usage').insert({
        coupon_id: couponId,
        user_id: user.id,
        subscription_id: subscription.subscription_id,
        discount_amount: discountAmount,
      })

      // Update coupon used count
      await supabase.rpc('increment_coupon_usage', { coupon_id: couponId })
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: subscription,
        checkout_url: razorpaySubscription.short_url || null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error creating subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

