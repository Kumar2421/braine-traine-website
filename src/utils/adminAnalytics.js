/**
 * Admin Analytics Utilities
 * Enterprise-grade analytics for admin dashboard
 * Platform-wide statistics, user analytics, feature adoption, system health
 */

import { supabase } from '../supabaseClient'

/**
 * Get platform-wide usage statistics
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getPlatformUsageStats() {
    try {
        // Get total users (from projects to get unique user count)
        const { data: projectUsers } = await supabase
            .from('projects')
            .select('user_id')
        
        const uniqueUsers = new Set(projectUsers?.map(p => p.user_id) || [])
        const totalUsers = uniqueUsers.size

        // Get active subscriptions
        const { count: activeSubscriptions } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        // Get total projects
        const { count: totalProjects } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })

        // Get total models
        const { count: totalModels } = await supabase
            .from('models')
            .select('*', { count: 'exact', head: true })

        // Get total training runs
        const { count: totalTrainingRuns } = await supabase
            .from('training_runs')
            .select('*', { count: 'exact', head: true })

        // Get total exports
        const { count: totalExports } = await supabase
            .from('exports')
            .select('*', { count: 'exact', head: true })

        // Get total GPU hours (from usage_tracking)
        const { data: usageTracking } = await supabase
            .from('usage_tracking')
            .select('gpu_hours_used')

        const totalGpuHours = usageTracking?.reduce((sum, u) => sum + parseFloat(u.gpu_hours_used || 0), 0) || 0

        // Get plan distribution
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('plan_type, status')
            .eq('status', 'active')

        const planDistribution = {}
        subscriptions?.forEach(sub => {
            planDistribution[sub.plan_type] = (planDistribution[sub.plan_type] || 0) + 1
        })

        return {
            data: {
                totalUsers: totalUsers || 0,
                activeSubscriptions: activeSubscriptions || 0,
                totalProjects: totalProjects || 0,
                totalModels: totalModels || 0,
                totalTrainingRuns: totalTrainingRuns || 0,
                totalExports: totalExports || 0,
                totalGpuHours: totalGpuHours.toFixed(2),
                planDistribution,
            },
            error: null,
        }
    } catch (error) {
        console.error('Error fetching platform usage stats:', error)
        return { data: null, error }
    }
}

/**
 * Get user-level analytics with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getUserLevelAnalytics(filters = {}) {
    try {
        // Get users from auth.users (we need to use a different approach)
        // First, get user IDs from a table we can access
        let userQuery = supabase
            .from('projects')
            .select('user_id')
            .limit(1000)

        const { data: projectUsers, error: projectError } = await userQuery

        if (projectError) throw projectError

        // Get unique user IDs
        const userIds = [...new Set((projectUsers || []).map(p => p.user_id))]

        // Get subscriptions for these users
        let subscriptionQuery = supabase
            .from('subscriptions')
            .select('user_id, plan_type, status, current_period_end')
            .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])
            .in('status', ['active', 'trialing'])

        if (filters.planType) {
            subscriptionQuery = subscriptionQuery.eq('plan_type', filters.planType)
        }
        if (filters.status) {
            subscriptionQuery = subscriptionQuery.eq('status', filters.status)
        }

        const { data: subscriptions, error: subError } = await subscriptionQuery

        if (subError) throw subError

        // Get usage tracking
        const { data: usageTracking, error: usageError } = await supabase
            .from('usage_tracking')
            .select('user_id, projects_count, exports_count, gpu_hours_used, training_runs_count')
            .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])
            .gte('period_end', new Date().toISOString())

        if (usageError) throw usageError

        // Get project counts
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('user_id')
            .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

        if (projectsError) throw projectsError

        // Get model counts
        const { data: models, error: modelsError } = await supabase
            .from('models')
            .select('user_id')
            .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

        if (modelsError) throw modelsError

        // Get training run counts
        const { data: trainingRuns, error: runsError } = await supabase
            .from('training_runs')
            .select('user_id')
            .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

        if (runsError) throw runsError

        // Aggregate data by user
        const userMap = new Map()

        // Initialize users
        userIds.forEach(userId => {
            userMap.set(userId, {
                userId,
                email: `user_${userId.substring(0, 8)}`, // We don't have direct access to email from auth.users
                planType: 'free',
                subscriptionStatus: 'none',
                currentPeriodEnd: null,
                projectsCount: 0,
                exportsCount: 0,
                gpuHoursUsed: 0,
                trainingRunsCount: 0,
                modelsCount: 0,
            })
        })

        // Add subscription data
        subscriptions?.forEach(sub => {
            const user = userMap.get(sub.user_id)
            if (user) {
                user.planType = sub.plan_type
                user.subscriptionStatus = sub.status
                user.currentPeriodEnd = sub.current_period_end
            }
        })

        // Add usage data
        usageTracking?.forEach(usage => {
            const user = userMap.get(usage.user_id)
            if (user) {
                user.projectsCount = usage.projects_count || 0
                user.exportsCount = usage.exports_count || 0
                user.gpuHoursUsed = parseFloat(usage.gpu_hours_used || 0).toFixed(2)
                user.trainingRunsCount = usage.training_runs_count || 0
            }
        })

        // Count projects
        const projectCounts = {}
        projects?.forEach(p => {
            projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1
        })

        // Count models
        const modelCounts = {}
        models?.forEach(m => {
            modelCounts[m.user_id] = (modelCounts[m.user_id] || 0) + 1
        })

        // Count training runs
        const runCounts = {}
        trainingRuns?.forEach(r => {
            runCounts[r.user_id] = (runCounts[r.user_id] || 0) + 1
        })

        // Update user data with counts
        userMap.forEach((user, userId) => {
            user.projectsCount = projectCounts[userId] || user.projectsCount
            user.modelsCount = modelCounts[userId] || 0
            user.trainingRunsCount = runCounts[userId] || user.trainingRunsCount
        })

        // Convert to array and filter
        let formattedUsers = Array.from(userMap.values())

        // Apply search filter
        if (filters.search) {
            formattedUsers = formattedUsers.filter(u => 
                u.email.toLowerCase().includes(filters.search.toLowerCase())
            )
        }

        // Sort and limit
        formattedUsers = formattedUsers
            .sort((a, b) => {
                // Sort by subscription status, then by usage
                if (a.subscriptionStatus !== b.subscriptionStatus) {
                    return a.subscriptionStatus === 'active' ? -1 : 1
                }
                return b.projectsCount - a.projectsCount
            })
            .slice(0, filters.limit || 100)

        return { data: formattedUsers, error: null }
    } catch (error) {
        console.error('Error fetching user-level analytics:', error)
        return { data: [], error }
    }
}

/**
 * Get feature adoption statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getFeatureAdoptionStats(filters = {}) {
    try {
        let query = supabase
            .from('feature_access_log')
            .select('feature_key, access_granted, subscription_tier, created_at')

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate)
        }

        const { data: logs, error } = await query
            .order('created_at', { ascending: false })
            .limit(10000)

        if (error) throw error

        // Group by feature
        const featureStats = {}
        logs?.forEach(log => {
            const key = log.feature_key
            if (!featureStats[key]) {
                featureStats[key] = {
                    feature: key,
                    total: 0,
                    granted: 0,
                    denied: 0,
                    byTier: {},
                }
            }
            featureStats[key].total += 1
            if (log.access_granted) {
                featureStats[key].granted += 1
            } else {
                featureStats[key].denied += 1
            }

            // Track by subscription tier
            const tier = log.subscription_tier || 'free'
            if (!featureStats[key].byTier[tier]) {
                featureStats[key].byTier[tier] = { total: 0, granted: 0 }
            }
            featureStats[key].byTier[tier].total += 1
            if (log.access_granted) {
                featureStats[key].byTier[tier].granted += 1
            }
        })

        // Calculate adoption rates
        const features = Object.values(featureStats)
            .map(f => ({
                ...f,
                adoptionRate: f.total > 0 ? (f.granted / f.total) * 100 : 0,
                denialRate: f.total > 0 ? (f.denied / f.total) * 100 : 0,
            }))
            .sort((a, b) => b.total - a.total)

        // Get most requested features (denied access)
        const mostRequested = features
            .filter(f => f.denied > 0)
            .sort((a, b) => b.denied - a.denied)
            .slice(0, 10)

        return {
            data: {
                features,
                mostRequested,
                totalFeatureChecks: logs?.length || 0,
                uniqueFeatures: features.length,
            },
            error: null,
        }
    } catch (error) {
        console.error('Error fetching feature adoption stats:', error)
        return { data: null, error }
    }
}

/**
 * Get system health metrics
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getSystemHealthMetrics() {
    try {
        const now = new Date()
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Get IDE sync events (last 24 hours)
        const { data: recentSyncEvents, count: totalSyncEvents } = await supabase
            .from('ide_sync_events')
            .select('sync_status, created_at', { count: 'exact' })
            .gte('created_at', last24Hours.toISOString())

        // Calculate sync success rate
        const successfulSyncs = recentSyncEvents?.filter(e => e.sync_status === 'success').length || 0
        const failedSyncs = recentSyncEvents?.filter(e => e.sync_status === 'failed').length || 0
        const syncSuccessRate = totalSyncEvents > 0 ? (successfulSyncs / totalSyncEvents) * 100 : 100

        // Get active IDE sessions (tokens used in last hour)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        const { count: activeSessions } = await supabase
            .from('ide_auth_tokens')
            .select('*', { count: 'exact', head: true })
            .gte('last_sync_at', oneHourAgo.toISOString())
            .or('last_sync_at.is.null,expires_at.gt.' + now.toISOString())

        // Get error rate from feature access logs (last 7 days)
        const { data: recentFeatureLogs, count: totalFeatureLogs } = await supabase
            .from('feature_access_log')
            .select('access_granted', { count: 'exact' })
            .gte('created_at', last7Days.toISOString())

        const deniedAccess = recentFeatureLogs?.filter(l => !l.access_granted).length || 0
        const accessDenialRate = totalFeatureLogs > 0 ? (deniedAccess / totalFeatureLogs) * 100 : 0

        // Get API error rate (from sync events)
        const { count: totalEvents } = await supabase
            .from('ide_sync_events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', last7Days.toISOString())

        const { count: errorEvents } = await supabase
            .from('ide_sync_events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', last7Days.toISOString())
            .eq('sync_status', 'failed')

        const apiErrorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0

        // Get database health (check if we can query)
        let dbHealth = 'healthy'
        try {
            await supabase.from('users').select('id').limit(1)
        } catch (e) {
            dbHealth = 'degraded'
        }

        return {
            data: {
                syncHealth: {
                    successRate: syncSuccessRate.toFixed(2),
                    totalSyncs: totalSyncEvents || 0,
                    successfulSyncs,
                    failedSyncs,
                },
                activeSessions: activeSessions || 0,
                accessDenialRate: accessDenialRate.toFixed(2),
                apiErrorRate: apiErrorRate.toFixed(2),
                dbHealth,
                lastUpdated: now.toISOString(),
            },
            error: null,
        }
    } catch (error) {
        console.error('Error fetching system health metrics:', error)
        return { data: null, error }
    }
}

/**
 * Get IDE sync status dashboard data
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getIDESyncStatus(filters = {}) {
    try {
        let query = supabase
            .from('ide_sync_events')
            .select(`
                *,
                user:user_id(
                    email
                )
            `)
            .order('created_at', { ascending: false })

        if (filters.userId) {
            query = query.eq('user_id', filters.userId)
        }
        if (filters.eventType) {
            query = query.eq('event_type', filters.eventType)
        }
        if (filters.status) {
            query = query.eq('sync_status', filters.status)
        }
        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate)
        }

        const { data: events, error } = await query.limit(1000)

        if (error) throw error

        // Group by event type
        const byEventType = {}
        events?.forEach(event => {
            const type = event.event_type
            if (!byEventType[type]) {
                byEventType[type] = { total: 0, success: 0, failed: 0 }
            }
            byEventType[type].total += 1
            if (event.sync_status === 'success') {
                byEventType[type].success += 1
            } else if (event.sync_status === 'failed') {
                byEventType[type].failed += 1
            }
        })

        // Group by status
        const byStatus = {
            success: events?.filter(e => e.sync_status === 'success').length || 0,
            failed: events?.filter(e => e.sync_status === 'failed').length || 0,
            partial: events?.filter(e => e.sync_status === 'partial').length || 0,
        }

        // Get unique users syncing
        const uniqueUsers = new Set(events?.map(e => e.user_id).filter(Boolean))
        
        // Get recent errors
        const recentErrors = events?.filter(e => e.sync_status === 'failed' && e.error_message)
            .slice(0, 10)
            .map(e => ({
                id: e.event_id,
                user: e.user?.email || 'Unknown',
                type: e.event_type,
                error: e.error_message,
                timestamp: e.created_at,
            }))

        return {
            data: {
                events: events || [],
                byEventType,
                byStatus,
                uniqueUsers: uniqueUsers.size,
                totalEvents: events?.length || 0,
                recentErrors,
            },
            error: null,
        }
    } catch (error) {
        console.error('Error fetching IDE sync status:', error)
        return { data: null, error }
    }
}

/**
 * Get revenue analytics (MRR/ARR)
 * @param {Object} filters - Filter options
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getRevenueAnalytics(filters = {}) {
    try {
        // Get all active subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('plan_type, billing_interval, current_period_start, current_period_end, status')
            .eq('status', 'active')

        if (subError) throw subError

        // Get pricing plans
        const { data: plans, error: plansError } = await supabase
            .from('pricing_plans')
            .select('plan_key, price_monthly, price_yearly')

        if (plansError) throw plansError

        const planPrices = {}
        plans?.forEach(plan => {
            planPrices[plan.plan_key] = {
                monthly: plan.price_monthly || 0,
                yearly: plan.price_yearly || 0,
            }
        })

        // Calculate MRR (Monthly Recurring Revenue)
        let mrr = 0
        subscriptions?.forEach(sub => {
            const prices = planPrices[sub.plan_type]
            if (prices) {
                if (sub.billing_interval === 'monthly') {
                    mrr += prices.monthly
                } else if (sub.billing_interval === 'yearly') {
                    mrr += prices.yearly / 12 // Convert yearly to monthly
                }
            }
        })

        // Calculate ARR (Annual Recurring Revenue)
        const arr = mrr * 12

        // Get revenue by plan
        const revenueByPlan = {}
        subscriptions?.forEach(sub => {
            const prices = planPrices[sub.plan_type]
            if (prices) {
                if (!revenueByPlan[sub.plan_type]) {
                    revenueByPlan[sub.plan_type] = { monthly: 0, yearly: 0, count: 0 }
                }
                if (sub.billing_interval === 'monthly') {
                    revenueByPlan[sub.plan_type].monthly += prices.monthly
                } else {
                    revenueByPlan[sub.plan_type].yearly += prices.yearly
                }
                revenueByPlan[sub.plan_type].count += 1
            }
        })

        // Get revenue trend (last 12 months)
        const revenueTrend = []
        for (let i = 11; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

            // Get subscriptions active during this month
            const monthSubs = subscriptions?.filter(sub => {
                const periodStart = new Date(sub.current_period_start)
                const periodEnd = new Date(sub.current_period_end)
                return periodStart <= monthEnd && periodEnd >= monthStart
            }) || []

            let monthRevenue = 0
            monthSubs.forEach(sub => {
                const prices = planPrices[sub.plan_type]
                if (prices) {
                    if (sub.billing_interval === 'monthly') {
                        monthRevenue += prices.monthly
                    } else {
                        monthRevenue += prices.yearly / 12
                    }
                }
            })

            revenueTrend.push({
                month: monthStart.toISOString().split('T')[0],
                label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                value: monthRevenue,
            })
        }

        return {
            data: {
                mrr: mrr.toFixed(2),
                arr: arr.toFixed(2),
                revenueByPlan,
                revenueTrend,
                totalSubscriptions: subscriptions?.length || 0,
            },
            error: null,
        }
    } catch (error) {
        console.error('Error fetching revenue analytics:', error)
        return { data: null, error }
    }
}

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {string} filename - Filename
 */
export function exportAdminDataToCSV(data, filename = 'admin-export.csv') {
    if (!data || data.length === 0) {
        console.error('No data to export')
        return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header]
            if (value === null || value === undefined) return ''
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
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

