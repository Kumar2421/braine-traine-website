import './App.css'
import {
    Activity,
    BarChart3,
    Bug,
    Cpu,
    CreditCard,
    Flag,
    Inbox,
    KeyRound,
    Shield,
    TrendingUp,
    Users,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
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
import LoadingSpinner from './components/LoadingSpinner'
import { useToast } from './utils/toast'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const AdminSecurityTab = lazy(() => import('./components/admin/AdminSecurityTab'))
const AdminReleaseTab = lazy(() => import('./components/admin/AdminReleaseTab'))

function AdminPage({ session, navigate }) {
    const [loading, setLoading] = useState(true)
    const [isUserAdmin, setIsUserAdmin] = useState(false)
    const [adminRole, setAdminRole] = useState('super')
    const [activeTab, setActiveTab] = useState(() => {
        const query = new URLSearchParams(window.location.search || '')
        return query.get('tab') || 'overview'
    }) // users, licenses, subscriptions, features, usage, audit, analytics, gpu-usage, activity
    const [selectedUserId, setSelectedUserId] = useState(() => {
        const query = new URLSearchParams(window.location.search || '')
        return query.get('user') || ''
    })
    const [selectedCrashEventId, setSelectedCrashEventId] = useState(() => {
        const query = new URLSearchParams(window.location.search || '')
        return query.get('event') || ''
    })
    const [adminSearchQuery, setAdminSearchQuery] = useState('')
    const [userDetailLicenseType, setUserDetailLicenseType] = useState('')
    const [users, setUsers] = useState([])
    const [featureFlags, setFeatureFlags] = useState([])
    const [platformStats, setPlatformStats] = useState(null)
    const [auditLog, setAuditLog] = useState([])
    const [userUsage, setUserUsage] = useState({})
    const [subscriptions, setSubscriptions] = useState([])
    const [billingHistory, setBillingHistory] = useState([])
    const [inboxMessages, setInboxMessages] = useState([])
    const [inboxLoading, setInboxLoading] = useState(false)
    const [inboxStatusFilter, setInboxStatusFilter] = useState('')
    const [inboxTagFilter, setInboxTagFilter] = useState('')
    const [inboxAssignedFilter, setInboxAssignedFilter] = useState('')
    const [securityBlocklist, setSecurityBlocklist] = useState([])
    const [securityEvents, setSecurityEvents] = useState([])
    const [securityLoading, setSecurityLoading] = useState(false)
    const [securityActiveOnly, setSecurityActiveOnly] = useState(true)
    const [securityNewEmail, setSecurityNewEmail] = useState('')
    const [securityNewIp, setSecurityNewIp] = useState('')
    const [securityNewUserId, setSecurityNewUserId] = useState('')
    const [securityNewReason, setSecurityNewReason] = useState('')
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

    const [diagnosticsEvents, setDiagnosticsEvents] = useState([])
    const [diagnosticsLoading, setDiagnosticsLoading] = useState(false)
    const [diagnosticsQuery, setDiagnosticsQuery] = useState('')
    const [diagnosticsTypeFilter, setDiagnosticsTypeFilter] = useState('')
    const [diagnosticsKindFilter, setDiagnosticsKindFilter] = useState('')
    const [diagnosticsAppVersionFilter, setDiagnosticsAppVersionFilter] = useState('')
    const [selectedDiagnosticsEvent, setSelectedDiagnosticsEvent] = useState(null)

    const [overviewLoading, setOverviewLoading] = useState(false)
    const [overviewRecentCrashes, setOverviewRecentCrashes] = useState([])

    const [userDetailLoading, setUserDetailLoading] = useState(false)
    const [userDetailEvents, setUserDetailEvents] = useState([])
    const [userDetailActions, setUserDetailActions] = useState([])
    const [userDetailSubscriptions, setUserDetailSubscriptions] = useState([])

    // Filters for user analytics
    const [userSearchFilter, setUserSearchFilter] = useState('')
    const [userPlanFilter, setUserPlanFilter] = useState('')
    const [userStatusFilter, setUserStatusFilter] = useState('')

    const toast = useToast()

    const sidebarDefaultOpen = useState(() => {
        try {
            const cookie = typeof document !== 'undefined' ? document.cookie || '' : ''
            const match = cookie.match(/(?:^|;\s*)sidebar_state=([^;]+)/)
            if (!match) return true
            const raw = decodeURIComponent(match[1] || '')
            return raw === 'true'
        } catch {
            return true
        }
    })[0]

    const canAccessRole = (required) => {
        const role = String(adminRole || 'super')
        if (role === 'super') return true
        if (role === 'billing') return required === 'billing' || required === 'support'
        if (role === 'support') return required === 'support'
        return false
    }

    const tabRequiredRole = (tab) => {
        switch (tab) {
            case 'subscriptions':
                return 'billing'
            case 'licenses':
                return 'billing'
            case 'analytics':
                return 'billing'
            case 'platform-analytics':
                return 'billing'
            case 'revenue':
                return 'billing'
            case 'security':
                return 'super'
            case 'release':
                return 'super'
            default:
                return 'support'
        }
    }

    useEffect(() => {
        if (!isUserAdmin) return
        const required = tabRequiredRole(activeTab)
        if (!canAccessRole(required)) {
            navigateAdminTab('overview')
        }
    }, [activeTab, adminRole, isUserAdmin])

    const navigateAdminTab = (tab) => {
        const nextTab = tab || 'users'
        const url = `/admin?tab=${encodeURIComponent(nextTab)}`
        if (navigate) {
            navigate(url)
        } else {
            window.history.pushState({}, '', url)
            window.dispatchEvent(new PopStateEvent('popstate'))
        }
    }

    const navigateToCrashEvent = (eventId) => {
        if (!eventId) return
        const url = `/admin?tab=crash-recovery&event=${encodeURIComponent(String(eventId))}`
        if (navigate) {
            navigate(url)
        } else {
            window.history.pushState({}, '', url)
            window.dispatchEvent(new PopStateEvent('popstate'))
        }
    }

    const updateInboxRequest = async (requestId, patch) => {
        const nowIso = new Date().toISOString()
        const currentUserId = session?.user?.id || null
        try {
            const payload = { ...patch }
            if ('assigned_to' in payload) {
                payload.assigned_at = payload.assigned_to ? nowIso : null
            }
            if ('status' in payload) {
                payload.updated_at = nowIso
                payload.updated_by = currentUserId
            }

            const { error } = await supabase
                .from('access_requests')
                .update(payload)
                .eq('request_id', requestId)

            if (error) throw error

            setInboxMessages((prev) => prev.map((m) => (m.request_id === requestId ? { ...m, ...payload } : m)))
            toast.success('Updated')
        } catch (e) {
            console.error('Failed to update inbox request:', e)
            toast.error('Inbox update failed (ensure access_requests has new workflow columns): ' + e.message)
        }
    }

    useEffect(() => {
        const onPopState = () => {
            const query = new URLSearchParams(window.location.search || '')
            setActiveTab(query.get('tab') || 'overview')
            setSelectedUserId(query.get('user') || '')
            setSelectedCrashEventId(query.get('event') || '')
        }
        window.addEventListener('popstate', onPopState)
        return () => window.removeEventListener('popstate', onPopState)
    }, [])

    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'crash-recovery' || !selectedCrashEventId) return

        let mounted = true
        const run = async () => {
            try {
                const { data, error } = await supabase
                    .from('ide_diagnostics_events')
                    .select('*')
                    .eq('id', selectedCrashEventId)
                    .maybeSingle()
                if (!mounted) return
                if (error) throw error
                if (data) setSelectedDiagnosticsEvent(data)
            } catch (e) {
                if (!mounted) return
                console.error('Failed to load crash event:', e)
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [activeTab, isUserAdmin, selectedCrashEventId])

    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'user-detail' || !selectedUserId) return

        let mounted = true
        const run = async () => {
            setUserDetailLoading(true)
            try {
                const [eventsRes, actionsRes, subsRes] = await Promise.all([
                    supabase
                        .from('ide_diagnostics_events')
                        .select('*')
                        .eq('user_id', selectedUserId)
                        .order('created_at', { ascending: false })
                        .limit(50),
                    supabase
                        .from('admin_actions')
                        .select('*')
                        .eq('target_user_id', selectedUserId)
                        .order('created_at', { ascending: false })
                        .limit(50),
                    supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', selectedUserId)
                        .order('created_at', { ascending: false })
                        .limit(20),
                ])

                if (!mounted) return
                if (eventsRes.error) throw eventsRes.error
                if (actionsRes.error) throw actionsRes.error
                if (subsRes.error) {
                    setUserDetailSubscriptions([])
                } else {
                    setUserDetailSubscriptions(subsRes.data || [])
                }

                setUserDetailEvents(eventsRes.data || [])
                setUserDetailActions(actionsRes.data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Failed to load user detail:', e)
                toast.error('Failed to load user detail: ' + e.message)
                setUserDetailEvents([])
                setUserDetailActions([])
                setUserDetailSubscriptions([])
            } finally {
                if (mounted) setUserDetailLoading(false)
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [activeTab, isUserAdmin, selectedUserId, toast])

    useEffect(() => {
        if (!isUserAdmin || activeTab !== 'overview') return

        let mounted = true
        const run = async () => {
            setOverviewLoading(true)
            try {
                const [platformRes, systemRes, ideRes, revenueRes] = await Promise.all([
                    getPlatformUsageStats().catch((e) => ({ error: e })),
                    getSystemHealthMetrics().catch((e) => ({ error: e })),
                    getIDESyncStatus().catch((e) => ({ error: e })),
                    getRevenueAnalyticsEnhanced().catch((e) => ({ error: e })),
                ])

                if (!mounted) return

                if (!platformRes?.error) setPlatformUsageStats(platformRes || null)
                if (!systemRes?.error) setSystemHealth(systemRes || null)
                if (!ideRes?.error) setIdeSyncStatus(ideRes || null)
                if (!revenueRes?.error) setRevenueAnalyticsEnhanced(revenueRes || null)

                const { data, error } = await supabase
                    .from('ide_diagnostics_events')
                    .select('*')
                    .eq('event_type', 'crash')
                    .order('created_at', { ascending: false })
                    .limit(10)

                if (!mounted) return
                if (error) throw error
                setOverviewRecentCrashes(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Failed to load overview:', e)
                toast.error('Failed to load overview: ' + e.message)
                setOverviewRecentCrashes([])
            } finally {
                if (mounted) setOverviewLoading(false)
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [activeTab, isUserAdmin, toast])

    // Check admin access with enterprise-grade verification
    useEffect(() => {
        const checkAdmin = async () => {
            const hasAccess = await checkAdminAccess(navigate)
            setIsUserAdmin(hasAccess)
            if (hasAccess) {
                try {
                    const allowOverride = Boolean(import.meta?.env?.DEV)
                    let override = ''

                    if (allowOverride) {
                        try {
                            const query = new URLSearchParams(window.location.search || '')
                            override = query.get('adminRole') || ''
                        } catch {
                            override = ''
                        }

                        if (!override) {
                            try {
                                override = String(window.localStorage?.getItem('adminRoleOverride') || '')
                            } catch {
                                override = ''
                            }
                        }
                    }

                    override = String(override || '').trim().toLowerCase()
                    if (allowOverride && override && ['support', 'billing', 'super'].includes(override)) {
                        setAdminRole(override)
                    } else {
                        const { data } = await supabase.rpc('get_admin_role')
                        setAdminRole(data || 'super')
                    }
                } catch {
                    setAdminRole('super')
                }
            }
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
        if (!isUserAdmin || (activeTab !== 'audit' && activeTab !== 'security')) return
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

    useEffect(() => {
        if (!isUserAdmin || (activeTab !== 'diagnostics' && activeTab !== 'crash-recovery' && activeTab !== 'release')) return

        let mounted = true
        const run = async () => {
            setDiagnosticsLoading(true)
            try {
                let query = supabase
                    .from('ide_diagnostics_events')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(200)

                if (diagnosticsTypeFilter) {
                    query = query.eq('event_type', diagnosticsTypeFilter)
                }
                if (diagnosticsKindFilter) {
                    query = query.eq('kind', diagnosticsKindFilter)
                }
                if (diagnosticsAppVersionFilter) {
                    query = query.eq('app_version', diagnosticsAppVersionFilter)
                }
                if (diagnosticsQuery) {
                    const q = diagnosticsQuery.trim()
                    if (q) {
                        query = query.or(
                            `message.ilike.%${q}%,platform.ilike.%${q}%,app_version.ilike.%${q}%,kind.ilike.%${q}%,source.ilike.%${q}%`
                        )
                    }
                }

                const { data, error } = await query
                if (error) throw error
                if (!mounted) return
                setDiagnosticsEvents(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Failed to load diagnostics events:', e)
                toast.error('Failed to load diagnostics events: ' + e.message)
                setDiagnosticsEvents([])
            } finally {
                if (mounted) setDiagnosticsLoading(false)
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [
        activeTab,
        diagnosticsAppVersionFilter,
        diagnosticsKindFilter,
        diagnosticsQuery,
        diagnosticsTypeFilter,
        isUserAdmin,
        toast,
    ])

    useEffect(() => {
        if (activeTab === 'crash-recovery') {
            setDiagnosticsTypeFilter('crash')
        }
        setSelectedDiagnosticsEvent(null)
    }, [activeTab])

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
        if (!isUserAdmin || (activeTab !== 'inbox' && activeTab !== 'security')) return
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
                setInboxLoading(false)
            }
        }
        loadInbox()
    }, [isUserAdmin, activeTab])

    const handleResendInbox = async (requestId) => {
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
                prev.map((m) =>
                    m.request_id === requestId ? { ...m, resend_count: nextResendCount, resent_at: nowIso, resent_by: currentUserId } : m
                )
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

    const loadSecurityData = async (activeOnly) => {
        const [{ data: blocklistData, error: blocklistError }, { data: eventsData, error: eventsError }] = await Promise.all([
            supabase.rpc('admin_blocklist_list', { active_only: Boolean(activeOnly) }),
            supabase.rpc('admin_security_events_recent', { limit_val: 50 }),
        ])

        if (blocklistError) throw blocklistError
        if (eventsError) throw eventsError

        setSecurityBlocklist(blocklistData || [])
        setSecurityEvents(eventsData || [])
    }

    useEffect(() => {
        if (!isUserAdmin) return
        if (activeTab !== 'security') return
        if (!canAccessRole('super')) return

        let mounted = true
        const run = async () => {
            setSecurityLoading(true)
            try {
                await loadSecurityData(securityActiveOnly)
            } catch (e) {
                console.error('Failed to load security data:', e)
                if (mounted) {
                    setSecurityBlocklist([])
                    setSecurityEvents([])
                }
            } finally {
                if (mounted) setSecurityLoading(false)
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [activeTab, isUserAdmin, securityActiveOnly, adminRole])

    const addBlocklistEntry = async () => {
        if (!canAccessRole('super')) {
            toast.error('Access denied')
            return
        }

        const emailVal = String(securityNewEmail || '').trim()
        const ipVal = String(securityNewIp || '').trim()
        const userIdVal = String(securityNewUserId || '').trim()
        const reasonVal = String(securityNewReason || '').trim()
        const targets = [emailVal ? 1 : 0, ipVal ? 1 : 0, userIdVal ? 1 : 0].reduce((a, b) => a + b, 0)

        if (targets !== 1) {
            toast.error('Provide exactly one of: email, ip, user_id')
            return
        }

        setSecurityLoading(true)
        try {
            const { error } = await supabase.rpc('admin_blocklist_add', {
                email_val: emailVal || null,
                ip_address_val: ipVal || null,
                user_id_val: userIdVal || null,
                reason_val: reasonVal || null,
            })
            if (error) throw error

            setSecurityNewEmail('')
            setSecurityNewIp('')
            setSecurityNewUserId('')
            setSecurityNewReason('')
            await loadSecurityData(securityActiveOnly)
            toast.success('Blocklist updated')
        } catch (e) {
            console.error('Failed to add blocklist entry:', e)
            toast.error('Failed to add blocklist entry: ' + e.message)
        } finally {
            setSecurityLoading(false)
        }
    }

    const deactivateBlocklistEntry = async (blockId) => {
        if (!canAccessRole('super')) {
            toast.error('Access denied')
            return
        }
        if (!blockId) return

        setSecurityLoading(true)
        try {
            const { error } = await supabase.rpc('admin_blocklist_deactivate', { block_id_val: blockId })
            if (error) throw error
            await loadSecurityData(securityActiveOnly)
            toast.success('Block removed')
        } catch (e) {
            console.error('Failed to deactivate blocklist entry:', e)
            toast.error('Failed to deactivate blocklist entry: ' + e.message)
        } finally {
            setSecurityLoading(false)
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

    const navigateToUserDetail = (userId) => {
        if (!userId) return
        const url = `/admin?tab=user-detail&user=${encodeURIComponent(String(userId))}`
        if (navigate) {
            navigate(url)
        } else {
            window.history.pushState({}, '', url)
            window.dispatchEvent(new PopStateEvent('popstate'))
        }
    }

    const resolveUserFromSearch = (raw) => {
        const q = String(raw || '').trim().toLowerCase()
        if (!q) return null

        const byId = users.find((u) => {
            const user = u?.users || {}
            const id = String(u?.user_id || user?.id || '').toLowerCase()
            return id === q || (q.length >= 8 && id.startsWith(q))
        })
        if (byId) return byId

        const byEmail = users.find((u) => {
            const email = String(u?.users?.email || '').toLowerCase()
            return email && (email === q || email.includes(q))
        })
        return byEmail || null
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
        <SidebarProvider
            defaultOpen={sidebarDefaultOpen}
            className="dark min-h-svh w-full bg-background text-foreground antialiased"
            style={{
                "--sidebar-width": "20rem",
                "--sidebar-width-mobile": "20rem",
            }}
        >
            <Sidebar variant="sidebar">
                <SidebarHeader>
                    <div className="px-2 py-2 text-sm font-semibold tracking-tight">Admin</div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'overview'} onClick={() => navigateAdminTab('overview')}>
                                <BarChart3 className="h-4 w-4" />
                                <span>Overview</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {canAccessRole('support') && (
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={activeTab === 'users'} onClick={() => navigateAdminTab('users')}>
                                    <Users className="h-4 w-4" />
                                    <span>Users</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccessRole('billing') && (
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={activeTab === 'licenses'} onClick={() => navigateAdminTab('licenses')}>
                                    <KeyRound className="h-4 w-4" />
                                    <span>Licenses</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccessRole('billing') && (
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={activeTab === 'subscriptions'} onClick={() => navigateAdminTab('subscriptions')}>
                                    <CreditCard className="h-4 w-4" />
                                    <span>Subscriptions</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccessRole('support') && (
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={activeTab === 'inbox'} onClick={() => navigateAdminTab('inbox')}>
                                    <Inbox className="h-4 w-4" />
                                    <span>Inbox</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'features'} onClick={() => navigateAdminTab('features')}>
                                <Flag className="h-4 w-4" />
                                <span>Feature flags</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'usage'} onClick={() => navigateAdminTab('usage')}>
                                <BarChart3 className="h-4 w-4" />
                                <span>Usage</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'audit'} onClick={() => navigateAdminTab('audit')}>
                                <Shield className="h-4 w-4" />
                                <span>Audit</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {canAccessRole('super') && (
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={activeTab === 'security'} onClick={() => navigateAdminTab('security')}>
                                    <Shield className="h-4 w-4" />
                                    <span>Security</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccessRole('super') && (
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={activeTab === 'release'} onClick={() => navigateAdminTab('release')}>
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Release</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccessRole('billing') && (
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={activeTab === 'analytics'} onClick={() => navigateAdminTab('analytics')}>
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Analytics</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'gpu-usage'} onClick={() => navigateAdminTab('gpu-usage')}>
                                <Cpu className="h-4 w-4" />
                                <span>GPU usage</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'activity'} onClick={() => navigateAdminTab('activity')}>
                                <Activity className="h-4 w-4" />
                                <span>Activity</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'diagnostics'} onClick={() => navigateAdminTab('diagnostics')}>
                                <Bug className="h-4 w-4" />
                                <span>Diagnostics</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'crash-recovery'} onClick={() => navigateAdminTab('crash-recovery')}>
                                <Bug className="h-4 w-4" />
                                <span>Crash recovery</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'platform-analytics'} onClick={() => navigateAdminTab('platform-analytics')}>
                                <TrendingUp className="h-4 w-4" />
                                <span>Platform analytics</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'user-analytics'} onClick={() => navigateAdminTab('user-analytics')}>
                                <Users className="h-4 w-4" />
                                <span>User analytics</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'feature-adoption'} onClick={() => navigateAdminTab('feature-adoption')}>
                                <Flag className="h-4 w-4" />
                                <span>Feature adoption</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'system-health'} onClick={() => navigateAdminTab('system-health')}>
                                <Shield className="h-4 w-4" />
                                <span>System health</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'ide-sync'} onClick={() => navigateAdminTab('ide-sync')}>
                                <Activity className="h-4 w-4" />
                                <span>IDE sync status</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={activeTab === 'revenue'} onClick={() => navigateAdminTab('revenue')}>
                                <CreditCard className="h-4 w-4" />
                                <span>Revenue</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>

            <SidebarInset className="min-w-0 flex-1 w-auto min-h-0 md:min-h-0">
                <div className="flex items-center justify-between gap-3 border-b p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <div className="leading-tight">
                            <div className="text-sm font-semibold tracking-tight">Admin Panel</div>
                            <div className="text-xs text-muted-foreground">Platform administration</div>
                        </div>
                    </div>

                    <div className="flex w-full max-w-md items-center gap-2">
                        <input
                            type="text"
                            value={adminSearchQuery}
                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                            placeholder="Search user (email or user_id)…"
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const match = resolveUserFromSearch(adminSearchQuery)
                                const user = match?.users || {}
                                const id = match?.user_id || user?.id
                                if (!id) {
                                    toast.error('User not found')
                                    return
                                }
                                setAdminSearchQuery('')
                                navigateToUserDetail(id)
                            }}
                        >
                            Go
                        </Button>
                    </div>
                </div>

                <div
                    className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4"
                    style={{ scrollbarGutter: "stable" }}
                >
                    <div className="w-full space-y-4">
                        {activeTab === 'overview' && platformStats && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>Total users</CardDescription>
                                        <CardTitle className="text-2xl">{platformStats.total_users}</CardTitle>
                                    </CardHeader>
                                    <CardContent />
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>Total projects</CardDescription>
                                        <CardTitle className="text-2xl">{platformStats.total_projects}</CardTitle>
                                    </CardHeader>
                                    <CardContent />
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>Total downloads</CardDescription>
                                        <CardTitle className="text-2xl">{platformStats.total_downloads}</CardTitle>
                                    </CardHeader>
                                    <CardContent />
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>Total exports</CardDescription>
                                        <CardTitle className="text-2xl">{platformStats.total_exports}</CardTitle>
                                    </CardHeader>
                                    <CardContent />
                                </Card>
                            </div>
                        )}

                        {activeTab === 'user-detail' && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>User detail</CardTitle>
                                        <CardDescription>Account 360 view</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {!selectedUserId ? (
                                            <div className="text-sm text-muted-foreground">Search and select a user to view details.</div>
                                        ) : (
                                            (() => {
                                                const record = users.find((u) => {
                                                    const user = u?.users || {}
                                                    return String(u?.user_id || user?.id || '') === String(selectedUserId)
                                                })
                                                const user = record?.users || {}
                                                const license = record || {}
                                                const isActive = Boolean(license?.is_active)

                                                return (
                                                    <div className="space-y-4">
                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                            <Card>
                                                                <CardHeader className="pb-2">
                                                                    <CardDescription>Email</CardDescription>
                                                                    <CardTitle className="text-base">{user.email || '—'}</CardTitle>
                                                                </CardHeader>
                                                            </Card>
                                                            <Card>
                                                                <CardHeader className="pb-2">
                                                                    <CardDescription>User id</CardDescription>
                                                                    <CardTitle className="text-base">{String(selectedUserId).substring(0, 12)}…</CardTitle>
                                                                </CardHeader>
                                                            </Card>
                                                            <Card>
                                                                <CardHeader className="pb-2">
                                                                    <CardDescription>License</CardDescription>
                                                                    <CardTitle className="text-base">{license.license_type || 'free'}</CardTitle>
                                                                </CardHeader>
                                                            </Card>
                                                            <Card>
                                                                <CardHeader className="pb-2">
                                                                    <CardDescription>Expires</CardDescription>
                                                                    <CardTitle className="text-base">{formatDate(license.expires_at)}</CardTitle>
                                                                </CardHeader>
                                                            </Card>
                                                        </div>

                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Quick actions</CardTitle>
                                                                <CardDescription>Administrative actions for this user</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3">
                                                                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                                                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                                                                        <select
                                                                            value={userDetailLicenseType}
                                                                            onChange={(e) => setUserDetailLicenseType(e.target.value)}
                                                                            className="h-9 w-full rounded-md border bg-background px-3 text-sm sm:max-w-xs"
                                                                        >
                                                                            <option value="">Assign license…</option>
                                                                            <option value="free">free</option>
                                                                            <option value="data_pro">data_pro</option>
                                                                            <option value="train_pro">train_pro</option>
                                                                            <option value="deploy_pro">deploy_pro</option>
                                                                            <option value="enterprise">enterprise</option>
                                                                        </select>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            disabled={!userDetailLicenseType}
                                                                            onClick={() => {
                                                                                handleAssignLicense(selectedUserId, userDetailLicenseType)
                                                                                setUserDetailLicenseType('')
                                                                            }}
                                                                        >
                                                                            Apply
                                                                        </Button>
                                                                    </div>

                                                                    <div className="flex flex-wrap items-center justify-start gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleToggleUser(selectedUserId, isActive)}
                                                                        >
                                                                            {isActive ? 'Deactivate' : 'Activate'}
                                                                        </Button>
                                                                        <Button variant="outline" size="sm" onClick={() => handleForceLogout(selectedUserId)}>
                                                                            Force logout
                                                                        </Button>
                                                                        <Button variant="outline" size="sm" onClick={() => handleUpdateExpiry(selectedUserId)}>
                                                                            Update expiry
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleToggleOffline(selectedUserId, Boolean(license?.offline_enabled))}
                                                                        >
                                                                            {license?.offline_enabled ? 'Disable offline' : 'Enable offline'}
                                                                        </Button>
                                                                        <Button variant="outline" size="sm" onClick={() => handleRegenerateToken(selectedUserId)}>
                                                                            Regenerate token
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {userDetailLoading ? (
                                                            <div className="py-10 text-center">
                                                                <LoadingSpinner />
                                                            </div>
                                                        ) : (
                                                            <div className="grid gap-4 lg:grid-cols-2">
                                                                <Card>
                                                                    <CardHeader>
                                                                        <CardTitle>Recent IDE events</CardTitle>
                                                                        <CardDescription>From ide_diagnostics_events</CardDescription>
                                                                    </CardHeader>
                                                                    <CardContent>
                                                                        {userDetailEvents.length === 0 ? (
                                                                            <div className="text-sm text-muted-foreground">No events found.</div>
                                                                        ) : (
                                                                            <div className="overflow-auto rounded-md border">
                                                                                <table className="w-full text-sm">
                                                                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                                                        <tr className="border-b">
                                                                                            <th className="px-3 py-2 text-left font-medium">Time</th>
                                                                                            <th className="px-3 py-2 text-left font-medium">Type</th>
                                                                                            <th className="px-3 py-2 text-left font-medium">Kind</th>
                                                                                            <th className="px-3 py-2 text-left font-medium">App</th>
                                                                                            <th className="px-3 py-2 text-left font-medium">Message</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {userDetailEvents.slice(0, 20).map((evt) => (
                                                                                            <tr key={String(evt.id)} className="border-b last:border-b-0">
                                                                                                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(evt.created_at)}</td>
                                                                                                <td className="px-3 py-2">{evt.event_type || '—'}</td>
                                                                                                <td className="px-3 py-2">{evt.kind || '—'}</td>
                                                                                                <td className="px-3 py-2">{evt.app_version || '—'}</td>
                                                                                                <td className="px-3 py-2 max-w-[420px] truncate">{evt.message || '—'}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>

                                                                <Card>
                                                                    <CardHeader>
                                                                        <CardTitle>Recent admin actions</CardTitle>
                                                                        <CardDescription>From admin_actions</CardDescription>
                                                                    </CardHeader>
                                                                    <CardContent>
                                                                        {userDetailActions.length === 0 ? (
                                                                            <div className="text-sm text-muted-foreground">No admin actions for this user.</div>
                                                                        ) : (
                                                                            <div className="overflow-auto rounded-md border">
                                                                                <table className="w-full text-sm">
                                                                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                                                        <tr className="border-b">
                                                                                            <th className="px-3 py-2 text-left font-medium">Time</th>
                                                                                            <th className="px-3 py-2 text-left font-medium">Admin</th>
                                                                                            <th className="px-3 py-2 text-left font-medium">Action</th>
                                                                                            <th className="px-3 py-2 text-left font-medium">Details</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {userDetailActions.slice(0, 20).map((action) => (
                                                                                            <tr key={String(action.action_id)} className="border-b last:border-b-0">
                                                                                                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(action.created_at)}</td>
                                                                                                <td className="px-3 py-2">{getUserEmailById(action.admin_user_id) || 'N/A'}</td>
                                                                                                <td className="px-3 py-2">{String(action.action_type || '').replace(/_/g, ' ')}</td>
                                                                                                <td className="px-3 py-2 max-w-[420px] truncate">{action.details ? JSON.stringify(action.details) : '—'}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )}

                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Subscriptions</CardTitle>
                                                                <CardDescription>Latest records</CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                {userDetailSubscriptions.length === 0 ? (
                                                                    <div className="text-sm text-muted-foreground">No subscription records found for this user.</div>
                                                                ) : (
                                                                    <div className="overflow-auto rounded-md border">
                                                                        <table className="w-full text-sm">
                                                                            <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                                                <tr className="border-b">
                                                                                    <th className="px-3 py-2 text-left font-medium">Created</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">Status</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">Plan</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">Period end</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {userDetailSubscriptions.slice(0, 10).map((sub) => (
                                                                                    <tr key={String(sub.subscription_id || sub.id)} className="border-b last:border-b-0">
                                                                                        <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(sub.created_at)}</td>
                                                                                        <td className="px-3 py-2">{sub.status || '—'}</td>
                                                                                        <td className="px-3 py-2">{sub.plan_type || sub.plan || '—'}</td>
                                                                                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(sub.current_period_end || sub.period_end)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )
                                            })()
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Control Tower</CardTitle>
                                        <CardDescription>Platform health, revenue, and recent issues</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {overviewLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : (
                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardDescription>Crash events (latest 10)</CardDescription>
                                                        <CardTitle className="text-2xl">{overviewRecentCrashes.length}</CardTitle>
                                                    </CardHeader>
                                                </Card>
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardDescription>Sync success rate</CardDescription>
                                                        <CardTitle className="text-2xl">
                                                            {systemHealth?.syncHealth?.successRate != null ? `${systemHealth.syncHealth.successRate}%` : '—'}
                                                        </CardTitle>
                                                    </CardHeader>
                                                </Card>
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardDescription>MRR</CardDescription>
                                                        <CardTitle className="text-2xl">
                                                            {revenueAnalyticsEnhanced?.mrr != null
                                                                ? `₹${parseFloat(revenueAnalyticsEnhanced.mrr).toLocaleString('en-IN')}`
                                                                : '—'}
                                                        </CardTitle>
                                                    </CardHeader>
                                                </Card>
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardDescription>Active IDE sessions</CardDescription>
                                                        <CardTitle className="text-2xl">{systemHealth?.activeSessions ?? '—'}</CardTitle>
                                                    </CardHeader>
                                                </Card>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Expiring licenses</CardTitle>
                                            <CardDescription>Next 14 days</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {(() => {
                                                const now = Date.now()
                                                const fourteenDays = 14 * 24 * 60 * 60 * 1000
                                                const expiring = (users || [])
                                                    .map((item) => {
                                                        const user = item.users || {}
                                                        const expiresAt = item.expires_at || null
                                                        return { userId: item.user_id || user.id, email: user.email, expiresAt }
                                                    })
                                                    .filter((u) => u.expiresAt && new Date(u.expiresAt).getTime() - now <= fourteenDays)
                                                    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
                                                    .slice(0, 10)

                                                if (expiring.length === 0) {
                                                    return <div className="text-sm text-muted-foreground">No expiring licenses found.</div>
                                                }

                                                return (
                                                    <div className="divide-y rounded-md border">
                                                        {expiring.map((u) => (
                                                            <div key={String(u.userId)} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                <div className="min-w-0">
                                                                    <div className="truncate font-medium">{u.email || String(u.userId || '').substring(0, 8) + '…'}</div>
                                                                    <div className="text-xs text-muted-foreground">{String(u.userId || '').substring(0, 8)}…</div>
                                                                </div>
                                                                <div className="text-right text-sm">{formatDate(u.expiresAt)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Recent crashes</CardTitle>
                                            <CardDescription>Latest events</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {overviewRecentCrashes.length === 0 ? (
                                                <div className="text-sm text-muted-foreground">No crash events found.</div>
                                            ) : (
                                                <div className="divide-y rounded-md border">
                                                    {overviewRecentCrashes.map((evt) => (
                                                        <div key={String(evt.id)} className="px-3 py-3 text-sm">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="font-medium">{evt.kind || 'crash'}</div>
                                                                <div className="text-xs text-muted-foreground">{formatDateTime(evt.created_at)}</div>
                                                            </div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                {(evt.user_id || '').substring(0, 8)}… · {evt.platform || '—'} · {evt.app_version || '—'}
                                                            </div>
                                                            <div className="mt-1 max-w-[720px] truncate text-sm text-muted-foreground">{evt.message || '—'}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <CardTitle>Blocklist</CardTitle>
                                                    <CardDescription>Block email, IP, or user_id (super only)</CardDescription>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSecurityActiveOnly((p) => !p)}
                                                >
                                                    {securityActiveOnly ? 'Showing active' : 'Showing all'}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <input
                                                    type="text"
                                                    value={securityNewEmail}
                                                    onChange={(e) => setSecurityNewEmail(e.target.value)}
                                                    placeholder="Email (optional)"
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={securityNewIp}
                                                    onChange={(e) => setSecurityNewIp(e.target.value)}
                                                    placeholder="IP address (optional)"
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <input
                                                    type="text"
                                                    value={securityNewUserId}
                                                    onChange={(e) => setSecurityNewUserId(e.target.value)}
                                                    placeholder="User ID (optional)"
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={securityNewReason}
                                                    onChange={(e) => setSecurityNewReason(e.target.value)}
                                                    placeholder="Reason"
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                />
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={addBlocklistEntry} disabled={securityLoading}>
                                                    Add
                                                </Button>
                                            </div>

                                            {securityLoading ? (
                                                <div className="py-6 text-center">
                                                    <LoadingSpinner />
                                                </div>
                                            ) : securityBlocklist.length === 0 ? (
                                                <div className="text-sm text-muted-foreground">No blocklist entries.</div>
                                            ) : (
                                                <div className="overflow-auto rounded-md border">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                            <tr className="border-b">
                                                                <th className="px-3 py-2 text-left font-medium">Target</th>
                                                                <th className="px-3 py-2 text-left font-medium">Reason</th>
                                                                <th className="px-3 py-2 text-left font-medium">Active</th>
                                                                <th className="px-3 py-2 text-right font-medium">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {securityBlocklist.slice(0, 30).map((row) => {
                                                                const target = row.email || row.ip_address || row.user_id || '—'
                                                                return (
                                                                    <tr key={String(row.block_id)} className="border-b last:border-b-0">
                                                                        <td className="px-3 py-2">{String(target)}</td>
                                                                        <td className="px-3 py-2 max-w-[360px] truncate">{row.reason || '—'}</td>
                                                                        <td className="px-3 py-2">{row.is_active ? 'yes' : 'no'}</td>
                                                                        <td className="px-3 py-2 text-right">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={!row.is_active || securityLoading}
                                                                                onClick={() => deactivateBlocklistEntry(row.block_id)}
                                                                            >
                                                                                Deactivate
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Security events</CardTitle>
                                            <CardDescription>Latest admin security events</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {securityLoading ? (
                                                <div className="py-6 text-center">
                                                    <LoadingSpinner />
                                                </div>
                                            ) : securityEvents.length === 0 ? (
                                                <div className="text-sm text-muted-foreground">No events.</div>
                                            ) : (
                                                <div className="overflow-auto rounded-md border">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                            <tr className="border-b">
                                                                <th className="px-3 py-2 text-left font-medium">Time</th>
                                                                <th className="px-3 py-2 text-left font-medium">Type</th>
                                                                <th className="px-3 py-2 text-left font-medium">Severity</th>
                                                                <th className="px-3 py-2 text-left font-medium">Target</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {securityEvents.slice(0, 30).map((evt) => {
                                                                const target = evt.email || evt.ip_address || evt.user_id || '—'
                                                                return (
                                                                    <tr key={String(evt.event_id)} className="border-b last:border-b-0">
                                                                        <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(evt.created_at)}</td>
                                                                        <td className="px-3 py-2">{evt.event_type || '—'}</td>
                                                                        <td className="px-3 py-2">{evt.severity || 'info'}</td>
                                                                        <td className="px-3 py-2">{String(target)}</td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Diagnostics Tab */}
                        {activeTab === 'diagnostics' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle>Diagnostics</CardTitle>
                                            <CardDescription>IDE diagnostics events (latest 200)</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setDiagnosticsQuery('')
                                                setDiagnosticsTypeFilter('')
                                                setDiagnosticsKindFilter('')
                                                setDiagnosticsAppVersionFilter('')
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                        <input
                                            type="text"
                                            value={diagnosticsQuery}
                                            onChange={(e) => setDiagnosticsQuery(e.target.value)}
                                            placeholder="Search message/platform/user/app_version…"
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                        />
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={diagnosticsTypeFilter}
                                            onChange={(e) => setDiagnosticsTypeFilter(e.target.value)}
                                        >
                                            <option value="">All types</option>
                                            <option value="crash">crash</option>
                                            <option value="perf">perf</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={diagnosticsKindFilter}
                                            onChange={(e) => setDiagnosticsKindFilter(e.target.value)}
                                            placeholder="Filter kind"
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={diagnosticsAppVersionFilter}
                                            onChange={(e) => setDiagnosticsAppVersionFilter(e.target.value)}
                                            placeholder="Filter app_version"
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                        />
                                    </div>

                                    {diagnosticsLoading ? (
                                        <div className="py-10 text-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <div className="overflow-auto rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                    <tr className="border-b">
                                                        <th className="px-3 py-2 text-left font-medium">Time</th>
                                                        <th className="px-3 py-2 text-left font-medium">User</th>
                                                        <th className="px-3 py-2 text-left font-medium">Type</th>
                                                        <th className="px-3 py-2 text-left font-medium">Kind</th>
                                                        <th className="px-3 py-2 text-left font-medium">Platform</th>
                                                        <th className="px-3 py-2 text-left font-medium">App</th>
                                                        <th className="px-3 py-2 text-left font-medium">Message</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {diagnosticsEvents.length === 0 ? (
                                                        <tr>
                                                            <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={7}>
                                                                No diagnostics events found.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        diagnosticsEvents.map((evt) => (
                                                            <tr key={String(evt.id)} className="border-b last:border-b-0">
                                                                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(evt.created_at)}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap">{(evt.user_id || '').substring(0, 8)}…</td>
                                                                <td className="px-3 py-2">{evt.event_type || '—'}</td>
                                                                <td className="px-3 py-2">{evt.kind || '—'}</td>
                                                                <td className="px-3 py-2">{evt.platform || '—'}</td>
                                                                <td className="px-3 py-2">{evt.app_version || '—'}</td>
                                                                <td className="px-3 py-2 max-w-[520px] truncate">{evt.message || '—'}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'crash-recovery' && (
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <CardTitle>Crash Recovery</CardTitle>
                                                    <CardDescription>Crash and perf events from ide_diagnostics_events (latest 200)</CardDescription>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDiagnosticsQuery('')
                                                        setDiagnosticsTypeFilter('crash')
                                                        setDiagnosticsKindFilter('')
                                                        setDiagnosticsAppVersionFilter('')
                                                    }}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <input
                                                    type="text"
                                                    value={diagnosticsQuery}
                                                    onChange={(e) => setDiagnosticsQuery(e.target.value)}
                                                    placeholder="Search message/platform/app_version/kind…"
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={diagnosticsAppVersionFilter}
                                                    onChange={(e) => setDiagnosticsAppVersionFilter(e.target.value)}
                                                    placeholder="Filter app_version"
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                />
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <input
                                                    type="text"
                                                    value={diagnosticsKindFilter}
                                                    onChange={(e) => setDiagnosticsKindFilter(e.target.value)}
                                                    placeholder="Filter kind (main/renderer/renderer-gone…)"
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                />
                                                <select
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                    value={diagnosticsTypeFilter}
                                                    onChange={(e) => setDiagnosticsTypeFilter(e.target.value)}
                                                >
                                                    <option value="crash">crash</option>
                                                    <option value="perf">perf</option>
                                                </select>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Distribution: app_version</CardTitle>
                                                <CardDescription>Top versions by event count</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {(() => {
                                                    const filtered = (diagnosticsEvents || []).filter((e) => !diagnosticsTypeFilter || e?.event_type === diagnosticsTypeFilter)
                                                    const byApp = filtered.reduce((acc, evt) => {
                                                        const key = String(evt?.app_version || 'unknown')
                                                        acc[key] = (acc[key] || 0) + 1
                                                        return acc
                                                    }, {})
                                                    const rows = Object.entries(byApp)
                                                        .sort((a, b) => b[1] - a[1])
                                                        .slice(0, 8)

                                                    if (rows.length === 0) {
                                                        return <div className="text-sm text-muted-foreground">No events.</div>
                                                    }

                                                    return (
                                                        <div className="divide-y rounded-md border">
                                                            {rows.map(([app, count]) => (
                                                                <div key={app} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                    <div className="font-medium">{app}</div>
                                                                    <div className="text-muted-foreground">{count}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )
                                                })()}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Distribution: platform</CardTitle>
                                                <CardDescription>Top platforms by event count</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {(() => {
                                                    const filtered = (diagnosticsEvents || []).filter((e) => !diagnosticsTypeFilter || e?.event_type === diagnosticsTypeFilter)
                                                    const byPlatform = filtered.reduce((acc, evt) => {
                                                        const key = String(evt?.platform || 'unknown')
                                                        acc[key] = (acc[key] || 0) + 1
                                                        return acc
                                                    }, {})
                                                    const rows = Object.entries(byPlatform)
                                                        .sort((a, b) => b[1] - a[1])
                                                        .slice(0, 8)

                                                    if (rows.length === 0) {
                                                        return <div className="text-sm text-muted-foreground">No events.</div>
                                                    }

                                                    return (
                                                        <div className="divide-y rounded-md border">
                                                            {rows.map(([platform, count]) => (
                                                                <div key={platform} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                    <div className="font-medium">{platform}</div>
                                                                    <div className="text-muted-foreground">{count}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )
                                                })()}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Top crash signatures</CardTitle>
                                            <CardDescription>Grouped by kind + source + message</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {(() => {
                                                const filtered = (diagnosticsEvents || []).filter((e) => !diagnosticsTypeFilter || e?.event_type === diagnosticsTypeFilter)
                                                const groups = filtered.reduce((acc, evt) => {
                                                    const kind = String(evt?.kind || '')
                                                    const source = String(evt?.source || '')
                                                    const message = String(evt?.message || '')
                                                    const key = `${kind}::${source}::${message}`
                                                    const existing = acc[key]
                                                    if (!existing) {
                                                        acc[key] = {
                                                            key,
                                                            kind,
                                                            source,
                                                            message,
                                                            count: 1,
                                                            lastAt: evt?.created_at,
                                                            sample: evt,
                                                        }
                                                    } else {
                                                        existing.count += 1
                                                        if (evt?.created_at && (!existing.lastAt || new Date(evt.created_at) > new Date(existing.lastAt))) {
                                                            existing.lastAt = evt.created_at
                                                            existing.sample = evt
                                                        }
                                                    }
                                                    return acc
                                                }, {})

                                                const rows = Object.values(groups)
                                                    .sort((a, b) => b.count - a.count)
                                                    .slice(0, 8)

                                                if (rows.length === 0) {
                                                    return <div className="text-sm text-muted-foreground">No signatures.</div>
                                                }

                                                return (
                                                    <div className="divide-y rounded-md border">
                                                        {rows.map((sig) => (
                                                            <button
                                                                key={sig.key}
                                                                type="button"
                                                                className="w-full px-3 py-3 text-left text-sm hover:bg-muted/30"
                                                                onClick={() => setSelectedDiagnosticsEvent(sig.sample)}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium">
                                                                            {sig.kind || '—'}{sig.source ? ` · ${sig.source}` : ''}
                                                                        </div>
                                                                        <div className="mt-1 max-w-[520px] truncate text-xs text-muted-foreground">{sig.message || '—'}</div>
                                                                    </div>
                                                                    <div className="shrink-0 text-right">
                                                                        <div className="font-medium">{sig.count}</div>
                                                                        <div className="text-xs text-muted-foreground">{formatDateTime(sig.lastAt)}</div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Event list</CardTitle>
                                            <CardDescription>Click any row to view details</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {diagnosticsLoading ? (
                                                <div className="py-10 text-center">
                                                    <LoadingSpinner />
                                                </div>
                                            ) : (
                                                <div className="overflow-auto rounded-md border">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                            <tr className="border-b">
                                                                <th className="px-3 py-2 text-left font-medium">Time</th>
                                                                <th className="px-3 py-2 text-left font-medium">User</th>
                                                                <th className="px-3 py-2 text-left font-medium">Kind</th>
                                                                <th className="px-3 py-2 text-left font-medium">Platform</th>
                                                                <th className="px-3 py-2 text-left font-medium">App</th>
                                                                <th className="px-3 py-2 text-left font-medium">Message</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {diagnosticsEvents.length === 0 ? (
                                                                <tr>
                                                                    <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>
                                                                        No events found.
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                diagnosticsEvents
                                                                    .filter((e) => !diagnosticsTypeFilter || e?.event_type === diagnosticsTypeFilter)
                                                                    .map((evt) => (
                                                                        <tr
                                                                            key={String(evt.id)}
                                                                            className="cursor-pointer border-b hover:bg-muted/30 last:border-b-0"
                                                                            onClick={() => setSelectedDiagnosticsEvent(evt)}
                                                                        >
                                                                            <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(evt.created_at)}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{(evt.user_id || '').substring(0, 8)}…</td>
                                                                            <td className="px-3 py-2">{evt.kind || '—'}</td>
                                                                            <td className="px-3 py-2">{evt.platform || '—'}</td>
                                                                            <td className="px-3 py-2">{evt.app_version || '—'}</td>
                                                                            <td className="px-3 py-2 max-w-[520px] truncate">{evt.message || '—'}</td>
                                                                        </tr>
                                                                    ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>Event Details</CardTitle>
                                                <CardDescription>Message, stack trace, and payload</CardDescription>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!selectedDiagnosticsEvent}
                                                    onClick={() => {
                                                        navigator.clipboard?.writeText?.(String(selectedDiagnosticsEvent?.id || ''))
                                                        toast.success('Copied event id')
                                                    }}
                                                >
                                                    Copy ID
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!selectedDiagnosticsEvent}
                                                    onClick={() => {
                                                        navigator.clipboard?.writeText?.(String(selectedDiagnosticsEvent?.message || ''))
                                                        toast.success('Copied message')
                                                    }}
                                                >
                                                    Copy message
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!selectedDiagnosticsEvent}
                                                    onClick={() => {
                                                        navigator.clipboard?.writeText?.(String(selectedDiagnosticsEvent?.stack || ''))
                                                        toast.success('Copied stack')
                                                    }}
                                                >
                                                    Copy stack
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!selectedDiagnosticsEvent}
                                                    onClick={() => {
                                                        const text = selectedDiagnosticsEvent ? JSON.stringify(selectedDiagnosticsEvent, null, 2) : ''
                                                        navigator.clipboard?.writeText?.(text)
                                                        toast.success('Copied event JSON')
                                                    }}
                                                >
                                                    Copy JSON
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {!selectedDiagnosticsEvent ? (
                                            <div className="text-sm text-muted-foreground">Select an event from the list to view details.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    <div className="rounded-md border p-3">
                                                        <div className="text-xs font-medium text-muted-foreground">Time</div>
                                                        <div className="mt-1 text-sm">{formatDateTime(selectedDiagnosticsEvent.created_at)}</div>
                                                    </div>
                                                    <div className="rounded-md border p-3">
                                                        <div className="text-xs font-medium text-muted-foreground">User</div>
                                                        <div className="mt-1 text-sm">{(selectedDiagnosticsEvent.user_id || '').substring(0, 8)}…</div>
                                                    </div>
                                                </div>

                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    <div className="rounded-md border p-3">
                                                        <div className="text-xs font-medium text-muted-foreground">Kind</div>
                                                        <div className="mt-1 text-sm">{selectedDiagnosticsEvent.kind || '—'}</div>
                                                    </div>
                                                    <div className="rounded-md border p-3">
                                                        <div className="text-xs font-medium text-muted-foreground">Source</div>
                                                        <div className="mt-1 text-sm">{selectedDiagnosticsEvent.source || '—'}</div>
                                                    </div>
                                                </div>

                                                <div className="rounded-md border p-3">
                                                    <div className="text-xs font-medium text-muted-foreground">Message</div>
                                                    <div className="mt-1 text-sm whitespace-pre-wrap">{selectedDiagnosticsEvent.message || '—'}</div>
                                                </div>

                                                <div className="rounded-md border p-3">
                                                    <div className="text-xs font-medium text-muted-foreground">Stack</div>
                                                    <pre className="mt-2 max-h-[360px] overflow-auto whitespace-pre-wrap text-xs">{selectedDiagnosticsEvent.stack || '—'}</pre>
                                                </div>

                                                <div className="rounded-md border p-3">
                                                    <div className="text-xs font-medium text-muted-foreground">Payload</div>
                                                    <pre className="mt-2 max-h-[360px] overflow-auto whitespace-pre-wrap text-xs">{selectedDiagnosticsEvent.payload ? JSON.stringify(selectedDiagnosticsEvent.payload, null, 2) : '—'}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle>Users</CardTitle>
                                            <CardDescription>Manage accounts and access</CardDescription>
                                        </div>
                                        <div className="text-xs text-muted-foreground">Total: {users.length}</div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-auto rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                <tr className="border-b">
                                                    <th className="px-3 py-2 text-left font-medium">Email</th>
                                                    <th className="px-3 py-2 text-left font-medium">License</th>
                                                    <th className="px-3 py-2 text-left font-medium">Status</th>
                                                    <th className="px-3 py-2 text-left font-medium">Expires</th>
                                                    <th className="px-3 py-2 text-right font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.length === 0 ? (
                                                    <tr>
                                                        <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                                                            No users found. If this is a new environment, create a test account and log in once to populate user metadata.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    users.map((item) => {
                                                        const user = item.users || {}
                                                        const license = item
                                                        return (
                                                            <tr key={String(user?.id || item.user_id)} className="border-b last:border-b-0">
                                                                <td className="px-3 py-2">{user?.email || `User ${item.user_id?.substring(0, 8)}`}</td>
                                                                <td className="px-3 py-2">{license.license_type || 'free'}</td>
                                                                <td className="px-3 py-2">{license.is_active ? 'Active' : 'Inactive'}</td>
                                                                <td className="px-3 py-2">{formatDate(license.expires_at)}</td>
                                                                <td className="px-3 py-2 text-right">
                                                                    <div className="inline-flex flex-wrap justify-end gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => navigateToUserDetail(item.user_id || user?.id)}
                                                                        >
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleToggleUser(item.user_id || user?.id, license.is_active)}
                                                                        >
                                                                            {license.is_active ? 'Deactivate' : 'Activate'}
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleForceLogout(item.user_id || user?.id)}
                                                                        >
                                                                            Force Logout
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Licenses Tab */}
                        {activeTab === 'licenses' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle>Licenses</CardTitle>
                                            <CardDescription>Assign plans, expiry, offline flags and tokens</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-auto rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                <tr className="border-b">
                                                    <th className="px-3 py-2 text-left font-medium">Email</th>
                                                    <th className="px-3 py-2 text-left font-medium">License</th>
                                                    <th className="px-3 py-2 text-left font-medium">Status</th>
                                                    <th className="px-3 py-2 text-left font-medium">Expires</th>
                                                    <th className="px-3 py-2 text-left font-medium">Offline</th>
                                                    <th className="px-3 py-2 text-right font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.length === 0 ? (
                                                    <tr>
                                                        <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>
                                                            No licenses found. Licenses are created when a user activates the desktop app or when an admin assigns a plan.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    users.map((item) => {
                                                        const user = item.users || {}
                                                        const license = item
                                                        return (
                                                            <tr key={String(user?.id || item.user_id)} className="border-b last:border-b-0">
                                                                <td className="px-3 py-2">{user?.email || `User ${item.user_id?.substring(0, 8)}`}</td>
                                                                <td className="px-3 py-2">{license.license_type || 'free'}</td>
                                                                <td className="px-3 py-2">{license.is_active ? 'Active' : 'Inactive'}</td>
                                                                <td className="px-3 py-2">{formatDate(license.expires_at)}</td>
                                                                <td className="px-3 py-2">{license.offline_enabled ? 'Yes' : 'No'}</td>
                                                                <td className="px-3 py-2 text-right">
                                                                    <div className="inline-flex flex-wrap justify-end gap-2">
                                                                        <select
                                                                            onChange={(e) => handleAssignLicense(item.user_id || user?.id, e.target.value)}
                                                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                                                            defaultValue=""
                                                                        >
                                                                            <option value="">Assign Plan</option>
                                                                            <option value="free">Free</option>
                                                                            <option value="data_pro">Data Pro</option>
                                                                            <option value="train_pro">Train Pro</option>
                                                                            <option value="deploy_pro">Deploy Pro</option>
                                                                            <option value="enterprise">Enterprise</option>
                                                                        </select>
                                                                        <Button variant="outline" size="sm" onClick={() => handleUpdateExpiry(item.user_id || user?.id)}>
                                                                            Set Expiry
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleToggleOffline(item.user_id || user?.id, license.offline_enabled)}
                                                                        >
                                                                            {license.offline_enabled ? 'Disable Offline' : 'Enable Offline'}
                                                                        </Button>
                                                                        <Button variant="outline" size="sm" onClick={() => handleRegenerateToken(item.user_id || user?.id)}>
                                                                            Regenerate Token
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Subscriptions Tab */}
                        {activeTab === 'subscriptions' && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Subscriptions</CardTitle>
                                        <CardDescription>Active subscriptions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-auto rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                    <tr className="border-b">
                                                        <th className="px-3 py-2 text-left font-medium">User</th>
                                                        <th className="px-3 py-2 text-left font-medium">Plan</th>
                                                        <th className="px-3 py-2 text-left font-medium">Status</th>
                                                        <th className="px-3 py-2 text-left font-medium">Period Start</th>
                                                        <th className="px-3 py-2 text-left font-medium">Period End</th>
                                                        <th className="px-3 py-2 text-left font-medium">Razorpay</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subscriptions.length === 0 ? (
                                                        <tr>
                                                            <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>
                                                                No subscriptions found. This is expected for a new install before anyone purchases a plan.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        subscriptions.map((sub) => (
                                                            <tr key={String(sub.subscription_id)} className="border-b last:border-b-0">
                                                                <td className="px-3 py-2">
                                                                    {users.find((u) => u.user_id === sub.user_id)?.users?.email || `User ${sub.user_id?.substring(0, 8)}`}
                                                                </td>
                                                                <td className="px-3 py-2">{String(sub.plan_type || '').replace('_', ' ')}</td>
                                                                <td className="px-3 py-2">{sub.status || '—'}</td>
                                                                <td className="px-3 py-2">{formatDate(sub.current_period_start)}</td>
                                                                <td className="px-3 py-2">{formatDate(sub.current_period_end)}</td>
                                                                <td className="px-3 py-2 font-mono text-xs">
                                                                    {sub.razorpay_subscription_id ? String(sub.razorpay_subscription_id).substring(0, 20) + '…' : '—'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent payments</CardTitle>
                                        <CardDescription>Latest 50 billing events</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-auto rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                    <tr className="border-b">
                                                        <th className="px-3 py-2 text-left font-medium">Date</th>
                                                        <th className="px-3 py-2 text-left font-medium">User</th>
                                                        <th className="px-3 py-2 text-left font-medium">Amount</th>
                                                        <th className="px-3 py-2 text-left font-medium">Status</th>
                                                        <th className="px-3 py-2 text-left font-medium">Payment ID</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {billingHistory.length === 0 ? (
                                                        <tr>
                                                            <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                                                                No payments found. Once a subscription is created, payments will appear here as invoices settle.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        billingHistory.map((payment) => (
                                                            <tr key={String(payment.billing_id)} className="border-b last:border-b-0">
                                                                <td className="px-3 py-2">{formatDate(payment.created_at)}</td>
                                                                <td className="px-3 py-2">{payment.user_id?.substring(0, 8)}</td>
                                                                <td className="px-3 py-2">₹{(Number(payment.amount || 0) / 100).toFixed(2)}</td>
                                                                <td className="px-3 py-2">{payment.status || '—'}</td>
                                                                <td className="px-3 py-2 font-mono text-xs">
                                                                    {payment.razorpay_payment_id ? String(payment.razorpay_payment_id).substring(0, 20) + '…' : '—'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Inbox Tab */}
                        {activeTab === 'inbox' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle>Inbox</CardTitle>
                                            <CardDescription>Access requests and follow-ups</CardDescription>
                                        </div>
                                        <div className="text-xs text-muted-foreground">Total: {inboxMessages.length}</div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={inboxStatusFilter}
                                            onChange={(e) => setInboxStatusFilter(e.target.value)}
                                        >
                                            <option value="">All statuses</option>
                                            <option value="new">new</option>
                                            <option value="investigating">investigating</option>
                                            <option value="resolved">resolved</option>
                                        </select>
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={inboxTagFilter}
                                            onChange={(e) => setInboxTagFilter(e.target.value)}
                                        >
                                            <option value="">All tags</option>
                                            <option value="billing">billing</option>
                                            <option value="license">license</option>
                                            <option value="crash">crash</option>
                                            <option value="perf">perf</option>
                                            <option value="bug">bug</option>
                                            <option value="other">other</option>
                                        </select>
                                        <select
                                            className="h-9 rounded-md border bg-background px-3 text-sm"
                                            value={inboxAssignedFilter}
                                            onChange={(e) => setInboxAssignedFilter(e.target.value)}
                                        >
                                            <option value="">All assignments</option>
                                            <option value="me">Assigned to me</option>
                                            <option value="unassigned">Unassigned</option>
                                        </select>
                                    </div>

                                    {inboxLoading ? (
                                        <div className="py-10 text-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <div className="overflow-auto rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                    <tr className="border-b">
                                                        <th className="px-3 py-2 text-left font-medium">Time</th>
                                                        <th className="px-3 py-2 text-left font-medium">Type</th>
                                                        <th className="px-3 py-2 text-left font-medium">User</th>
                                                        <th className="px-3 py-2 text-left font-medium">Status</th>
                                                        <th className="px-3 py-2 text-left font-medium">Tag</th>
                                                        <th className="px-3 py-2 text-left font-medium">Crash</th>
                                                        <th className="px-3 py-2 text-left font-medium">Message</th>
                                                        <th className="px-3 py-2 text-right font-medium">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inboxMessages.length === 0 ? (
                                                        <tr>
                                                            <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={8}>
                                                                No messages found. Access requests (e.g., air-gapped/offline licensing) will show up here.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        inboxMessages
                                                            .filter((msg) => {
                                                                if (inboxStatusFilter && String(msg.status || '').toLowerCase() !== inboxStatusFilter) return false
                                                                if (inboxTagFilter && String(msg.tag || '').toLowerCase() !== inboxTagFilter) return false
                                                                if (inboxAssignedFilter === 'unassigned') {
                                                                    if (msg.assigned_to) return false
                                                                }
                                                                if (inboxAssignedFilter === 'me') {
                                                                    if (!session?.user?.id) return false
                                                                    if (String(msg.assigned_to || '') !== String(session.user.id)) return false
                                                                }
                                                                return true
                                                            })
                                                            .map((msg) => (
                                                                <tr key={String(msg.request_id)} className="border-b last:border-b-0">
                                                                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(msg.created_at)}</td>
                                                                    <td className="px-3 py-2">{String(msg.request_type || '').replace(/_/g, ' ')}</td>
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        {msg.linked_user_id ? String(msg.linked_user_id).substring(0, 8) + '…' : String(msg.user_id || '').substring(0, 8) + '…'}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <select
                                                                            value={msg.status || 'new'}
                                                                            onChange={(e) => updateInboxRequest(msg.request_id, { status: e.target.value })}
                                                                            className="h-8 rounded-md border bg-background px-2 text-xs"
                                                                        >
                                                                            <option value="new">new</option>
                                                                            <option value="investigating">investigating</option>
                                                                            <option value="resolved">resolved</option>
                                                                        </select>
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <select
                                                                            value={msg.tag || ''}
                                                                            onChange={(e) => updateInboxRequest(msg.request_id, { tag: e.target.value })}
                                                                            className="h-8 rounded-md border bg-background px-2 text-xs"
                                                                        >
                                                                            <option value="">—</option>
                                                                            <option value="billing">billing</option>
                                                                            <option value="license">license</option>
                                                                            <option value="crash">crash</option>
                                                                            <option value="perf">perf</option>
                                                                            <option value="bug">bug</option>
                                                                            <option value="other">other</option>
                                                                        </select>
                                                                    </td>
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        {msg.crash_event_id ? String(msg.crash_event_id).substring(0, 8) + '…' : '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2 max-w-[520px] truncate">{msg.message || msg.details || '—'}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        <div className="inline-flex flex-wrap justify-end gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const uid = msg.linked_user_id || msg.user_id
                                                                                    if (uid) navigateToUserDetail(uid)
                                                                                }}
                                                                            >
                                                                                User
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={!msg.crash_event_id}
                                                                                onClick={() => {
                                                                                    if (msg.crash_event_id) navigateToCrashEvent(msg.crash_event_id)
                                                                                }}
                                                                            >
                                                                                Crash
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const current = msg.assigned_to || null
                                                                                    const me = session?.user?.id || null
                                                                                    const next = current ? null : me
                                                                                    updateInboxRequest(msg.request_id, { assigned_to: next })
                                                                                }}
                                                                            >
                                                                                {msg.assigned_to ? 'Unassign' : 'Assign to me'}
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handleResendInboxMessage(msg.request_id)}
                                                                            >
                                                                                Resend
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Feature Flags Tab */}
                        {activeTab === 'features' && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>Feature flags</CardTitle>
                                                <CardDescription>Toggle flags for experiments and rollouts</CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleEmergencyDisable}
                                            >
                                                Emergency Disable All
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {featureFlags.length === 0 ? (
                                            <div className="text-sm text-muted-foreground">No feature flags found.</div>
                                        ) : (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {featureFlags.map((flag) => (
                                                    <Card key={String(flag.flag_id)}>
                                                        <CardHeader className="pb-2">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <CardTitle className="text-base">{flag.flag_name}</CardTitle>
                                                                    <CardDescription className="mt-1">
                                                                        {flag.description}
                                                                    </CardDescription>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleToggleFeature(flag.flag_key, flag.enabled)}
                                                                >
                                                                    {flag.enabled ? 'Enabled' : 'Disabled'}
                                                                </Button>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="pt-0">
                                                            <div className="text-xs text-muted-foreground">
                                                                Category: {String(flag.category || '').replace(/_/g, ' ')}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Usage Overview Tab */}
                        {activeTab === 'usage' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage overview</CardTitle>
                                    <CardDescription>Per-user usage counters</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-auto rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                <tr className="border-b">
                                                    <th className="px-3 py-2 text-left font-medium">Email</th>
                                                    <th className="px-3 py-2 text-left font-medium">Projects</th>
                                                    <th className="px-3 py-2 text-left font-medium">Datasets</th>
                                                    <th className="px-3 py-2 text-left font-medium">Downloads</th>
                                                    <th className="px-3 py-2 text-left font-medium">Exports</th>
                                                    <th className="px-3 py-2 text-left font-medium">Training Runs</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.length === 0 ? (
                                                    <tr>
                                                        <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>
                                                            No users found. Create a test account to verify usage tracking and admin controls end-to-end.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    users.map((item) => {
                                                        const user = item.users || {}
                                                        const usage = userUsage[item.user_id] || {}
                                                        return (
                                                            <tr key={String(user?.id || item.user_id)} className="border-b last:border-b-0">
                                                                <td className="px-3 py-2">{user?.email || `User ${item.user_id?.substring(0, 8)}`}</td>
                                                                <td className="px-3 py-2">{usage.projects_count || 0}</td>
                                                                <td className="px-3 py-2">{usage.datasets_count || 0}</td>
                                                                <td className="px-3 py-2">{usage.downloads_count || 0}</td>
                                                                <td className="px-3 py-2">{usage.exports_count || 0}</td>
                                                                <td className="px-3 py-2">{usage.training_runs || 0}</td>
                                                            </tr>
                                                        )
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Audit Log Tab */}
                        {activeTab === 'audit' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Audit log</CardTitle>
                                    <CardDescription>Recent admin actions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-auto rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                <tr className="border-b">
                                                    <th className="px-3 py-2 text-left font-medium">Time</th>
                                                    <th className="px-3 py-2 text-left font-medium">Admin</th>
                                                    <th className="px-3 py-2 text-left font-medium">Action</th>
                                                    <th className="px-3 py-2 text-left font-medium">Target</th>
                                                    <th className="px-3 py-2 text-left font-medium">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {auditLog.length === 0 ? (
                                                    <tr>
                                                        <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                                                            No audit log entries found. Admin actions (plan assignment, user toggles, token resets) will appear here.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    auditLog.map((action) => (
                                                        <tr key={String(action.action_id)} className="border-b last:border-b-0">
                                                            <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(action.created_at)}</td>
                                                            <td className="px-3 py-2">{getUserEmailById(action.admin_user_id) || 'N/A'}</td>
                                                            <td className="px-3 py-2">{String(action.action_type || '').replace(/_/g, ' ')}</td>
                                                            <td className="px-3 py-2">{getUserEmailById(action.target_user_id) || '—'}</td>
                                                            <td className="px-3 py-2 max-w-[420px] truncate">
                                                                {action.details ? JSON.stringify(action.details) : '—'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'security' && (
                            <Suspense fallback={<div className="py-10 text-center"><LoadingSpinner /></div>}>
                                <AdminSecurityTab
                                    inboxMessages={inboxMessages}
                                    inboxLoading={inboxLoading}
                                    auditLog={auditLog}
                                    securityActiveOnly={securityActiveOnly}
                                    setSecurityActiveOnly={setSecurityActiveOnly}
                                    securityNewEmail={securityNewEmail}
                                    setSecurityNewEmail={setSecurityNewEmail}
                                    securityNewIp={securityNewIp}
                                    setSecurityNewIp={setSecurityNewIp}
                                    securityNewUserId={securityNewUserId}
                                    setSecurityNewUserId={setSecurityNewUserId}
                                    securityNewReason={securityNewReason}
                                    setSecurityNewReason={setSecurityNewReason}
                                    securityLoading={securityLoading}
                                    securityBlocklist={securityBlocklist}
                                    securityEvents={securityEvents}
                                    addBlocklistEntry={addBlocklistEntry}
                                    deactivateBlocklistEntry={deactivateBlocklistEntry}
                                    formatDateTime={formatDateTime}
                                    getUserEmailById={getUserEmailById}
                                    navigateToUserDetail={navigateToUserDetail}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'release' && (
                            <Suspense fallback={<div className="py-10 text-center"><LoadingSpinner /></div>}>
                                <AdminReleaseTab
                                    diagnosticsEvents={diagnosticsEvents}
                                    diagnosticsLoading={diagnosticsLoading}
                                    featureFlags={featureFlags}
                                    handleToggleFeature={handleToggleFeature}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'gpu-usage' && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>GPU usage</CardTitle>
                                                <CardDescription>Resource tracking and cost</CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (gpuUsage?.usage) {
                                                        exportToCSV(gpuUsage.usage, 'gpu-usage.csv')
                                                        toast.success('GPU usage data exported')
                                                    }
                                                }}
                                            >
                                                Export CSV
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {analyticsLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : !gpuUsage ? (
                                            <div className="text-sm text-muted-foreground">No GPU usage data available.</div>
                                        ) : (
                                            <>
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total GPU hours</CardDescription>
                                                            <CardTitle className="text-2xl">{Number(gpuUsage.totals?.totalHours || 0).toFixed(2)}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">All time</CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total cost</CardDescription>
                                                            <CardTitle className="text-2xl">₹{Number(gpuUsage.totals?.totalCost || 0).toFixed(2)}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">All time</CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Usage sessions</CardDescription>
                                                            <CardTitle className="text-2xl">{Number(gpuUsage.totals?.count || 0)}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent />
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Avg cost / session</CardDescription>
                                                            <CardTitle className="text-2xl">
                                                                ₹{Number(gpuUsage.totals?.count || 0) > 0 ? (Number(gpuUsage.totals?.totalCost || 0) / Number(gpuUsage.totals.count)).toFixed(2) : '0.00'}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent />
                                                    </Card>
                                                </div>

                                                <div className="overflow-auto rounded-md border">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                            <tr className="border-b">
                                                                <th className="px-3 py-2 text-left font-medium">User</th>
                                                                <th className="px-3 py-2 text-left font-medium">GPU</th>
                                                                <th className="px-3 py-2 text-left font-medium">Hours</th>
                                                                <th className="px-3 py-2 text-left font-medium">Cost</th>
                                                                <th className="px-3 py-2 text-left font-medium">Date</th>
                                                                <th className="px-3 py-2 text-left font-medium">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {gpuUsage.usage && gpuUsage.usage.length > 0 ? (
                                                                gpuUsage.usage.slice(0, 50).map((usage) => (
                                                                    <tr key={String(usage.usage_id)} className="border-b last:border-b-0">
                                                                        <td className="px-3 py-2">{usage.user_id?.substring(0, 8)}…</td>
                                                                        <td className="px-3 py-2">{usage.gpu_type} x{usage.gpu_count}</td>
                                                                        <td className="px-3 py-2">{Number(usage.hours_used || 0).toFixed(2)}</td>
                                                                        <td className="px-3 py-2">₹{Number(usage.total_cost || 0).toFixed(2)}</td>
                                                                        <td className="px-3 py-2">{formatDate(usage.usage_start)}</td>
                                                                        <td className="px-3 py-2">{usage.status || '—'}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>
                                                                        No GPU usage recorded yet.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Platform Analytics Tab */}
                        {activeTab === 'platform-analytics' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>Platform Analytics</CardTitle>
                                                <CardDescription>Platform-wide usage and plan distribution</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {analyticsLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : !platformUsageStats ? (
                                            <div className="text-sm text-muted-foreground">No platform statistics available.</div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total users</CardDescription>
                                                            <CardTitle className="text-2xl">{platformUsageStats.totalUsers}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Active subscriptions</CardDescription>
                                                            <CardTitle className="text-2xl">{platformUsageStats.activeSubscriptions}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total projects</CardDescription>
                                                            <CardTitle className="text-2xl">{platformUsageStats.totalProjects}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total models</CardDescription>
                                                            <CardTitle className="text-2xl">{platformUsageStats.totalModels}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Training runs</CardDescription>
                                                            <CardTitle className="text-2xl">{platformUsageStats.totalTrainingRuns}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total exports</CardDescription>
                                                            <CardTitle className="text-2xl">{platformUsageStats.totalExports}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total GPU hours</CardDescription>
                                                            <CardTitle className="text-2xl">{platformUsageStats.totalGpuHours}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                </div>

                                                {Object.keys(platformUsageStats.planDistribution || {}).length > 0 && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Plan Distribution</CardTitle>
                                                            <CardDescription>Users by plan</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="divide-y rounded-md border">
                                                                {Object.entries(platformUsageStats.planDistribution).map(([plan, count]) => (
                                                                    <div key={plan} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                        <div className="font-medium">
                                                                            {plan.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                                        </div>
                                                                        <div className="text-muted-foreground">{count} users</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* User Analytics Tab */}
                        {activeTab === 'user-analytics' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>User Analytics</CardTitle>
                                                <CardDescription>Per-user usage and subscription metadata</CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => exportAdminDataToCSV(userLevelAnalytics, 'user-analytics.csv')}
                                                disabled={userLevelAnalytics.length === 0}
                                            >
                                                Export CSV
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <input
                                                type="text"
                                                placeholder="Search by email..."
                                                value={userSearchFilter}
                                                onChange={(e) => setUserSearchFilter(e.target.value)}
                                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                            />
                                            <select
                                                value={userPlanFilter}
                                                onChange={(e) => setUserPlanFilter(e.target.value)}
                                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
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
                                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="active">Active</option>
                                                <option value="trialing">Trialing</option>
                                                <option value="canceled">Canceled</option>
                                                <option value="past_due">Past Due</option>
                                            </select>
                                        </div>

                                        {analyticsLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : userLevelAnalytics.length === 0 ? (
                                            <div className="text-sm text-muted-foreground">No users found.</div>
                                        ) : (
                                            <div className="overflow-hidden rounded-md border">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                        <tr className="border-b">
                                                            <th className="px-3 py-2 text-left font-medium">Email</th>
                                                            <th className="px-3 py-2 text-left font-medium">Plan</th>
                                                            <th className="px-3 py-2 text-left font-medium">Status</th>
                                                            <th className="px-3 py-2 text-left font-medium">Projects</th>
                                                            <th className="px-3 py-2 text-left font-medium">Exports</th>
                                                            <th className="px-3 py-2 text-left font-medium">GPU hours</th>
                                                            <th className="px-3 py-2 text-left font-medium">Training runs</th>
                                                            <th className="px-3 py-2 text-left font-medium">Models</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userLevelAnalytics.map((user) => (
                                                            <tr key={user.userId} className="border-b last:border-b-0">
                                                                <td className="px-3 py-2">{user.email}</td>
                                                                <td className="px-3 py-2">{user.planType.replace('_', ' ')}</td>
                                                                <td className="px-3 py-2">
                                                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                                                        {user.subscriptionStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2">{user.projectsCount}</td>
                                                                <td className="px-3 py-2">{user.exportsCount}</td>
                                                                <td className="px-3 py-2">{user.gpuHoursUsed}</td>
                                                                <td className="px-3 py-2">{user.trainingRunsCount}</td>
                                                                <td className="px-3 py-2">{user.modelsCount}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Feature Adoption Tab */}
                        {activeTab === 'feature-adoption' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>Feature Adoption</CardTitle>
                                                <CardDescription>Usage and adoption rates across feature gates</CardDescription>
                                            </div>
                                            {featureAdoption && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => exportAdminDataToCSV(featureAdoption.features, 'feature-adoption.csv')}
                                                >
                                                    Export CSV
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {analyticsLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : !featureAdoption ? (
                                            <div className="text-sm text-muted-foreground">No feature adoption data available.</div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total feature checks</CardDescription>
                                                            <CardTitle className="text-2xl">{featureAdoption.totalFeatureChecks}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Unique features</CardDescription>
                                                            <CardTitle className="text-2xl">{featureAdoption.uniqueFeatures}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                </div>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Top Features by Usage</CardTitle>
                                                        <CardDescription>Highest adoption features</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="divide-y rounded-md border">
                                                            {featureAdoption.features.slice(0, 20).map((feature) => (
                                                                <div key={feature.feature} className="space-y-2 px-3 py-3">
                                                                    <div className="flex items-center justify-between gap-3 text-sm">
                                                                        <div className="font-medium">
                                                                            {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                                        </div>
                                                                        <div className="text-muted-foreground">
                                                                            {feature.granted} / {feature.total} ({feature.adoptionRate.toFixed(1)}%)
                                                                        </div>
                                                                    </div>
                                                                    <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                                                                        <div
                                                                            className="h-full bg-primary"
                                                                            style={{ width: `${feature.adoptionRate}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {featureAdoption.mostRequested && featureAdoption.mostRequested.length > 0 && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Most Requested Features (Access Denied)</CardTitle>
                                                            <CardDescription>Denied requests</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="divide-y rounded-md border">
                                                                {featureAdoption.mostRequested.map((feature) => (
                                                                    <div key={feature.feature} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                        <div className="font-medium">
                                                                            {feature.feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                                        </div>
                                                                        <div className="text-muted-foreground">{feature.denied} denied requests</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* System Health Tab */}
                        {activeTab === 'system-health' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Health</CardTitle>
                                        <CardDescription>Sync success, error rates, and service health</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {analyticsLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : !systemHealth ? (
                                            <div className="text-sm text-muted-foreground">No system health data available.</div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Sync success rate</CardDescription>
                                                            <CardTitle className="text-2xl">{systemHealth.syncHealth.successRate}%</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">
                                                            {systemHealth.syncHealth.successfulSyncs} / {systemHealth.syncHealth.totalSyncs}
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Active IDE sessions</CardDescription>
                                                            <CardTitle className="text-2xl">{systemHealth.activeSessions}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">Last hour</CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Access denial rate</CardDescription>
                                                            <CardTitle className="text-2xl">{systemHealth.accessDenialRate}%</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">Last 7 days</CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>API error rate</CardDescription>
                                                            <CardTitle className="text-2xl">{systemHealth.apiErrorRate}%</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">Last 7 days</CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Database</CardDescription>
                                                            <CardTitle className="text-2xl">{String(systemHealth.dbHealth || '').toUpperCase()}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">Status</CardContent>
                                                    </Card>
                                                </div>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Sync Health Details</CardTitle>
                                                        <CardDescription>Last 24 hours</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="divide-y rounded-md border">
                                                            <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                <div>Total syncs (24h)</div>
                                                                <div className="font-medium">{systemHealth.syncHealth.totalSyncs}</div>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                <div>Successful</div>
                                                                <div className="font-medium">{systemHealth.syncHealth.successfulSyncs}</div>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                <div>Failed</div>
                                                                <div className="font-medium">{systemHealth.syncHealth.failedSyncs}</div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 text-right text-xs text-muted-foreground">
                                                            Last updated: {formatDateTime(systemHealth.lastUpdated)}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* IDE Sync Status Tab */}
                        {activeTab === 'ide-sync' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>IDE Sync Status</CardTitle>
                                                <CardDescription>Events and errors from IDE-to-web sync</CardDescription>
                                            </div>
                                            {ideSyncStatus && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => exportAdminDataToCSV(ideSyncStatus.events, 'ide-sync-events.csv')}
                                                >
                                                    Export CSV
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {analyticsLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : !ideSyncStatus ? (
                                            <div className="text-sm text-muted-foreground">No IDE sync data available.</div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total events</CardDescription>
                                                            <CardTitle className="text-2xl">{ideSyncStatus.totalEvents}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Unique users</CardDescription>
                                                            <CardTitle className="text-2xl">{ideSyncStatus.uniqueUsers}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Successful</CardDescription>
                                                            <CardTitle className="text-2xl">{ideSyncStatus.byStatus.success}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Failed</CardDescription>
                                                            <CardTitle className="text-2xl">{ideSyncStatus.byStatus.failed}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                </div>

                                                {Object.keys(ideSyncStatus.byEventType || {}).length > 0 && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Events by Type</CardTitle>
                                                            <CardDescription>Breakdown by event type</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="divide-y rounded-md border">
                                                                {Object.entries(ideSyncStatus.byEventType).map(([type, stats]) => (
                                                                    <div key={type} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                                        <div>
                                                                            <div className="font-medium">{type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</div>
                                                                            <div className="text-xs text-muted-foreground">{stats.success} success, {stats.failed} failed</div>
                                                                        </div>
                                                                        <div className="text-muted-foreground">{stats.total} total</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {ideSyncStatus.recentErrors && ideSyncStatus.recentErrors.length > 0 && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Recent Errors</CardTitle>
                                                            <CardDescription>Latest failed events</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                {ideSyncStatus.recentErrors.map((error) => (
                                                                    <div key={error.id} className="rounded-md border bg-muted/20 p-3 text-sm">
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <div className="font-medium">{error.user}</div>
                                                                            <div className="text-xs text-muted-foreground">{formatDateTime(error.timestamp)}</div>
                                                                        </div>
                                                                        <div className="mt-1 text-xs text-muted-foreground">{error.type}</div>
                                                                        <div className="mt-1 text-xs">{error.error}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Revenue Tab */}
                        {activeTab === 'revenue' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle>Revenue</CardTitle>
                                                <CardDescription>MRR/ARR and revenue trend analytics</CardDescription>
                                            </div>
                                            {revenueAnalyticsEnhanced && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => exportAdminDataToCSV(revenueAnalyticsEnhanced.revenueTrend, 'revenue-trend.csv')}
                                                >
                                                    Export Revenue Trend
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {analyticsLoading ? (
                                            <div className="py-10 text-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : !revenueAnalyticsEnhanced ? (
                                            <div className="text-sm text-muted-foreground">No revenue data available.</div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Monthly recurring revenue (MRR)</CardDescription>
                                                            <CardTitle className="text-2xl">₹{parseFloat(revenueAnalyticsEnhanced.mrr).toLocaleString('en-IN')}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Annual recurring revenue (ARR)</CardDescription>
                                                            <CardTitle className="text-2xl">₹{parseFloat(revenueAnalyticsEnhanced.arr).toLocaleString('en-IN')}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>Total subscriptions</CardDescription>
                                                            <CardTitle className="text-2xl">{revenueAnalyticsEnhanced.totalSubscriptions}</CardTitle>
                                                        </CardHeader>
                                                    </Card>
                                                </div>

                                                {revenueAnalyticsEnhanced.revenueTrend && revenueAnalyticsEnhanced.revenueTrend.length > 0 && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Revenue Trend</CardTitle>
                                                            <CardDescription>Last 12 months</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <UsageChart
                                                                data={revenueAnalyticsEnhanced.revenueTrend}
                                                                type="line"
                                                                title="MRR"
                                                                height={300}
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {Object.keys(revenueAnalyticsEnhanced.revenueByPlan || {}).length > 0 && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Revenue by Plan</CardTitle>
                                                            <CardDescription>Monthly equivalent</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="divide-y rounded-md border">
                                                                {Object.entries(revenueAnalyticsEnhanced.revenueByPlan).map(([plan, revenue]) => (
                                                                    <div key={plan} className="flex items-start justify-between gap-3 px-3 py-3 text-sm">
                                                                        <div>
                                                                            <div className="font-medium">{plan.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</div>
                                                                            <div className="mt-0.5 text-xs text-muted-foreground">{revenue.count} subscriptions</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-medium">₹{((revenue.monthly || 0) + (revenue.yearly || 0) / 12).toFixed(2)}</div>
                                                                            <div className="mt-0.5 text-xs text-muted-foreground">Monthly</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Activity Tab */}
                        {activeTab === 'activity' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle>Activity</CardTitle>
                                            <CardDescription>Latest user activity events</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (userActivity?.activities) {
                                                    exportToCSV(userActivity.activities, 'user-activity.csv')
                                                    toast.success('User activity data exported')
                                                }
                                            }}
                                        >
                                            Export CSV
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analyticsLoading ? (
                                        <div className="py-10 text-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : !userActivity ? (
                                        <div className="text-sm text-muted-foreground">No activity data available.</div>
                                    ) : (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardDescription>Total activities</CardDescription>
                                                        <CardTitle className="text-2xl">{userActivity.total}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="text-xs text-muted-foreground">All time</CardContent>
                                                </Card>
                                                {Object.entries(userActivity.grouped || {}).slice(0, 3).map(([type, count]) => (
                                                    <Card key={type}>
                                                        <CardHeader className="pb-2">
                                                            <CardDescription>{type.replace(/_/g, ' ')}</CardDescription>
                                                            <CardTitle className="text-2xl">{count}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-xs text-muted-foreground">Events</CardContent>
                                                    </Card>
                                                ))}
                                            </div>

                                            <div className="overflow-hidden rounded-md border">
                                                <div className="bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">Recent activity</div>
                                                <div className="divide-y">
                                                    {userActivity.activities && userActivity.activities.length > 0 ? (
                                                        userActivity.activities.slice(0, 50).map((activity) => (
                                                            <div key={activity.activity_id} className="flex items-start justify-between gap-3 px-3 py-3 text-sm">
                                                                <div className="min-w-0">
                                                                    <div className="font-semibold tracking-tight">
                                                                        {String(activity.activity_type || '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">{formatDateTime(activity.created_at)}</div>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">{String(activity.user_id || '').substring(0, 8)}…</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-3 py-6 text-sm text-muted-foreground">No activity recorded yet.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default AdminPage

