import './App.css'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
    getActiveSubscription,
    getAllSubscriptions,
    getBillingHistory,
    getPaymentMethods,
    getUserSubscriptionSummary,
    cancelSubscription,
    resumeSubscription,
    formatPrice,
    formatPriceWithInterval,
} from './utils/razorpayApi'
import {
    getSubscriptionUsage,
    getSubscriptionChangeHistory,
    getActiveTrial,
} from './utils/subscriptionApi'
import { SubscriptionUpgradeModal } from './components/SubscriptionUpgradeModal'
import { UsageChart } from './components/UsageChart'
import { LimitWarning } from './components/LimitWarning.jsx'
import { UpgradePrompt } from './components/UpgradePrompt.jsx'
import { getUsageWithLimits } from './utils/ideFeatureGating.js'
import { getUsagePercentage, isSoftLimitReached, isHardLimitReached } from './utils/usageLimits.js'
import { useToast } from './utils/toast'
import { LoadingSpinner } from './components/LoadingSpinner'

function SubscriptionPage({ session, navigate }) {
    const toast = useToast()
    const [loading, setLoading] = useState(true)
    const [subscription, setSubscription] = useState(null)
    const [subscriptionSummary, setSubscriptionSummary] = useState(null)
    const [billingHistory, setBillingHistory] = useState([])
    const [paymentMethods, setPaymentMethods] = useState([])
    const [activeTab, setActiveTab] = useState('overview') // overview, billing, payment-methods, usage, history
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [usageData, setUsageData] = useState(null)
    const [usageLoading, setUsageLoading] = useState(false)
    const [changeHistory, setChangeHistory] = useState([])
    const [activeTrial, setActiveTrial] = useState(null)
    const [usageWithLimits, setUsageWithLimits] = useState(null)

    useEffect(() => {
        loadSubscriptionData()
    }, [session])

    // Load usage limits
    useEffect(() => {
        const loadUsageLimits = async () => {
            if (!session?.user?.id) return
            try {
                const result = await getUsageWithLimits(session.user.id)
                if (result.data) {
                    setUsageWithLimits(result.data)
                }
            } catch (error) {
                console.error('Error loading usage limits:', error)
            }
        }
        loadUsageLimits()
    }, [session])

    const loadSubscriptionData = async () => {
        setLoading(true)
        try {
            const [subResult, summaryResult, billingResult, paymentResult, trialResult] = await Promise.all([
                getActiveSubscription(),
                getUserSubscriptionSummary(),
                getBillingHistory(20),
                getPaymentMethods(),
                getActiveTrial(),
            ])

            if (subResult.data) {
                setSubscription(subResult.data)
                // Load usage and change history for active subscription
                loadUsageData(subResult.data.subscription_id)
                loadChangeHistory(subResult.data.subscription_id)
            }
            if (summaryResult.data) setSubscriptionSummary(summaryResult.data)
            if (billingResult.data) setBillingHistory(billingResult.data)
            if (paymentResult.data) setPaymentMethods(paymentResult.data)
            if (trialResult.data) setActiveTrial(trialResult.data)
        } catch (error) {
            console.error('Error loading subscription data:', error)
            toast.error('Failed to load subscription data')
        } finally {
            setLoading(false)
        }
    }

    const loadUsageData = async (subscriptionId) => {
        if (!subscriptionId) return
        setUsageLoading(true)
        try {
            const result = await getSubscriptionUsage(subscriptionId)
            if (result.data) {
                // Transform data for chart (last 30 days)
                const chartData = transformUsageDataForChart(result.data)
                setUsageData(chartData)
            }
        } catch (error) {
            console.error('Error loading usage data:', error)
        } finally {
            setUsageLoading(false)
        }
    }

    const loadChangeHistory = async (subscriptionId) => {
        if (!subscriptionId) return
        try {
            const result = await getSubscriptionChangeHistory(subscriptionId)
            if (result.data) {
                setChangeHistory(result.data)
            }
        } catch (error) {
            console.error('Error loading change history:', error)
        }
    }

    const transformUsageDataForChart = (usageData) => {
        // Create chart data from GPU usage
        const last30Days = []
        const today = new Date()

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            // Find usage for this date
            const dayUsage = usageData.gpuUsage?.filter(usage => {
                const usageDate = new Date(usage.usage_start).toISOString().split('T')[0]
                return usageDate === dateStr
            }) || []

            const totalHours = dayUsage.reduce((sum, u) => sum + parseFloat(u.hours_used || 0), 0)

            last30Days.push({
                date: dateStr,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: totalHours,
            })
        }

        return last30Days
    }

    const generateBillingCalendar = () => {
        if (!subscription) return []

        const calendar = []
        const start = new Date(subscription.current_period_start)
        const end = new Date(subscription.current_period_end)
        const today = new Date()

        // Get all days in the billing period
        const currentDate = new Date(start)
        while (currentDate <= end) {
            const isBillingDay = currentDate.getTime() === end.getTime()
            const isTrialEnd = activeTrial && new Date(activeTrial.trial_end).toDateString() === currentDate.toDateString()
            const isPast = currentDate < today

            calendar.push({
                date: new Date(currentDate),
                isBillingDay,
                isTrialEnd,
                isPast,
            })

            currentDate.setDate(currentDate.getDate() + 1)
        }

        return calendar
    }

    const downloadInvoice = async (billingId) => {
        try {
            // Get invoice URL from billing history
            const invoice = billingHistory.find(b => b.billing_id === billingId)
            if (invoice?.invoice_pdf_url) {
                window.open(invoice.invoice_pdf_url, '_blank')
            } else if (invoice?.hosted_invoice_url) {
                window.open(invoice.hosted_invoice_url, '_blank')
            } else {
                toast.info('Invoice not available yet. Please check back later.')
            }
        } catch (error) {
            console.error('Error downloading invoice:', error)
            toast.error('Failed to download invoice')
        }
    }

    const handleManageSubscription = async () => {
        // For Razorpay, redirect to subscription management page
        toast.info('Subscription management available in your account')
        // You can implement a custom subscription management page or use Razorpay dashboard
    }

    const handleCancelSubscription = async () => {
        if (!subscription) return

        const confirmed = confirm(
            'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.'
        )

        if (!confirmed) return

        const result = await cancelSubscription(subscription.subscription_id)
        if (result.success) {
            toast.success('Subscription will be canceled at the end of the billing period')
            loadSubscriptionData()
        } else {
            toast.error(result.error || 'Failed to cancel subscription')
        }
    }

    const handleResumeSubscription = async () => {
        if (!subscription) return

        const result = await resumeSubscription(subscription.subscription_id)
        if (result.success) {
            toast.success('Subscription resumed successfully')
            loadSubscriptionData()
        } else {
            toast.error(result.error || 'Failed to resume subscription')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
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
                minute: '2-digit',
            })
        } catch {
            return 'Invalid date'
        }
    }

    const getPlanDisplayName = (planType) => {
        const names = {
            free: 'Free — Explore',
            data_pro: 'Data Pro — Prepare',
            train_pro: 'Train Pro — Build',
            deploy_pro: 'Deploy Pro — Ship',
            enterprise: 'Enterprise',
        }
        return names[planType] || planType
    }

    const getStatusBadgeClass = (status) => {
        const classes = {
            active: 'dashStatus--active',
            trialing: 'dashStatus--active',
            past_due: 'dashStatus--warning',
            canceled: 'dashStatus--archived',
            unpaid: 'dashStatus--archived',
            paused: 'dashStatus--warning',
        }
        return classes[status] || 'dashStatus--archived'
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <>
            <section className="dashHero">
                <div className="container dashHero__inner">
                    <p className="dashHero__kicker">Subscription</p>
                    <h1 className="dashHero__title">Manage Your Subscription</h1>
                    <p className="dashHero__subtitle">
                        View your current plan, billing history, and payment methods.
                    </p>
                </div>
            </section>

            <section className="dashSection">
                <div className="container">
                    {/* Tabs */}
                    <div className="adminTabs" style={{ marginBottom: '32px' }}>
                        <button
                            className={`adminTab ${activeTab === 'overview' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'usage' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('usage')}
                        >
                            Usage
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'billing' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('billing')}
                        >
                            Billing History
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'payment-methods' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('payment-methods')}
                        >
                            Payment Methods
                        </button>
                        <button
                            className={`adminTab ${activeTab === 'history' ? 'adminTab--active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Change History
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="dashGrid">
                            <article className="dashCard">
                                <h2 className="dashCard__title">Current Plan</h2>
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">Plan</div>
                                        <div className="dashRow__value">
                                            {subscriptionSummary?.plan_type
                                                ? getPlanDisplayName(subscriptionSummary.plan_type)
                                                : 'Free'}
                                        </div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Status</div>
                                        <div className="dashRow__value">
                                            {subscription ? (
                                                <span
                                                    className={`dashStatus ${getStatusBadgeClass(
                                                        subscription.status
                                                    )}`}
                                                >
                                                    {subscription.status.charAt(0).toUpperCase() +
                                                        subscription.status.slice(1).replace('_', ' ')}
                                                </span>
                                            ) : (
                                                <span className="dashStatus dashStatus--active">Active (Free)</span>
                                            )}
                                        </div>
                                    </div>
                                    {subscription && (
                                        <>
                                            <div className="dashRow">
                                                <div className="dashRow__label">Current Period</div>
                                                <div className="dashRow__value">
                                                    {formatDate(subscription.current_period_start)} -{' '}
                                                    {formatDate(subscription.current_period_end)}
                                                </div>
                                            </div>
                                            {subscription.cancel_at_period_end && (
                                                <div className="dashRow">
                                                    <div className="dashRow__label">Cancellation</div>
                                                    <div className="dashRow__value" style={{ color: 'rgba(239, 68, 68, 0.9)' }}>
                                                        Will cancel on {formatDate(subscription.current_period_end)}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {subscriptionSummary?.license_expires_at && (
                                        <div className="dashRow">
                                            <div className="dashRow__label">License Expires</div>
                                            <div className="dashRow__value">
                                                {formatDate(subscriptionSummary.license_expires_at)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="dashActions">
                                    {subscription ? (
                                        <>
                                            {subscription.cancel_at_period_end ? (
                                                <button
                                                    className="button button--primary"
                                                    onClick={handleResumeSubscription}
                                                >
                                                    Resume Subscription
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="button button--primary"
                                                        onClick={() => setShowUpgradeModal(true)}
                                                    >
                                                        Change Plan
                                                    </button>
                                                    <button
                                                        className="button button--outline"
                                                        onClick={handleCancelSubscription}
                                                    >
                                                        Cancel Subscription
                                                    </button>
                                                    <a
                                                        className="button button--outline"
                                                        href="https://dashboard.razorpay.com"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View in Razorpay
                                                    </a>
                                                </>
                                            )}
                                        </>
                                    ) : (
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
                                </div>
                            </article>

                            <article className="dashCard">
                                <h2 className="dashCard__title">Usage Summary</h2>
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">Total Payments</div>
                                        <div className="dashRow__value">
                                            {subscriptionSummary?.total_payments || 0}
                                        </div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Total Paid</div>
                                        <div className="dashRow__value">
                                            {subscriptionSummary?.total_paid_amount
                                                ? formatPrice(subscriptionSummary.total_paid_amount)
                                                : '₹0.00'}
                                        </div>
                                    </div>
                                    {usageData && (
                                        <>
                                            <div className="dashRow">
                                                <div className="dashRow__label">GPU Usage (30 days)</div>
                                                <div className="dashRow__value">
                                                    {usageData.reduce((sum, d) => sum + d.value, 0).toFixed(2)} hours
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Usage Limits Warnings */}
                                {usageWithLimits && (
                                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--dr-border-weak)' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Current Usage Limits</h3>

                                        {/* Projects Limit */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>Projects</span>
                                                <span style={{ fontSize: '14px', color: 'var(--dr-muted)' }}>
                                                    {usageWithLimits.usage.projects_count || 0} / {usageWithLimits.limits.max_projects === -1 ? '∞' : usageWithLimits.limits.max_projects}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '6px',
                                                backgroundColor: 'var(--dr-border-weak)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    width: `${getUsagePercentage(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)}%`,
                                                    height: '100%',
                                                    backgroundColor: isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)
                                                        ? '#ef4444'
                                                        : isSoftLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)
                                                            ? '#f59e0b'
                                                            : '#14b8a6',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <LimitWarning
                                                current={usageWithLimits.usage.projects_count || 0}
                                                limit={usageWithLimits.limits.max_projects}
                                                label="projects"
                                                isSoftLimit={isSoftLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)}
                                                isHardLimit={isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects)}
                                                onUpgrade={() => navigate('/pricing')}
                                                showUpgradeButton={false}
                                            />
                                        </div>

                                        {/* Exports Limit */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>Exports</span>
                                                <span style={{ fontSize: '14px', color: 'var(--dr-muted)' }}>
                                                    {usageWithLimits.usage.exports_count || 0} / {usageWithLimits.limits.max_exports_per_month === -1 ? '∞' : usageWithLimits.limits.max_exports_per_month}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '6px',
                                                backgroundColor: 'var(--dr-border-weak)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    width: `${getUsagePercentage(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)}%`,
                                                    height: '100%',
                                                    backgroundColor: isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)
                                                        ? '#ef4444'
                                                        : isSoftLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)
                                                            ? '#f59e0b'
                                                            : '#14b8a6',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <LimitWarning
                                                current={usageWithLimits.usage.exports_count || 0}
                                                limit={usageWithLimits.limits.max_exports_per_month}
                                                label="exports"
                                                unit=" per month"
                                                isSoftLimit={isSoftLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)}
                                                isHardLimit={isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month)}
                                                onUpgrade={() => navigate('/pricing')}
                                                showUpgradeButton={false}
                                            />
                                        </div>

                                        {/* GPU Hours Limit */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>GPU Hours</span>
                                                <span style={{ fontSize: '14px', color: 'var(--dr-muted)' }}>
                                                    {parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0').toFixed(1)} / {usageWithLimits.limits.max_gpu_hours_per_month === -1 ? '∞' : usageWithLimits.limits.max_gpu_hours_per_month}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '6px',
                                                backgroundColor: 'var(--dr-border-weak)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    width: `${getUsagePercentage(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)}%`,
                                                    height: '100%',
                                                    backgroundColor: isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                                        ? '#ef4444'
                                                        : isSoftLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                                            ? '#f59e0b'
                                                            : '#14b8a6',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <LimitWarning
                                                current={parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0')}
                                                limit={usageWithLimits.limits.max_gpu_hours_per_month}
                                                label="GPU hours"
                                                unit=" hours"
                                                isSoftLimit={isSoftLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)}
                                                isHardLimit={isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)}
                                                onUpgrade={() => navigate('/pricing')}
                                                showUpgradeButton={false}
                                            />
                                        </div>

                                        {/* Upgrade Prompt if approaching limits */}
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
                                                        ? "You've reached one or more usage limits. Choose a plan with higher limits to continue."
                                                        : "You're approaching your usage limits. Compare plans if you want higher limits."}
                                                    variant={[
                                                        isHardLimitReached(usageWithLimits.usage.projects_count || 0, usageWithLimits.limits.max_projects),
                                                        isHardLimitReached(usageWithLimits.usage.exports_count || 0, usageWithLimits.limits.max_exports_per_month),
                                                        isHardLimitReached(parseFloat(usageWithLimits.usage.gpu_hours_used?.toString() || '0'), usageWithLimits.limits.max_gpu_hours_per_month)
                                                    ].some(Boolean) ? 'error' : 'warning'}
                                                    onUpgrade={() => navigate('/pricing')}
                                                />
                                            )}
                                    </div>
                                )}
                            </article>

                            {/* Trial Status Card */}
                            {activeTrial && (
                                <article className="dashCard" style={{ border: '2px solid #fbbf24', background: '#fef3c7' }}>
                                    <h2 className="dashCard__title">Trial Period</h2>
                                    <div className="dashRows">
                                        <div className="dashRow">
                                            <div className="dashRow__label">Trial End Date</div>
                                            <div className="dashRow__value">
                                                {formatDate(activeTrial.trial_end)}
                                            </div>
                                        </div>
                                        <div className="dashRow">
                                            <div className="dashRow__label">Days Remaining</div>
                                            <div className="dashRow__value">
                                                {Math.ceil((new Date(activeTrial.trial_end) - new Date()) / (1000 * 60 * 60 * 24))} days
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dashActions">
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
                                </article>
                            )}

                            {/* Billing Calendar */}
                            {subscription && (
                                <article className="dashCard">
                                    <h2 className="dashCard__title">Billing Calendar</h2>
                                    <div className="billing-calendar">
                                        {generateBillingCalendar().map((day, idx) => (
                                            <div
                                                key={idx}
                                                className={`calendar-day ${day.isBillingDay ? 'calendar-day--billing' : ''
                                                    } ${day.isTrialEnd ? 'calendar-day--trial' : ''} ${day.isPast ? 'calendar-day--past' : ''
                                                    }`}
                                                title={
                                                    day.isBillingDay
                                                        ? 'Billing Date'
                                                        : day.isTrialEnd
                                                            ? 'Trial Ends'
                                                            : day.date.toLocaleDateString()
                                                }
                                            >
                                                {day.date.getDate()}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--dr-muted)' }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div
                                                    style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        background: '#14b8a6',
                                                        borderRadius: '4px',
                                                    }}
                                                />
                                                <span>Billing Date</span>
                                            </div>
                                            {activeTrial && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div
                                                        style={{
                                                            width: '16px',
                                                            height: '16px',
                                                            background: '#fbbf24',
                                                            borderRadius: '4px',
                                                        }}
                                                    />
                                                    <span>Trial End</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            )}
                        </div>
                    )}

                    {/* Usage Tab */}
                    {activeTab === 'usage' && (
                        <div className="dashCard">
                            <h2 className="dashCard__title">Usage Analytics</h2>
                            {usageLoading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </div>
                            ) : usageData && usageData.length > 0 ? (
                                <>
                                    <UsageChart
                                        data={usageData}
                                        type="line"
                                        title="GPU Usage (Last 30 Days)"
                                        height={300}
                                    />
                                    <div style={{ marginTop: '24px' }}>
                                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                            Usage Statistics
                                        </h3>
                                        <div className="stats-grid">
                                            <div className="stat-card">
                                                <div className="stat-card__label">Total Hours (30 days)</div>
                                                <div className="stat-card__value">
                                                    {usageData.reduce((sum, d) => sum + d.value, 0).toFixed(2)}
                                                </div>
                                                <div className="stat-card__subtext">GPU hours used</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card__label">Average Daily</div>
                                                <div className="stat-card__value">
                                                    {(usageData.reduce((sum, d) => sum + d.value, 0) / 30).toFixed(2)}
                                                </div>
                                                <div className="stat-card__subtext">Hours per day</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card__label">Peak Usage</div>
                                                <div className="stat-card__value">
                                                    {Math.max(...usageData.map(d => d.value)).toFixed(2)}
                                                </div>
                                                <div className="stat-card__subtext">Highest single day</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No usage data available yet. Usage will appear here as you use GPU resources.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Billing History Tab */}
                    {activeTab === 'billing' && (
                        <div className="dashCard">
                            <h2 className="dashCard__title">Billing History</h2>
                            {billingHistory.length === 0 ? (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No billing history found.
                                </div>
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Date</div>
                                        <div>Description</div>
                                        <div>Amount</div>
                                        <div>Status</div>
                                        <div>Invoice</div>
                                    </div>
                                    {billingHistory.map((invoice) => (
                                        <div key={invoice.billing_id} className="dashTable__row">
                                            <div>{formatDate(invoice.created_at)}</div>
                                            <div>{invoice.description || 'Subscription payment'}</div>
                                            <div>{formatPrice(invoice.amount, invoice.currency)}</div>
                                            <div>
                                                <span
                                                    className={`dashStatus dashStatus--${invoice.status === 'paid' ? 'active' : 'archived'
                                                        }`}
                                                >
                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                </span>
                                            </div>
                                            <div>
                                                {invoice.invoice_pdf_url || invoice.hosted_invoice_url ? (
                                                    <button
                                                        className="button button--outline"
                                                        style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        onClick={() => downloadInvoice(invoice.billing_id)}
                                                    >
                                                        {invoice.invoice_pdf_url ? 'Download' : 'View'}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--dr-muted)', fontSize: '14px' }}>—</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Methods Tab */}
                    {activeTab === 'payment-methods' && (
                        <div className="dashCard">
                            <h2 className="dashCard__title">Payment Methods</h2>
                            {paymentMethods.length === 0 ? (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No payment methods found. Add a payment method through the customer portal.
                                </div>
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Type</div>
                                        <div>Card</div>
                                        <div>Expires</div>
                                        <div>Default</div>
                                        <div>Actions</div>
                                    </div>
                                    {paymentMethods.map((method) => (
                                        <div key={method.payment_method_id} className="dashTable__row">
                                            <div>{method.type === 'card' ? 'Card' : 'Bank Account'}</div>
                                            <div>
                                                {method.card_brand && method.card_last4
                                                    ? `${method.card_brand.toUpperCase()} •••• ${method.card_last4}`
                                                    : '—'}
                                            </div>
                                            <div>
                                                {method.card_exp_month && method.card_exp_year
                                                    ? `${method.card_exp_month}/${method.card_exp_year}`
                                                    : '—'}
                                            </div>
                                            <div>
                                                {method.is_default ? (
                                                    <span className="dashStatus dashStatus--active">Default</span>
                                                ) : (
                                                    '—'
                                                )}
                                            </div>
                                            <div>
                                                <button
                                                    className="button button--outline"
                                                    onClick={handleManageSubscription}
                                                    style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="dashActions" style={{ marginTop: '24px' }}>
                                <button className="button button--primary" onClick={handleManageSubscription}>
                                    Manage Payment Methods
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Change History Tab */}
                    {activeTab === 'history' && (
                        <div className="dashCard">
                            <h2 className="dashCard__title">Subscription Change History</h2>
                            {changeHistory.length === 0 ? (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No changes recorded yet.
                                </div>
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Date</div>
                                        <div>Change Type</div>
                                        <div>From Plan</div>
                                        <div>To Plan</div>
                                        <div>Prorated Amount</div>
                                    </div>
                                    {changeHistory.map((change) => (
                                        <div key={change.change_id} className="dashTable__row">
                                            <div>{formatDateTime(change.created_at)}</div>
                                            <div>
                                                <span
                                                    className={`dashStatus dashStatus--${change.change_type === 'upgrade'
                                                            ? 'active'
                                                            : change.change_type === 'downgrade'
                                                                ? 'warning'
                                                                : 'archived'
                                                        }`}
                                                >
                                                    {change.change_type.charAt(0).toUpperCase() +
                                                        change.change_type.slice(1).replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div>{change.from_plan ? getPlanDisplayName(change.from_plan) : '—'}</div>
                                            <div>{change.to_plan ? getPlanDisplayName(change.to_plan) : '—'}</div>
                                            <div>
                                                {change.prorated_amount
                                                    ? formatPrice(change.prorated_amount)
                                                    : '—'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Upgrade/Downgrade Modal */}
            {subscription && (
                <SubscriptionUpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentSubscription={subscription}
                    onSuccess={() => {
                        loadSubscriptionData()
                        setShowUpgradeModal(false)
                    }}
                />
            )}
        </>
    )
}

export default SubscriptionPage

