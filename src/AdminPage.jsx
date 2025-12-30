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
import { useToast } from './utils/toast'
import { LoadingSpinner } from './components/LoadingSpinner'

function AdminPage({ session, navigate }) {
    const [loading, setLoading] = useState(true)
    const [isUserAdmin, setIsUserAdmin] = useState(false)
    const [activeTab, setActiveTab] = useState('users') // users, licenses, features, usage, audit
    const [users, setUsers] = useState([])
    const [featureFlags, setFeatureFlags] = useState([])
    const [platformStats, setPlatformStats] = useState(null)
    const [auditLog, setAuditLog] = useState([])
    const [userUsage, setUserUsage] = useState({})
    const toast = useToast()

    // Check admin access
    useEffect(() => {
        const checkAdmin = async () => {
            const admin = await isAdmin()
            setIsUserAdmin(admin)
            setLoading(false)
            if (!admin) {
                toast.error('Access denied. Admin privileges required.')
                navigate('/dashboard')
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
                                        <div className="dashMuted">No users found.</div>
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
                                        <div className="dashMuted">No licenses found.</div>
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
                                                        <option value="pro">Pro</option>
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
                                        <div className="dashMuted">No users found.</div>
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
                                        <div className="dashMuted">No audit log entries found.</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                ) : (
                                    auditLog.map((action) => (
                                        <div key={action.action_id} className="dashTable__row">
                                            <div>{formatDateTime(action.created_at)}</div>
                                            <div>{action.admin_user?.email || 'N/A'}</div>
                                            <div>{action.action_type.replace(/_/g, ' ')}</div>
                                            <div>{action.target_user?.email || '—'}</div>
                                            <div style={{ fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {action.details ? JSON.stringify(action.details).substring(0, 50) + '...' : '—'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default AdminPage

