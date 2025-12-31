import './App.css'

import { useEffect, useMemo, useRef, useState } from 'react'

import { supabase } from './supabaseClient'
import { sendOTP, verifyOTP } from './utils/emailApi'

function SignupPage() {
    const go = (nextPath) => {
        window.history.pushState({}, '', nextPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const [step, setStep] = useState('form')

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [otpResendCooldown, setOtpResendCooldown] = useState(0)
    const [accountExists, setAccountExists] = useState(null)

    const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
    const passwordLenOk = useMemo(() => {
        const len = password.length
        return len >= 8 && len <= 64
    }, [password])

    const passwordComplexOk = useMemo(() => {
        const hasLetter = /[A-Za-z]/.test(password)
        const hasNumber = /\d/.test(password)
        return hasLetter && hasNumber
    }, [password])

    const passwordOk = passwordLenOk && passwordComplexOk
    const confirmOk = useMemo(() => confirmPassword === password && confirmPassword.length > 0, [confirmPassword, password])
    const nameOk = useMemo(() => firstName.trim().length > 0 && lastName.trim().length > 0, [firstName, lastName])

    const canSubmit = emailOk && nameOk && passwordOk && confirmOk

    const vantaRef = useRef(null)
    const vantaEffect = useRef(null)

    // Initialize Vanta.js cells effect
    useEffect(() => {
        if (!vantaRef.current) return

        let vantaInstance = null

        const initVanta = async () => {
            try {
                const vantaModule = await import('vanta/dist/vanta.cells.min.js')
                const THREE = await import('three')

                const VANTA = vantaModule.default || vantaModule

                if (vantaEffect.current) {
                    vantaEffect.current.destroy()
                }

                vantaInstance = VANTA({
                    el: vantaRef.current,
                    THREE: THREE.default || THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    color1: 0x517915,
                    color2: 0x84f7a8,
                    size: 1.30,
                    speed: 1.20,
                    backgroundColor: 0x0a0c0d
                })

                vantaEffect.current = vantaInstance
            } catch (error) {
                console.error('Error initializing Vanta.js:', error)
            }
        }

        // Small delay to ensure DOM is ready and container has dimensions
        const timer = setTimeout(() => {
            if (vantaRef.current && vantaRef.current.offsetWidth > 0 && vantaRef.current.offsetHeight > 0) {
                initVanta()
            } else {
                // Retry if container not ready
                setTimeout(() => initVanta(), 200)
            }
        }, 100)

        return () => {
            clearTimeout(timer)
            if (vantaEffect.current) {
                vantaEffect.current.destroy()
                vantaEffect.current = null
            }
        }
    }, [])

    return (
        <div className="loginShell">
            <div className="loginShell__left" aria-hidden="true">
                <div className="loginHero">
                    <h1 className="loginHero__headline">
                        The end-to-end IDE for{' '}
                        <span className="loginHero__highlight">Vision AI</span>
                    </h1>
                    <div className="loginHero__pipeline">
                        <div className="loginHero__pipelineLine" />
                        <div className="loginHero__pipelineNodes">
                            <span className="loginHero__pipelineNode" />
                            <span className="loginHero__pipelineNode" />
                            <span className="loginHero__pipelineNode" />
                            <span className="loginHero__pipelineNode" />
                            <span className="loginHero__pipelineNode" />
                        </div>
                    </div>
                </div>
                <div ref={vantaRef} className="loginArt loginArt--vanta" />
            </div>

            <div className="loginShell__right">
                <div className="loginPanel">
                    <div className="loginBrand">ML FORGE</div>
                    {step === 'otp' ? (
                        <>
                            <h1 className="loginTitle">Verify your email</h1>
                            <p className="loginSubtitle">Enter the code sent to {email.trim() || 'your email'}.</p>

                            <form
                                className="loginForm"
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    setSubmitted(true)
                                    setError('')
                                    if (isLoading) return
                                    if (!otp.trim()) return

                                    try {
                                        setIsLoading(true)

                                        // Verify OTP using custom email API
                                        const verifyResult = await verifyOTP(email.trim(), otp.trim())

                                        if (!verifyResult.success) {
                                            // Show user-friendly message for existing account
                                            if (verifyResult.requiresLogin) {
                                                setError('An account with this email already exists. Please log in to continue.')
                                            } else {
                                                setError(verifyResult.error || 'Failed to verify OTP')
                                            }
                                            return
                                        }

                                        // Handle case where account was created but session couldn't be created
                                        if (verifyResult.requiresPasswordLogin) {
                                            setSuccess(verifyResult.message || 'Account created successfully! Redirecting to login...')
                                            setTimeout(() => {
                                                go('/login')
                                            }, 2000)
                                            return
                                        }

                                        if (!verifyResult.session && !verifyResult.requiresLogin) {
                                            setError('Verification succeeded but no session was created. Please try again.')
                                            return
                                        }

                                        // If account already exists, show message (handled above)
                                        if (verifyResult.requiresLogin) {
                                            return
                                        }

                                        // Update user metadata if needed
                                        if (firstName.trim() || lastName.trim()) {
                                            const { error: updateError } = await supabase.auth.updateUser({
                                                data: {
                                                    first_name: firstName.trim(),
                                                    last_name: lastName.trim()
                                                },
                                            })
                                            if (updateError) {
                                                console.error('Error updating user metadata:', updateError)
                                                // Don't fail the signup if metadata update fails
                                            }
                                        }

                                        // Check if admin and redirect accordingly
                                        const { data: { user } } = await supabase.auth.getUser()
                                        const isAdmin = user?.user_metadata?.is_admin === true
                                        const redirectPath = isAdmin ? '/admin' : '/dashboard'

                                        window.location.href = redirectPath
                                    } catch (err) {
                                        setError(err?.message || 'Unable to verify code. Please try again.')
                                    } finally {
                                        setIsLoading(false)
                                    }
                                }}
                            >
                                <label className="loginLabel">
                                    OTP code
                                    <input
                                        className="loginInput"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </label>

                                {submitted && !otp.trim() && <div className="loginHint">Enter the code from your email.</div>}
                                {error && (
                                    <div className={`loginHint ${error.includes('already exists') || error.includes('already registered') ? 'loginHint--warning' : 'loginHint--error'}`}>
                                        {error}
                                        {(error.includes('already exists') || error.includes('already registered') || error.includes('Please log in')) && (
                                            <div style={{ marginTop: '12px' }}>
                                                <a
                                                    href="/login"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        go('/login')
                                                    }}
                                                    style={{
                                                        color: '#3b82f6',
                                                        textDecoration: 'underline',
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Go to Login →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button className="button button--primary loginSubmit" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Verifying…' : 'Verify & Create account'}
                                </button>

                                <button
                                    className="button button--ghost loginSubmit"
                                    type="button"
                                    disabled={isLoading || otpResendCooldown > 0}
                                    onClick={async () => {
                                        setError('')
                                        setSuccess('')
                                        try {
                                            setIsLoading(true)

                                            // Resend OTP using custom email API
                                            const sendResult = await sendOTP(
                                                email.trim(),
                                                firstName.trim(),
                                                lastName.trim(),
                                                password
                                            )

                                            if (!sendResult.success) {
                                                setError(sendResult.error || 'Failed to resend OTP')
                                                return
                                            }

                                            setSuccess('OTP resent. Check your email.')
                                            setOtpResendCooldown(60) // 60 second cooldown

                                            // Countdown timer
                                            const interval = setInterval(() => {
                                                setOtpResendCooldown((prev) => {
                                                    if (prev <= 1) {
                                                        clearInterval(interval)
                                                        return 0
                                                    }
                                                    return prev - 1
                                                })
                                            }, 1000)
                                        } catch (err) {
                                            setError(err?.message || 'Unable to resend OTP.')
                                        } finally {
                                            setIsLoading(false)
                                        }
                                    }}
                                >
                                    {otpResendCooldown > 0 ? `Resend code (${otpResendCooldown}s)` : 'Resend code'}
                                </button>

                                {success && <div className="loginHint">{success}</div>}
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="loginTitle">Let&apos;s create your account</h1>
                            <p className="loginSubtitle">Email</p>

                            <button
                                className="loginAccount"
                                type="button"
                                disabled={isLoading}
                                onClick={async () => {
                                    setError('')
                                    setSuccess('')
                                    await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: { redirectTo: window.location.origin },
                                    })
                                }}
                            >
                                <div className="loginAccount__left">
                                    <div className="loginAccount__avatar" aria-hidden="true" />
                                    <div className="loginAccount__text">
                                        <div className="loginAccount__name">Continue with Google</div>
                                        <div className="loginAccount__email">Use a Google account</div>
                                    </div>
                                </div>
                                <span className="loginAccount__google" aria-hidden="true">
                                    <svg viewBox="0 0 48 48" width="18" height="18" focusable="false" aria-hidden="true">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.2 3.6l6.9-6.9C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l8 6.2C12.6 13.1 17.9 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.14-2.8-.46-4.1H24v7.7h12.6c-.26 2-1.67 5-4.8 7l7.4 5.7c4.4-4.1 6.9-10.1 6.9-17.3z" />
                                        <path fill="#FBBC05" d="M10.6 28.7c-.54-1.6-.86-3.3-.86-5.2s.32-3.6.84-5.2l-8-6.2C.9 15.6 0 19.7 0 23.5c0 3.8.9 7.9 2.6 11.4l8-6.2z" />
                                        <path fill="#34A853" d="M24 48c6.4 0 11.8-2.1 15.7-5.7l-7.4-5.7c-2 1.4-4.7 2.4-8.3 2.4-6.1 0-11.4-3.6-13.5-9l-8 6.2C6.5 42.6 14.6 48 24 48z" />
                                    </svg>
                                </span>
                            </button>

                            <form
                                className="loginForm"
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    setSubmitted(true)
                                    setError('')
                                    setSuccess('')
                                    if (!canSubmit || isLoading) return

                                    try {
                                        setIsLoading(true)

                                        // Check if account already exists
                                        // We'll check this during OTP send, but also try a password reset to verify
                                        try {
                                            // Try password reset - if user exists, this will succeed
                                            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                                                redirectTo: window.location.origin + '/login'
                                            })

                                            // If no error, user exists (password reset email sent)
                                            if (!resetError) {
                                                setError('An account with this email already exists. Please log in instead. If you forgot your password, check your email for a reset link.')
                                                return
                                            }
                                        } catch (e) {
                                            // User likely doesn't exist, continue with signup
                                            // The error is expected if user doesn't exist
                                        }

                                        // Send OTP using custom email API
                                        // Password is sent securely to Edge Function, which handles hashing via Supabase Auth
                                        const sendResult = await sendOTP(
                                            email.trim(),
                                            firstName.trim(),
                                            lastName.trim(),
                                            password
                                        )

                                        if (!sendResult.success) {
                                            setError(sendResult.error || 'Failed to send OTP')
                                            return
                                        }

                                        setSuccess('We sent an OTP to your email. Enter it to finish creating your account.')
                                        setStep('otp')
                                        setOtpResendCooldown(60) // Start cooldown timer

                                        // Countdown timer for resend
                                        const interval = setInterval(() => {
                                            setOtpResendCooldown((prev) => {
                                                if (prev <= 1) {
                                                    clearInterval(interval)
                                                    return 0
                                                }
                                                return prev - 1
                                            })
                                        }, 1000)
                                    } catch (err) {
                                        setError(err?.message || 'Unable to create account. Please try again.')
                                    } finally {
                                        setIsLoading(false)
                                    }
                                }}
                            >
                                <label className="loginLabel">
                                    First name
                                    <input
                                        className="loginInput"
                                        type="text"
                                        placeholder="First name"
                                        autoComplete="given-name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </label>
                                {submitted && !firstName.trim() && <div className="loginHint">Enter your first name.</div>}

                                <label className="loginLabel">
                                    Last name
                                    <input
                                        className="loginInput"
                                        type="text"
                                        placeholder="Last name"
                                        autoComplete="family-name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </label>
                                {submitted && !lastName.trim() && <div className="loginHint">Enter your last name.</div>}

                                <label className="loginLabel">
                                    Email
                                    <input
                                        className="loginInput"
                                        type="email"
                                        placeholder="@ehost.cam"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </label>
                                {submitted && !emailOk && <div className="loginHint">Enter a valid email address.</div>}

                                <label className="loginLabel">
                                    Password
                                    <input
                                        className="loginInput"
                                        type="password"
                                        placeholder="Create password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </label>

                                <label className="loginLabel">
                                    Password confirmation
                                    <input
                                        className="loginInput"
                                        type="password"
                                        placeholder="Confirm password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </label>
                                {submitted && !confirmOk && <div className="loginHint">Passwords must match.</div>}

                                <div className="loginHint" style={{ marginTop: 10 }}>
                                    Your password must contain:
                                </div>
                                <div className="loginHint">Between 8 and 64 characters , At least 1 letter and 1 number</div>


                                {submitted && !passwordOk && <div className="loginHint">Please meet the password requirements above.</div>}

                                {error && (
                                    <div className={`loginHint ${error.includes('already exists') || error.includes('already registered') ? 'loginHint--warning' : 'loginHint--error'}`}>
                                        {error}
                                        {(error.includes('already exists') || error.includes('already registered') || error.includes('Please log in')) && (
                                            <div style={{ marginTop: '12px' }}>
                                                <a
                                                    href="/login"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        go('/login')
                                                    }}
                                                    style={{
                                                        color: '#3b82f6',
                                                        textDecoration: 'underline',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    Go to Login →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {success && <div className="loginHint loginHint--success">{success}</div>}

                                <div className="loginHint" style={{ marginTop: 12 }}>
                                    By signing up you agree to the terms and services and the privacy policy.
                                </div>

                                <button className="button button--primary loginSubmit" type="submit" disabled={!canSubmit || isLoading}>
                                    {isLoading ? 'Sending OTP…' : 'Continue'}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="loginRow loginRow--bottom">
                        <span className="loginMuted">Already have an account?</span>
                        <a
                            className="loginLink"
                            href="/login"
                            onClick={(e) => {
                                e.preventDefault()
                                go('/login')
                            }}
                        >
                            Log in
                        </a>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default SignupPage
