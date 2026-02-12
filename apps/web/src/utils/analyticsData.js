/**
 * Analytics Data Utilities
 * Provides functions to fetch and format analytics data for dashboard
 */

import { supabase } from '../supabaseClient'

/**
 * Get usage analytics data for charts
 * @param {string} userId - User ID
 * @param {string} period - Period: '1d', '7d', '30d', 'all'
 * @returns {Promise<{gpuHours: Array, exports: Array, trainingRuns: Array, error: Error|null}>}
 */
export async function getUsageAnalytics(userId, period = '30d') {
    try {
        if (!userId) {
            return { gpuHours: [], exports: [], trainingRuns: [], error: new Error('User ID required') }
        }

        // Calculate date range
        const now = new Date()
        let startDate = new Date()

        switch (period) {
            case '1d':
                startDate.setDate(now.getDate() - 1)
                break
            case '7d':
                startDate.setDate(now.getDate() - 7)
                break
            case '30d':
                startDate.setDate(now.getDate() - 30)
                break
            case 'all':
                startDate = new Date(0) // Beginning of time
                break
            default:
                startDate.setDate(now.getDate() - 30)
        }

        // Get GPU usage from training_runs
        const { data: trainingRuns, error: runsError } = await supabase
            .from('training_runs')
            .select('start_time, gpu_hours_used, status')
            .eq('user_id', userId)
            .gte('start_time', startDate.toISOString())
            .order('start_time', { ascending: true })

        if (runsError) throw runsError

        // Get exports data
        const { data: exports, error: exportsError } = await supabase
            .from('exports')
            .select('exported_at, format')
            .eq('user_id', userId)
            .gte('exported_at', startDate.toISOString())
            .order('exported_at', { ascending: true })

        if (exportsError) throw exportsError

        // Get usage tracking data (monthly aggregated)
        const { data: usageTracking, error: trackingError } = await supabase
            .from('usage_tracking')
            .select('period_start, gpu_hours_used, exports_count, training_runs_count')
            .eq('user_id', userId)
            .gte('period_start', startDate.toISOString())
            .order('period_start', { ascending: true })

        if (trackingError && trackingError.code !== 'PGRST116') throw trackingError

        // Format GPU hours data (daily aggregation from training runs)
        const gpuHoursData = aggregateDailyData(
            trainingRuns || [],
            'start_time',
            'gpu_hours_used',
            startDate,
            now
        )

        // Format exports data (daily aggregation)
        const exportsData = aggregateDailyData(
            exports || [],
            'exported_at',
            null, // Count, not sum
            startDate,
            now
        )

        // Format training runs data (daily aggregation)
        const trainingRunsData = aggregateDailyData(
            trainingRuns || [],
            'start_time',
            null, // Count, not sum
            startDate,
            now
        )

        return {
            gpuHours: gpuHoursData,
            exports: exportsData,
            trainingRuns: trainingRunsData,
            error: null,
        }
    } catch (error) {
        console.error('Error fetching usage analytics:', error)
        return {
            gpuHours: [],
            exports: [],
            trainingRuns: [],
            error,
        }
    }
}

/**
 * Aggregate data by day
 */
function aggregateDailyData(items, dateField, valueField, startDate, endDate) {
    const dailyMap = new Map()

    // Initialize all days in range
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0]
        dailyMap.set(dateKey, { date: dateKey, value: 0, count: 0 })
        currentDate.setDate(currentDate.getDate() + 1)
    }

    // Aggregate items
    items.forEach(item => {
        if (!item[dateField]) return

        const date = new Date(item[dateField])
        const dateKey = date.toISOString().split('T')[0]

        if (dailyMap.has(dateKey)) {
            const entry = dailyMap.get(dateKey)
            if (valueField) {
                entry.value += parseFloat(item[valueField] || 0)
            } else {
                entry.count += 1
                entry.value = entry.count
            }
        }
    })

    // Convert to array and format
    return Array.from(dailyMap.values())
        .map(entry => ({
            date: entry.date,
            label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.value,
        }))
}

/**
 * Get export format breakdown
 * @param {string} userId - User ID
 * @returns {Promise<{formats: Array, error: Error|null}>}
 */
