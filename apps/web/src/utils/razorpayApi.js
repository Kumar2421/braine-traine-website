import { supabase } from '../supabaseClient'

/**
 * Razorpay Payment Integration API
 * Handles subscription management, checkout, and billing for India
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Create order for subscription payment
 */
export async function createRazorpayOrder(planKey, billingInterval = 'monthly') {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in to purchase a subscription')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                plan_key: planKey,
                billing_interval: billingInterval, // 'monthly' or 'yearly'
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to create order')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { 
            success: true, 
            orderId: data.order_id,
            amount: data.amount,
            currency: data.currency,
            keyId: data.key_id,
            customerId: data.customer_id
        }
    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        return {
            success: false,
            error: error.message || 'Failed to create order. Please try again.'
        }
    }
}

/**
 * Verify Razorpay payment and create subscription
 */
export async function verifyRazorpayPayment(paymentData) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify(paymentData),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to verify payment')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true, subscription: data.subscription }
    } catch (error) {
        console.error('Error verifying payment:', error)
        return {
            success: false,
            error: error.message || 'Failed to verify payment. Please try again.'
        }
    }
}

/**
 * Get user's active subscription
 */
export async function getActiveSubscription() {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('status', 'active')
            .or('status.eq.trialing,status.eq.past_due')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return { data: null, error }
    }
}

/**
 * Get all subscriptions for user
 */
export async function getAllSubscriptions() {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching subscriptions:', error)
        return { data: null, error }
    }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-cancel-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                subscription_id: subscriptionId,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to cancel subscription')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true }
    } catch (error) {
        console.error('Error canceling subscription:', error)
        return {
            success: false,
            error: error.message || 'Failed to cancel subscription. Please try again.'
        }
    }
}

/**
 * Resume subscription
 */
export async function resumeSubscription(subscriptionId) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-resume-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                subscription_id: subscriptionId,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to resume subscription')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true }
    } catch (error) {
        console.error('Error resuming subscription:', error)
        return {
            success: false,
            error: error.message || 'Failed to resume subscription. Please try again.'
        }
    }
}

/**
 * Get billing history
 */
export async function getBillingHistory(limit = 50) {
    try {
        const { data, error } = await supabase
            .from('billing_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching billing history:', error)
        return { data: null, error }
    }
}

/**
 * Get payment methods
 */
export async function getPaymentMethods() {
    try {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching payment methods:', error)
        return { data: null, error }
    }
}

/**
 * Get pricing plans
 */
export async function getPricingPlans() {
    try {
        const { data, error } = await supabase
            .from('pricing_plans')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching pricing plans:', error)
        return { data: null, error }
    }
}

/**
 * Get user subscription summary
 */
export async function getUserSubscriptionSummary() {
    try {
        // Use the function instead of view to avoid auth.users access issues
        const { data, error } = await supabase.rpc('get_user_subscription_summary')

        if (error) {
            // Fallback: try to get subscription directly
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                return { data: null, error: null }
            }

            const [subResult, licenseResult, billingResult] = await Promise.all([
                supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('status', ['active', 'trialing', 'past_due'])
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from('licenses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('issued_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from('billing_history')
                    .select('amount')
                    .eq('user_id', user.id)
                    .eq('status', 'paid')
            ])

            const subscription = subResult.data
            const license = licenseResult.data
            const billing = billingResult.data || []

            const summary = {
                user_id: user.id,
                email: user.email,
                subscription_id: subscription?.subscription_id || null,
                plan_type: subscription?.plan_type || license?.license_type || 'free',
                subscription_status: subscription?.status || null,
                current_period_start: subscription?.current_period_start || null,
                current_period_end: subscription?.current_period_end || null,
                cancel_at_period_end: subscription?.cancel_at_period_end || false,
                license_type: license?.license_type || 'free',
                license_active: license?.is_active || false,
                license_expires_at: license?.expires_at || null,
                total_payments: billing.length,
                total_paid_amount: billing.reduce((sum, item) => sum + (item.amount || 0), 0)
            }

            return { data: summary, error: null }
        }

        return { data: data?.[0] || null, error: null }
    } catch (error) {
        console.error('Error fetching subscription summary:', error)
        return { data: null, error }
    }
}

/**
 * Format price in paise to currency string (Razorpay uses paise, 1 rupee = 100 paise)
 */
export function formatPrice(paise, currency = 'INR') {
    if (paise === null || paise === undefined) return 'Contact Sales'
    const amount = (paise / 100).toFixed(2)
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount)
}

/**
 * Format price per month/year
 */
export function formatPriceWithInterval(paise, interval, currency = 'INR') {
    if (paise === null || paise === undefined) return 'Contact Sales'
    const price = formatPrice(paise, currency)
    return interval === 'yearly' ? `${price}/year` : `${price}/month`
}
