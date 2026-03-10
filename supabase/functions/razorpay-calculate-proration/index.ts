// Razorpay Calculate Proration Edge Function
// Calculates prorated amount for plan changes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscription_id', subscription_id)
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get current and new plan prices
    const { data: currentPlan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_key', subscription.plan_type)
      .single()

    const { data: newPlan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_key', new_plan_key)
      .single()

    if (!currentPlan || !newPlan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const currentPrice = subscription.billing_interval === 'yearly'
      ? currentPlan.price_yearly
      : currentPlan.price_monthly

    const newPrice = subscription.billing_interval === 'yearly'
      ? newPlan.price_yearly
      : newPlan.price_monthly

    // Calculate proration
    const now = new Date()
    const periodStart = new Date(subscription.current_period_start)
    const periodEnd = new Date(subscription.current_period_end)
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const daysUsed = totalDays - daysRemaining

    const unusedAmount = Math.floor((currentPrice * daysRemaining) / totalDays)
    const proratedAmount = Math.max(0, newPrice - unusedAmount)

    const breakdown = {
      currentPlan: subscription.plan_type,
      newPlan: new_plan_key,
      currentPrice,
      newPrice,
      totalDays,
      daysUsed,
      daysRemaining,
      unusedAmount,
      proratedAmount,
      isUpgrade: newPrice > currentPrice,
      isDowngrade: newPrice < currentPrice,
    }

    return new Response(
      JSON.stringify({
        success: true,
        prorated_amount: proratedAmount,
        breakdown: breakdown,
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
    console.error('Error calculating proration:', error)
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