export async function getExportFormatBreakdown(userId) {
    try {
        if (!userId) {
            return { formats: [], error: new Error('User ID required') }
        }

        // Get exports grouped by format
        const { data: exports, error } = await supabase
            .from('exports')
            .select('format')
            .eq('user_id', userId)

        if (error) throw error

        // Count by format
        const formatCounts = {}
        exports?.forEach(exp => {
            const format = exp.format?.toUpperCase() || 'UNKNOWN'
            formatCounts[format] = (formatCounts[format] || 0) + 1
        })

        // Convert to array
        const formats = Object.entries(formatCounts)
            .map(([format, count]) => ({
                format,
                count,
                value: count, // For chart compatibility
            }))
            .sort((a, b) => b.count - a.count)

        return { formats, error: null }
    } catch (error) {
        console.error('Error fetching export format breakdown:', error)
        return { formats: [], error }
    }
}

/**
 * Get feature usage breakdown from feature_access_log
 * @param {string} userId - User ID
 * @param {string} period - Period: '1d', '7d', '30d', 'all'
 * @returns {Promise<{features: Array, error: Error|null}>}
 */
export async function getFeatureUsageBreakdown(userId, period = '30d') {
    try {
        if (!userId) {
            return { features: [], error: new Error('User ID required') }
        }

        // Calculate date range
        const now = new Date()
        let startDate = new Date()

        switch (period) {
            case '1d':
                startDate.setDate(now.getDate() - 1)
                break
            case '7d':
                startDate.setDate(now.getDate() - 7)
                break
            case '30d':
                startDate.setDate(now.getDate() - 30)
                break
            case 'all':
                startDate = new Date(0)
                break
            default:
                startDate.setDate(now.getDate() - 30)
        }

        // Get feature access logs
        const { data: logs, error } = await supabase
            .from('feature_access_log')
            .select('feature_key, access_granted, created_at')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })

        if (error) throw error

        // Count by feature
        const featureCounts = {}
        logs?.forEach(log => {
            const key = log.feature_key || 'unknown'
            if (!featureCounts[key]) {
                featureCounts[key] = {
                    feature: key,
                    total: 0,
                    granted: 0,
                    denied: 0,
                }
            }
            featureCounts[key].total += 1
            if (log.access_granted) {
                featureCounts[key].granted += 1
            } else {
                featureCounts[key].denied += 1
            }
        })

        // Convert to array and format
        const features = Object.values(featureCounts)
            .map(f => ({
                ...f,
                value: f.granted, // For chart compatibility
                successRate: f.total > 0 ? (f.granted / f.total) * 100 : 0,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10) // Top 10 features

        return { features, error: null }
    } catch (error) {
        console.error('Error fetching feature usage breakdown:', error)
        return { features: [], error }
    }
}

/**
 * Get activity timeline from ide_sync_events
 * @param {string} userId - User ID
 * @param {number} limit - Number of events to fetch
 * @returns {Promise<{activities: Array, error: Error|null}>}
 */
export async function getActivityTimeline(userId, limit = 50) {
    try {
        if (!userId) {
            return { activities: [], error: new Error('User ID required') }
        }

        const { data: events, error } = await supabase
            .from('ide_sync_events')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        // Format events for timeline
        const activities = (events || []).map(event => ({
            id: event.event_id,
            type: event.event_type,
            timestamp: event.created_at,
            status: event.sync_status,
            data: event.event_data || {},
            ideVersion: event.ide_version,
            platform: event.ide_platform,
            error: event.error_message,
        }))

        return { activities, error: null }
    } catch (error) {
        if (error?.code === '42501') {
            return { activities: [], error: null }
        }
        console.error('Error fetching activity timeline:', error)
        return { activities: [], error }
    }
}

/**
 * Get current period usage summary
 * @param {string} userId - User ID
 * @returns {Promise<{summary: Object, error: Error|null}>}
 */
export async function getCurrentPeriodSummary(userId) {
    try {
        if (!userId) {
            return { summary: null, error: new Error('User ID required') }
        }

        const periodStart = new Date()
        periodStart.setDate(1)
        periodStart.setHours(0, 0, 0, 0)

        const { data: usage, error } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', userId)
            .eq('period_start', periodStart.toISOString())
            .maybeSingle()

        if (error && error.code !== 'PGRST116') throw error

        return {
            summary: usage || {
                projects_count: 0,
                exports_count: 0,
                gpu_hours_used: 0,
                training_runs_count: 0,
                period_start: periodStart.toISOString(),
            },
            error: null,
        }
    } catch (error) {
        console.error('Error fetching current period summary:', error)
        return { summary: null, error }
    }
}

