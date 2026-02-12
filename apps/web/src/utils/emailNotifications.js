/**
 * Email Notifications System
 * Handles email notifications for subscription events, user activities, etc.
 */

import { supabase } from '../supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Send email notification via Edge Function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} template - Template name
 * @param {Object} data - Template data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendEmailNotification(to, subject, template, data = {}) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return { success: false, error: 'Not authenticated' }
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                to,
                subject,
                template,
                data,
            }),
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send email')
        }

        return { success: true }
    } catch (error) {
        console.error('Error sending email notification:', error)
        return { success: false, error: error.message || 'Failed to send email notification' }
    }
}

/**
 * Send subscription confirmation email
 * @param {string} email - User email
 * @param {Object} subscriptionData - Subscription details
 */
export async function sendSubscriptionConfirmation(email, subscriptionData) {
    return await sendEmailNotification(
        email,
        'Subscription Confirmed - ML FORGE',
        'subscription_confirmation',
        {
            plan_name: subscriptionData.plan_name,
            amount: subscriptionData.amount,
            billing_interval: subscriptionData.billing_interval,
            next_billing_date: subscriptionData.next_billing_date,
        }
    )
}

/**
 * Send subscription cancellation email
 * @param {string} email - User email
 * @param {Object} subscriptionData - Subscription details
 */
export async function sendSubscriptionCancellation(email, subscriptionData) {
    return await sendEmailNotification(
        email,
        'Subscription Cancelled - ML FORGE',
        'subscription_cancellation',
        {
            plan_name: subscriptionData.plan_name,
            cancellation_date: subscriptionData.cancellation_date,
            access_until: subscriptionData.access_until,
        }
    )
}

/**
 * Send trial started email
 * @param {string} email - User email
 * @param {Object} trialData - Trial details
 */
export async function sendTrialStarted(email, trialData) {
    return await sendEmailNotification(
        email,
        'Trial Started - ML FORGE',
        'trial_started',
        {
            plan_name: trialData.plan_name,
            trial_end_date: trialData.trial_end_date,
            days_remaining: trialData.days_remaining,
        }
    )
}

/**
 * Send trial ending soon email
 * @param {string} email - User email
 * @param {Object} trialData - Trial details
 */
export async function sendTrialEndingSoon(email, trialData) {
    return await sendEmailNotification(
        email,
        'Trial Ending Soon - ML FORGE',
        'trial_ending_soon',
        {
            plan_name: trialData.plan_name,
            trial_end_date: trialData.trial_end_date,
            days_remaining: trialData.days_remaining,
        }
    )
}

/**
 * Send payment receipt email
 * @param {string} email - User email
 * @param {Object} paymentData - Payment details
 */
export async function sendPaymentReceipt(email, paymentData) {
    return await sendEmailNotification(
        email,
        'Payment Receipt - ML FORGE',
        'payment_receipt',
        {
            amount: paymentData.amount,
            currency: paymentData.currency,
            payment_id: paymentData.payment_id,
            date: paymentData.date,
            plan_name: paymentData.plan_name,
        }
    )
}

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 */
export async function sendWelcomeEmail(email, name) {
    return await sendEmailNotification(
        email,
        'Welcome to ML FORGE!',
        'welcome',
        {
            name: name || 'User',
        }
    )
}

/**
 * Send password reset email (if not using Supabase built-in)
 * @param {string} email - User email
 * @param {string} resetLink - Reset link
 */
export async function sendPasswordResetEmail(email, resetLink) {
    return await sendEmailNotification(
        email,
        'Reset Your Password - ML FORGE',
        'password_reset',
        {
            reset_link: resetLink,
        }
    )
}

/**
 * Send team invitation email
 * @param {string} email - Invitee email
 * @param {Object} invitationData - Invitation details
 */
export async function sendTeamInvitation(email, invitationData) {
    return await sendEmailNotification(
        email,
        `You've been invited to join ${invitationData.team_name} - ML FORGE`,
        'team_invitation',
        {
            team_name: invitationData.team_name,
            inviter_name: invitationData.inviter_name,
            role: invitationData.role,
            accept_link: invitationData.accept_link,
        }
    )
}

/**
 * Get user email preferences
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getEmailPreferences() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { data: null, error: new Error('Not authenticated') }
        }

        // In production, you'd have an email_preferences table
        // For now, return defaults
        return {
            data: {
                subscription_emails: true,
                marketing_emails: false,
                security_emails: true,
                weekly_digest: false,
            },
            error: null,
        }
    } catch (error) {
        return { data: null, error }
    }
}

/**
 * Update email preferences
 * @param {Object} preferences - Email preferences
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateEmailPreferences(preferences) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // In production, update email_preferences table
        // For now, just return success
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

