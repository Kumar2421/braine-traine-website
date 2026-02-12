import './App.css'

import { useMemo, useState, useEffect } from 'react'

import { supabase } from './supabaseClient'
import { useToast } from './utils/toast.jsx'

function ResetPasswordPage() {
    const toast = useToast()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [ready, setReady] = useState(false)

    const passwordLenOk = useMemo(() => password.trim().length >= 8 && password.trim().length <= 64, [password])
    const passwordComplexOk = useMemo(() => /[A-Za-z]/.test(password) && /\d/.test(password), [password])
    const passwordOk = passwordLenOk && passwordComplexOk
    const confirmOk = useMemo(() => confirmPassword === password && confirmPassword.length > 0, [confirmPassword, password])

    const go = (nextPath) => {
        window.history.pushState({}, '', nextPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        let mounted = true

        const init = async () => {
            try {
                const { data } = await supabase.auth.getSession()
                if (!mounted) return
                setReady(!!data?.session)
            } catch {
                if (!mounted) return
                setReady(false)
            }
        }

        init()

        return () => {
            mounted = false
        }
    }, [])

    return (
        <div className="loginShell">
            <div className="loginShell__left" aria-hidden="true">
                <div className="loginHero">
                    <h1 className="loginHero__headline">
                        Set a new <span className="loginHero__highlight">password</span>
                    </h1>
                    <p className="loginSubtitle" style={{ marginTop: 16, maxWidth: 420 }}>
                        Use a strong password you don’t use elsewhere.
                    </p>
                </div>
                <div className="loginArt" />
            </div>

            <div className="loginShell__right">
                <div className="loginPanel">
                    <div className="loginBrand">ML FORGE</div>
                    <h1 className="loginTitle">Reset password</h1>
                    <p className="loginSubtitle">Choose your new password below.</p>

                    {!ready ? (
                        <div className="loginHint" style={{ marginTop: 12 }}>
                            This reset link may be expired or already used. Please request a new link.
                            <div style={{ marginTop: 12 }}>
                                <a
                                    className="loginLink"
                                    href="/forgot-password"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        go('/forgot-password')
                                    }}
                                >
                                    Request a new reset link
                                </a>
                            </div>
                        </div>
                    ) : (
                        <form
                            className="loginForm"
                            onSubmit={async (e) => {
                                e.preventDefault()
                                setSubmitted(true)
                                setError('')

                                if (!passwordOk || !confirmOk || isLoading) return

                                try {
                                    setIsLoading(true)
                                    const { error: updateErr } = await supabase.auth.updateUser({
                                        password,
                                    })

                                    if (updateErr) throw updateErr

                                    toast.success('Password updated')
                                    go('/login')
                                } catch (err) {
                                    const msg = err?.message || 'Unable to update password. Please try again.'
                                    setError(msg)
                                    toast.error(msg)
                                } finally {
                                    setIsLoading(false)
                                }
                            }}
                        >
                            <label className="loginLabel">
                                New password
                                <input
                                    className="loginInput"
                                    type="password"
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </label>
                            {submitted && !passwordOk && (
                                <div className="loginHint">Password must be 8–64 characters and include at least 1 letter and 1 number.</div>
                            )}

                            <label className="loginLabel">
                                Confirm new password
                                <input
                                    className="loginInput"
                                    type="password"
                                    placeholder="Repeat new password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </label>
                            {submitted && !confirmOk && <div className="loginHint">Passwords must match.</div>}

                            {error && <div className="loginHint">{error}</div>}

                            <button className="button button--primary loginSubmit" type="submit" disabled={!passwordOk || !confirmOk || isLoading}>
                                {isLoading ? 'Updating…' : 'Update password'}
                            </button>
                        </form>
                    )}

                    <div className="loginRow loginRow--bottom">
                        <span className="loginMuted">Back to</span>
                        <a
                            className="loginLink"
                            href="/login"
                            onClick={(e) => {
                                e.preventDefault()
                                go('/login')
                            }}
                        >
                            login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
