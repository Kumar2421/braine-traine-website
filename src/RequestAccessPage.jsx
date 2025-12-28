import './App.css'

import { useMemo, useState } from 'react'

import { supabase } from './supabaseClient'

function RequestAccessPage({ session, navigate }) {
    const user = session?.user

    const query = useMemo(() => new URLSearchParams(window.location.search || ''), [])
    const type = useMemo(() => query.get('type') || 'pro', [query])

    const [name, setName] = useState(user?.user_metadata?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [message, setMessage] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [ok, setOk] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setOk(false)

        const cleanEmail = email.trim()
        if (!cleanEmail) {
            setError('Email is required.')
            return
        }

        try {
            setIsLoading(true)
            const { error: insertErr } = await supabase.from('access_requests').insert({
                request_type: type,
                user_id: user?.id || null,
                name: name.trim() || null,
                email: cleanEmail,
                message: message.trim() || null,
            })

            if (insertErr) throw insertErr
            setOk(true)
            setMessage('')
        } catch (err) {
            setError(err?.message || 'Unable to submit request. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <section className="pricingHero">
                <div className="container pricingHero__inner">
                    <p className="pricingHero__kicker">Access request</p>
                    <h1 className="pricingHero__title">{type === 'enterprise' ? 'Contact Enterprise' : 'Request Pro Access'}</h1>
                    <p className="pricingHero__subtitle">
                        No payments yet. This sends a metadata-only request so we can coordinate access.
                    </p>
                </div>
            </section>

            <section className="pricingMain">
                <div className="container">
                    <div className="dashGrid">
                        <article className="dashCard">
                            <h2 className="dashCard__title">Details</h2>

                            <form className="requestForm" onSubmit={submit}>
                                <label className="loginLabel">
                                    Name (optional)
                                    <input
                                        className="loginInput"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Your name"
                                    />
                                </label>

                                <label className="loginLabel">
                                    Email
                                    <input
                                        className="loginInput"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        placeholder="name@company.com"
                                        required
                                    />
                                </label>

                                <label className="loginLabel">
                                    Message (optional)
                                    <textarea
                                        className="loginInput"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={isLoading}
                                        placeholder={
                                            type === 'enterprise'
                                                ? 'Air-gapped installs, offline licensing, security review, timelines…'
                                                : 'Team size, use-case, timeline…'
                                        }
                                        rows={4}
                                    />
                                </label>

                                {error && <div className="loginHint">{error}</div>}
                                {ok && <div className="loginHint">Request submitted. We’ll follow up via email.</div>}

                                <div className="dashActions">
                                    <button className="button button--primary" type="submit" disabled={isLoading}>
                                        {isLoading ? 'Sending…' : 'Send request'}
                                    </button>
                                    <a
                                        className="button button--outline"
                                        href="/pricing"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigate('/pricing')
                                        }}
                                    >
                                        Back to pricing
                                    </a>
                                </div>
                            </form>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">What gets stored</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">Stored</div>
                                    <div className="dashRow__value">Email, request type, optional message</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Not stored</div>
                                    <div className="dashRow__value">Datasets, files, models, training data</div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default RequestAccessPage
