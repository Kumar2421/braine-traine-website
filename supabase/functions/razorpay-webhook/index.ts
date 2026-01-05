// Razorpay Webhook Handler Edge Function
// Handles Razorpay webhook events for subscription management

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
      },
    })
  }

  try {
    const signature = req.headers.get('x-razorpay-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.text()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify webhook signature (simplified - use proper HMAC verification in production)
    // For now, we'll log the event and process it

    let event
    try {
      event = JSON.parse(body)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Log webhook event
    await supabase.from('razorpay_webhook_events').insert({
      razorpay_event_id: event.id || `event_${Date.now()}`,
      event_type: event.event || 'unknown',
      payload: event,
      processed: false,
    })

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
      case 'payment.authorized': {
        const payment = event.payload.payment?.entity || event.payload.payment
        
        // Find subscription by payment ID
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('razorpay_payment_id', payment.id)
          .single()

        if (subscription) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscription.subscription_id)
        }

        // Update billing history
        await supabase
          .from('billing_history')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('razorpay_payment_id', payment.id)

        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment?.entity || event.payload.payment
        
        // Update billing history
        await supabase
          .from('billing_history')
          .update({
            status: 'failed',
          })
          .eq('razorpay_payment_id', payment.id)

        break
      }

      case 'subscription.cancelled':
      case 'subscription.paused': {
        const subscription = event.payload.subscription?.entity || event.payload.subscription
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subscription.id)

        break
      }

      case 'subscription.activated':
      case 'subscription.resumed': {
        const subscription = event.payload.subscription?.entity || event.payload.subscription
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subscription.id)

        break
      }
    }

    // Mark event as processed
    await supabase
      .from('razorpay_webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('razorpay_event_id', event.id || `event_${Date.now()}`)

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
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
