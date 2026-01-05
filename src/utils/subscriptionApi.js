/**
 * Enhanced Subscription Management API
 * 
 * Handles recurring subscriptions, upgrades, downgrades, trials, and coupons
 * for ML FORGE platform using Razorpay payment gateway.
 * 
 * @module subscriptionApi
 * @requires supabase
 */

import { supabase } from '../supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Create recurring subscription with Razorpay
 * 
 * Creates a new recurring subscription with optional trial period and coupon code.
 * The subscription will automatically renew based on the billing interval.
 * 
 * @param {string} planKey - Plan key (data_pro, train_pro, deploy_pro, enterprise)
 * @param {string} billingInterval - Billing interval: 'monthly' or 'yearly'
 * @param {Object} [options={}] - Additional subscription options
 * @param {string} [options.couponCode] - Optional coupon code for discount
 * @param {number} [options.trialDays=0] - Number of trial days (0 = no trial)
 * @returns {Promise<{success: boolean, subscription?: Object, checkoutUrl?: string, error?: string}>}
 * @throws {Error} If user is not authenticated or plan is invalid
 * 
 * @example
 * const result = await createRecurringSubscription('data_pro', 'monthly', {
 *   couponCode: 'SAVE20',
 *   trialDays: 14
 * })
 */
export async function createRecurringSubscription(planKey, billingInterval = 'monthly', options = {}) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in to create a subscription')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-create-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                plan_key: planKey,
                billing_interval: billingInterval,
                coupon_code: options.couponCode,
                trial_days: options.trialDays || 0,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to create subscription')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true, subscription: data.subscription, checkoutUrl: data.checkout_url }
    } catch (error) {
        console.error('Error creating recurring subscription:', error)
        return {
            success: false,
            error: error.message || 'Failed to create subscription. Please try again.'
        }
    }
}

/**
 * Upgrade subscription to a higher tier
 * 
 * Upgrades the user's subscription to a higher plan with prorated billing.
 * The upgrade takes effect immediately and the user is charged the prorated amount.
 * 
 * @param {string} subscriptionId - Current subscription UUID
 * @param {string} newPlanKey - New plan key to upgrade to (must be higher tier)
 * @returns {Promise<{success: boolean, subscription?: Object, proratedAmount?: number, error?: string}>}
 * @throws {Error} If subscription not found or upgrade fails
 * 
 * @example
 * const result = await upgradeSubscription('sub_123', 'train_pro')
 * if (result.success) {
 *   console.log('Upgraded! Prorated amount:', result.proratedAmount)
 * }
 */
export async function upgradeSubscription(subscriptionId, newPlanKey) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-upgrade-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                subscription_id: subscriptionId,
                new_plan_key: newPlanKey,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to upgrade subscription')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true, subscription: data.subscription, proratedAmount: data.prorated_amount }
    } catch (error) {
        console.error('Error upgrading subscription:', error)
        return {
            success: false,
            error: error.message || 'Failed to upgrade subscription. Please try again.'
        }
    }
}

/**
 * Downgrade subscription to a lower tier
 * @param {string} subscriptionId - Current subscription ID
 * @param {string} newPlanKey - New plan key to downgrade to
 * @param {boolean} immediate - Whether to downgrade immediately or at period end
 * @returns {Promise<Object>} Downgrade result
 */
export async function downgradeSubscription(subscriptionId, newPlanKey, immediate = false) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-downgrade-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                subscription_id: subscriptionId,
                new_plan_key: newPlanKey,
                immediate: immediate,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to downgrade subscription')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true, subscription: data.subscription }
    } catch (error) {
        console.error('Error downgrading subscription:', error)
        return {
            success: false,
            error: error.message || 'Failed to downgrade subscription. Please try again.'
        }
    }
}

/**
 * Validate coupon code
 * 
 * Validates a coupon code and calculates the discount amount.
 * Checks coupon validity, expiration, usage limits, and applicable plans.
 * 
 * @param {string} couponCode - Coupon code to validate
 * @param {string} planKey - Plan key the coupon is being applied to
 * @param {number} amountPaise - Order amount in paise (for discount calculation)
 * @returns {Promise<{valid: boolean, coupon?: Object, error?: string}>}
 * @returns {Object} coupon - If valid, contains discount details
 * @returns {string} coupon.code - Coupon code
 * @returns {string} coupon.name - Coupon name
 * @returns {string} coupon.discountType - 'percentage' or 'fixed_amount'
 * @returns {number} coupon.discountValue - Discount value
 * @returns {number} coupon.discountAmount - Calculated discount in paise
 * @returns {number} coupon.finalAmount - Final amount after discount
 * 
 * @example
 * const result = await validateCoupon('SAVE20', 'data_pro', 100000)
 * if (result.valid) {
 *   console.log('Discount:', result.coupon.discountAmount)
 * }
 */
