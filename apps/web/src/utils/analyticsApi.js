/**
 * Analytics API
 * 
 * Provides functions for subscription analytics, revenue reporting, 
 * user activity tracking, and GPU usage statistics.
 * 
 * @module analyticsApi
 * @requires supabase
 */

import { supabase } from '../supabaseClient'

/**
 * Get subscription analytics
 * 
 * Retrieves subscription analytics data including new subscriptions,
 * active/canceled counts, and plan distribution over time.
 * 
 * @param {Object} [filters={}] - Filter options
 * @param {string} [filters.startDate] - Start date (ISO 8601 string)
 * @param {string} [filters.endDate] - End date (ISO 8601 string)
 * @param {string} [filters.planType] - Filter by plan type (data_pro, train_pro, etc.)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 * @returns {Array} data - Array of analytics records with date, plan_type, counts
 * 
 * @example
 * const result = await getSubscriptionAnalytics({
 *   startDate: '2024-01-01',
 *   planType: 'data_pro'
 * })
 */
export async function getSubscriptionAnalytics(filters = {}) {
    try {
        let query = supabase
            .from('subscription_analytics')
            .select('*')
            .order('date', { ascending: false })

        if (filters.startDate) {
            query = query.gte('date', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate)
        }
        if (filters.planType) {
            query = query.eq('plan_type', filters.planType)
        }

        const { data, error } = await query.limit(100)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching subscription analytics:', error)
        return { data: null, error }
    }
}

/**
 * Get revenue analytics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Revenue analytics data
 */
export async function getRevenueAnalytics(filters = {}) {
    try {
        let query = supabase
            .from('revenue_analytics')
            .select('*')
            .order('date', { ascending: false })

        if (filters.startDate) {
            query = query.gte('date', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate)
        }
        if (filters.planType) {
            query = query.eq('plan_type', filters.planType)
        }

        const { data, error } = await query.limit(100)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching revenue analytics:', error)
        return { data: null, error }
    }
}

/**
 * Get GPU usage statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} GPU usage data
 */
export async function getGPUUsageStats(filters = {}) {
    try {
        let query = supabase
            .from('gpu_usage')
            .select('*')
            .order('usage_start', { ascending: false })

        if (filters.userId) {
            query = query.eq('user_id', filters.userId)
        }
        if (filters.startDate) {
            query = query.gte('usage_start', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('usage_end', filters.endDate)
        }

        const { data, error } = await query.limit(1000)

        if (error) throw error

        // Calculate totals
        const totals = data?.reduce((acc, usage) => {
            acc.totalHours += parseFloat(usage.hours_used || 0)
            acc.totalCost += parseFloat(usage.total_cost || 0)
            acc.count += 1
            return acc
        }, { totalHours: 0, totalCost: 0, count: 0 }) || { totalHours: 0, totalCost: 0, count: 0 }

        return {
            data: {
                usage: data || [],
                totals,
            },
            error: null
        }
    } catch (error) {
        console.error('Error fetching GPU usage:', error)
        return { data: null, error }
    }
}

/**
 * Get user activity statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Activity data
 */
export async function getUserActivityStats(filters = {}) {
    try {
        let query = supabase
            .from('user_activity')
            .select('*')
            .order('created_at', { ascending: false })

        if (filters.userId) {
            query = query.eq('user_id', filters.userId)
        }
        if (filters.activityType) {
            query = query.eq('activity_type', filters.activityType)
        }
        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate)
        }

        const { data, error } = await query.limit(1000)

        if (error) throw error

        // Group by activity type
        const grouped = data?.reduce((acc, activity) => {
            const type = activity.activity_type
            if (!acc[type]) {
                acc[type] = 0
            }
            acc[type] += 1
            return acc
        }, {}) || {}

        return {
            data: {
                activities: data || [],
                grouped,
                total: data?.length || 0,
            },
            error: null
        }
    } catch (error) {
        console.error('Error fetching user activity:', error)
        return { data: null, error }
    }
}

/**
 * Track user activity
 * @param {string} activityType - Type of activity
 * @param {Object} activityData - Additional activity data
 * @returns {Promise<Object>} Result
 */
export async function trackActivity(activityType, activityData = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        const { error } = await supabase.from('user_activity').insert({
            user_id: user.id,
            activity_type: activityType,
            activity_data: activityData,
        })

        if (error) throw error
        return { success: true, error: null }
    } catch (error) {
        console.error('Error tracking activity:', error)
        return { success: false, error }
    }
}

/**
 * Export analytics data to CSV
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for download
 */
export function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        console.error('No data to export')
        return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header]
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

