import './App.css'
import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import { createRazorpayOrder, verifyRazorpayPayment, getPricingPlans, formatPrice, formatPriceWithInterval } from './utils/razorpayApi'
import { useToast } from './utils/toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { SuccessAnimation } from './components/SuccessAnimation'

function CheckoutPage({ navigate }) {
    const toast = useToast()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [billingInterval, setBillingInterval] = useState('monthly')
    const [email, setEmail] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [saveInfo, setSaveInfo] = useState(false)
    const [razorpayOrder, setRazorpayOrder] = useState(null)
    const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false)
    const [orderLoading, setOrderLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [loadingStep, setLoadingStep] = useState('') // 'plan', 'order', 'payment'
    const razorpayScriptLoadedRef = useRef(false)

    // Load Razorpay script
    useEffect(() => {
        if (razorpayScriptLoadedRef.current) {
            setRazorpayScriptLoaded(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => {
            razorpayScriptLoadedRef.current = true
            setRazorpayScriptLoaded(true)
        }
        script.onerror = () => {
            setErrorMessage('Failed to load payment gateway. Please check your internet connection and refresh the page.')
            toast.error('Payment gateway failed to load')
        }
        document.body.appendChild(script)

        return () => {
            // Cleanup if needed
        }
    }, [toast])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            setLoadingStep('plan')
            setErrorMessage(null)

            try {
                // Get plan from URL params
                const params = new URLSearchParams(window.location.search)
                const planKey = params.get('plan') || 'data_pro'
                const interval = params.get('interval') || 'monthly'

                setBillingInterval(interval)

                // Check auth
                const { data: { session: currentSession }, error: authError } = await supabase.auth.getSession()
                if (authError) {
                    throw new Error('Authentication check failed. Please try logging in again.')
                }
                
                if (!currentSession) {
                    setErrorMessage('You need to be logged in to complete your purchase. Redirecting to login...')
                    toast.error('Please log in to continue')
                    setTimeout(() => {
                        navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
                    }, 2000)
                    return
                }

                setSession(currentSession)
                setEmail(currentSession.user.email || '')

                // Load plan details
                setLoadingStep('plan')
                const { data: plans, error: plansError } = await getPricingPlans()
                
                if (plansError) {
                    throw new Error('Unable to load pricing plans. Please try again or contact support if the issue persists.')
                }

                const plan = plans?.find(p => p.plan_key === planKey)
                if (!plan) {
                    setErrorMessage(`The selected plan "${planKey}" is not available. Redirecting to pricing page...`)
                    toast.error('Invalid plan selected')
                    setTimeout(() => navigate('/pricing'), 2000)
                    return
                }

                setSelectedPlan(plan)
            } catch (error) {
                console.error('Error loading checkout data:', error)
                const errorMsg = error.message || 'Failed to load checkout page. Please refresh or contact support.'
                setErrorMessage(errorMsg)
                toast.error(errorMsg)
            } finally {
                setLoading(false)
                setLoadingStep('')
            }
        }

        loadData()
    }, [navigate, toast])

    // Create Razorpay order when plan is selected
    useEffect(() => {
        if (!selectedPlan || !session || selectedPlan.plan_key === 'free' || orderLoading) return

        const createOrder = async () => {
            setOrderLoading(true)
            setLoadingStep('order')
            setErrorMessage(null)

            try {
                const result = await createRazorpayOrder(selectedPlan.plan_key, billingInterval)
                if (result.success) {
                    setRazorpayOrder(result.data || result)
                } else {
                    throw new Error(result.error || 'Failed to create payment order. Please try again.')
                }
            } catch (error) {
                console.error('Error creating order:', error)
                const errorMsg = error.message || 'Unable to create payment order. Please refresh the page or contact support.'
                setErrorMessage(errorMsg)
                toast.error(errorMsg)
            } finally {
                setOrderLoading(false)
                setLoadingStep('')
            }
        }

        createOrder()
    }, [selectedPlan, billingInterval, session, toast])

    const handleSubscribe = async () => {
        // Validation
        if (!selectedPlan || !session) {
            setErrorMessage('Missing subscription details. Please refresh the page.')
            toast.error('Please refresh the page and try again.')
            return
        }

        if (!razorpayOrder || orderLoading) {
            setErrorMessage('Payment order is still being created. Please wait a moment...')
            toast.info('Please wait, order is being created...')
            return
        }

        if (!razorpayScriptLoaded || !window.Razorpay) {
            setErrorMessage('Payment gateway is not ready. Please refresh the page to reload the payment system.')
            toast.error('Payment gateway not loaded. Please refresh the page.')
            return
        }

        if (!email || !email.includes('@')) {
            setErrorMessage('Please enter a valid email address.')
            toast.error('Invalid email address')
            return
        }

        setProcessing(true)
        setLoadingStep('payment')
        setErrorMessage(null)

        try {
            const options = {
                key: razorpayOrder.key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: razorpayOrder.name,
                description: razorpayOrder.description,
                order_id: razorpayOrder.orderId,
                prefill: {
                    email: email,
                    name: session.user.user_metadata?.first_name && session.user.user_metadata?.last_name
                        ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name}`
                        : email,
                },
                theme: {
                    color: '#14b8a6',
                },
                handler: async function (response) {
                    // Payment successful, verify payment
                    try {
                        setLoadingStep('verifying')
                        const verifyResult = await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan_key: selectedPlan.plan_key,
                            billing_interval: billingInterval,
                        })

                        if (verifyResult.success) {
                            setShowSuccess(true)
                            // Navigate after animation
                            setTimeout(() => {
                                navigate('/subscription')
                            }, 2500)
                        } else {
                            const errorMsg = verifyResult.error || 'Payment verification failed. Your payment may have been processed but subscription activation failed. Please contact support with your payment ID: ' + response.razorpay_payment_id
                            setErrorMessage(errorMsg)
                            toast.error('Payment verification failed. Please contact support.')
                            setProcessing(false)
                            setLoadingStep('')
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error)
                        const errorMsg = 'Payment verification encountered an error. Your payment may have been processed. Please contact support with payment ID: ' + (response?.razorpay_payment_id || 'N/A')
                        setErrorMessage(errorMsg)
                        toast.error('Payment verification failed. Please contact support.')
                        setProcessing(false)
                        setLoadingStep('')
                    }
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false)
                        setLoadingStep('')
                        toast.info('Payment process cancelled. You can try again when ready.')
                    },
                },
            }

            // Add payment method specific options
            if (paymentMethod === 'bank') {
                options.method = {
                    netbanking: true,
                }
            } else if (paymentMethod === 'cashapp') {
                // Cash App Pay not directly supported by Razorpay
                // Use UPI or wallet instead
                options.method = {
                    upi: true,
                    wallet: true,
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.error('Error opening Razorpay checkout:', error)
            const errorMsg = error.message || 'Failed to open payment gateway. Please check your internet connection and try again.'
            setErrorMessage(errorMsg)
            toast.error('Failed to open payment gateway. Please try again.')
            setProcessing(false)
            setLoadingStep('')
        }
    }

    const handleAmazonPay = async () => {
        // For Amazon Pay, we can use Razorpay's wallet option
        if (!razorpayOrder || !window.Razorpay) {
            toast.error('Please wait, order is being created...')
            return
        }

        setProcessing(true)

        try {
            const options = {
                key: razorpayOrder.key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: razorpayOrder.name,
                description: razorpayOrder.description,
                order_id: razorpayOrder.orderId,
                prefill: {
                    email: email,
                },
                method: {
                    wallet: true,
                },
                handler: async function (response) {
                    const verifyResult = await verifyRazorpayPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        plan_key: selectedPlan.plan_key,
                        billing_interval: billingInterval,
                    })

                    if (verifyResult.success) {
                        toast.success('Payment successful!')
                        navigate('/subscription')
                    } else {
                        toast.error(verifyResult.error || 'Payment verification failed')
                        setProcessing(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false)
                    },
                },
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.error('Error opening Razorpay:', error)
            toast.error('Failed to open payment gateway.')
            setProcessing(false)
        }
    }

    const getPlanPrice = () => {
        if (!selectedPlan) return '$0.00'
        if (selectedPlan.plan_key === 'free') return '$0.00'
        const price = billingInterval === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly
        if (price === null || price === undefined) return 'Contact Sales'
        return formatPrice(price)
    }

    const getPricePerInterval = () => {
        if (!selectedPlan) return ''
        if (selectedPlan.plan_key === 'free') return ''
        return billingInterval === 'yearly' ? 'per year' : 'per month'
    }

    if (loading) {
        return (
            <div 
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '80vh',
                    gap: '16px'
                }}
                role="status"
                aria-live="polite"
            >
                <LoadingSpinner />
                <p style={{ color: 'var(--dr-muted)', fontSize: '14px' }}>
                    {loadingStep === 'plan' ? 'Loading plan details...' : 
                     loadingStep === 'order' ? 'Creating payment order...' : 
                     'Loading checkout...'}
                </p>
            </div>
        )
    }

    if (!selectedPlan) {
        return null
    }

    return (
        <>
            <SuccessAnimation 
                show={showSuccess} 
                onComplete={() => {
                    setShowSuccess(false)
                    navigate('/subscription')
                }} 
            />
            <div 
                style={{ 
                    minHeight: '100vh', 
                    backgroundColor: '#ffffff',
                    padding: '40px 20px'
                }}
                role="main"
                aria-label="Checkout page"
            >
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '60px',
                    alignItems: 'start'
                }}
                className="checkout-container"
                >
                {/* Left Column - Subscription Details */}
                <div>
                    {/* Error Message Display */}
                    {errorMessage && (
                        <div 
                            role="alert"
                            aria-live="assertive"
                            style={{
                                padding: '16px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                color: '#991b1b'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>⚠️</span>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ display: 'block', marginBottom: '4px' }}>Error</strong>
                                    <p style={{ margin: 0, fontSize: '14px' }}>{errorMessage}</p>
                                </div>
                                <button
                                    onClick={() => setErrorMessage(null)}
                                    aria-label="Dismiss error message"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        color: '#991b1b',
                                        padding: '0',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Back Button & Logo */}
                    <button
                        onClick={() => navigate('/pricing')}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            marginBottom: '32px',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            textAlign: 'left'
                        }}
                        aria-label="Go back to pricing page"
                    >
                        <span style={{ fontSize: '20px' }}>←</span>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontWeight: '600',
                            fontSize: '18px',
                            color: '#000000'
                        }}>
                            <span style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '6px',
                                backgroundColor: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}>M</span>
                            <span>ML FORGE</span>
                        </div>
                    </div>

                    {/* Subscription Title */}
                    <h1 style={{ 
                        fontSize: '28px', 
                        fontWeight: '600', 
                        marginBottom: '16px',
                        color: '#000000'
                    }}>
                        Subscribe to {selectedPlan.plan_name}
                    </h1>

                    {/* Price */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'baseline', 
                        gap: '8px',
                        marginBottom: '24px'
                    }}>
                        <span style={{ 
                            fontSize: '48px', 
                            fontWeight: '700',
                            color: '#000000'
                        }}>
                            {getPlanPrice()}
                        </span>
                        {getPricePerInterval() && (
                            <span style={{ 
                                fontSize: '16px', 
                                color: '#666666',
                                marginLeft: '4px'
                            }}>
                                {getPricePerInterval()}
                            </span>
                        )}
                    </div>

                    {/* Product Summary */}
                    <div style={{ 
                        backgroundColor: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                            {selectedPlan.plan_name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                            Desktop-first Vision AI IDE
                        </div>
                        <div style={{ fontSize: '14px', color: '#666666' }}>
                            Billed {billingInterval === 'yearly' ? 'annually' : 'monthly'}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ 
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '24px',
                        marginTop: '24px'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '16px',
                            fontSize: '16px'
                        }}>
                            <span>Subtotal</span>
                            <span style={{ fontWeight: '600' }}>{getPlanPrice()}</span>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '16px',
                            fontSize: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>Tax</span>
                                <span style={{ fontSize: '12px', color: '#666666' }}>ℹ️</span>
                            </div>
                            <span style={{ color: '#666666' }}>Enter address to calculate</span>
                        </div>

                        <div style={{ 
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: '16px',
                            marginTop: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '18px',
                            fontWeight: '600'
                        }}>
                            <span>Total due today</span>
                            <span>{getPlanPrice()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Payment Information */}
                <div>
                    {/* Amazon Pay / Wallet Button */}
                    <button 
                        onClick={handleAmazonPay}
                        disabled={processing || !razorpayOrder}
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            backgroundColor: processing || !razorpayOrder ? '#d1d5db' : '#FF9900',
                            color: '#000000',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: processing || !razorpayOrder ? 'not-allowed' : 'pointer',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                        <span>Pay with</span>
                        <span style={{ fontWeight: '700' }}>amazon</span>
                    </button>
                    <div style={{ 
                        textAlign: 'center', 
                        fontSize: '14px', 
                        color: '#666666',
                        marginBottom: '24px'
                    }}>
                        Use your Amazon account or wallet
                    </div>

                    {/* OR Separator */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                        <span style={{ color: '#666666', fontSize: '14px' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                    </div>

                    {/* Email Field */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#000000'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                setErrorMessage(null)
                            }}
                            aria-label="Email address for payment"
                            aria-required="true"
                            aria-invalid={email && !email.includes('@')}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: email && !email.includes('@') ? '1px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        />
                        {email && !email.includes('@') && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }} role="alert">
                                Please enter a valid email address
                            </p>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                            marginBottom: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#000000'
                        }}>
                            Payment method
                        </div>

                        {/* Card Option */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            border: '2px solid #000000',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            cursor: 'pointer',
                            backgroundColor: paymentMethod === 'card' ? '#f8f9fa' : '#ffffff'
                        }}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                aria-label="Pay with credit or debit card"
                                style={{ marginRight: '12px', width: '18px', height: '18px' }}
                            />
                            <span style={{ marginRight: 'auto', fontWeight: '500' }}>Card</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>💳</span>
                                <span style={{ fontSize: '20px' }}>💳</span>
                                <span style={{ fontSize: '20px' }}>💳</span>
                                <span style={{ fontSize: '20px' }}>💳</span>
                            </div>
                        </label>

                        {/* UPI / Wallet Option (replaces Cash App Pay for India) */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            cursor: 'pointer',
                            backgroundColor: paymentMethod === 'upi' ? '#f8f9fa' : '#ffffff'
                        }}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="upi"
                                checked={paymentMethod === 'upi'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                aria-label="Pay with UPI or digital wallet"
                                style={{ marginRight: '12px', width: '18px', height: '18px' }}
                            />
                            <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#00D632',
                                borderRadius: '4px',
                                marginRight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>₹</div>
                            <span style={{ fontWeight: '500' }}>UPI / Wallet</span>
                        </label>

                        {/* Bank Option */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: paymentMethod === 'bank' ? '#f8f9fa' : '#ffffff'
                        }}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bank"
                                checked={paymentMethod === 'bank'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                aria-label="Pay with net banking"
                                style={{ marginRight: '12px', width: '18px', height: '18px' }}
                            />
                            <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#10b981',
                                borderRadius: '4px',
                                marginRight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '14px'
                            }}>🏦</div>
                            <span style={{ marginRight: 'auto', fontWeight: '500' }}>Bank</span>
                            <span style={{ 
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>$5 back</span>
                        </label>
                    </div>

                    {/* Save Info Checkbox */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'start',
                        marginBottom: '24px',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={saveInfo}
                            onChange={(e) => setSaveInfo(e.target.checked)}
                            style={{ marginRight: '12px', marginTop: '4px', width: '18px', height: '18px' }}
                        />
                        <div style={{ fontSize: '14px', color: '#666666' }}>
                            <div style={{ marginBottom: '4px' }}>Save my information for faster checkout</div>
                            <div style={{ fontSize: '12px' }}>
                                Pay securely at ML FORGE and everywhere Link is accepted.
                            </div>
                        </div>
                    </label>

                    {/* Order Loading State */}
                    {orderLoading && (
                        <div 
                            role="status"
                            aria-live="polite"
                            style={{
                                padding: '12px',
                                backgroundColor: '#f0fdfa',
                                border: '1px solid #14b8a6',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#065f46'
                            }}
                        >
                            <LoadingSpinner size="small" />
                            <span style={{ fontSize: '14px' }}>Creating payment order...</span>
                        </div>
                    )}

                    {/* Subscribe Button */}
                    <button
                        onClick={handleSubscribe}
                        disabled={processing || !email || orderLoading || !razorpayOrder || !razorpayScriptLoaded}
                        aria-label={processing ? 'Processing payment' : orderLoading ? 'Waiting for order creation' : 'Subscribe to plan'}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: (processing || orderLoading || !razorpayOrder || !razorpayScriptLoaded) ? '#9ca3af' : '#14b8a6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: (processing || orderLoading || !razorpayOrder || !razorpayScriptLoaded) ? 'not-allowed' : 'pointer',
                            marginBottom: '16px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {processing ? (
                            <>
                                <LoadingSpinner size="small" />
                                <span>{loadingStep === 'verifying' ? 'Verifying payment...' : 'Processing payment...'}</span>
                            </>
                        ) : orderLoading ? (
                            <>
                                <LoadingSpinner size="small" />
                                <span>Preparing checkout...</span>
                            </>
                        ) : !razorpayOrder ? (
                            'Preparing checkout...'
                        ) : !razorpayScriptLoaded ? (
                            'Loading payment gateway...'
                        ) : (
                            'Subscribe'
                        )}
                    </button>

                    {/* Authorization Text */}
                    <p style={{
                        fontSize: '12px',
                        color: '#666666',
                        textAlign: 'center',
                        lineHeight: '1.5',
                        marginBottom: '24px'
                    }}>
                        By subscribing, you authorize ML FORGE to charge you according to the terms until you cancel.
                    </p>

                    {/* Footer Links */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        fontSize: '12px',
                        color: '#666666'
                    }}>
                        <span>Powered by</span>
                        <span style={{ fontWeight: '600' }}>razorpay</span>
                        <span>•</span>
                        <a href="#" style={{ color: '#666666', textDecoration: 'none' }}>Terms</a>
                        <span>•</span>
                        <a href="#" style={{ color: '#666666', textDecoration: 'none' }}>Privacy</a>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default CheckoutPage
