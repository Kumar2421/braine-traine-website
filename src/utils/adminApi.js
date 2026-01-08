import { supabase } from '../supabaseClient'

/**
 * Check if current user is admin
 * @deprecated Use adminAuth.isAdmin() for enhanced security
 */
export async function isAdmin() {
    // Import from adminAuth for consistency
    const { isAdmin: checkAdmin } = await import('./adminAuth.js')
    return await checkAdmin()
}

/**
 * Admin API for user management
 */
export const adminUsersApi = {
    /**
     * Get all users with license info
     */
    async getAllUsers() {
        // Use admin RPC so the admin panel can list all auth users (including new users)
        const { data, error } = await supabase.rpc('admin_get_users')
        if (error) throw error

        // Normalize shape expected by AdminPage.jsx (it expects `user_id` and nested `users` object)
        return (data || []).map((row) => ({
            user_id: row.user_id,
            license_type: row.license_type,
            is_active: row.is_active,
            expires_at: row.expires_at,
            issued_at: row.issued_at,
            offline_enabled: row.offline_enabled,
            users: {
                id: row.user_id,
                email: row.email,
                created_at: row.user_created_at,
                raw_user_meta_data: row.raw_user_meta_data || {},
            },
        }))
    },

    /**
     * Activate/deactivate user
     */
    async toggleUserActive(userId, isActive) {
        const { error } = await supabase
            .from('licenses')
            .update({ is_active: isActive })
            .eq('user_id', userId)

        if (error) throw error

        // Log admin action
        await adminActionsApi.logAction(
            isActive ? 'user_activate' : 'user_deactivate',
            userId,
            { is_active: isActive }
        )
    },

    /**
     * Assign license tier to user
     */
    async assignLicense(userId, licenseType, expiresAt = null) {
        const { error } = await supabase
            .from('licenses')
            .insert({
                user_id: userId,
                license_type: licenseType,
                is_active: true,
                expires_at: expiresAt,
                issued_at: new Date().toISOString(),
            })

        if (error) throw error

        await adminActionsApi.logAction('license_assign', userId, {
            license_type: licenseType,
            expires_at: expiresAt
        })
    },

    /**
     * Update license expiry
     */
    async updateLicenseExpiry(userId, expiresAt) {
        // Get the latest license
        const { data: latestLicense } = await supabase
            .from('licenses')
            .select('license_id')
            .eq('user_id', userId)
            .order('issued_at', { ascending: false })
            .limit(1)
            .single()

        if (latestLicense) {
            const { error } = await supabase
                .from('licenses')
                .update({ expires_at: expiresAt })
                .eq('license_id', latestLicense.license_id)

            if (error) throw error

            await adminActionsApi.logAction('license_expiry_update', userId, {
                expires_at: expiresAt
            })
        }
    },

    /**
     * Toggle offline license
     */
    async toggleOfflineLicense(userId, enabled) {
        // Get the latest license
        const { data: latestLicense } = await supabase
            .from('licenses')
            .select('license_id')
            .eq('user_id', userId)
            .order('issued_at', { ascending: false })
            .limit(1)
            .single()

        if (latestLicense) {
            const { error } = await supabase
                .from('licenses')
                .update({ offline_enabled: enabled })
                .eq('license_id', latestLicense.license_id)

            if (error) throw error

            await adminActionsApi.logAction('license_offline_toggle', userId, {
                offline_enabled: enabled
            })
        }
    },

    /**
     * Regenerate token (for IDE auth)
     */
    async regenerateToken(userId) {
        // This would typically invalidate old tokens and create new ones
        // For now, we'll just log the action
        await adminActionsApi.logAction('token_regenerate', userId, {
            timestamp: new Date().toISOString()
        })
    },

    /**
     * Force logout user (invalidate all sessions)
     */
    async forceLogout(userId) {
        // This requires Supabase Admin API - for now, we'll log the action
        // In production, you'd call an edge function or use admin API
        await adminActionsApi.logAction('force_logout', userId, {
            timestamp: new Date().toISOString()
        })
    }
}

/**
 * Admin API for feature flags
 */
export const adminFeatureFlagsApi = {
    /**
     * Get all feature flags
     */
    async getAllFlags() {
        const { data, error } = await supabase
            .from('feature_flags')
            .select('*')
            .order('category', { ascending: true })

        if (error) throw error
        return data
    },

    /**
     * Toggle feature flag
     */
    async toggleFlag(flagKey, enabled) {
        const { error } = await supabase
            .from('feature_flags')
            .update({
                enabled,
                updated_at: new Date().toISOString()
            })
            .eq('flag_key', flagKey)

        if (error) throw error

        await adminActionsApi.logAction('feature_flag_toggle', null, {
            flag_key: flagKey,
            enabled
        })
    },

    /**
     * Emergency disable all features
     */
    async emergencyDisable() {
        const { error } = await supabase
            .from('feature_flags')
            .update({
                enabled: false,
                updated_at: new Date().toISOString()
            })

        if (error) throw error

        await adminActionsApi.logAction('feature_flag_toggle', null, {
            emergency_disable: true
        })
    }
}

/**
 * Admin API for usage overview
 */
export const adminUsageApi = {
    /**
     * Get usage overview for a user
     */
    async getUserUsage(userId) {
        const [projects, downloads, exports] = await Promise.all([
            supabase
                .from('projects')
                .select('project_id, dataset_count')
                .eq('user_id', userId),
            supabase
                .from('downloads')
                .select('download_id')
                .eq('user_id', userId),
            supabase
                .from('exports')
                .select('export_id')
                .eq('user_id', userId)
        ])

        const totalDatasets = projects.data?.reduce((sum, p) => sum + (p.dataset_count || 0), 0) || 0

        return {
            projects_count: projects.data?.length || 0,
            datasets_count: totalDatasets,
            downloads_count: downloads.data?.length || 0,
            exports_count: exports.data?.length || 0,
            training_runs: projects.data?.length || 0, // Simplified
            gpu_usage: null // TODO: Phase 2
        }
    },

    /**
     * Get platform-wide usage stats
     */
    async getPlatformStats() {
        const [users, projects, downloads, exports] = await Promise.all([
            supabase.from('licenses').select('user_id', { count: 'exact', head: true }),
            supabase.from('projects').select('project_id', { count: 'exact', head: true }),
            supabase.from('downloads').select('download_id', { count: 'exact', head: true }),
            supabase.from('exports').select('export_id', { count: 'exact', head: true })
        ])

        return {
            total_users: users.count || 0,
            total_projects: projects.count || 0,
            total_downloads: downloads.count || 0,
            total_exports: exports.count || 0
        }
    }
}

/**
 * Admin actions audit log
 */
export const adminActionsApi = {
    /**
     * Log admin action
     */
    async logAction(actionType, targetUserId, details) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('admin_actions')
            .insert({
                admin_user_id: user.id,
                action_type: actionType,
                target_user_id: targetUserId,
                details
            })

        if (error) {
            console.error('Failed to log admin action:', error)
            // Don't throw - logging failures shouldn't break the flow
        }
    },

    /**
     * Get admin actions log
     */
    async getActions(limit = 100) {
        const { data, error } = await supabase
            .from('admin_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data
    }
}

