import './App.css'

import { useMemo, useState } from 'react'

import { supabase } from './supabaseClient'

function LoginPage() {
    const nextPath = useMemo(() => {
        const next = new URLSearchParams(window.location.search || '').get('next')
        return next || '/dashboard'
    }, [])

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
                    <div className="loginBrand">FREEPIK</div>
                    <h1 className="loginTitle">Log in</h1>
                    <p className="loginSubtitle">Welcome back!</p>

                    <button
                        className="loginAccount"
                        type="button"
                        disabled={isLoading}
                        onClick={async () => {
                            setError('')
                            setSubmitted(false)
                            await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: { redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}` },
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
                                    return
                                }

                                go(nextPath)
                            } catch (err) {
                                setError(err?.message || 'Unable to log in. Please try again.')
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

                    <button className="loginCookies" type="button">Cookies Settings</button>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
