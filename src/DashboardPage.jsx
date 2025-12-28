import './App.css'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from './supabaseClient'

function DashboardPage({ session, navigate }) {
    const user = session?.user
    const meta = user?.user_metadata || {}
    const name = [meta.first_name, meta.last_name].filter(Boolean).join(' ') || user?.email || 'Account'

    const userId = user?.id
    const [license, setLicense] = useState(null)
    const [licenseError, setLicenseError] = useState('')

    const licenseStatus = useMemo(() => {
        if (!license) return 'Unknown'
        if (!license.is_active) return 'Inactive'
        if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) return 'Expired'
        return 'Active'
    }, [license])

    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLicenseError('')

            try {
                const { data, error } = await supabase
                    .from('licenses')
                    .select('license_type,is_active,expires_at,issued_at')
                    .eq('user_id', userId)
                    .order('issued_at', { ascending: false })
                    .limit(1)

                if (error) throw error
                if (!mounted) return
                setLicense(data?.[0] || null)
            } catch (e) {
                if (!mounted) return
                setLicenseError(e?.message || 'Unable to load license.')
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
                    <p className="dashHero__kicker">Workspace</p>
                    <h1 className="dashHero__title">{name}</h1>
                    <p className="dashHero__subtitle">Metadata-only dashboard. No datasets, images, or models are uploaded.</p>
                </div>
            </section>

            <section className="dashSection">
                <div className="container">
                    <div className="dashGrid">
                        <article className="dashCard">
                            <h2 className="dashCard__title">Overview</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">License tier</div>
                                    <div className="dashRow__value">Free</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">IDE version</div>
                                    <div className="dashRow__value">Not reported</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Last IDE activity</div>
                                    <div className="dashRow__value">Not reported</div>
                                </div>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">License</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">Tier</div>
                                    <div className="dashRow__value">{license?.license_type || 'free'}</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Status</div>
                                    <div className="dashRow__value">{licenseError ? 'Unavailable' : licenseStatus}</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Last sync</div>
                                    <div className="dashRow__value">Not reported</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Hint</div>
                                    <div className="dashRow__value">Manage activation inside the IDE.</div>
                                </div>
                            </div>

                            <div className="dashActions">
                                <a
                                    className="button button--outline"
                                    href="/dashboard/license"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/dashboard/license')
                                    }}
                                >
                                    View license details
                                </a>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Projects (metadata only)</h2>
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Project</div>
                                    <div>Task</div>
                                    <div>Datasets</div>
                                    <div>Last trained</div>
                                    <div>Status</div>
                                </div>
                                <div className="dashTable__row dashTable__row--empty">
                                    <div className="dashMuted">No projects yet.</div>
                                    <div />
                                    <div />
                                    <div />
                                    <div />
                                </div>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Downloads</h2>
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Version</div>
                                    <div>OS</div>
                                    <div>Status</div>
                                </div>
                                <div className="dashTable__row dashTable__row--empty">
                                    <div className="dashMuted">No downloads recorded yet.</div>
                                    <div />
                                    <div />
                                </div>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Exports (metadata)</h2>
                            <div className="dashTable">
                                <div className="dashTable__head">
                                    <div>Model</div>
                                    <div>Format</div>
                                    <div>Date</div>
                                    <div>Project</div>
                                </div>
                                <div className="dashTable__row dashTable__row--empty">
                                    <div className="dashMuted">No exports recorded yet.</div>
                                    <div />
                                    <div />
                                    <div />
                                </div>
                            </div>
                        </article>
                    </div>

                    <div className="dashActions">
                        <a
                            className="button button--primary"
                            href="/download"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/download')
                            }}
                        >
                            Go to Download Hub
                        </a>
                        <a
                            className="button button--outline"
                            href="/docs"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/docs')
                            }}
                        >
                            View Docs
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}

export default DashboardPage
