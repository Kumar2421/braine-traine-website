/**
 * Enterprise-Grade Admin Authentication
 * Provides secure admin authentication and access control
 */

import { supabase } from '../supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Verify admin access with server-side check
 * @returns {Promise<{isAdmin: boolean, error?: string}>}
 */
export async function verifyAdminAccess() {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return { isAdmin: false, error: 'Not authenticated' }
        }

        // Check client-side metadata first (fast check)
        const user = session.user
        const clientSideCheck = user?.user_metadata?.is_admin === true

        if (!clientSideCheck) {
            return { isAdmin: false, error: 'Not an admin user' }
        }

        // Verify with server-side function for security
        const { data, error } = await supabase.rpc('can_access_admin_panel')

        if (error) {
            console.error('Error verifying admin access:', error)
            // Fallback to client-side check if RPC fails
            return { isAdmin: clientSideCheck }
        }

        return { isAdmin: data === true }
    } catch (error) {
        console.error('Error in verifyAdminAccess:', error)
        return { isAdmin: false, error: error.message }
    }
}

/**
 * Log admin login for security auditing
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent string
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logAdminLogin(ipAddress, userAgent) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { error } = await supabase.rpc('log_admin_login', {
            user_id: user.id,
            ip_address_val: ipAddress,
            user_agent_val: userAgent
        })

        if (error) {
            console.error('Error logging admin login:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error in logAdminLogin:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Enhanced admin check with logging
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
    const result = await verifyAdminAccess()

    // Log admin access attempt
    if (result.isAdmin) {
        // Get IP and user agent
        const ipAddress = await fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => data.ip)
            .catch(() => null)

        const userAgent = navigator.userAgent

        // Log asynchronously (don't wait)
        logAdminLogin(ipAddress, userAgent).catch(err => {
            console.error('Failed to log admin login:', err)
        })
    }

    return result.isAdmin
}

/**
 * Check if user can access admin panel (with redirect)
 * @param {Function} navigate - Navigation function
 * @returns {Promise<boolean>}
 */
export async function checkAdminAccess(navigate) {
    const result = await verifyAdminAccess()

    if (!result.isAdmin) {
        if (navigate) {
            navigate('/dashboard-v2')
        }
        return false
    }

    return true
}

/**
 * Get admin dashboard stats
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getAdminDashboardStats() {
    try {
        const { data, error } = await supabase
            .from('admin_dashboard_stats')
            .select('*')
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return { data: null, error }
    }
}

