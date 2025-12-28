import './App.css'

import { useMemo, useState } from 'react'

import { supabase } from './supabaseClient'

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
                <div className="loginArt__caption">Image generated with Freepik Pikaso</div>
            </div>

            <div className="loginShell__right">
                <div className="loginPanel">
                    <div className="loginBrand">FREEPIK</div>
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

                                        const { data, error: verifyError } = await supabase.auth.verifyOtp({
                                            email: email.trim(),
                                            token: otp.trim(),
                                            type: 'email',
                                        })

                                        if (verifyError) {
                                            setError(verifyError.message)
                                            return
                                        }

                                        if (!data?.session) {
                                            setError('Verification succeeded but no session was created. Please try again.')
                                            return
                                        }

                                        const { error: updateError } = await supabase.auth.updateUser({
                                            password,
                                            data: { first_name: firstName.trim(), last_name: lastName.trim() },
                                        })
                                        if (updateError) {
                                            setError(updateError.message)
                                            return
                                        }

                                        go('/')
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
                                {error && <div className="loginHint">{error}</div>}

                                <button className="button button--primary loginSubmit" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Verifying…' : 'Verify & Create account'}
                                </button>

                                <button
                                    className="button button--ghost loginSubmit"
                                    type="button"
                                    disabled={isLoading}
                                    onClick={async () => {
                                        setError('')
                                        try {
                                            setIsLoading(true)
                                            const { error: otpError } = await supabase.auth.signInWithOtp({
                                                email: email.trim(),
                                                options: { shouldCreateUser: true },
                                            })
                                            if (otpError) {
                                                setError(otpError.message)
                                                return
                                            }
                                            setSuccess('OTP resent.')
                                        } catch (err) {
                                            setError(err?.message || 'Unable to resend OTP.')
                                        } finally {
                                            setIsLoading(false)
                                        }
                                    }}
                                >
                                    Resend code
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
                                        const { error: otpError } = await supabase.auth.signInWithOtp({
                                            email: email.trim(),
                                            options: { shouldCreateUser: true },
                                        })

                                        if (otpError) {
                                            setError(otpError.message)
                                            return
                                        }

                                        setSuccess('We sent an OTP to your email. Enter it to finish creating your account.')
                                        setStep('otp')
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
                                <div className="loginHint">Between 8 and 64 characters</div>
                                <div className="loginHint">At least 1 letter and 1 number</div>

                                {submitted && !passwordOk && <div className="loginHint">Please meet the password requirements above.</div>}

                                {error && <div className="loginHint">{error}</div>}
                                {success && <div className="loginHint">{success}</div>}

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

                    <button className="loginCookies" type="button">Cookies Settings</button>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
