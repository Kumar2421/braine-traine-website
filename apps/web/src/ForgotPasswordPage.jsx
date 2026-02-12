import './App.css'

import { useMemo, useState } from 'react'

import { supabase } from './supabaseClient'
import { useToast } from './utils/toast.jsx'

function ForgotPasswordPage() {
    const toast = useToast()
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])

    const go = (nextPath) => {
        window.history.pushState({}, '', nextPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="loginShell">
            <div className="loginShell__left" aria-hidden="true">
                <div className="loginHero">
                    <h1 className="loginHero__headline">
                        Reset your <span className="loginHero__highlight">password</span>
                    </h1>
                    <p className="loginSubtitle" style={{ marginTop: 16, maxWidth: 420 }}>
                        Enter the email address you used to sign up. We’ll send you a secure link to set a new password.
                    </p>
                </div>
                <div className="loginArt" />
            </div>

            <div className="loginShell__right">
                <div className="loginPanel">
                    <div className="loginBrand">ML FORGE</div>
                    <h1 className="loginTitle">Forgot password</h1>
                    <p className="loginSubtitle">We’ll email you a reset link.</p>

                    <form
                        className="loginForm"
                        onSubmit={async (e) => {
                            e.preventDefault()
                            setSubmitted(true)
                            setError('')
                            setSuccess('')

                            if (!emailOk || isLoading) return

                            try {
                                setIsLoading(true)

                                const redirectTo = `${window.location.origin}/reset-password`

                                const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                                    redirectTo,
                                })

                                if (resetErr) throw resetErr

                                setSuccess('If an account exists for this email, a password reset link has been sent.')
                                toast.success('Check your email for the reset link')
                            } catch (err) {
                                const msg = err?.message || 'Unable to send reset email. Please try again.'
                                setError(msg)
                                toast.error(msg)
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

                        {error && <div className="loginHint">{error}</div>}
                        {success && <div className="loginHint loginHint--success">{success}</div>}

                        <button className="button button--primary loginSubmit" type="submit" disabled={!emailOk || isLoading}>
                            {isLoading ? 'Sending…' : 'Send reset link'}
                        </button>
                    </form>

                    <div className="loginRow loginRow--bottom">
                        <span className="loginMuted">Remembered your password?</span>
                        <a
                            className="loginLink"
                            href="/login"
                            onClick={(e) => {
                                e.preventDefault()
                                go('/login')
                            }}
                        >
                            Back to login
                        </a>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