export async function validateCoupon(couponCode, planKey, amountPaise) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const { data, error } = await supabase.rpc('is_coupon_valid', {
            coupon_code: couponCode,
            user_id: session.user.id,
            plan_key: planKey,
            amount_paise: amountPaise
        })

        if (error) throw error

        if (!data) {
            return { valid: false, error: 'Invalid or expired coupon code' }
        }

        // Get coupon details
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode)
            .single()

        if (couponError || !coupon) {
            return { valid: false, error: 'Coupon not found' }
        }

        // Calculate discount
        let discountAmount = 0
        if (coupon.discount_type === 'percentage') {
            discountAmount = Math.floor((amountPaise * coupon.discount_value) / 100)
        } else {
            discountAmount = coupon.discount_value
        }

        // Ensure discount doesn't exceed amount
        discountAmount = Math.min(discountAmount, amountPaise)

        return {
            valid: true,
            coupon: {
                code: coupon.code,
                name: coupon.name,
                discountType: coupon.discount_type,
                discountValue: coupon.discount_value,
                discountAmount: discountAmount,
                finalAmount: amountPaise - discountAmount,
            }
        }
    } catch (error) {
        console.error('Error validating coupon:', error)
        return {
            valid: false,
            error: error.message || 'Failed to validate coupon'
        }
    }
}

/**
 * Get subscription change history
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Change history
 */
export async function getSubscriptionChangeHistory(subscriptionId) {
    try {
        const { data, error } = await supabase
            .from('subscription_changes')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching subscription change history:', error)
        return { data: null, error }
    }
}

/**
 * Get active trial information
 * @returns {Promise<Object>} Trial information
 */
export async function getActiveTrial() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: null }

        const { data, error } = await supabase
            .from('trials')
            .select('*')
            .eq('user_id', user.id)
            .eq('converted', false)
            .eq('canceled', false)
            .gt('trial_end', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching active trial:', error)
        return { data: null, error }
    }
}

/**
 * Start trial period
 * @param {string} planKey - Plan key for trial
 * @param {number} trialDays - Number of trial days (default: 14)
 * @returns {Promise<Object>} Trial creation result
 */
export async function startTrial(planKey, trialDays = 14) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-start-trial`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                plan_key: planKey,
                trial_days: trialDays,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to start trial')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true, trial: data.trial, subscription: data.subscription }
    } catch (error) {
        console.error('Error starting trial:', error)
        return {
            success: false,
            error: error.message || 'Failed to start trial. Please try again.'
        }
    }
}

/**
 * Get available coupons for a plan
 * @param {string} planKey - Plan key
 * @returns {Promise<Object>} Available coupons
 */
export async function getAvailableCoupons(planKey) {
    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('is_active', true)
            .or(`applicable_plans.is.null,applicable_plans.cs.{${planKey}}`)
            .gte('valid_from', new Date().toISOString())
            .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching coupons:', error)
        return { data: null, error }
    }
}

/**
 * Calculate prorated amount for plan change
 * @param {string} subscriptionId - Current subscription ID
 * @param {string} newPlanKey - New plan key
 * @returns {Promise<Object>} Prorated amount calculation
 */
export async function calculateProratedAmount(subscriptionId, newPlanKey) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-calculate-proration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                subscription_id: subscriptionId,
                new_plan_key: newPlanKey,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to calculate proration')
        }

        if (data.error) {
            throw new Error(data.error)
        }

        return { success: true, proratedAmount: data.prorated_amount, breakdown: data.breakdown }
    } catch (error) {
        console.error('Error calculating prorated amount:', error)
        return {
            success: false,
            error: error.message || 'Failed to calculate proration'
        }
    }
}

/**
 * Get subscription usage statistics
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Usage statistics
 */
export async function getSubscriptionUsage(subscriptionId) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'Not authenticated' }

        // Get GPU usage for this subscription period
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('current_period_start, current_period_end')
            .eq('subscription_id', subscriptionId)
            .single()

        if (!subscription) {
            return { data: null, error: 'Subscription not found' }
        }

        const { data: gpuUsage, error: gpuError } = await supabase
            .from('gpu_usage')
            .select('*')
            .eq('user_id', user.id)
            .gte('usage_start', subscription.current_period_start)
            .lte('usage_end', subscription.current_period_end)

        if (gpuError) throw gpuError

        // Calculate totals
        const totalHours = gpuUsage?.reduce((sum, usage) => sum + parseFloat(usage.hours_used || 0), 0) || 0
        const totalCost = gpuUsage?.reduce((sum, usage) => sum + parseFloat(usage.total_cost || 0), 0) || 0

        return {
            data: {
                gpuUsage: gpuUsage || [],
                totalHours,
                totalCost,
                usageCount: gpuUsage?.length || 0,
            },
            error: null
        }
    } catch (error) {
        console.error('Error fetching subscription usage:', error)
        return { data: null, error }
    }
}

