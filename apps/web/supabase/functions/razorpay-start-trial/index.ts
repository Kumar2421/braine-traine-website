// Razorpay Start Trial Edge Function
// Starts a trial period for a subscription

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

    const { plan_key, trial_days } = await req.json()

    if (!plan_key || !trial_days) {
      return new Response(
        JSON.stringify({ error: 'Missing plan_key or trial_days' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has an active trial
    const { data: existingTrial } = await supabase
      .from('trials')
      .select('*')
      .eq('user_id', user.id)
      .eq('converted', false)
      .eq('canceled', false)
      .gt('trial_end', new Date().toISOString())
      .maybeSingle()

    if (existingTrial) {
      return new Response(
        JSON.stringify({ error: 'You already have an active trial' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get plan
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

    // Calculate trial dates
    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + trial_days)

    // Create trial subscription (status: trialing)
    const periodEnd = new Date(trialEnd)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // After trial, start monthly billing

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: plan_key,
        status: 'trialing',
        billing_interval: 'monthly',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        next_billing_at: periodEnd.toISOString(),
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
      })
      .select()
      .single()

    if (subError) {
      throw subError
    }

    // Create trial record
    const { data: trial, error: trialError } = await supabase
      .from('trials')
      .insert({
        user_id: user.id,
        subscription_id: subscription.subscription_id,
        plan_type: plan_key,
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        trial_days: trial_days,
      })
      .select()
      .single()

    if (trialError) {
      throw trialError
    }

    return new Response(
      JSON.stringify({
        success: true,
        trial: trial,
        subscription: subscription,
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
    console.error('Error starting trial:', error)
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

