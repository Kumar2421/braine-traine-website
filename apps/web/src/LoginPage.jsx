import './App.css'

import { useEffect, useMemo, useRef, useState } from 'react'

import { supabase } from './supabaseClient'
import { useToast } from './utils/toast.jsx'
import { isAdmin } from './utils/adminAuth'

function LoginPage() {
    const toast = useToast()
    const query = useMemo(() => new URLSearchParams(window.location.search || ''), [])

    const ideMode = useMemo(() => query.get('ide') === '1', [query])
    const ideRedirect = useMemo(() => query.get('redirect') || '', [query])

    const nextPath = useMemo(() => {
        const next = query.get('next')
        return next || '/dashboard' // Default path, will be checked after login
    }, [query])

    const oauthRedirectTo = useMemo(() => {
        const base = `${window.location.origin}/login`
        const params = new URLSearchParams()
        if (query.get('next')) params.set('next', query.get('next'))
        if (query.get('ide')) params.set('ide', query.get('ide'))
        if (query.get('redirect')) params.set('redirect', query.get('redirect'))
        if (query.get('source')) params.set('source', query.get('source'))
        const qs = params.toString()
        return qs ? `${base}?${qs}` : base
    }, [query])

    const generateToken = () => {
        const bytes = new Uint8Array(24)
        crypto.getRandomValues(bytes)
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
    }

    const completeIdeHandshake = async () => {
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        const userId = userData?.user?.id
        if (!userId) throw new Error('Unable to resolve user id.')

        let licenseType = 'free'
        try {
            const { data: licenses, error: licErr } = await supabase
                .from('licenses')
                .select('license_type,issued_at,is_active,expires_at')
                .eq('user_id', userId)
                .order('issued_at', { ascending: false })
                .limit(1)

            if (licErr) throw licErr
            const lic = licenses?.[0]
            if (lic?.license_type) licenseType = lic.license_type
        } catch {
            licenseType = 'free'
        }

        const token = generateToken()
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

        const { error: insertErr } = await supabase.from('ide_auth_tokens').insert({
            token,
            user_id: userId,
            license_type: licenseType,
            expires_at: expiresAt,
        })

        if (insertErr) throw insertErr

        const redirectUrl = ideRedirect ? new URL(ideRedirect) : null
        if (!redirectUrl) {
            return { userId, licenseType, token }
        }

        redirectUrl.searchParams.set('user_id', userId)
        redirectUrl.searchParams.set('license_type', licenseType)
        redirectUrl.searchParams.set('token', token)
        window.location.href = redirectUrl.toString()
        return null
    }

    const go = (nextPath) => {
        window.history.pushState({}, '', nextPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [ideResult, setIdeResult] = useState(null)
    const [checkingAccount, setCheckingAccount] = useState(false)
    const [accountExists, setAccountExists] = useState(null)
    const vantaRef = useRef(null)
    const vantaEffect = useRef(null)

    // Initialize Vanta.js cells effect
    useEffect(() => {
        let mounted = true
        let timer = null
        let retryTimer = null

        const initVanta = async () => {
            try {
                if (!mounted || !vantaRef.current) return
                const vantaModule = await import('vanta/dist/vanta.cells.min.js')
                const THREE = await import('three')

                const VANTA = vantaModule.default || vantaModule

                if (vantaEffect.current) {
                    vantaEffect.current.destroy()
                    vantaEffect.current = null
                }

                if (!mounted || !vantaRef.current) return
                const vantaInstance = VANTA({
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
        timer = setTimeout(() => {
            if (!mounted) return
            if (vantaRef.current && vantaRef.current.offsetWidth > 0 && vantaRef.current.offsetHeight > 0) {
                initVanta()
            } else {
                // Retry if container not ready
                retryTimer = setTimeout(() => {
                    if (!mounted) return
                    initVanta()
                }, 200)
            }
        }, 100)

        return () => {
            mounted = false
            if (timer) clearTimeout(timer)
            if (retryTimer) clearTimeout(retryTimer)
            if (vantaEffect.current) {
                vantaEffect.current.destroy()
                vantaEffect.current = null
            }
        }
    }, [])

    const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
    const passwordOk = useMemo(() => password.trim().length >= 6, [password])
    const canSubmit = emailOk && passwordOk

    // Note: Account existence check will be done on login attempt
    // We can't use admin API from client side, so we'll check during sign-in

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
                    <h1 className="loginTitle">Log in</h1>
                    <p className="loginSubtitle">{ideMode ? 'Sign in to continue in the ML FORGE desktop app.' : 'Sign in to continue.'}</p>

                    <button
                        className="loginAccount"
                        type="button"
                        disabled={isLoading}
                        onClick={async () => {
                            setError('')
                            setSubmitted(false)
                            await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: { redirectTo: oauthRedirectTo },
                            })
                        }}
                    >
                        <div className="loginAccount__left">
                            <div className="loginAccount__avatar" aria-hidden="true" />
                            <div className="loginAccount__text">
                                <div className="loginAccount__name">Continue with Google</div>
                                <div className="loginAccount__email">Fastest way to sign in</div>
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
                            if (!canSubmit || isLoading) return

                            try {
                                setIsLoading(true)

                                // Verify password format
                                if (password.length < 6) {
                                    setError('Password must be at least 6 characters')
                                    toast.error('Password must be at least 6 characters')
                                    return
                                }

                                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                                    email: email.trim(),
                                    password,
                                })

                                if (signInError) {
                                    // Provide more specific error messages
                                    let errorMessage = signInError.message

                                    if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('Invalid')) {
                                        // Provide helpful message that covers both wrong password and OAuth-only accounts
                                        errorMessage = 'Invalid email or password. If you signed up with Google, please use "Continue with Google" to log in. Otherwise, check your credentials and try again, or use "Forgot Password" to reset.'
                                        setAccountExists(false)
                                    } else if (signInError.message.includes('Email not confirmed')) {
                                        errorMessage = 'Please verify your email address before logging in. Check your inbox for a verification email.'
                                    } else if (signInError.message.includes('User not found')) {
                                        errorMessage = 'No account found with this email. Please sign up first.'
                                        setAccountExists(false)
                                    } else if (signInError.message.includes('Too many requests') || signInError.message.includes('rate limit')) {
                                        errorMessage = 'Too many login attempts. Please wait a few minutes and try again.'
                                    } else if (signInError.message.includes('Network') || signInError.message.includes('fetch') || signInError.message.includes('Failed to fetch')) {
                                        errorMessage = 'Network error. Please check your internet connection and try again.'
                                    } else if (signInError.message.includes('Email rate limit')) {
                                        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.'
                                    }

                                    setError(errorMessage)
                                    toast.error(errorMessage)
                                    console.error('Login error details:', signInError)
                                    return
                                }

                                // Verify session was created
                                if (!signInData?.session) {
                                    setError('Login failed. Please try again.')
                                    toast.error('Login failed. Please try again.')
                                    return
                                }

                                toast.success('Successfully logged in!')

                                if (ideMode) {
                                    if (!ideRedirect) {
                                        const msg = 'Missing IDE redirect URL. Please restart sign-in from the IDE.'
                                        setError(msg)
                                        toast.error(msg)
                                        return
                                    }
                                    const result = await completeIdeHandshake()
                                    if (result) {
                                        setIdeResult(result)
                                        toast.success('IDE handshake completed successfully')
                                    }
                                    return
                                }

                                // Check if admin and redirect accordingly
                                // Only check if no explicit next path was provided
                                let redirectPath = nextPath
                                if (!query.get('next')) {
                                    try {
                                        const admin = await isAdmin()
                                        redirectPath = admin ? '/admin' : '/dashboard'
                                    } catch (e) {
                                        console.error('Error checking admin status:', e)
                                        redirectPath = '/dashboard'
                                    }
                                }

                                // Use full page redirect to ensure proper navigation
                                // This ensures App.jsx can properly handle the redirect
                                window.location.href = redirectPath
                            } catch (err) {
                                const errorMessage = err?.message || 'Unable to log in. Please try again.'
                                setError(errorMessage)
                                toast.error(errorMessage)
                            } finally {
                                setIsLoading(false)
                            }
                        }}
                    >
                        <label className="loginLabel">
                            Email
                            <input
                                className="loginInput"
                                type="email"
                                placeholder="name@company.com"
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
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </label>
                        {submitted && !passwordOk && <div className="loginHint">Password must be at least 6 characters.</div>}

                        {error && <div className="loginHint">{error}</div>}

                        <div className="loginRow" style={{ justifyContent: 'space-between' }}>
                            <span className="loginMuted" />
                            <a
                                className="loginLink"
                                href="/forgot-password"
                                onClick={(e) => {
                                    e.preventDefault()
                                    go('/forgot-password')
                                }}
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button className="button button--primary loginSubmit" type="submit" disabled={!canSubmit || isLoading}>
                            {isLoading ? 'Logging in…' : 'Log in'}
                        </button>
                    </form>

                    <div className="loginRow loginRow--bottom">
                        <span className="loginMuted">Don’t you have an account?</span>
                        <a
                            className="loginLink"
                            href="/signup"
                            onClick={(e) => {
                                e.preventDefault()
                                go('/signup')
                            }}
                        >
                            Sign up
                        </a>
                    </div>

                    {ideMode && ideResult && (
                        <div className="loginHint" style={{ marginTop: 10 }}>
                            IDE handshake ready. Provide this token to the IDE within 5 minutes.
                            <div style={{ marginTop: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                                user_id={ideResult.userId}
                                <br />
                                license_type={ideResult.licenseType}
                                <br />
                                token={ideResult.token}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default LoginPage
