// Razorpay Cancel Subscription Edge Function
// Cancels a subscription at period end

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

    const { subscription_id } = await req.json()

    if (!subscription_id) {
      return new Response(
        JSON.stringify({ error: 'Missing subscription_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get subscription
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

    // If Razorpay subscription exists, cancel it
    if (subscription.razorpay_subscription_id) {
      const cancelResponse = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
          },
        }
      )

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json()
        throw new Error(errorData.error?.description || 'Failed to cancel subscription')
      }
    }

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscription_id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period',
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
    console.error('Error canceling subscription:', error)
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
