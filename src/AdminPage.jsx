import './App.css'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
    isAdmin,
    adminUsersApi,
    adminFeatureFlagsApi,
    adminUsageApi,
    adminActionsApi
} from './utils/adminApi'
import { checkAdminAccess } from './utils/adminAuth'
import {
    getSubscriptionAnalytics,
    getRevenueAnalytics,
    getGPUUsageStats,
    getUserActivityStats,
    exportToCSV,
} from './utils/analyticsApi'
import {
    getPlatformUsageStats,
    getUserLevelAnalytics,
    getFeatureAdoptionStats,
    getSystemHealthMetrics,
    getIDESyncStatus,
    getRevenueAnalytics as getRevenueAnalyticsEnhanced,
    exportAdminDataToCSV,
} from './utils/adminAnalytics'
import { UsageChart } from './components/UsageChart'
import { useToast } from './utils/toast'
import { LoadingSpinner } from './components/LoadingSpinner'

function AdminPage({ session, navigate }) {
    const [loading, setLoading] = useState(true)
    const [isUserAdmin, setIsUserAdmin] = useState(false)
    const [activeTab, setActiveTab] = useState('users') // users, licenses, subscriptions, features, usage, audit, analytics, gpu-usage, activity
    const [users, setUsers] = useState([])
    const [featureFlags, setFeatureFlags] = useState([])
    const [platformStats, setPlatformStats] = useState(null)
    const [auditLog, setAuditLog] = useState([])
    const [userUsage, setUserUsage] = useState({})
    const [subscriptions, setSubscriptions] = useState([])
    const [billingHistory, setBillingHistory] = useState([])
    const [inboxMessages, setInboxMessages] = useState([])
    const [inboxLoading, setInboxLoading] = useState(false)
    const [subscriptionAnalytics, setSubscriptionAnalytics] = useState(null)
    const [revenueAnalytics, setRevenueAnalytics] = useState(null)
    const [gpuUsage, setGpuUsage] = useState(null)
    const [userActivity, setUserActivity] = useState(null)
    const [analyticsLoading, setAnalyticsLoading] = useState(false)

    // Enhanced analytics state
    const [platformUsageStats, setPlatformUsageStats] = useState(null)
    const [userLevelAnalytics, setUserLevelAnalytics] = useState([])
    const [featureAdoption, setFeatureAdoption] = useState(null)
    const [systemHealth, setSystemHealth] = useState(null)
    const [ideSyncStatus, setIdeSyncStatus] = useState(null)
    const [revenueAnalyticsEnhanced, setRevenueAnalyticsEnhanced] = useState(null)

    // Filters for user analytics
    const [userSearchFilter, setUserSearchFilter] = useState('')
    const [userPlanFilter, setUserPlanFilter] = useState('')
    const [userStatusFilter, setUserStatusFilter] = useState('')

    const toast = useToast()

    // Check admin access with enterprise-grade verification
    useEffect(() => {
        const checkAdmin = async () => {
            const hasAccess = await checkAdminAccess(navigate)
            setIsUserAdmin(hasAccess)
            setLoading(false)
            if (!hasAccess) {
                toast.error('Access denied. Admin privileges required.')
            }
        }
        checkAdmin()
    }, [navigate, toast])

    // Load users
    useEffect(() => {
        if (!isUserAdmin) return
        const loadUsers = async () => {
            try {
                const data = await adminUsersApi.getAllUsers()
                setUsers(data || [])
            } catch (e) {
                console.error('Failed to load users:', e)
                toast.error('Failed to load users: ' + e.message)
            }
        }
        loadUsers()
    }, [isUserAdmin, toast])

    // Load feature flags
    useEffect(() => {
        if (!isUserAdmin) return
        const loadFlags = async () => {
            try {
                const data = await adminFeatureFlagsApi.getAllFlags()
                setFeatureFlags(data || [])
            } catch (e) {
                console.error('Failed to load feature flags:', e)
                toast.error('Failed to load feature flags: ' + e.message)
            }
        }
        loadFlags()
    }, [isUserAdmin, toast])

    // Load platform stats
    useEffect(() => {
        if (!isUserAdmin) return
        const loadStats = async () => {
            try {
                const stats = await adminUsageApi.getPlatformStats()
                setPlatformStats(stats)
            } catch (e) {
                console.error('Failed to load platform stats:', e)
            }
        }
        loadStats()
    }, [isUserAdmin])

    // Load audit log
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'audit') return
        const loadAudit = async () => {
            try {
                const data = await adminActionsApi.getActions(50)
                setAuditLog(data || [])
            } catch (e) {
                console.error('Failed to load audit log:', e)
            }
        }
        loadAudit()
    }, [isUserAdmin, activeTab])

    // Load user usage when viewing usage tab
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'usage') return
        const loadUsage = async () => {
            const usageMap = {}
            for (const user of users) {
                try {
                    const usage = await adminUsageApi.getUserUsage(user.user_id)
                    usageMap[user.user_id] = usage
                } catch (e) {
                    console.error(`Failed to load usage for user ${user.user_id}:`, e)
                }
            }
            setUserUsage(usageMap)
        }
        if (users.length > 0) {
            loadUsage()
        }
    }, [isUserAdmin, activeTab, users])

    // Load subscriptions when viewing subscriptions tab
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'subscriptions') return
        const loadSubscriptions = async () => {
            try {
                const { data, error } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setSubscriptions(data || [])
            } catch (e) {
                console.error('Failed to load subscriptions:', e)
                toast.error('Failed to load subscriptions: ' + e.message)
            }
        }
        loadSubscriptions()
    }, [isUserAdmin, activeTab, toast])

    // Load billing history when viewing subscriptions tab
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'subscriptions') return
        const loadBilling = async () => {
            try {
                const { data, error } = await supabase
                    .from('billing_history')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50)

                if (error) throw error
                setBillingHistory(data || [])
            } catch (e) {
                console.error('Failed to load billing history:', e)
            }
        }
        loadBilling()
    }, [isUserAdmin, activeTab])

    // Load inbox when viewing inbox tab
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'inbox') return
        const loadInbox = async () => {
            setInboxLoading(true)
            try {
                const { data, error } = await supabase
                    .from('access_requests')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(200)

                if (error) throw error
                setInboxMessages(data || [])
            } catch (e) {
                console.error('Failed to load inbox:', e)
                toast.error('Failed to load inbox: ' + e.message)
            } finally {
                setInboxLoading(false)
            }
        }
        loadInbox()
    }, [isUserAdmin, activeTab, toast])

    const handleResendInboxMessage = async (requestId) => {
        try {
            const nowIso = new Date().toISOString()
            const currentUserId = session?.user?.id || null

            const current = inboxMessages.find((m) => m.request_id === requestId)
            const nextResendCount = (current?.resend_count || 0) + 1

            const { error } = await supabase
                .from('access_requests')
                .update({
                    resend_count: nextResendCount,
                    resent_at: nowIso,
                    resent_by: currentUserId,
                })
                .eq('request_id', requestId)

            if (error) throw error

            setInboxMessages((prev) =>
                prev.map((m) => (m.request_id === requestId ? { ...m, resend_count: nextResendCount, resent_at: nowIso, resent_by: currentUserId } : m))
            )

            await adminActionsApi.logAction('inbox_resend', null, { request_id: requestId })
            toast.success('Resend recorded')
        } catch (e) {
            console.error('Failed to resend:', e)
            toast.error('Failed to resend: ' + e.message)
        }
    }

    const handleMarkInboxHandled = async (requestId, handled) => {
        try {
            const nowIso = new Date().toISOString()
            const currentUserId = session?.user?.id || null

            const update = handled
                ? { status: 'handled', handled_at: nowIso, handled_by: currentUserId }
                : { status: 'new', handled_at: null, handled_by: null }

            const { error } = await supabase
                .from('access_requests')
                .update(update)
                .eq('request_id', requestId)

            if (error) throw error

            setInboxMessages((prev) =>
                prev.map((m) => (m.request_id === requestId ? { ...m, ...update } : m))
            )

            await adminActionsApi.logAction('inbox_status_update', null, { request_id: requestId, status: handled ? 'handled' : 'new' })
            toast.success(handled ? 'Marked handled' : 'Marked new')
        } catch (e) {
            console.error('Failed to update inbox status:', e)
            toast.error('Failed to update inbox status: ' + e.message)
        }
    }

    // Load analytics when viewing analytics tab
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'analytics') return
        const loadAnalytics = async () => {
            setAnalyticsLoading(true)
            try {
                const [subAnalytics, revAnalytics] = await Promise.all([
                    getSubscriptionAnalytics(),
                    getRevenueAnalytics(),
                ])
                if (subAnalytics.data) setSubscriptionAnalytics(subAnalytics.data)
                if (revAnalytics.data) setRevenueAnalytics(revAnalytics.data)
            } catch (e) {
                console.error('Failed to load analytics:', e)
                toast.error('Failed to load analytics')
            } finally {
                setAnalyticsLoading(false)
            }
        }
        loadAnalytics()
    }, [isUserAdmin, activeTab, toast])

    // Load GPU usage when viewing GPU usage tab
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'gpu-usage') return
        const loadGPUUsage = async () => {
            setAnalyticsLoading(true)
            try {
                const result = await getGPUUsageStats({})
                if (result.data) setGpuUsage(result.data)
            } catch (e) {
                console.error('Failed to load GPU usage:', e)
                toast.error('Failed to load GPU usage')
            } finally {
                setAnalyticsLoading(false)
            }
        }
        loadGPUUsage()
    }, [isUserAdmin, activeTab, toast])

    // Load user activity when viewing activity tab
    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'activity') return
        const loadActivity = async () => {
            setAnalyticsLoading(true)
            try {
                const result = await getUserActivityStats({})
                if (result.data) setUserActivity(result.data)
            } catch (e) {
                console.error('Failed to load user activity:', e)
                toast.error('Failed to load user activity')
            } finally {
                setAnalyticsLoading(false)
            }
        }
        loadActivity()
    }, [isUserAdmin, activeTab, toast])

    const handleToggleUser = async (userId, currentActive) => {
        try {
            await adminUsersApi.toggleUserActive(userId, !currentActive)
            toast.success(`User ${!currentActive ? 'activated' : 'deactivated'}`)
            // Reload users
            const data = await adminUsersApi.getAllUsers()
            setUsers(data || [])
        } catch (e) {
            toast.error('Failed to update user: ' + e.message)
        }
    }

    const handleAssignLicense = async (userId, licenseType) => {
        if (!licenseType) return
        try {
            await adminUsersApi.assignLicense(userId, licenseType)
            toast.success(`License ${licenseType} assigned`)
            const data = await adminUsersApi.getAllUsers()
            setUsers(data || [])
        } catch (e) {
            toast.error('Failed to assign license: ' + e.message)
        }
    }

    const handleUpdateExpiry = async (userId) => {
        const days = prompt('Enter expiry days from now (or leave empty for no expiry):')
        if (days === null) return

        let expiresAt = null
        if (days && !isNaN(days) && parseInt(days) > 0) {
            const expiryDate = new Date()
            expiryDate.setDate(expiryDate.getDate() + parseInt(days))
            expiresAt = expiryDate.toISOString()
        }

        try {
            await adminUsersApi.updateLicenseExpiry(userId, expiresAt)
            toast.success('License expiry updated')
            const data = await adminUsersApi.getAllUsers()
            setUsers(data || [])
        } catch (e) {
            toast.error('Failed to update expiry: ' + e.message)
        }
    }

    const handleToggleOffline = async (userId, currentEnabled) => {
        try {
            await adminUsersApi.toggleOfflineLicense(userId, !currentEnabled)
            toast.success(`Offline license ${!currentEnabled ? 'enabled' : 'disabled'}`)
            const data = await adminUsersApi.getAllUsers()
            setUsers(data || [])
        } catch (e) {
            toast.error('Failed to update offline license: ' + e.message)
        }
    }

    const handleRegenerateToken = async (userId) => {
        if (!confirm('Regenerate token for this user?')) return
        try {
            await adminUsersApi.regenerateToken(userId)
            toast.success('Token regeneration logged')
        } catch (e) {
            toast.error('Failed to regenerate token: ' + e.message)
        }
    }

    const handleForceLogout = async (userId) => {
        if (!confirm('Force logout this user? This will invalidate all their sessions.')) return
        try {
            await adminUsersApi.forceLogout(userId)
            toast.success('Force logout logged')
        } catch (e) {
            toast.error('Failed to force logout: ' + e.message)
        }
    }

    const handleToggleFeature = async (flagKey, currentEnabled) => {
        try {
            await adminFeatureFlagsApi.toggleFlag(flagKey, !currentEnabled)
            toast.success(`Feature ${!currentEnabled ? 'enabled' : 'disabled'}`)
            const data = await adminFeatureFlagsApi.getAllFlags()
            setFeatureFlags(data || [])
        } catch (e) {
            toast.error('Failed to update feature flag: ' + e.message)
        }
    }

    const handleEmergencyDisable = async () => {
        if (!confirm('Emergency disable all features? This will disable all feature flags.')) return
        try {
            await adminFeatureFlagsApi.emergencyDisable()
            toast.success('All features disabled')
            const data = await adminFeatureFlagsApi.getAllFlags()
            setFeatureFlags(data || [])
        } catch (e) {
            toast.error('Failed to disable features: ' + e.message)
        }
    }

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

    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch {
            return 'Invalid date'
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never'
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'Invalid date'
        }
    }

    const getUserEmailById = (userId) => {
        if (!userId) return null
        const match = users.find(u => (u?.users?.id || u?.user_id) === userId)
        return match?.users?.email || null
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <LoadingSpinner />
            </div>
        )
    }

    if (!isUserAdmin) {
        return null
    }

    return (
        <>
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <p className="aboutHero__kicker">Admin Panel</p>
                            <h1 className="aboutHero__title">Platform Administration</h1>
                            <p className="aboutHero__subtitle">
                                Manage users, licenses, feature flags, and monitor platform usage.
                            </p>
                        </div>
                        <button
                            className="button button--outline"
                            onClick={handleLogout}
                            style={{ marginTop: '8px', flexShrink: 0 }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    {/* Platform Stats */}
                    {platformStats && (
                        <div className="unifyGrid" style={{ marginBottom: '32px' }}>
                            <article className="unifyCard">
                                <div className="unifyCard__kicker">Total Users</div>
                                <p className="unifyCard__body" style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: 'rgba(255,255,255,0.95)' }}>
                                    {platformStats.total_users}
                                </p>
                            </article>
                            <article className="unifyCard">
                                <div className="unifyCard__kicker">Total Projects</div>
                                <p className="unifyCard__body" style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: 'rgba(255,255,255,0.95)' }}>
                                    {platformStats.total_projects}
                                </p>
                            </article>
                            <article className="unifyCard">
                                <div className="unifyCard__kicker">Total Downloads</div>
                                <p className="unifyCard__body" style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: 'rgba(255,255,255,0.95)' }}>
                                    {platformStats.total_downloads}
                                </p>
                            </article>
                            <article className="unifyCard">
                                <div className="unifyCard__kicker">Total Exports</div>
                                <p className="unifyCard__body" style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: 'rgba(255,255,255,0.95)' }}>
                                    {platformStats.total_exports}
                                </p>
                            </article>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="adminTabs">
                        <button
                            className={`adminTab ${activeTab === 'users' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'licenses' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('licenses')}
                        >
                            Licenses
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'subscriptions' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('subscriptions')}
                        >
                            Subscriptions
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'inbox' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('inbox')}
                        >
                            Inbox
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'features' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('features')}
                        >
                            Feature Flags
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'usage' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('usage')}
                        >
                            Usage Overview
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'audit' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('audit')}
                        >
                            Audit Log
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'analytics' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            Analytics
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'gpu-usage' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('gpu-usage')}
                        >
                            GPU Usage
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'activity' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('activity')}
                        >
                            Activity
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'platform-analytics' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('platform-analytics')}
                        >
                            Platform Analytics
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'user-analytics' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('user-analytics')}
                        >
                            User Analytics
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'feature-adoption' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('feature-adoption')}
                        >
                            Feature Adoption
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'system-health' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('system-health')}
                        >
                            System Health
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'ide-sync' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('ide-sync')}
                        >
                            IDE Sync Status
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'revenue' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('revenue')}
                        >
                            Revenue
                        </button>
                    </div>

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="adminContent">
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Email</div>
                                    <div>License</div>
                                    <div>Status</div>
                                    <div>Expires</div>
                                    <div>Actions</div>
                                </div>
                                {users.length === 0 ? (
                                    <div className="dashTable__row dashTable__row--empty">
                                        <div className="dashMuted">No users found. If this is a new environment, create a test account and log in once to populate user metadata.</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                ) : (
                                    users.map((item) => {
                                        const user = item.users || {}
                                        const license = item
                                        return (
                                            <div key={user?.id || item.user_id} className="dashTable__row">
                                                <div>{user?.email || `User ${item.user_id?.substring(0, 8)}`}</div>
                                                <div>{license.license_type || 'free'}</div>
                                                <div>
                                                    <span className={`dashStatus dashStatus--${license.is_active ? 'active' : 'archived'}`}>
                                                        {license.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div>{formatDate(license.expires_at)}</div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => handleToggleUser(item.user_id || user?.id, license.is_active)}
                                                    >
                                                        {license.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => handleForceLogout(item.user_id || user?.id)}
                                                    >
                                                        Force Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Licenses Tab */}
                    {activeTab === 'licenses' && (
                        <div className="adminContent">
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Email</div>
                                    <div>License Type</div>
                                    <div>Status</div>
                                    <div>Expires</div>
                                    <div>Offline</div>
                                    <div>Actions</div>
                                </div>
                                {users.length === 0 ? (
                                    <div className="dashTable__row dashTable__row--empty">
                                        <div className="dashMuted">No licenses found. Licenses are created when a user activates the desktop app or when an admin assigns a plan.</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                ) : (
                                    users.map((item) => {
                                        const user = item.users || {}
                                        const license = item
                                        return (
                                            <div key={user?.id || item.user_id} className="dashTable__row">
                                                <div>{user?.email || `User ${item.user_id?.substring(0, 8)}`}</div>
                                                <div>{license.license_type || 'free'}</div>
                                                <div>
                                                    <span className={`dashStatus dashStatus--${license.is_active ? 'active' : 'archived'}`}>
                                                        {license.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div>{formatDate(license.expires_at)}</div>
                                                <div>
                                                    <span className={`dashStatus dashStatus--${license.offline_enabled ? 'active' : 'archived'}`}>
                                                        {license.offline_enabled ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <select
                                                        onChange={(e) => handleAssignLicense(item.user_id || user?.id, e.target.value)}
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto', background: '#202224', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', borderRadius: '6px' }}
                                                        defaultValue=""
                                                    >
                                                        <option value="">Assign Plan</option>
                                                        <option value="free">Free</option>
                                                        <option value="data_pro">Data Pro</option>
                                                        <option value="train_pro">Train Pro</option>
                                                        <option value="deploy_pro">Deploy Pro</option>
                                                        <option value="enterprise">Enterprise</option>
                                                    </select>
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => handleUpdateExpiry(item.user_id || user?.id)}
                                                    >
                                                        Set Expiry
                                                    </button>
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => handleToggleOffline(item.user_id || user?.id, license.offline_enabled)}
                                                    >
                                                        {license.offline_enabled ? 'Disable Offline' : 'Enable Offline'}
                                                    </button>
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => handleRegenerateToken(item.user_id || user?.id)}
                                                    >
                                                        Regenerate Token
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Subscriptions Tab */}
                    {activeTab === 'subscriptions' && (
                        <div className="adminContent">
                            <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Active Subscriptions</h3>
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>User</div>
                                    <div>Plan</div>
                                    <div>Status</div>
                                    <div>Period Start</div>
                                    <div>Period End</div>
                                    <div>Razorpay ID</div>
                                </div>
                                {subscriptions.length === 0 ? (
                                    <div className="dashTable__row dashTable__row--empty">
                                        <div className="dashMuted">No subscriptions found. This is expected for a new install before anyone purchases a plan.</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                ) : (
                                    subscriptions.map((sub) => (
                                        <div key={sub.subscription_id} className="dashTable__row">
                                            <div>{users.find(u => u.user_id === sub.user_id)?.users?.email || `User ${sub.user_id?.substring(0, 8)}`}</div>
                                            <div>{sub.plan_type.replace('_', ' ')}</div>
                                            <div>
                                                <span className={`dashStatus dashStatus--${sub.status === 'active' ? 'active' : 'archived'}`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            <div>{formatDate(sub.current_period_start)}</div>
                                            <div>{formatDate(sub.current_period_end)}</div>
                                            <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                {sub.razorpay_subscription_id ? sub.razorpay_subscription_id.substring(0, 20) + '...' : '—'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <h3 style={{ marginTop: '48px', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Recent Payments</h3>
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Date</div>
                                    <div>User</div>
                                    <div>Amount</div>
                                    <div>Status</div>
                                    <div>Payment ID</div>
                                </div>
                                {billingHistory.length === 0 ? (
                                    <div className="dashTable__row dashTable__row--empty">
                                        <div className="dashMuted">No payments found. Once a subscription is created, payments will appear here as invoices settle.</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                ) : (
                                    billingHistory.map((payment) => (
                                        <div key={payment.billing_id} className="dashTable__row">
                                            <div>{formatDate(payment.created_at)}</div>
                                            <div>{payment.user_id?.substring(0, 8)}</div>
                                            <div>₹{(payment.amount / 100).toFixed(2)}</div>
                                            <div>
                                                <span className={`dashStatus dashStatus--${payment.status === 'paid' ? 'active' : 'archived'}`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                {payment.razorpay_payment_id ? payment.razorpay_payment_id.substring(0, 20) + '...' : '—'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Inbox Tab */}
                    {activeTab === 'inbox' && (
                        <div className="adminContent">
                            <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Inbox</h3>
                            {inboxLoading ? (
                                <div style={{ padding: '24px' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Time</div>
                                        <div>Type</div>
                                        <div>Email</div>
                                        <div>Company</div>
                                        <div>Status</div>
                                        <div>Resends</div>
                                        <div>Actions</div>
                                    </div>
                                    {inboxMessages.length === 0 ? (
                                        <div className="dashTable__row dashTable__row--empty">
                                            <div className="dashMuted">No messages found. Access requests (e.g., air-gapped/offline licensing) will show up here.</div>
                                            <div />
                                            <div />
                                            <div />
                                            <div />
                                            <div />
                                            <div />
                                        </div>
                                    ) : (
                                        inboxMessages.map((msg) => (
                                            <div key={msg.request_id} className="dashTable__row">
                                                <div>{formatDateTime(msg.created_at)}</div>
                                                <div>{(msg.request_type || '').replace(/_/g, ' ')}</div>
                                                <div>{msg.email}</div>
                                                <div>{msg.company || '—'}</div>
                                                <div>
                                                    <span className={`dashStatus dashStatus--${msg.status === 'handled' ? 'active' : 'archived'}`}>
                                                        {msg.status || 'new'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>{msg.resend_count || 0}</div>
                                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
                                                        {msg.resent_at ? `Last: ${formatDateTime(msg.resent_at)}` : '—'}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => handleResendInboxMessage(msg.request_id)}
                                                    >
                                                        Resend
                                                    </button>
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => handleMarkInboxHandled(msg.request_id, msg.status !== 'handled')}
                                                    >
                                                        {msg.status === 'handled' ? 'Mark New' : 'Mark Handled'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {inboxMessages.length > 0 && (
                                <div style={{ marginTop: '16px', color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>
                                    Tip: Open “Resend” to track follow-ups in the inbox. For full email sending integration, we can wire this to an email provider.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feature Flags Tab */}
                    {activeTab === 'features' && (
                        <div className="adminContent">
                            <div className="unifyGrid">
                                {featureFlags.map((flag) => (
                                    <article key={flag.flag_id} className="unifyCard">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div className="unifyCard__kicker">{flag.flag_name}</div>
                                                <p className="unifyCard__body">{flag.description}</p>
                                                <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                                    Category: {flag.category.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <button
                                                className={`button ${flag.enabled ? 'button--primary' : 'button--outline'}`}
                                                onClick={() => handleToggleFeature(flag.flag_key, flag.enabled)}
                                                style={{ minWidth: '100px', flexShrink: 0 }}
                                            >
                                                {flag.enabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <div style={{ marginTop: '24px' }}>
                                <button
                                    className="button button--outline"
                                    onClick={handleEmergencyDisable}
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'rgba(239, 68, 68, 0.9)' }}
                                >
                                    Emergency Disable All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Usage Overview Tab */}
                    {activeTab === 'usage' && (
                        <div className="adminContent">
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Email</div>
                                    <div>Projects</div>
                                    <div>Datasets</div>
                                    <div>Downloads</div>
                                    <div>Exports</div>
                                    <div>Training Runs</div>
                                </div>
                                {users.length === 0 ? (
                                    <div className="dashTable__row dashTable__row--empty">
                                        <div className="dashMuted">No users found. Create a test account to verify usage tracking and admin controls end-to-end.</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                ) : (
                                    users.map((item) => {
                                        const user = item.users || {}
                                        const usage = userUsage[item.user_id] || {}
                                        return (
                                            <div key={user?.id || item.user_id} className="dashTable__row">
                                                <div>{user?.email || `User ${item.user_id?.substring(0, 8)}`}</div>
                                                <div>{usage.projects_count || 0}</div>
                                                <div>{usage.datasets_count || 0}</div>
                                                <div>{usage.downloads_count || 0}</div>
                                                <div>{usage.exports_count || 0}</div>
                                                <div>{usage.training_runs || 0}</div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Audit Log Tab */}
                    {activeTab === 'audit' && (
                        <div className="adminContent">
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Time</div>
                                    <div>Admin</div>
                                    <div>Action</div>
                                    <div>Target</div>
                                    <div>Details</div>
                                </div>
                                {auditLog.length === 0 ? (
                                    <div className="dashTable__row dashTable__row--empty">
                                        <div className="dashMuted">No audit log entries found. Admin actions (plan assignment, user toggles, token resets) will appear here.</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                ) : (
                                    auditLog.map((action) => (
                                        <div key={action.action_id} className="dashTable__row">
                                            <div>{formatDateTime(action.created_at)}</div>
                                            <div>{getUserEmailById(action.admin_user_id) || 'N/A'}</div>
                                            <div>{action.action_type.replace(/_/g, ' ')}</div>
                                            <div>{getUserEmailById(action.target_user_id) || '—'}</div>
                                            <div style={{ fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {action.details ? JSON.stringify(action.details).substring(0, 50) + '...' : '—'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="adminContent">
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>Analytics Dashboard</h2>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <>
                                    {/* Quick Stats */}
                                    <div className="analytics-dashboard">
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Total Subscriptions</div>
                                            <div className="analytics-card__value">
                                                {subscriptions.length}
                                            </div>
                                            <div className="analytics-card__change">Active subscriptions</div>
                                        </div>
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Total Revenue</div>
                                            <div className="analytics-card__value">
                                                {revenueAnalytics
                                                    ? `₹${((revenueAnalytics.reduce((sum, r) => sum + (r.paid_revenue_paise || 0), 0)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                    : '₹0.00'}
                                            </div>
                                            <div className="analytics-card__change">All time</div>
                                        </div>
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Active Users</div>
                                            <div className="analytics-card__value">
                                                {users.filter(u => u.is_active).length}
                                            </div>
                                            <div className="analytics-card__change">Out of {users.length} total</div>
                                        </div>
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Monthly Recurring Revenue</div>
                                            <div className="analytics-card__value">
                                                {revenueAnalytics
                                                    ? `₹${((revenueAnalytics.filter(r => r.month === new Date().toISOString().slice(0, 7)).reduce((sum, r) => sum + (r.paid_revenue_paise || 0), 0)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                    : '₹0.00'}
                                            </div>
                                            <div className="analytics-card__change">This month</div>
                                        </div>
                                    </div>

                                    {/* Subscription Analytics Chart */}
                                    {subscriptionAnalytics && subscriptionAnalytics.length > 0 && (
                                        <div style={{ marginTop: '32px' }}>
                                            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                                Subscription Trends
                                            </h3>
                                            <UsageChart
                                                data={subscriptionAnalytics.map(a => ({
                                                    date: a.date,
                                                    label: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                                    value: a.new_subscriptions || 0,
                                                }))}
                                                type="bar"
                                                title="New Subscriptions"
                                                height={250}
                                            />
                                        </div>
                                    )}

                                    {/* Revenue Chart */}
                                    {revenueAnalytics && revenueAnalytics.length > 0 && (
                                        <div style={{ marginTop: '32px' }}>
                                            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                                Revenue Trends
                                            </h3>
                                            <UsageChart
                                                data={revenueAnalytics.map(r => ({
                                                    date: r.date,
                                                    label: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                                    value: (r.paid_revenue_paise || 0) / 100,
                                                }))}
                                                type="line"
                                                title="Daily Revenue (₹)"
                                                height={250}
                                            />
                                        </div>
                                    )}

                                    {/* Export Buttons */}
                                    <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                        <button
                                            className="button button--outline"
                                            onClick={() => {
                                                if (subscriptionAnalytics) {
                                                    exportToCSV(subscriptionAnalytics, 'subscription-analytics.csv')
                                                    toast.success('Subscription analytics exported')
                                                }
                                            }}
                                        >
                                            Export Subscription Analytics
                                        </button>
                                        <button
                                            className="button button--outline"
                                            onClick={() => {
                                                if (revenueAnalytics) {
                                                    exportToCSV(revenueAnalytics, 'revenue-analytics.csv')
                                                    toast.success('Revenue analytics exported')
                                                }
                                            }}
                                        >
                                            Export Revenue Analytics
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* GPU Usage Tab */}
                    {activeTab === 'gpu-usage' && (
                        <div className="adminContent">
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>GPU Usage Tracking</h2>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : gpuUsage ? (
                                <>
                                    {/* GPU Usage Stats */}
                                    <div className="analytics-dashboard">
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Total GPU Hours</div>
                                            <div className="analytics-card__value">
                                                {gpuUsage.totals.totalHours.toFixed(2)}
                                            </div>
                                            <div className="analytics-card__change">All time</div>
                                        </div>
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Total Cost</div>
                                            <div className="analytics-card__value">
                                                ₹{gpuUsage.totals.totalCost.toFixed(2)}
                                            </div>
                                            <div className="analytics-card__change">GPU costs</div>
                                        </div>
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Usage Sessions</div>
                                            <div className="analytics-card__value">
                                                {gpuUsage.totals.count}
                                            </div>
                                            <div className="analytics-card__change">Total sessions</div>
                                        </div>
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Avg Cost/Session</div>
                                            <div className="analytics-card__value">
                                                ₹{gpuUsage.totals.count > 0 ? (gpuUsage.totals.totalCost / gpuUsage.totals.count).toFixed(2) : '0.00'}
                                            </div>
                                            <div className="analytics-card__change">Average</div>
                                        </div>
                                    </div>

                                    {/* GPU Usage Table */}
                                    <div style={{ marginTop: '32px' }}>
                                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                            Recent GPU Usage
                                        </h3>
                                        <div className="dashTable">
                                            <div className="dashTable__head">
                                                <div>User</div>
                                                <div>GPU Type</div>
                                                <div>Hours</div>
                                                <div>Cost</div>
                                                <div>Date</div>
                                                <div>Status</div>
                                            </div>
                                            {gpuUsage.usage && gpuUsage.usage.length > 0 ? (
                                                gpuUsage.usage.slice(0, 50).map((usage) => (
                                                    <div key={usage.usage_id} className="dashTable__row">
                                                        <div>{usage.user_id?.substring(0, 8)}...</div>
                                                        <div>{usage.gpu_type} x{usage.gpu_count}</div>
                                                        <div>{parseFloat(usage.hours_used || 0).toFixed(2)}</div>
                                                        <div>₹{parseFloat(usage.total_cost || 0).toFixed(2)}</div>
                                                        <div>{formatDate(usage.usage_start)}</div>
                                                        <div>
                                                            <span className={`dashStatus dashStatus--${usage.status === 'completed' ? 'active' : 'archived'}`}>
                                                                {usage.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dashTable__row dashTable__row--empty">
                                                    <div className="dashMuted">No GPU usage recorded yet.</div>
                                                    <div />
                                                    <div />
                                                    <div />
                                                    <div />
                                                    <div />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Export Button */}
                                    <div style={{ marginTop: '24px' }}>
                                        <button
                                            className="button button--outline"
                                            onClick={() => {
                                                if (gpuUsage.usage) {
                                                    exportToCSV(gpuUsage.usage, 'gpu-usage.csv')
                                                    toast.success('GPU usage data exported')
                                                }
                                            }}
                                        >
                                            Export GPU Usage Data
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No GPU usage data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Platform Analytics Tab */}
                    {activeTab === 'platform-analytics' && (
                        <div className="adminContent">
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>Platform-Wide Analytics</h2>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : platformUsageStats ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Users</div>
                                            <div className="stat-card__value">{platformUsageStats.totalUsers}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Active Subscriptions</div>
                                            <div className="stat-card__value">{platformUsageStats.activeSubscriptions}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Projects</div>
                                            <div className="stat-card__value">{platformUsageStats.totalProjects}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Models</div>
                                            <div className="stat-card__value">{platformUsageStats.totalModels}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Training Runs</div>
                                            <div className="stat-card__value">{platformUsageStats.totalTrainingRuns}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Exports</div>
                                            <div className="stat-card__value">{platformUsageStats.totalExports}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total GPU Hours</div>
                                            <div className="stat-card__value">{platformUsageStats.totalGpuHours}</div>
                                        </div>
                                    </div>

                                    {/* Plan Distribution */}
                                    {Object.keys(platformUsageStats.planDistribution || {}).length > 0 && (
                                        <div className="dashCard" style={{ marginBottom: '32px' }}>
                                            <h3 className="dashCard__title">Plan Distribution</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {Object.entries(platformUsageStats.planDistribution).map(([plan, count]) => (
                                                    <div key={plan} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <span style={{ fontWeight: '500' }}>
                                                            {plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        <span style={{ color: 'var(--dr-muted)' }}>{count} users</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No platform statistics available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Analytics Tab */}
                    {activeTab === 'user-analytics' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>User-Level Analytics</h2>
                                <button
                                    className="button button--outline"
                                    onClick={() => exportAdminDataToCSV(userLevelAnalytics, 'user-analytics.csv')}
                                    disabled={userLevelAnalytics.length === 0}
                                >
                                    Export CSV
                                </button>
                            </div>

                            {/* Filters */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px',
                                padding: '16px',
                                backgroundColor: 'var(--dr-surface-2)',
                                borderRadius: '8px'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Search by email..."
                                    value={userSearchFilter}
                                    onChange={(e) => setUserSearchFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                                <select
                                    value={userPlanFilter}
                                    onChange={(e) => setUserPlanFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Plans</option>
                                    <option value="free">Free</option>
                                    <option value="data_pro">Data Pro</option>
                                    <option value="train_pro">Train Pro</option>
                                    <option value="deploy_pro">Deploy Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                                <select
                                    value={userStatusFilter}
                                    onChange={(e) => setUserStatusFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="trialing">Trialing</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="past_due">Past Due</option>
                                </select>
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : userLevelAnalytics.length > 0 ? (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Email</div>
                                        <div>Plan</div>
                                        <div>Status</div>
                                        <div>Projects</div>
                                        <div>Exports</div>
                                        <div>GPU Hours</div>
                                        <div>Training Runs</div>
                                        <div>Models</div>
                                    </div>
                                    {userLevelAnalytics.map((user) => (
                                        <div key={user.userId} className="dashTable__row">
                                            <div>{user.email}</div>
                                            <div>{user.planType.replace('_', ' ')}</div>
                                            <div>
                                                <span className={`dashStatus dashStatus--${user.subscriptionStatus === 'active' ? 'active' : 'archived'}`}>
                                                    {user.subscriptionStatus}
                                                </span>
                                            </div>
                                            <div>{user.projectsCount}</div>
                                            <div>{user.exportsCount}</div>
                                            <div>{user.gpuHoursUsed}</div>
                                            <div>{user.trainingRunsCount}</div>
                                            <div>{user.modelsCount}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No users found.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feature Adoption Tab */}
                    {activeTab === 'feature-adoption' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Feature Adoption Tracking</h2>
                                {featureAdoption && (
                                    <button
                                        className="button button--outline"
                                        onClick={() => exportAdminDataToCSV(featureAdoption.features, 'feature-adoption.csv')}
                                    >
                                        Export CSV
                                    </button>
                                )}
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : featureAdoption ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Feature Checks</div>
                                            <div className="stat-card__value">{featureAdoption.totalFeatureChecks}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Unique Features</div>
                                            <div className="stat-card__value">{featureAdoption.uniqueFeatures}</div>
                                        </div>
                                    </div>

                                    {/* Top Features */}
                                    <div className="dashCard" style={{ marginBottom: '32px' }}>
                                        <h3 className="dashCard__title">Top Features by Usage</h3>
                                        <div style={{ padding: '16px 0' }}>
                                            {featureAdoption.features.slice(0, 20).map((feature) => (
                                                <div key={feature.feature} style={{
                                                    padding: '16px 0',
                                                    borderBottom: '1px solid var(--dr-border-weak)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: '500', fontSize: '14px' }}>
                                                            {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        <span style={{ color: 'var(--dr-muted)', fontSize: '14px' }}>
                                                            {feature.granted} / {feature.total} ({feature.adoptionRate.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '6px',
                                                        backgroundColor: 'var(--dr-border-weak)',
                                                        borderRadius: '3px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${feature.adoptionRate}%`,
                                                            height: '100%',
                                                            backgroundColor: feature.adoptionRate > 80 ? '#14b8a6' : feature.adoptionRate > 50 ? '#f59e0b' : '#ef4444',
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Most Requested Features */}
                                    {featureAdoption.mostRequested && featureAdoption.mostRequested.length > 0 && (
                                        <div className="dashCard">
                                            <h3 className="dashCard__title">Most Requested Features (Access Denied)</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {featureAdoption.mostRequested.map((feature) => (
                                                    <div key={feature.feature} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <span style={{ fontWeight: '500' }}>
                                                            {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        <span style={{ color: 'var(--dr-muted)' }}>
                                                            {feature.denied} denied requests
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No feature adoption data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* System Health Tab */}
                    {activeTab === 'system-health' && (
                        <div className="adminContent">
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>System Health Monitoring</h2>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : systemHealth ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Sync Success Rate</div>
                                            <div className="stat-card__value">{systemHealth.syncHealth.successRate}%</div>
                                            <div className="stat-card__subtext">
                                                {systemHealth.syncHealth.successfulSyncs} / {systemHealth.syncHealth.totalSyncs}
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Active IDE Sessions</div>
                                            <div className="stat-card__value">{systemHealth.activeSessions}</div>
                                            <div className="stat-card__subtext">Last hour</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Access Denial Rate</div>
                                            <div className="stat-card__value">{systemHealth.accessDenialRate}%</div>
                                            <div className="stat-card__subtext">Last 7 days</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">API Error Rate</div>
                                            <div className="stat-card__value">{systemHealth.apiErrorRate}%</div>
                                            <div className="stat-card__subtext">Last 7 days</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Database Health</div>
                                            <div className="stat-card__value">
                                                <span style={{
                                                    color: systemHealth.dbHealth === 'healthy' ? '#14b8a6' : '#f59e0b',
                                                    fontWeight: '600'
                                                }}>
                                                    {systemHealth.dbHealth.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sync Health Details */}
                                    <div className="dashCard" style={{ marginBottom: '32px' }}>
                                        <h3 className="dashCard__title">Sync Health Details</h3>
                                        <div style={{ padding: '16px 0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--dr-border-weak)' }}>
                                                <span>Total Syncs (24h)</span>
                                                <span style={{ fontWeight: '500' }}>{systemHealth.syncHealth.totalSyncs}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--dr-border-weak)' }}>
                                                <span>Successful</span>
                                                <span style={{ color: '#14b8a6', fontWeight: '500' }}>{systemHealth.syncHealth.successfulSyncs}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                                <span>Failed</span>
                                                <span style={{ color: '#ef4444', fontWeight: '500' }}>{systemHealth.syncHealth.failedSyncs}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '12px', color: 'var(--dr-muted)', textAlign: 'right' }}>
                                        Last updated: {formatDateTime(systemHealth.lastUpdated)}
                                    </div>
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No system health data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* IDE Sync Status Tab */}
                    {activeTab === 'ide-sync' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>IDE Sync Status Dashboard</h2>
                                {ideSyncStatus && (
                                    <button
                                        className="button button--outline"
                                        onClick={() => exportAdminDataToCSV(ideSyncStatus.events, 'ide-sync-events.csv')}
                                    >
                                        Export CSV
                                    </button>
                                )}
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : ideSyncStatus ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Events</div>
                                            <div className="stat-card__value">{ideSyncStatus.totalEvents}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Unique Users</div>
                                            <div className="stat-card__value">{ideSyncStatus.uniqueUsers}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Successful</div>
                                            <div className="stat-card__value" style={{ color: '#14b8a6' }}>
                                                {ideSyncStatus.byStatus.success}
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Failed</div>
                                            <div className="stat-card__value" style={{ color: '#ef4444' }}>
                                                {ideSyncStatus.byStatus.failed}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Events by Type */}
                                    {Object.keys(ideSyncStatus.byEventType || {}).length > 0 && (
                                        <div className="dashCard" style={{ marginBottom: '32px' }}>
                                            <h3 className="dashCard__title">Events by Type</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {Object.entries(ideSyncStatus.byEventType).map(([type, stats]) => (
                                                    <div key={type} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <div>
                                                            <span style={{ fontWeight: '500' }}>
                                                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                            <div style={{ fontSize: '12px', color: 'var(--dr-muted)', marginTop: '4px' }}>
                                                                {stats.success} success, {stats.failed} failed
                                                            </div>
                                                        </div>
                                                        <span style={{ color: 'var(--dr-muted)' }}>{stats.total} total</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Errors */}
                                    {ideSyncStatus.recentErrors && ideSyncStatus.recentErrors.length > 0 && (
                                        <div className="dashCard">
                                            <h3 className="dashCard__title">Recent Errors</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {ideSyncStatus.recentErrors.map((error) => (
                                                    <div key={error.id} style={{
                                                        padding: '12px',
                                                        marginBottom: '12px',
                                                        backgroundColor: '#fef2f2',
                                                        border: '1px solid #fecaca',
                                                        borderRadius: '4px'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                            <span style={{ fontWeight: '500', fontSize: '14px' }}>{error.user}</span>
                                                            <span style={{ fontSize: '12px', color: 'var(--dr-muted)' }}>
                                                                {formatDateTime(error.timestamp)}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
                                                            {error.type}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#991b1b' }}>
                                                            {error.error}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No IDE sync data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Revenue Tab */}
                    {activeTab === 'revenue' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Revenue Analytics</h2>
                                {revenueAnalyticsEnhanced && (
                                    <button
                                        className="button button--outline"
                                        onClick={() => exportAdminDataToCSV(revenueAnalyticsEnhanced.revenueTrend, 'revenue-trend.csv')}
                                    >
                                        Export Revenue Trend
                                    </button>
                                )}
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : revenueAnalyticsEnhanced ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Monthly Recurring Revenue (MRR)</div>
                                            <div className="stat-card__value">₹{parseFloat(revenueAnalyticsEnhanced.mrr).toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Annual Recurring Revenue (ARR)</div>
                                            <div className="stat-card__value">₹{parseFloat(revenueAnalyticsEnhanced.arr).toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Subscriptions</div>
                                            <div className="stat-card__value">{revenueAnalyticsEnhanced.totalSubscriptions}</div>
                                        </div>
                                    </div>

                                    {/* Revenue Trend Chart */}
                                    {revenueAnalyticsEnhanced.revenueTrend && revenueAnalyticsEnhanced.revenueTrend.length > 0 && (
                                        <div className="dashCard" style={{ marginBottom: '32px' }}>
                                            <h3 className="dashCard__title">Revenue Trend (Last 12 Months)</h3>
                                            <UsageChart
                                                data={revenueAnalyticsEnhanced.revenueTrend}
                                                type="line"
                                                title="MRR"
                                                height={300}
                                            />
                                        </div>
                                    )}

                                    {/* Revenue by Plan */}
                                    {Object.keys(revenueAnalyticsEnhanced.revenueByPlan || {}).length > 0 && (
                                        <div className="dashCard">
                                            <h3 className="dashCard__title">Revenue by Plan</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {Object.entries(revenueAnalyticsEnhanced.revenueByPlan).map(([plan, revenue]) => (
                                                    <div key={plan} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <div>
                                                            <span style={{ fontWeight: '500' }}>
                                                                {plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                            <div style={{ fontSize: '12px', color: 'var(--dr-muted)', marginTop: '4px' }}>
                                                                {revenue.count} subscriptions
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: '500' }}>
                                                                ₹{((revenue.monthly || 0) + (revenue.yearly || 0) / 12).toFixed(2)}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: 'var(--dr-muted)' }}>
                                                                Monthly
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No revenue data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Platform Analytics Tab */}
                    {activeTab === 'platform-analytics' && (
                        <div className="adminContent">
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>Platform-Wide Analytics</h2>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : platformUsageStats ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Users</div>
                                            <div className="stat-card__value">{platformUsageStats.totalUsers}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Active Subscriptions</div>
                                            <div className="stat-card__value">{platformUsageStats.activeSubscriptions}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Projects</div>
                                            <div className="stat-card__value">{platformUsageStats.totalProjects}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Models</div>
                                            <div className="stat-card__value">{platformUsageStats.totalModels}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Training Runs</div>
                                            <div className="stat-card__value">{platformUsageStats.totalTrainingRuns}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Exports</div>
                                            <div className="stat-card__value">{platformUsageStats.totalExports}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total GPU Hours</div>
                                            <div className="stat-card__value">{platformUsageStats.totalGpuHours}</div>
                                        </div>
                                    </div>

                                    {/* Plan Distribution */}
                                    {Object.keys(platformUsageStats.planDistribution || {}).length > 0 && (
                                        <div className="dashCard" style={{ marginBottom: '32px' }}>
                                            <h3 className="dashCard__title">Plan Distribution</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {Object.entries(platformUsageStats.planDistribution).map(([plan, count]) => (
                                                    <div key={plan} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <span style={{ fontWeight: '500' }}>
                                                            {plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        <span style={{ color: 'var(--dr-muted)' }}>{count} users</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No platform statistics available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Analytics Tab */}
                    {activeTab === 'user-analytics' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>User-Level Analytics</h2>
                                <button
                                    className="button button--outline"
                                    onClick={() => exportAdminDataToCSV(userLevelAnalytics, 'user-analytics.csv')}
                                    disabled={userLevelAnalytics.length === 0}
                                >
                                    Export CSV
                                </button>
                            </div>

                            {/* Filters */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px',
                                padding: '16px',
                                backgroundColor: 'var(--dr-surface-2)',
                                borderRadius: '8px'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Search by email..."
                                    value={userSearchFilter}
                                    onChange={(e) => setUserSearchFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                                <select
                                    value={userPlanFilter}
                                    onChange={(e) => setUserPlanFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Plans</option>
                                    <option value="free">Free</option>
                                    <option value="data_pro">Data Pro</option>
                                    <option value="train_pro">Train Pro</option>
                                    <option value="deploy_pro">Deploy Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                                <select
                                    value={userStatusFilter}
                                    onChange={(e) => setUserStatusFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="trialing">Trialing</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="past_due">Past Due</option>
                                </select>
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : userLevelAnalytics.length > 0 ? (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Email</div>
                                        <div>Plan</div>
                                        <div>Status</div>
                                        <div>Projects</div>
                                        <div>Exports</div>
                                        <div>GPU Hours</div>
                                        <div>Training Runs</div>
                                        <div>Models</div>
                                    </div>
                                    {userLevelAnalytics.map((user) => (
                                        <div key={user.userId} className="dashTable__row">
                                            <div>{user.email}</div>
                                            <div>{user.planType.replace('_', ' ')}</div>
                                            <div>
                                                <span className={`dashStatus dashStatus--${user.subscriptionStatus === 'active' ? 'active' : 'archived'}`}>
                                                    {user.subscriptionStatus}
                                                </span>
                                            </div>
                                            <div>{user.projectsCount}</div>
                                            <div>{user.exportsCount}</div>
                                            <div>{user.gpuHoursUsed}</div>
                                            <div>{user.trainingRunsCount}</div>
                                            <div>{user.modelsCount}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No users found.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feature Adoption Tab */}
                    {activeTab === 'feature-adoption' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Feature Adoption Tracking</h2>
                                {featureAdoption && (
                                    <button
                                        className="button button--outline"
                                        onClick={() => exportAdminDataToCSV(featureAdoption.features, 'feature-adoption.csv')}
                                    >
                                        Export CSV
                                    </button>
                                )}
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : featureAdoption ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Feature Checks</div>
                                            <div className="stat-card__value">{featureAdoption.totalFeatureChecks}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Unique Features</div>
                                            <div className="stat-card__value">{featureAdoption.uniqueFeatures}</div>
                                        </div>
                                    </div>

                                    {/* Top Features */}
                                    <div className="dashCard" style={{ marginBottom: '32px' }}>
                                        <h3 className="dashCard__title">Top Features by Usage</h3>
                                        <div style={{ padding: '16px 0' }}>
                                            {featureAdoption.features.slice(0, 20).map((feature) => (
                                                <div key={feature.feature} style={{
                                                    padding: '16px 0',
                                                    borderBottom: '1px solid var(--dr-border-weak)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: '500', fontSize: '14px' }}>
                                                            {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        <span style={{ color: 'var(--dr-muted)', fontSize: '14px' }}>
                                                            {feature.granted} / {feature.total} ({feature.adoptionRate.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '6px',
                                                        backgroundColor: 'var(--dr-border-weak)',
                                                        borderRadius: '3px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${feature.adoptionRate}%`,
                                                            height: '100%',
                                                            backgroundColor: feature.adoptionRate > 80 ? '#14b8a6' : feature.adoptionRate > 50 ? '#f59e0b' : '#ef4444',
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Most Requested Features */}
                                    {featureAdoption.mostRequested && featureAdoption.mostRequested.length > 0 && (
                                        <div className="dashCard">
                                            <h3 className="dashCard__title">Most Requested Features (Access Denied)</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {featureAdoption.mostRequested.map((feature) => (
                                                    <div key={feature.feature} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <span style={{ fontWeight: '500' }}>
                                                            {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        <span style={{ color: 'var(--dr-muted)' }}>
                                                            {feature.denied} denied requests
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No feature adoption data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* System Health Tab */}
                    {activeTab === 'system-health' && (
                        <div className="adminContent">
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>System Health Monitoring</h2>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : systemHealth ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Sync Success Rate</div>
                                            <div className="stat-card__value">{systemHealth.syncHealth.successRate}%</div>
                                            <div className="stat-card__subtext">
                                                {systemHealth.syncHealth.successfulSyncs} / {systemHealth.syncHealth.totalSyncs}
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Active IDE Sessions</div>
                                            <div className="stat-card__value">{systemHealth.activeSessions}</div>
                                            <div className="stat-card__subtext">Last hour</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Access Denial Rate</div>
                                            <div className="stat-card__value">{systemHealth.accessDenialRate}%</div>
                                            <div className="stat-card__subtext">Last 7 days</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">API Error Rate</div>
                                            <div className="stat-card__value">{systemHealth.apiErrorRate}%</div>
                                            <div className="stat-card__subtext">Last 7 days</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Database Health</div>
                                            <div className="stat-card__value">
                                                <span style={{
                                                    color: systemHealth.dbHealth === 'healthy' ? '#14b8a6' : '#f59e0b',
                                                    fontWeight: '600'
                                                }}>
                                                    {systemHealth.dbHealth.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sync Health Details */}
                                    <div className="dashCard" style={{ marginBottom: '32px' }}>
                                        <h3 className="dashCard__title">Sync Health Details</h3>
                                        <div style={{ padding: '16px 0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--dr-border-weak)' }}>
                                                <span>Total Syncs (24h)</span>
                                                <span style={{ fontWeight: '500' }}>{systemHealth.syncHealth.totalSyncs}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--dr-border-weak)' }}>
                                                <span>Successful</span>
                                                <span style={{ color: '#14b8a6', fontWeight: '500' }}>{systemHealth.syncHealth.successfulSyncs}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                                <span>Failed</span>
                                                <span style={{ color: '#ef4444', fontWeight: '500' }}>{systemHealth.syncHealth.failedSyncs}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '12px', color: 'var(--dr-muted)', textAlign: 'right' }}>
                                        Last updated: {formatDateTime(systemHealth.lastUpdated)}
                                    </div>
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No system health data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* IDE Sync Status Tab */}
                    {activeTab === 'ide-sync' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>IDE Sync Status Dashboard</h2>
                                {ideSyncStatus && (
                                    <button
                                        className="button button--outline"
                                        onClick={() => exportAdminDataToCSV(ideSyncStatus.events, 'ide-sync-events.csv')}
                                    >
                                        Export CSV
                                    </button>
                                )}
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : ideSyncStatus ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Events</div>
                                            <div className="stat-card__value">{ideSyncStatus.totalEvents}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Unique Users</div>
                                            <div className="stat-card__value">{ideSyncStatus.uniqueUsers}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Successful</div>
                                            <div className="stat-card__value" style={{ color: '#14b8a6' }}>
                                                {ideSyncStatus.byStatus.success}
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Failed</div>
                                            <div className="stat-card__value" style={{ color: '#ef4444' }}>
                                                {ideSyncStatus.byStatus.failed}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Events by Type */}
                                    {Object.keys(ideSyncStatus.byEventType || {}).length > 0 && (
                                        <div className="dashCard" style={{ marginBottom: '32px' }}>
                                            <h3 className="dashCard__title">Events by Type</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {Object.entries(ideSyncStatus.byEventType).map(([type, stats]) => (
                                                    <div key={type} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <div>
                                                            <span style={{ fontWeight: '500' }}>
                                                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                            <div style={{ fontSize: '12px', color: 'var(--dr-muted)', marginTop: '4px' }}>
                                                                {stats.success} success, {stats.failed} failed
                                                            </div>
                                                        </div>
                                                        <span style={{ color: 'var(--dr-muted)' }}>{stats.total} total</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Errors */}
                                    {ideSyncStatus.recentErrors && ideSyncStatus.recentErrors.length > 0 && (
                                        <div className="dashCard">
                                            <h3 className="dashCard__title">Recent Errors</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {ideSyncStatus.recentErrors.map((error) => (
                                                    <div key={error.id} style={{
                                                        padding: '12px',
                                                        marginBottom: '12px',
                                                        backgroundColor: '#fef2f2',
                                                        border: '1px solid #fecaca',
                                                        borderRadius: '4px'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                            <span style={{ fontWeight: '500', fontSize: '14px' }}>{error.user}</span>
                                                            <span style={{ fontSize: '12px', color: 'var(--dr-muted)' }}>
                                                                {formatDateTime(error.timestamp)}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
                                                            {error.type}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#991b1b' }}>
                                                            {error.error}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No IDE sync data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Revenue Tab */}
                    {activeTab === 'revenue' && (
                        <div className="adminContent">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Revenue Analytics</h2>
                                {revenueAnalyticsEnhanced && (
                                    <button
                                        className="button button--outline"
                                        onClick={() => exportAdminDataToCSV(revenueAnalyticsEnhanced.revenueTrend, 'revenue-trend.csv')}
                                    >
                                        Export Revenue Trend
                                    </button>
                                )}
                            </div>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : revenueAnalyticsEnhanced ? (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Monthly Recurring Revenue (MRR)</div>
                                            <div className="stat-card__value">₹{parseFloat(revenueAnalyticsEnhanced.mrr).toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Annual Recurring Revenue (ARR)</div>
                                            <div className="stat-card__value">₹{parseFloat(revenueAnalyticsEnhanced.arr).toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__label">Total Subscriptions</div>
                                            <div className="stat-card__value">{revenueAnalyticsEnhanced.totalSubscriptions}</div>
                                        </div>
                                    </div>

                                    {/* Revenue Trend Chart */}
                                    {revenueAnalyticsEnhanced.revenueTrend && revenueAnalyticsEnhanced.revenueTrend.length > 0 && (
                                        <div className="dashCard" style={{ marginBottom: '32px' }}>
                                            <h3 className="dashCard__title">Revenue Trend (Last 12 Months)</h3>
                                            <UsageChart
                                                data={revenueAnalyticsEnhanced.revenueTrend}
                                                type="line"
                                                title="MRR"
                                                height={300}
                                            />
                                        </div>
                                    )}

                                    {/* Revenue by Plan */}
                                    {Object.keys(revenueAnalyticsEnhanced.revenueByPlan || {}).length > 0 && (
                                        <div className="dashCard">
                                            <h3 className="dashCard__title">Revenue by Plan</h3>
                                            <div style={{ padding: '16px 0' }}>
                                                {Object.entries(revenueAnalyticsEnhanced.revenueByPlan).map(([plan, revenue]) => (
                                                    <div key={plan} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid var(--dr-border-weak)'
                                                    }}>
                                                        <div>
                                                            <span style={{ fontWeight: '500' }}>
                                                                {plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                            <div style={{ fontSize: '12px', color: 'var(--dr-muted)', marginTop: '4px' }}>
                                                                {revenue.count} subscriptions
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: '500' }}>
                                                                ₹{((revenue.monthly || 0) + (revenue.yearly || 0) / 12).toFixed(2)}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: 'var(--dr-muted)' }}>
                                                                Monthly
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No revenue data available.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <div className="adminContent">
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>User Activity</h2>

                            {analyticsLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : userActivity ? (
                                <>
                                    {/* Activity Stats */}
                                    <div className="analytics-dashboard">
                                        <div className="analytics-card">
                                            <div className="analytics-card__title">Total Activities</div>
                                            <div className="analytics-card__value">
                                                {userActivity.total}
                                            </div>
                                            <div className="analytics-card__change">All time</div>
                                        </div>
                                        {Object.entries(userActivity.grouped || {}).slice(0, 3).map(([type, count]) => (
                                            <div key={type} className="analytics-card">
                                                <div className="analytics-card__title">{type.replace(/_/g, ' ')}</div>
                                                <div className="analytics-card__value">{count}</div>
                                                <div className="analytics-card__change">Events</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Activity Feed */}
                                    <div style={{ marginTop: '32px' }}>
                                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                            Recent Activity
                                        </h3>
                                        <div className="activity-feed">
                                            {userActivity.activities && userActivity.activities.length > 0 ? (
                                                userActivity.activities.slice(0, 50).map((activity) => (
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
                                                ))
                                            ) : (
                                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                                    No activity recorded yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Export Button */}
                                    <div style={{ marginTop: '24px' }}>
                                        <button
                                            className="button button--outline"
                                            onClick={() => {
                                                if (userActivity.activities) {
                                                    exportToCSV(userActivity.activities, 'user-activity.csv')
                                                    toast.success('User activity data exported')
                                                }
                                            }}
                                        >
                                            Export Activity Data
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No activity data available.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default AdminPage

