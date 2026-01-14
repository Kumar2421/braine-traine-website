import './App.css'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from './supabaseClient'
import { projectsApi, exportsApi, handleApiError } from './utils/api.js'
import { getUserSubscriptionSummary, formatPrice } from './utils/razorpayApi.js'
import { getSubscriptionUsage, getActiveTrial } from './utils/subscriptionApi.js'
import { getUserActivityStats, trackActivity } from './utils/analyticsApi.js'
import { getUsageWithLimits, getCurrentUsage } from './utils/ideFeatureGating.js'
import { getUsagePercentage, isSoftLimitReached, isHardLimitReached } from './utils/usageLimits.js'
import { getActivityTimeline } from './utils/analyticsData.js'
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
    const [exports, setExports] = useState([])
    const [usageData, setUsageData] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])
    const [activeTrial, setActiveTrial] = useState(null)
    const [usageWithLimits, setUsageWithLimits] = useState(null)
    const [models, setModels] = useState([])
    const [trainingRuns, setTrainingRuns] = useState([])

    const [selectedProjectId, setSelectedProjectId] = useState('')

    const [syncMeta, setSyncMeta] = useState({
        lastSyncAt: null,
        lastSyncEventAt: null,
        lastSyncEventStatus: null,
        lastSyncError: null,
        lastIdeVersion: null,
        lastIdePlatform: null,
    })

    const [activityTimeline, setActivityTimeline] = useState([])

    const [loading, setLoading] = useState({
        license: true,
        subscription: true,
        projects: true,
        exports: true,
        usage: false,
        activity: false,
        usageLimits: true,
        models: false,
        trainingRuns: false,
        activityTimeline: false,
    })

    const selectedProject = useMemo(() => {
        if (!selectedProjectId) return null
        return projects.find((p) => p.project_id === selectedProjectId) || null
    }, [projects, selectedProjectId])

    const projectExports = useMemo(() => {
        if (!selectedProjectId) return []
        return exports.filter((e) => e.project_id === selectedProjectId)
    }, [exports, selectedProjectId])

    const lastProjectExport = useMemo(() => {
        return projectExports[0] || null
    }, [projectExports])

    const projectModels = useMemo(() => {
        if (!selectedProjectId) return []
        return models.filter((m) => m.project_id === selectedProjectId)
    }, [models, selectedProjectId])

    const lastProjectModel = useMemo(() => {
        return projectModels[0] || null
    }, [projectModels])

    const projectResourceSummary = useMemo(() => {
        if (!selectedProjectId) {
            return {
                totalGpuHours: 0,
                lastGpuType: null,
                lastGpuCount: null,
            }
        }

        const totalGpuHours = (trainingRuns || []).reduce((acc, r) => acc + Number(r.gpu_hours_used || 0), 0)
        const last = trainingRuns?.[0] || null
        return {
            totalGpuHours,
            lastGpuType: last?.gpu_type || null,
            lastGpuCount: last?.gpu_count ?? null,
        }
    }, [selectedProjectId, trainingRuns])

    const recommendedNextSteps = useMemo(() => {
        if (!selectedProjectId) {
            return {
                title: 'Select a project to begin',
                items: [
                    {
                        title: 'Pick a project',
                        detail: 'All metrics and timelines are scoped to a single project.',
                    },
                ],
            }
        }

        const datasetCount = Number(selectedProject?.dataset_count || 0)
        const runCount = Number(trainingRuns?.length || 0)
        const exportCount = Number(projectExports?.length || 0)

        const items = []

        if (datasetCount === 0) {
            items.push({
                title: 'Create or sync a dataset',
                detail: 'Create your first dataset in the IDE. Once the IDE syncs, the dataset count will appear here.',
            })
        }

        if (datasetCount > 0 && runCount === 0) {
            items.push({
                title: 'Run your first training',
                detail: 'Start a training run in the IDE. This dashboard will show run status + final metrics once synced.',
            })
        }

        if (runCount > 0 && exportCount === 0) {
            items.push({
                title: 'Export a model artifact',
                detail: 'Export ONNX/TensorRT/etc. from the IDE. This dashboard stores metadata only (format + timestamp).',
            })
        }

        if (syncMeta.lastSyncAt == null) {
            items.push({
                title: 'Check IDE sync health',
                detail: 'No sync timestamp reported yet. Make sure the IDE is authenticated and online for metadata sync.',
            })
        }

        if (items.length === 0) {
            items.push({
                title: 'Review latest outputs',
                detail: 'You have runs and exports. Use the tables below to audit provenance, timestamps, and formats.',
            })
        }

        return {
            title: 'Recommended next steps',
            items,
        }
    }, [selectedProjectId, selectedProject, trainingRuns, projectExports, syncMeta.lastSyncAt])

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

                // Default selection: most recently updated/active project
                const nextDefault = (data || [])?.[0]?.project_id
                if (nextDefault && !selectedProjectId) {
                    setSelectedProjectId(nextDefault)
                }
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

    // Fetch project models (metadata) scoped by project
    useEffect(() => {
        let mounted = true

        const run = async () => {
            if (!userId) return
            if (!selectedProjectId) {
                setModels([])
                return
            }

            setLoading((prev) => ({ ...prev, models: true }))

            try {
                const { data, error } = await supabase
                    .from('models')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('project_id', selectedProjectId)
                    .order('trained_at', { ascending: false })
                    .limit(50)

                if (error) throw error
                if (!mounted) return
                setModels(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading models:', e)
                setModels([])
            } finally {
                if (mounted) setLoading((prev) => ({ ...prev, models: false }))
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, selectedProjectId])

    // Fetch training runs (project-scoped)
    useEffect(() => {
        let mounted = true

        const run = async () => {
            if (!userId || !selectedProjectId) {
                setTrainingRuns([])
                return
            }

            setLoading((prev) => ({ ...prev, trainingRuns: true }))

            try {
                const { data, error } = await supabase
                    .from('training_runs')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('project_id', selectedProjectId)
                    .order('start_time', { ascending: false })
                    .limit(50)

                if (error) throw error
                if (!mounted) return
                setTrainingRuns(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading training runs:', e)
                setTrainingRuns([])
            } finally {
                if (mounted) setLoading((prev) => ({ ...prev, trainingRuns: false }))
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, selectedProjectId])

    // Sync health (project-scoped where possible)
    useEffect(() => {
        let mounted = true

        const run = async () => {
            if (!userId) return

            try {
                const { data: tokenRow } = await supabase
                    .from('ide_auth_tokens')
                    .select('last_sync_at')
                    .eq('user_id', userId)
                    .order('issued_at', { ascending: false })
                    .limit(1)

                const { data: syncRow } = await supabase
                    .from('ide_sync_events')
                    .select('created_at,sync_status,error_message,ide_version,ide_platform,event_data')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(25)

                if (!mounted) return

                const latestToken = tokenRow?.[0] || null
                const events = syncRow || []

                // Attempt to find most recent event for this project (best-effort)
                const projectEvent = selectedProjectId
                    ? events.find((e) => String(e?.event_data?.project_id || '') === String(selectedProjectId))
                    : null

                const latestEvent = projectEvent || events[0] || null

                setSyncMeta({
                    lastSyncAt: latestToken?.last_sync_at || null,
                    lastSyncEventAt: latestEvent?.created_at || null,
                    lastSyncEventStatus: latestEvent?.sync_status || null,
                    lastSyncError: latestEvent?.error_message || null,
                    lastIdeVersion: latestEvent?.ide_version || null,
                    lastIdePlatform: latestEvent?.ide_platform || null,
                })
            } catch (e) {
                if (!mounted) return
                console.error('Error loading sync health:', e)
                setSyncMeta({
                    lastSyncAt: null,
                    lastSyncEventAt: null,
                    lastSyncEventStatus: null,
                    lastSyncError: null,
                    lastIdeVersion: null,
                    lastIdePlatform: null,
                })
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, selectedProjectId])

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
                    {/* Project Selector (Persistent for dashboard) */}
                    <article className="dashCard" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                                <h2 className="dashCard__title">Project</h2>
                                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--dr-muted)' }}>
                                    Select a project to view observability. The dashboard observes. The IDE executes.
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="uiSelect"
                                    style={{ minWidth: '280px' }}
                                    disabled={loading.projects || projects.length === 0}
                                >
                                    <option value="">Select a project…</option>
                                    {projects.map((p) => (
                                        <option key={p.project_id} value={p.project_id}>
                                            {p.name} {p.last_trained_at ? `• last trained ${formatDate(p.last_trained_at)}` : '• no activity yet'}
                                        </option>
                                    ))}
                                </select>
                                <span
                                    className={`dashStatus dashStatus--${selectedProject?.status || 'archived'}`}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {selectedProject?.status || (projects.length ? 'Select project' : 'No projects')}
                                </span>
                            </div>
                        </div>
                    </article>

                    <article className="dashCard" style={{ marginBottom: '16px' }}>
                        <h2 className="dashCard__title">{recommendedNextSteps.title}</h2>
                        <div className="dashRows" style={{ marginTop: '12px' }}>
                            {recommendedNextSteps.items.map((item) => (
                                <div key={item.title} className="dashRow">
                                    <div className="dashRow__label">{item.title}</div>
                                    <div className="dashRow__value">{item.detail}</div>
                                </div>
                            ))}
                        </div>
                    </article>

                    {!selectedProjectId && (
                        <article className="dashCard" style={{ marginBottom: '16px' }}>
                            <h2 className="dashCard__title">No project selected</h2>
                            <div className="dashMuted" style={{ marginTop: '10px' }}>
                                Choose a project above to view:
                                <div style={{ marginTop: '8px' }}>- Dataset summary</div>
                                <div>- Training runs timeline</div>
                                <div>- Export artifacts</div>
                                <div>- Resource snapshots (when reported by the IDE)</div>
                            </div>
                        </article>
                    )}

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

                    {selectedProjectId && (
                        <div className="dashGrid">
                            <article className="dashCard">
                                <h2 className="dashCard__title">Project Overview</h2>
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">Project</div>
                                        <div className="dashRow__value">{selectedProject?.name || '—'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Task</div>
                                        <div className="dashRow__value">{selectedProject?.task_type || 'Not reported'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Datasets</div>
                                        <div className="dashRow__value">{Number(selectedProject?.dataset_count || 0)}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last completed run</div>
                                        <div className="dashRow__value">{selectedProject?.last_trained_at ? formatDateTime(selectedProject.last_trained_at) : 'No activity yet'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Total training runs</div>
                                        <div className="dashRow__value">{loading.trainingRuns ? 'Loading…' : trainingRuns.length}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Total exports</div>
                                        <div className="dashRow__value">{projectExports.length}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last export format</div>
                                        <div className="dashRow__value">{lastProjectExport?.format ? lastProjectExport.format.toUpperCase() : 'No exports yet'}</div>
                                    </div>
                                </div>
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">System Status & Sync Health</h2>
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">IDE version</div>
                                        <div className="dashRow__value">
                                            {syncMeta.lastIdeVersion || selectedProject?.ide_version || 'Not reported'}
                                        </div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">IDE connection</div>
                                        <div className="dashRow__value">
                                            {syncMeta.lastSyncEventAt ? 'Last seen recently (events available)' : 'Not reported'}
                                        </div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last sync</div>
                                        <div className="dashRow__value">{syncMeta.lastSyncAt ? formatDateTime(syncMeta.lastSyncAt) : 'Not reported'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Event backlog</div>
                                        <div className="dashRow__value">Not reported</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Compatibility</div>
                                        <div className="dashRow__value">Not reported</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last sync event</div>
                                        <div className="dashRow__value">
                                            {syncMeta.lastSyncEventAt ? (
                                                <>
                                                    {formatDateTime(syncMeta.lastSyncEventAt)}
                                                    {syncMeta.lastSyncEventStatus ? (
                                                        <span className={`dashStatus dashStatus--${syncMeta.lastSyncEventStatus === 'success' ? 'active' : 'deleted'}`} style={{ marginLeft: '8px' }}>
                                                            {syncMeta.lastSyncEventStatus}
                                                        </span>
                                                    ) : null}
                                                </>
                                            ) : (
                                                'No sync events yet'
                                            )}
                                        </div>
                                    </div>
                                    {syncMeta.lastSyncError ? (
                                        <div className="dashRow">
                                            <div className="dashRow__label">Last error</div>
                                            <div className="dashRow__value">{syncMeta.lastSyncError}</div>
                                        </div>
                                    ) : null}
                                </div>
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">Resource Usage (Project-scoped)</h2>
                                <p style={{ margin: '0 0 12px 0', color: 'var(--dr-muted)', fontSize: '13px' }}>
                                    Snapshot-style summary derived from recorded training runs. Live GPU charts require IDE resource snapshot events.
                                </p>
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">GPU hours (sum)</div>
                                        <div className="dashRow__value">{projectResourceSummary.totalGpuHours.toFixed(2)}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last GPU type</div>
                                        <div className="dashRow__value">{projectResourceSummary.lastGpuType || 'Not reported'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last GPU count</div>
                                        <div className="dashRow__value">{projectResourceSummary.lastGpuCount ?? 'Not reported'}</div>
                                    </div>
                                </div>
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">Dataset & Annotation Summary</h2>
                                <p style={{ margin: '0 0 12px 0', color: 'var(--dr-muted)', fontSize: '13px' }}>
                                    This project currently syncs dataset counts only. Detailed dataset versioning + annotation states are planned.
                                </p>
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">Dataset count</div>
                                        <div className="dashRow__value">{Number(selectedProject?.dataset_count || 0)}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Annotation status</div>
                                        <div className="dashRow__value">Not reported</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last annotation activity</div>
                                        <div className="dashRow__value">Not reported</div>
                                    </div>
                                </div>
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">Live / Recent Activity</h2>
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">Run status</div>
                                        <div className="dashRow__value">
                                            {loading.trainingRuns ? 'Loading…' : trainingRuns?.[0]?.status || 'Idle'}
                                        </div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Progress</div>
                                        <div className="dashRow__value">{trainingRuns?.[0]?.progress_percentage != null ? `${trainingRuns[0].progress_percentage}%` : 'Not reported'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last metric snapshot</div>
                                        <div className="dashRow__value">{trainingRuns?.[0]?.final_metrics ? JSON.stringify(trainingRuns[0].final_metrics).slice(0, 60) + '…' : 'Not reported'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Last reported from IDE</div>
                                        <div className="dashRow__value">{selectedProject?.updated_at ? formatDateTime(selectedProject.updated_at) : 'Not reported'}</div>
                                    </div>
                                </div>
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">Training Runs Timeline</h2>
                                {loading.trainingRuns ? (
                                    <TableSkeleton rows={3} columns={5} />
                                ) : (
                                    <div className="dashTable">
                                        <div className="dashTable__head">
                                            <div>Run</div>
                                            <div>Dataset</div>
                                            <div>Status</div>
                                            <div>Start</div>
                                            <div>Config ID</div>
                                        </div>
                                        {trainingRuns.length === 0 ? (
                                            <div className="dashTable__row dashTable__row--empty">
                                                <div className="dashMuted">No training runs recorded yet for this project.</div>
                                                <div />
                                                <div />
                                                <div />
                                                <div />
                                            </div>
                                        ) : (
                                            trainingRuns.map((run) => (
                                                <div key={run.run_id || run.id} className="dashTable__row">
                                                    <div>{run.run_name || run.run_id}</div>
                                                    <div>{run.config?.dataset_version || '—'}</div>
                                                    <div>
                                                        <span className={`dashStatus dashStatus--${run.status || 'active'}`}>{run.status || 'unknown'}</span>
                                                    </div>
                                                    <div>{formatDateTime(run.start_time)}</div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{(run.ide_run_id || run.run_id || '—').toString().slice(0, 10)}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">Models (metadata)</h2>
                                {loading.models ? (
                                    <TableSkeleton rows={3} columns={5} />
                                ) : (
                                    <div className="dashTable">
                                        <div className="dashTable__head">
                                            <div>Name</div>
                                            <div>Type</div>
                                            <div>Status</div>
                                            <div>Trained</div>
                                            <div>GPU hours</div>
                                        </div>
                                        {projectModels.length === 0 ? (
                                            <div className="dashTable__row dashTable__row--empty">
                                                <div className="dashMuted">No models recorded yet for this project.</div>
                                                <div />
                                                <div />
                                                <div />
                                                <div />
                                            </div>
                                        ) : (
                                            projectModels.map((m) => (
                                                <div key={m.model_id} className="dashTable__row">
                                                    <div>{m.name}</div>
                                                    <div>{m.model_type}</div>
                                                    <div><span className={`dashStatus dashStatus--${m.status || 'active'}`}>{m.status || 'unknown'}</span></div>
                                                    <div>{formatDateTime(m.trained_at || m.created_at)}</div>
                                                    <div>{Number(m.gpu_hours_used || 0).toFixed(2)}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">Model & Export Artifacts</h2>
                                {loading.exports ? (
                                    <TableSkeleton rows={3} columns={4} />
                                ) : (
                                    <div className="dashTable">
                                        <div className="dashTable__head">
                                            <div>Model</div>
                                            <div>Format</div>
                                            <div>Exported</div>
                                            <div>Project</div>
                                        </div>
                                        {projectExports.length === 0 ? (
                                            <div className="dashTable__row dashTable__row--empty">
                                                <div className="dashMuted">No exports recorded yet for this project.</div>
                                                <div />
                                                <div />
                                                <div />
                                            </div>
                                        ) : (
                                            projectExports.map((exportItem) => (
                                                <div key={exportItem.export_id} className="dashTable__row">
                                                    <div>{exportItem.model_name}</div>
                                                    <div>{exportItem.format?.toUpperCase?.() || '—'}</div>
                                                    <div>{formatDate(exportItem.exported_at)}</div>
                                                    <div>{selectedProject?.name || '—'}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </article>
                        </div>
                    )}

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
                                Download Hub
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

            {/* Generic analytics section removed: metrics must be project-scoped */}

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
