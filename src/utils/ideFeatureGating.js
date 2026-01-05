/**
 * IDE Feature Gating System
 * Provides real-time feature access checks for IDE integration
 * Enterprise-grade feature gating with usage limits
 */

import { supabase } from '../supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Get user's subscription info with limits (for IDE)
 * @param {string} syncToken - Sync token from IDE
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getIDEUserInfo(syncToken) {
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/ide-authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({ 
                token: syncToken,
                ide_version: '1.0.0', // Will be provided by IDE
                platform: 'web', // Will be provided by IDE
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to authenticate IDE')
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error getting IDE user info:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Check feature access (for IDE)
 * @param {string} featureKey - Feature key to check
 * @param {Object} context - Additional context (export format, model size, etc.)
 * @returns {Promise<{has_access: boolean, reason?: string, upgrade_required?: boolean, required_tier?: string, current_tier?: string}>}
 */
export async function checkIDEFeature(featureKey, context = {}) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return { has_access: false, reason: 'Not authenticated' }
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/ide-check-feature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                feature_key: featureKey,
                context: context,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check feature access')
        }

        return data
    } catch (error) {
        console.error('Error checking IDE feature:', error)
        return { has_access: false, reason: error.message }
    }
}

/**
 * Track usage from IDE
 * @param {string} usageType - Type of usage (gpu_hours, export, training_run, project_created)
 * @param {number} amount - Amount (for gpu_hours, default 1.0 for counts)
 * @param {Object} details - Additional details
 * @returns {Promise<{success: boolean, usage_updated?: Object, error?: string}>}
 */
export async function trackIDEUsage(usageType, amount = 1.0, details = {}) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return { success: false, error: 'Not authenticated' }
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/ide-track-usage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                usage_type: usageType,
                amount: amount,
                details: details,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to track usage')
        }

        return data
    } catch (error) {
        console.error('Error tracking IDE usage:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Sync project from IDE
 * @param {Object} projectData - Project data from IDE
 * @returns {Promise<{success: boolean, project?: Object, error?: string}>}
 */
export async function syncIDEProject(projectData) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return { success: false, error: 'Not authenticated' }
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/ide-sync-project`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify(projectData),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to sync project')
        }

        return data
    } catch (error) {
        console.error('Error syncing IDE project:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Validate export request
 * @param {string} exportFormat - Export format (onnx, tensorflow, pytorch, etc.)
 * @param {number} modelSizeMb - Model size in MB
 * @param {string} projectId - Project ID
 * @returns {Promise<{allowed: boolean, reason?: string, current_usage?: Object, upgrade_required?: boolean}>}
 */
export async function validateIDEExport(exportFormat, modelSizeMb = null, projectId = null) {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return { allowed: false, reason: 'Not authenticated' }
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/ide-validate-export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                export_format: exportFormat,
                model_size_mb: modelSizeMb,
                project_id: projectId,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to validate export')
        }

        return data
    } catch (error) {
        console.error('Error validating IDE export:', error)
        return { allowed: false, reason: error.message }
    }
}

/**
 * Get current usage stats
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getCurrentUsage() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { data: null, error: new Error('Not authenticated') }
        }

        const periodStart = new Date()
        periodStart.setDate(1)
        periodStart.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', user.id)
            .eq('period_start', periodStart.toISOString())
            .order('period_start', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error && error.code !== 'PGRST116') throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting current usage:', error)
        return { data: null, error }
    }
}

/**
 * Get user's usage limits
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getUserUsageLimits() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { data: null, error: new Error('Not authenticated') }
        }

        // Get subscription tier
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_type')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        let tier = subscription?.plan_type || 'free'

        // Fallback to license
        if (tier === 'free') {
            const { data: license } = await supabase
                .from('licenses')
                .select('license_type')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('issued_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (license) {
                if (license.license_type === 'pro') tier = 'train_pro'
                else if (license.license_type === 'enterprise') tier = 'enterprise'
                else tier = license.license_type
            }
        }

        // Get limits
        const { data, error } = await supabase
            .from('usage_limits')
            .select('*')
            .eq('plan_type', tier)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting usage limits:', error)
        return { data: null, error }
    }
}

/**
 * Get usage with limits (combined)
 * @returns {Promise<{usage: Object, limits: Object, tier: string}>}
 */
export async function getUsageWithLimits() {
    const [usageResult, limitsResult] = await Promise.all([
        getCurrentUsage(),
        getUserUsageLimits(),
    ])

    const usage = usageResult.data || {
        projects_count: 0,
        exports_count: 0,
        gpu_hours_used: 0,
        training_runs_count: 0,
    }

    const limits = limitsResult.data || {}
    const tier = limits.plan_type || 'free'

    return {
        usage,
        limits,
        tier,
    }
}

