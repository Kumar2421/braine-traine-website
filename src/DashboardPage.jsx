import './App.css'

function DashboardPage({ session, navigate }) {
    const user = session?.user
    const meta = user?.user_metadata || {}
    const name = [meta.first_name, meta.last_name].filter(Boolean).join(' ') || user?.email || 'Account'

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
