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
        // Get all licenses with user info
        // Note: We can't directly query auth.users, so we'll work with licenses
        // and create a view that combines them
        const { data: licensesData, error: licensesError } = await supabase
            .from('licenses')
            .select(`
                user_id,
                license_type,
                is_active,
                expires_at,
                issued_at,
                offline_enabled
            `)
            .order('issued_at', { ascending: false })

        if (licensesError) throw licensesError

        // Group by user_id to get latest license per user
        const userLicenseMap = new Map()
        licensesData.forEach(license => {
            if (!userLicenseMap.has(license.user_id)) {
                userLicenseMap.set(license.user_id, license)
            }
        })

        // Get unique user IDs
        const userIds = Array.from(userLicenseMap.keys())

        // For each user, try to get their email from projects or other tables
        // Since we can't query auth.users directly, we'll use a workaround
        const users = []

        for (const userId of userIds) {
            const license = userLicenseMap.get(userId)
            
            // Try to get email from projects table if it exists
            const { data: projectData } = await supabase
                .from('projects')
                .select('user_id')
                .eq('user_id', userId)
                .limit(1)
                .single()

            // Create user object (email will be shown as user ID if not available)
            users.push({
                user_id: userId,
                ...license,
                users: {
                    id: userId,
                    email: `user_${userId.substring(0, 8)}`, // Placeholder - will be replaced if we can get email
                    created_at: license?.issued_at || new Date().toISOString(),
                    raw_user_meta_data: {}
                }
            })
        }

        // Also include users who have projects but no licenses
        const { data: projectsData } = await supabase
            .from('projects')
            .select('user_id')
            .order('created_at', { ascending: false })

        if (projectsData) {
            const projectUserIds = new Set(projectsData.map(p => p.user_id))
            projectUserIds.forEach(userId => {
                if (!userLicenseMap.has(userId)) {
                    users.push({
                        user_id: userId,
                        license_type: 'free',
                        is_active: false,
                        expires_at: null,
                        issued_at: null,
                        offline_enabled: false,
                        users: {
                            id: userId,
                            email: `user_${userId.substring(0, 8)}`,
                            created_at: new Date().toISOString(),
                            raw_user_meta_data: {}
                        }
                    })
                }
            })
        }

        return users
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
            .select(`
                *,
                admin_user:admin_user_id (
                    email
                ),
                target_user:target_user_id (
                    email
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data
    }
}

