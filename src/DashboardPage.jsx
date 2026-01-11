import './App.css'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from './supabaseClient'
import { projectsApi, downloadsApi, exportsApi, handleApiError } from './utils/api.js'
import { getUserSubscriptionSummary, formatPrice } from './utils/razorpayApi.js'
import { getSubscriptionUsage, getActiveTrial } from './utils/subscriptionApi.js'
import { getUserActivityStats, trackActivity } from './utils/analyticsApi.js'
import { getUsageWithLimits, getCurrentUsage } from './utils/ideFeatureGating.js'
import { getUsagePercentage, isSoftLimitReached, isHardLimitReached } from './utils/usageLimits.js'
import { getUsageAnalytics, getExportFormatBreakdown, getFeatureUsageBreakdown, getActivityTimeline } from './utils/analyticsData.js'
import { subscribeToAllUpdates } from './utils/realtimeSync.js'
import { LimitWarning } from './components/LimitWarning.jsx'
import { UpgradePrompt } from './components/UpgradePrompt.jsx'
import { UsageChart } from './components/UsageChart.jsx'
import { useToast } from './utils/toast.jsx'
import { LoadingSpinner, TableSkeleton } from './components/LoadingSpinner.jsx'

function DashboardPage({ session, navigate }) {
    const toast = useToast()

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            toast.success('Logged out successfully')
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout. Please try again.')
        }
    }
    const user = session?.user
    const meta = user?.user_metadata || {}
    const name = [meta.first_name, meta.last_name].filter(Boolean).join(' ') || user?.email || 'Account'

    const userId = user?.id
    const [license, setLicense] = useState(null)
    const [licenseError, setLicenseError] = useState('')
    const [subscriptionSummary, setSubscriptionSummary] = useState(null)
    const [projects, setProjects] = useState([])
    const [downloads, setDownloads] = useState([])
    const [exports, setExports] = useState([])
    const [usageData, setUsageData] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])
    const [activeTrial, setActiveTrial] = useState(null)
    const [usageWithLimits, setUsageWithLimits] = useState(null)
    const [models, setModels] = useState([])
    const [trainingRuns, setTrainingRuns] = useState([])

    // Analytics data
    const [analyticsPeriod, setAnalyticsPeriod] = useState('30d') // '1d', '7d', '30d', 'all'
    const [gpuHoursData, setGpuHoursData] = useState([])
    const [exportsData, setExportsData] = useState([])
    const [trainingRunsData, setTrainingRunsData] = useState([])
    const [exportFormats, setExportFormats] = useState([])
    const [featureUsage, setFeatureUsage] = useState([])
    const [activityTimeline, setActivityTimeline] = useState([])

    const [loading, setLoading] = useState({
        license: true,
        subscription: true,
        projects: true,
        downloads: true,
        exports: true,
        usage: false,
        activity: false,
        usageLimits: true,
        models: false,
        trainingRuns: false,
        analytics: false,
        exportFormats: false,
        featureUsage: false,
        activityTimeline: false,
    })

    const licenseStatus = useMemo(() => {
        if (!license) return 'Unknown'
        if (!license.is_active) return 'Inactive'
        if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) return 'Expired'
        return 'Active'
    }, [license])

    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        } catch {
            return 'Invalid date'
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never'
        try {
            const date = new Date(dateString)
            return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        } catch {
            return 'Invalid date'
        }
    }

    // Fetch license
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLicenseError('')
            setLoading((prev) => ({ ...prev, license: true }))

            try {
                const { data, error } = await supabase
                    .from('licenses')
                    .select('license_type,is_active,expires_at,issued_at')
                    .eq('user_id', userId)
                    .order('issued_at', { ascending: false })
                    .limit(1)

                if (error) throw error
                if (!mounted) return
                setLicense(data?.[0] || null)
            } catch (e) {
                if (!mounted) return
                setLicenseError(e?.message || 'Unable to load license.')
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, license: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId])

    // Fetch subscription summary
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLoading((prev) => ({ ...prev, subscription: true }))

            try {
                const { data, error } = await getUserSubscriptionSummary()
                if (error) throw error
                if (!mounted) return
                setSubscriptionSummary(data)
            } catch (e) {
                if (!mounted) return
                console.error('Error loading subscription summary:', e)
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, subscription: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId])

    // Fetch projects
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLoading((prev) => ({ ...prev, projects: true }))

            try {
                const { data, error } = await projectsApi.getProjects(userId)
                if (error) throw error
                if (!mounted) return
                setProjects(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading projects:', e)
                toast.error(handleApiError(e, 'Unable to load projects'))
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, projects: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, toast])

    // Fetch downloads
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLoading((prev) => ({ ...prev, downloads: true }))

            try {
                const { data, error } = await downloadsApi.getDownloads(userId)
                if (error) throw error
                if (!mounted) return
                setDownloads(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading downloads:', e)
                toast.error(handleApiError(e, 'Unable to load downloads'))
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, downloads: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, toast])

    // Fetch exports
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLoading((prev) => ({ ...prev, exports: true }))

            try {
                const { data, error } = await exportsApi.getExports(userId)
                if (error) throw error
                if (!mounted) return
                setExports(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading exports:', e)
                toast.error(handleApiError(e, 'Unable to load exports'))
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, exports: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, toast])

    // Load usage data and activity
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId || !subscriptionSummary?.subscription_id) return

            setLoading((prev) => ({ ...prev, usage: true, activity: true }))

            try {
                // Load subscription usage
                const usageResult = await getSubscriptionUsage(subscriptionSummary.subscription_id)
                if (!mounted) return
                if (usageResult.data) {
                    const chartData = usageResult.data.gpuUsage?.slice(-30).map((u, idx) => ({
                        date: new Date(u.usage_start).toISOString().split('T')[0],
                        label: new Date(u.usage_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        value: parseFloat(u.hours_used || 0),
                    })) || []
                    setUsageData(chartData)
                }

                // Load recent activity
                const activityResult = await getUserActivityStats({ userId })
                if (!mounted) return
                if (activityResult.data) {
                    setRecentActivity(activityResult.data.activities?.slice(0, 10) || [])
                }

                // Load active trial
                const trialResult = await getActiveTrial()
                if (!mounted) return
                if (trialResult.data) {
                    setActiveTrial(trialResult.data)
                }
            } catch (e) {
                console.error('Error loading usage/activity:', e)
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, usage: false, activity: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, subscriptionSummary?.subscription_id])

    // Setup real-time subscriptions
    useEffect(() => {
        if (!userId) return

        const unsubscribe = subscribeToAllUpdates(userId, {
            usageTracking: (payload) => {
                console.log('Usage tracking updated:', payload)
                // Refresh usage data
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    getUsageWithLimits(userId).then(result => {
                        if (result.data) {
                            setUsageWithLimits(result.data)
                        }
                    })
                }
            },
            subscription: (payload) => {
                console.log('Subscription updated:', payload)
                // Refresh subscription summary
                getUserSubscriptionSummary().then(result => {
                    if (result.data) {
                        setSubscriptionSummary(result.data)
                    }
                })
            },
            ideSync: (payload) => {
                console.log('IDE sync event:', payload)
                // Refresh activity timeline
                getActivityTimeline(userId, 50).then(result => {
                    if (result.data) {
                        setActivityTimeline(result.data.activities)
                    }
                })
            },
            models: () => {
                // Models will be refreshed by existing effect
            },
            trainingRuns: () => {
                // Training runs will be refreshed by existing effect
            },
            projects: () => {
                // Projects will be refreshed by existing effect
            },
        })

        return () => {
            unsubscribe()
        }
    }, [userId])

    return (
        <>
            <section className="dashHero">
                <div className="container dashHero__inner">
                    <p className="dashHero__kicker">Workspace</p>
                    <h1 className="dashHero__title">{name}</h1>
                    <p className="dashHero__subtitle">Metadata-only dashboard. No datasets, images, or models are uploaded.</p>
                </div>
            </section>

            <section className="dashSection">
                <div className="container">
                    {/* Usage Overview Section (Cursor-style) */}
                    {usageWithLimits && (
                        <article className="dashCard" style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h2 className="dashCard__title">Your Usage</h2>
                                    {usageWithLimits.usage.period_start && (
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--dr-muted)' }}>
                                            {new Date(usageWithLimits.usage.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(usageWithLimits.usage.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className={`button ${analyticsPeriod === '1d' ? 'button--primary' : 'button--outline'}`}
                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                        onClick={() => setAnalyticsPeriod('1d')}
                                    >
                                        1d
                                    </button>
                                    <button
                                        className={`button ${analyticsPeriod === '7d' ? 'button--primary' : 'button--outline'}`}
                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                        onClick={() => setAnalyticsPeriod('7d')}
                                    >
                                        7d
                                    </button>
                                    <button
                                        className={`button ${analyticsPeriod === '30d' ? 'button--primary' : 'button--outline'}`}
                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                        onClick={() => setAnalyticsPeriod('30d')}
                                    >
                                        30d
                                    </button>
                                    <button
                                        className={`button ${analyticsPeriod === 'all' ? 'button--primary' : 'button--outline'}`}
                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                        onClick={() => setAnalyticsPeriod('all')}
                                    >
                                        All
                                    </button>
                                </div>
                            </div>

                            <div className="usage-overview">
                                {/* Projects Usage */}
                                <div className="usage-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Projects</span>
                                        <span style={{ fontSize: '14px', color: 'var(--dr-muted)' }}>
                                            {usageWithLimits.usage.projects_count || 0} / {usageWithLimits.limits.max_projects === -1 ? '∞' : usageWithLimits.limits.max_projects}
                                        </span>
                                    </div>
                                    <div className="usage-progress">
                                        <div
                                            className="usage-progress__bar"
                                            style={{
                                                width: `${getUsagePercentage(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)}%`,
                                                backgroundColor: isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)
                                                    ? '#ef4444'
                                                    : isSoftLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)
                                                        ? '#f59e0b'
                                                        : '#14b8a6'
                                            }}
                                        />
                                    </div>
                                    <LimitWarning
                                        current={usageWithLimits.usage.projects_count || 0}
                                        limit={usageWithLimits.limits.max_projects}
                                        label="projects"
                                        isSoftLimit={isSoftLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)}
                                        isHardLimit={isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)}
                                        onUpgrade={() => navigate('/pricing')}
                                    />
                                </div>

                                {/* Exports Usage */}
                                <div className="usage-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Exports</span>
                                        <span style={{ fontSize: '14px', color: 'var(--dr-muted)' }}>
                                            {usageWithLimits.usage.exports_count || 0} / {usageWithLimits.limits.max_exports_per_month === -1 ? '∞' : usageWithLimits.limits.max_exports_per_month}
                                        </span>
                                    </div>
                                    <div className="usage-progress">
                                        <div
                                            className="usage-progress__bar"
                                            style={{
                                                width: `${getUsagePercentage(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)}%`,
                                                backgroundColor: isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)
                                                    ? '#ef4444'
                                                    : isSoftLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)
                                                        ? '#f59e0b'
                                                        : '#14b8a6'
                                            }}
                                        />
                                    </div>
                                    <LimitWarning
                                        current={usageWithLimits.usage.exports_count || 0}
                                        limit={usageWithLimits.limits.max_exports_per_month}
                                        label="exports"
                                        unit=" per month"
                                        isSoftLimit={isSoftLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)}
                                        isHardLimit={isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)}
                                        onUpgrade={() => navigate('/pricing')}
                                    />
                                </div>

                                {/* GPU Hours Usage */}
                                <div className="usage-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>GPU Hours</span>
                                        <span style={{ fontSize: '14px', color: 'var(--dr-muted)' }}>
                                            {parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0').toFixed(1)} / {usageWithLimits.limits.max_gpu_hours_per_month === -1 ? '∞' : usageWithLimits.limits.max_gpu_hours_per_month}
                                        </span>
                                    </div>
                                    <div className="usage-progress">
                                        <div
                                            className="usage-progress__bar"
                                            style={{
                                                width: `${getUsagePercentage(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)}%`,
                                                backgroundColor: isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                                    ? '#ef4444'
                                                    : isSoftLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                                        ? '#f59e0b'
                                                        : '#14b8a6'
                                            }}
                                        />
                                    </div>
                                    <LimitWarning
                                        current={parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0')}
                                        limit={usageWithLimits.limits.max_gpu_hours_per_month}
                                        label="GPU hours"
                                        unit=" hours"
                                        isSoftLimit={isSoftLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)}
                                        isHardLimit={isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)}
                                        onUpgrade={() => navigate('/pricing')}
                                    />
                                </div>

                                {/* Training Runs Usage */}
                                <div className="usage-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Training Runs</span>
                                        <span style={{ fontSize: '14px', color: 'var(--dr-muted)' }}>
                                            {usageWithLimits.usage.training_runs_count || 0} / {usageWithLimits.limits.max_training_runs_per_month === -1 ? '∞' : usageWithLimits.limits.max_training_runs_per_month}
                                        </span>
                                    </div>
                                    <div className="usage-progress">
                                        <div
                                            className="usage-progress__bar"
                                            style={{
                                                width: `${getUsagePercentage(usageWithLimits.usage.training_runs_count || 0, usageWithLimits.limits.max_training_runs_per_month)}%`,
                                                backgroundColor: isHardLimitReached(usageWithLimits.usage.training_runs_count || 0, usageWithLimits.limits.max_training_runs_per_month)
                                                    ? '#ef4444'
                                                    : isSoftLimitReached(usageWithLimits.usage.training_runs_count || 0, usageWithLimits.limits.max_training_runs_per_month)
                                                        ? '#f59e0b'
                                                        : '#14b8a6'
                                            }}
                                        />
                                    </div>
                                    <LimitWarning
                                        current={usageWithLimits.usage.training_runs_count || 0}
                                        limit={usageWithLimits.limits.max_training_runs_per_month}
                                        label="training runs"
                                        unit=" per month"
                                        isSoftLimit={isSoftLimitReached(usageWithLimits.usage.training_runs_count || 0, usageWithLimits.limits.max_training_runs_per_month)}
                                        isHardLimit={isHardLimitReached(usageWithLimits.usage.training_runs_count || 0, usageWithLimits.limits.max_training_runs_per_month)}
                                        onUpgrade={() => navigate('/pricing')}
                                    />
                                </div>
                            </div>

                            {/* Upgrade Prompt if approaching or at limits */}
                            {(isSoftLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects) ||
                                isSoftLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month) ||
                                isSoftLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month) ||
                                isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects) ||
                                isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month) ||
                                isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)) && (
                                    <UpgradePrompt
                                        title={[
                                            isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects),
                                            isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month),
                                            isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                        ].some(Boolean) ? "Usage Limit Reached" : "Approaching Usage Limits"}
                                        message={[
                                            isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects),
                                            isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month),
                                            isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                        ].some(Boolean)
                                            ? "You've reached one or more usage limits. Upgrade your plan to continue using all features."
                                            : "You're approaching your usage limits. Upgrade your plan to get more resources and avoid interruptions."}
                                        variant={[
                                            isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects),
                                            isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month),
                                            isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                        ].some(Boolean) ? 'error' : 'warning'}
                                        onUpgrade={() => navigate('/pricing')}
                                    />
                                )}
                        </article>
                    )}

                    {/* Quick Stats Cards */}
                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                        <div className="stat-card">
                            <div className="stat-card__label">Total Projects</div>
                            <div className="stat-card__value">{projects.length}</div>
                            <div className="stat-card__subtext">Active projects</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__label">Total Downloads</div>
                            <div className="stat-card__value">{downloads.length}</div>
                            <div className="stat-card__subtext">Downloads</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__label">Total Exports</div>
                            <div className="stat-card__value">{exports.length}</div>
                            <div className="stat-card__subtext">Exported models</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__label">Subscription</div>
                            <div className="stat-card__value">
                                {subscriptionSummary?.plan_type || 'Free'}
                            </div>
                            <div className="stat-card__subtext">
                                {subscriptionSummary?.plan_type === 'free' ? (
                                    <a href="/pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing') }} style={{ color: '#14b8a6', textDecoration: 'underline' }}>
                                        Compare plans →
                                    </a>
                                ) : (
                                    'Active'
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Prompt for Free Users */}
                    {subscriptionSummary?.plan_type === 'free' && !activeTrial && (
                        <div className="dashCard" style={{ marginBottom: '32px', border: '2px solid #14b8a6', background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
                                        Optional: unlock higher limits
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--dr-muted)' }}>
                                        If you’re hitting limits (projects, exports, GPU hours), pick a plan that matches your workload.
                                    </p>
                                </div>
                                <a
                                    className="button button--primary"
                                    href="/pricing"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/pricing')
                                    }}
                                >
                                    See plans
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Trial Banner */}
                    {activeTrial && (
                        <div className="dashCard" style={{ marginBottom: '32px', border: '2px solid #fbbf24', background: '#fef3c7' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
                                        Trial Period Active
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--dr-muted)' }}>
                                        Your trial ends on {formatDate(activeTrial.trial_end)}. Choose a plan if you want higher limits after the trial.
                                    </p>
                                </div>
                                <a
                                    className="button button--primary"
                                    href="/pricing"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/pricing')
                                    }}
                                >
                                    Choose a plan
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="dashGrid">
                        <article className="dashCard">
                            <h2 className="dashCard__title">Overview</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">License tier</div>
                                    <div className="dashRow__value">
                                        {loading.license ? (
                                            <LoadingSpinner size="small" />
                                        ) : (
                                            license?.license_type || 'free'
                                        )}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">IDE version</div>
                                    <div className="dashRow__value">
                                        {projects.length > 0 && projects[0]?.ide_version
                                            ? projects[0].ide_version
                                            : 'Not reported'}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Last IDE activity</div>
                                    <div className="dashRow__value">
                                        {projects.length > 0 && projects[0]?.last_trained_at
                                            ? formatDate(projects[0].last_trained_at)
                                            : 'Not reported'}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Total projects</div>
                                    <div className="dashRow__value">{projects.length}</div>
                                </div>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Subscription & License</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">Plan</div>
                                    <div className="dashRow__value">
                                        {loading.subscription ? (
                                            <LoadingSpinner size="small" />
                                        ) : subscriptionSummary?.plan_type ? (
                                            subscriptionSummary.plan_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                        ) : (
                                            license?.license_type || 'free'
                                        )}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Status</div>
                                    <div className="dashRow__value">
                                        {licenseError ? 'Unavailable' : licenseStatus}
                                        {subscriptionSummary?.subscription_status && subscriptionSummary.subscription_status !== 'active' && (
                                            <span className="dashStatus dashStatus--warning" style={{ marginLeft: '8px' }}>
                                                {subscriptionSummary.subscription_status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {subscriptionSummary?.current_period_end && (
                                    <div className="dashRow">
                                        <div className="dashRow__label">Renews</div>
                                        <div className="dashRow__value">{formatDate(subscriptionSummary.current_period_end)}</div>
                                    </div>
                                )}
                                <div className="dashRow">
                                    <div className="dashRow__label">Last sync</div>
                                    <div className="dashRow__value">Not reported</div>
                                </div>
                            </div>

                            <div className="dashActions">
                                <a
                                    className="button button--outline"
                                    href="/subscription"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/subscription')
                                    }}
                                >
                                    Manage Subscription
                                </a>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Projects (metadata only)</h2>
                            {loading.projects ? (
                                <TableSkeleton rows={3} columns={5} />
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Project</div>
                                        <div>Task</div>
                                        <div>Datasets</div>
                                        <div>Last trained</div>
                                        <div>Status</div>
                                    </div>
                                    {projects.length === 0 ? (
                                        <div className="dashTable__row dashTable__row--empty">
                                            <div className="dashMuted">
                                                No projects yet. Create one in the ML FORGE desktop app — it will appear here once the IDE syncs metadata.
                                                <div style={{ marginTop: '10px' }}>
                                                    <strong>First run checklist</strong>
                                                    <div style={{ marginTop: '8px' }}>
                                                        <div>1) Create your first dataset</div>
                                                        <div>2) Run your first training (YOLO)</div>
                                                        <div>3) Export your first model (ONNX / TensorRT)</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div />
                                            <div />
                                            <div />
                                            <div />
                                        </div>
                                    ) : (
                                        projects.map((project) => (
                                            <div key={project.project_id} className="dashTable__row">
                                                <div>{project.name}</div>
                                                <div>{project.task_type || '—'}</div>
                                                <div>{project.dataset_count}</div>
                                                <div>{formatDate(project.last_trained_at)}</div>
                                                <div>
                                                    <span
                                                        className={`dashStatus dashStatus--${project.status}`}
                                                    >
                                                        {project.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Downloads</h2>
                            {loading.downloads ? (
                                <TableSkeleton rows={3} columns={3} />
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Version</div>
                                        <div>OS</div>
                                        <div>Date</div>
                                    </div>
                                    {downloads.length === 0 ? (
                                        <div className="dashTable__row dashTable__row--empty">
                                            <div className="dashMuted">No downloads recorded yet. Grab an installer from the Download Hub to see download metadata here.</div>
                                            <div />
                                            <div />
                                        </div>
                                    ) : (
                                        downloads.map((download) => (
                                            <div key={download.download_id} className="dashTable__row">
                                                <div>{download.version}</div>
                                                <div>{download.os}</div>
                                                <div>{formatDate(download.downloaded_at)}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Exports (metadata)</h2>
                            {loading.exports ? (
                                <TableSkeleton rows={3} columns={4} />
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Model</div>
                                        <div>Format</div>
                                        <div>Date</div>
                                        <div>Project</div>
                                    </div>
                                    {exports.length === 0 ? (
                                        <div className="dashTable__row dashTable__row--empty">
                                            <div className="dashMuted">
                                                No exports recorded yet. Export a model from the desktop app (e.g., ONNX/TensorRT) and you’ll see export metadata here.
                                                <div style={{ marginTop: '10px' }}>
                                                    Exports are stored locally; this dashboard only shows metadata once the desktop app syncs it.
                                                </div>
                                            </div>
                                            <div />
                                            <div />
                                            <div />
                                        </div>
                                    ) : (
                                        exports.map((exportItem) => {
                                            const project = projects.find(
                                                (p) => p.project_id === exportItem.project_id
                                            )
                                            return (
                                                <div key={exportItem.export_id} className="dashTable__row">
                                                    <div>{exportItem.model_name}</div>
                                                    <div>{exportItem.format.toUpperCase()}</div>
                                                    <div>{formatDate(exportItem.exported_at)}</div>
                                                    <div>{project?.name || '—'}</div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}
                        </article>
                    </div>

                    <div className="dashActions" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <a
                                className="button button--primary"
                                href="/download"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/download')
                                }}
                            >
                                Go to Download Hub
                            </a>
                            {(!subscriptionSummary || subscriptionSummary.plan_type === 'free') && (
                                <a
                                    className="button button--primary"
                                    href="/pricing"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/pricing')
                                    }}
                                >
                                    Compare plans
                                </a>
                            )}
                            <a
                                className="button button--outline"
                                href="/docs"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs')
                                }}
                            >
                                View Docs
                            </a>
                            <a
                                className="button button--outline"
                                href="/teams"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/teams')
                                }}
                            >
                                Teams
                            </a>
                            <a
                                className="button button--outline"
                                href="/subscription"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/subscription')
                                }}
                            >
                                Subscription
                            </a>
                        </div>
                        <button
                            className="button button--outline-dark"
                            onClick={(e) => {
                                e.preventDefault()
                                handleLogout()
                            }}
                            type="button"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </section>

            {/* Analytics Section */}
            <section className="dashSection">
                <div className="container">
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Analytics</h2>
                        <p style={{ color: 'var(--dr-muted)', fontSize: '16px' }}>Track your usage and activity over time</p>
                    </div>

                    <div className="dashGrid">
                        {/* GPU Hours Chart */}
                        <article className="dashCard" style={{ gridColumn: 'span 2' }}>
                            <h2 className="dashCard__title">GPU Hours Usage</h2>
                            {loading.analytics ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : gpuHoursData.length > 0 ? (
                                <UsageChart
                                    data={gpuHoursData}
                                    type="line"
                                    title="GPU Hours"
                                    height={250}
                                />
                            ) : (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <UsageChart
                                        data={[]}
                                        type="line"
                                        title="GPU Hours"
                                        height={250}
                                    />
                                    <p style={{ marginTop: '16px', color: 'var(--dr-muted)', fontSize: '14px' }}>
                                        No GPU usage data available for the selected period.
                                    </p>
                                </div>
                            )}
                        </article>

                        {/* Exports Chart */}
                        <article className="dashCard">
                            <h2 className="dashCard__title">Exports</h2>
                            {loading.analytics ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : exportsData.length > 0 ? (
                                <UsageChart
                                    data={exportsData}
                                    type="bar"
                                    title="Exports per Day"
                                    height={200}
                                />
                            ) : (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <UsageChart
                                        data={[]}
                                        type="bar"
                                        title="Exports per Day"
                                        height={200}
                                    />
                                    <p style={{ marginTop: '16px', color: 'var(--dr-muted)', fontSize: '14px' }}>
                                        No export data available.
                                    </p>
                                </div>
                            )}
                        </article>

                        {/* Training Runs Chart */}
                        <article className="dashCard">
                            <h2 className="dashCard__title">Training Runs</h2>
                            {loading.analytics ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : trainingRunsData.length > 0 ? (
                                <UsageChart
                                    data={trainingRunsData}
                                    type="bar"
                                    title="Training Runs per Day"
                                    height={200}
                                />
                            ) : (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <UsageChart
                                        data={[]}
                                        type="bar"
                                        title="Training Runs per Day"
                                        height={200}
                                    />
                                    <p style={{ marginTop: '16px', color: 'var(--dr-muted)', fontSize: '14px' }}>
                                        No training runs data available.
                                    </p>
                                </div>
                            )}
                        </article>

                        {/* Export Format Breakdown */}
                        <article className="dashCard">
                            <h2 className="dashCard__title">Export Formats</h2>
                            {loading.exportFormats ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : exportFormats.length > 0 ? (
                                <div style={{ padding: '16px 0' }}>
                                    {exportFormats.map((format) => (
                                        <div key={format.format} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 0',
                                            borderBottom: '1px solid var(--dr-border-weak)'
                                        }}>
                                            <span style={{ fontWeight: '500' }}>{format.format}</span>
                                            <span style={{ color: 'var(--dr-muted)' }}>{format.count} exports</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--dr-muted)', fontSize: '14px' }}>
                                        No export formats data available.
                                    </p>
                                </div>
                            )}
                        </article>

                        {/* Feature Usage Breakdown */}
                        <article className="dashCard">
                            <h2 className="dashCard__title">Top Features Used</h2>
                            {loading.featureUsage ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : featureUsage.length > 0 ? (
                                <div style={{ padding: '16px 0' }}>
                                    {featureUsage.map((feature) => (
                                        <div key={feature.feature} style={{
                                            padding: '12px 0',
                                            borderBottom: '1px solid var(--dr-border-weak)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                                                    {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span style={{ color: 'var(--dr-muted)', fontSize: '14px' }}>
                                                    {feature.granted} / {feature.total}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '4px',
                                                backgroundColor: 'var(--dr-border-weak)',
                                                borderRadius: '2px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${feature.successRate}%`,
                                                    height: '100%',
                                                    backgroundColor: feature.successRate > 80 ? '#14b8a6' : '#f59e0b',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--dr-muted)', marginTop: '4px', display: 'block' }}>
                                                {feature.successRate.toFixed(0)}% success rate
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--dr-muted)', fontSize: '14px' }}>
                                        No feature usage data available.
                                    </p>
                                </div>
                            )}
                        </article>
                    </div>
                </div>
            </section>

            {/* Activity Timeline Section */}
            {activityTimeline.length > 0 && (
                <section className="dashSection">
                    <div className="container">
                        <article className="dashCard">
                            <h2 className="dashCard__title">Activity Timeline</h2>
                            <p style={{ margin: '0 0 24px 0', color: 'var(--dr-muted)', fontSize: '14px' }}>
                                Recent IDE sync events and activities
                            </p>
                            {loading.activityTimeline ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="activity-timeline">
                                    {activityTimeline.map((activity, index) => (
                                        <div key={activity.id} className="timeline-item">
                                            <div className="timeline-item__marker">
                                                {activity.status === 'success' ? '✓' : activity.status === 'failed' ? '✗' : '○'}
                                            </div>
                                            <div className="timeline-item__content">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                    <div>
                                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                                            {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        {activity.ideVersion && (
                                                            <span style={{
                                                                marginLeft: '8px',
                                                                fontSize: '12px',
                                                                color: 'var(--dr-muted)',
                                                                padding: '2px 6px',
                                                                backgroundColor: 'var(--dr-surface-2)',
                                                                borderRadius: '4px'
                                                            }}>
                                                                v{activity.ideVersion}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: 'var(--dr-muted)' }}>
                                                        {formatDateTime(activity.timestamp)}
                                                    </span>
                                                </div>
                                                {activity.error && (
                                                    <div style={{
                                                        marginTop: '4px',
                                                        padding: '8px',
                                                        backgroundColor: '#fef2f2',
                                                        border: '1px solid #fecaca',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        color: '#991b1b'
                                                    }}>
                                                        Error: {activity.error}
                                                    </div>
                                                )}
                                                {activity.data && Object.keys(activity.data).length > 0 && (
                                                    <div style={{
                                                        marginTop: '4px',
                                                        fontSize: '12px',
                                                        color: 'var(--dr-muted)',
                                                        fontFamily: 'monospace'
                                                    }}>
                                                        {JSON.stringify(activity.data, null, 2).slice(0, 100)}...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    </div>
                </section>
            )}

            {/* Usage & Activity Section (Legacy - kept for backward compatibility) */}
            {(usageData || recentActivity.length > 0) && (
                <section className="dashSection">
                    <div className="container">
                        <div className="dashGrid">
                            {/* Usage Chart */}
                            {usageData && usageData.length > 0 && (
                                <article className="dashCard" style={{ gridColumn: 'span 2' }}>
                                    <h2 className="dashCard__title">GPU Usage (Last 30 Days)</h2>
                                    {loading.usage ? (
                                        <div style={{ padding: '48px', textAlign: 'center' }}>
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <UsageChart
                                            data={usageData}
                                            type="line"
                                            title="GPU Hours"
                                            height={250}
                                        />
                                    )}
                                </article>
                            )}

                            {/* Recent Activity */}
                            {recentActivity.length > 0 && (
                                <article className="dashCard" style={{ gridColumn: 'span 2' }}>
                                    <h2 className="dashCard__title">Recent Activity</h2>
                                    {loading.activity ? (
                                        <div style={{ padding: '48px', textAlign: 'center' }}>
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <div className="activity-feed">
                                            {recentActivity.map((activity) => (
                                                <div key={activity.activity_id} className="activity-item">
                                                    <div className="activity-item__icon">
                                                        {activity.activity_type === 'login' ? '🔐' :
                                                            activity.activity_type === 'feature_used' ? '⚡' :
                                                                activity.activity_type === 'project_created' ? '📁' : '📊'}
                                                    </div>
                                                    <div className="activity-item__content">
                                                        <div className="activity-item__title">
                                                            {activity.activity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </div>
                                                        <div className="activity-item__time">
                                                            {formatDateTime(activity.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}

export default DashboardPage
