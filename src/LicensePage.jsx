import './App.css'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from './supabaseClient'

function LicensePage({ session, navigate }) {
    const userId = session?.user?.id

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [license, setLicense] = useState(null)

    const status = useMemo(() => {
        if (!license) return 'Unknown'
        if (!license.is_active) return 'Inactive'
        if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) return 'Expired'
        return 'Active'
    }, [license])

    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setIsLoading(true)
            setError('')

            try {
                const { data, error: qErr } = await supabase
                    .from('licenses')
                    .select('license_id,user_id,license_type,issued_at,expires_at,offline_signature,is_active')
                    .eq('user_id', userId)
                    .order('issued_at', { ascending: false })
                    .limit(1)

                if (qErr) throw qErr
                if (!mounted) return

                setLicense(data?.[0] || null)
            } catch (e) {
                if (!mounted) return
                setError(e?.message || 'Unable to load license metadata.')
            } finally {
                if (!mounted) return
                setIsLoading(false)
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId])

    return (
        <>
            <section className="dashHero">
                <div className="container dashHero__inner">
                    <p className="dashHero__kicker">Account</p>
                    <h1 className="dashHero__title">License</h1>
                    <p className="dashHero__subtitle">Control-plane license metadata used by the BrainTrain IDE for offline activation.</p>
                </div>
            </section>

            <section className="dashSection">
                <div className="container">
                    <div className="dashGrid">
                        <article className="dashCard">
                            <h2 className="dashCard__title">Current tier</h2>
                            {isLoading ? (
                                <div className="dashMuted" style={{ marginTop: 10 }}>Loading…</div>
                            ) : error ? (
                                <div className="dashMuted" style={{ marginTop: 10 }}>{error}</div>
                            ) : (
                                <div className="dashRows">
                                    <div className="dashRow">
                                        <div className="dashRow__label">Tier</div>
                                        <div className="dashRow__value">{license?.license_type || 'free'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Status</div>
                                        <div className="dashRow__value">{status}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Expires</div>
                                        <div className="dashRow__value">{license?.expires_at ? new Date(license.expires_at).toLocaleString() : 'No expiry'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Offline activation</div>
                                        <div className="dashRow__value">{license?.offline_signature ? 'Signature present' : 'Not provisioned'}</div>
                                    </div>
                                    <div className="dashRow">
                                        <div className="dashRow__label">Bound devices</div>
                                        <div className="dashRow__value">0 (future)</div>
                                    </div>
                                </div>
                            )}
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Upgrade</h2>
                            <div className="dashMuted" style={{ marginTop: 10 }}>
                                Payments are not enabled on the website. Use these hooks to request access.
                            </div>
                            <div className="dashActions">
                                <button
                                    className="button button--primary"
                                    type="button"
                                    onClick={() => {
                                        navigate('/request-access?type=pro')
                                    }}
                                >
                                    Request Pro Access
                                </button>
                                <button
                                    className="button button--outline"
                                    type="button"
                                    onClick={() => {
                                        navigate('/request-access?type=enterprise')
                                    }}
                                >
                                    Contact Enterprise
                                </button>
                            </div>
                        </article>
                    </div>

                    <div className="dashActions" style={{ marginTop: 14 }}>
                        <a
                            className="button button--outline"
                            href="/dashboard"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/dashboard')
                            }}
                        >
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LicensePage
