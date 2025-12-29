import './App.css'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from './supabaseClient'
import { useToast } from './utils/toast.jsx'

function LoginPage() {
    const toast = useToast()
    const query = useMemo(() => new URLSearchParams(window.location.search || ''), [])

    const source = useMemo(() => query.get('source') || '', [query])
    const ideDeepLinkMode = useMemo(() => source === 'ide', [source])

    const ideMode = useMemo(() => query.get('ide') === '1', [query])
    const ideRedirect = useMemo(() => query.get('redirect') || '', [query])

    const nextPath = useMemo(() => {
        const next = query.get('next')
        return next || '/dashboard'
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

    const createExchangeToken = async () => {
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        const userId = userData?.user?.id
        if (!userId) throw new Error('Unable to resolve user id.')

        const token = `bt_ex_${generateToken()}`
        const expiresAt = new Date(Date.now() + 60 * 1000).toISOString()

        const { error: insertErr } = await supabase.from('auth_exchanges').insert({
            token,
            user_id: userId,
            expires_at: expiresAt,
            used: false,
        })

        if (insertErr) throw insertErr

        return token
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
    const [exchangeToken, setExchangeToken] = useState('')

    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!ideDeepLinkMode) return
            if (isLoading) return
            if (exchangeToken) return

            const { data } = await supabase.auth.getSession()
            if (!data?.session) return
            if (!mounted) return

            try {
                setIsLoading(true)
                const token = await createExchangeToken()
                if (!mounted) return
                setExchangeToken(token)
                go(`/auth-redirect?token=${encodeURIComponent(token)}`)
            } catch (e) {
                if (!mounted) return
                setError(e?.message || 'Unable to create IDE exchange token.')
            } finally {
                if (!mounted) return
                setIsLoading(false)
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [ideDeepLinkMode, exchangeToken])

    const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
    const passwordOk = useMemo(() => password.trim().length >= 6, [password])
    const canSubmit = emailOk && passwordOk

    return (
        <div className="loginShell">
            <div className="loginShell__left" aria-hidden="true">
                <div className="loginArt">
                    <div className="loginArt__step loginArt__step--1" />
                    <div className="loginArt__step loginArt__step--2" />
                    <div className="loginArt__step loginArt__step--3" />
                    <div className="loginArt__wall loginArt__wall--a" />
                    <div className="loginArt__wall loginArt__wall--b" />
                    <div className="loginArt__person" />
                </div>
                <div className="loginArt__caption">Image generated with Freepik Pikasoa</div>
            </div>

            <div className="loginShell__right">
                <div className="loginPanel">
                    <div className="loginBrand">BrainTrain</div>
                    <h1 className="loginTitle">Log in</h1>
                    <p className="loginSubtitle">{ideDeepLinkMode ? 'Complete sign-in to open the BrainTrain IDE.' : 'Welcome back!'}</p>

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
                            if (!canSubmit || isLoading) return

                            try {
                                setIsLoading(true)
                                const { error: signInError } = await supabase.auth.signInWithPassword({
                                    email: email.trim(),
                                    password,
                                })
                                if (signInError) {
                                    setError(signInError.message)
                                    toast.error(signInError.message)
                                    return
                                }

                                toast.success('Successfully logged in!')

                                if (ideDeepLinkMode) {
                                    const token = await createExchangeToken()
                                    setExchangeToken(token)
                                    go(`/auth-redirect?token=${encodeURIComponent(token)}`)
                                    return
                                }

                                if (ideMode) {
                                    const result = await completeIdeHandshake()
                                    if (result) {
                                        setIdeResult(result)
                                        toast.success('IDE handshake completed successfully')
                                    }
                                    return
                                }

                                go(nextPath)
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

                    <button className="loginCookies" type="button">Cookies Settings</button>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
