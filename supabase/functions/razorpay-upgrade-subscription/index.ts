// Razorpay Upgrade Subscription Edge Function
// Upgrades subscription with prorated billing

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

    const { subscription_id, new_plan_key } = await req.json()

    if (!subscription_id || !new_plan_key) {
      return new Response(
        JSON.stringify({ error: 'Missing subscription_id or new_plan_key' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscription_id', subscription_id)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get new plan
    const { data: newPlan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_key', new_plan_key)
      .single()

    if (!newPlan) {
      return new Response(
        JSON.stringify({ error: 'Invalid new plan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calculate prorated amount
    const now = new Date()
    const periodStart = new Date(subscription.current_period_start)
    const periodEnd = new Date(subscription.current_period_end)
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))

    const currentPrice = subscription.billing_interval === 'yearly'
      ? (await supabase.from('pricing_plans').select('price_yearly').eq('plan_key', subscription.plan_type).single()).data?.price_yearly || 0
      : (await supabase.from('pricing_plans').select('price_monthly').eq('plan_key', subscription.plan_type).single()).data?.price_monthly || 0

    const newPrice = subscription.billing_interval === 'yearly'
      ? newPlan.price_yearly
      : newPlan.price_monthly

    const unusedAmount = Math.floor((currentPrice * daysRemaining) / totalDays)
    const proratedAmount = Math.max(0, newPrice - unusedAmount)

    // Update Razorpay subscription if exists
    if (subscription.razorpay_subscription_id) {
      const newPlanId = subscription.billing_interval === 'yearly'
        ? newPlan.razorpay_plan_id_yearly
        : newPlan.razorpay_plan_id_monthly

      if (newPlanId) {
        const updateResponse = await fetch(
          `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
            },
            body: JSON.stringify({
              plan_id: newPlanId,
            }),
          }
        )

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json()
          throw new Error(errorData.error?.description || 'Failed to update subscription')
        }
      }
    }

    // Update subscription in database
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_type: new_plan_key,
        razorpay_plan_id: subscription.billing_interval === 'yearly'
          ? newPlan.razorpay_plan_id_yearly
          : newPlan.razorpay_plan_id_monthly,
        upgrade_from_plan: subscription.plan_type,
        change_type: 'upgrade',
        prorated_amount: proratedAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscription_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Create billing record for prorated charge if needed
    if (proratedAmount > 0) {
      await supabase.from('billing_history').insert({
        user_id: user.id,
        subscription_id: subscription_id,
        amount: proratedAmount,
        currency: 'INR',
        status: 'pending',
        description: `Prorated upgrade from ${subscription.plan_type} to ${new_plan_key}`,
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: updatedSubscription,
        prorated_amount: proratedAmount,
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
    console.error('Error upgrading subscription:', error)
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

