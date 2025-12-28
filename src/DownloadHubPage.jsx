import './App.css'

function DownloadHubPage({ navigate }) {
    return (
        <>
            <section className="downloadHero">
                <div className="container downloadHero__inner">
                    <h1 className="downloadHero__title">Download BrainTrain</h1>
                    <p className="downloadHero__subtitle">
                        Local-first installers. Offline capable. No dataset uploads.
                    </p>
                </div>
            </section>

            <section className="downloadMain">
                <div className="container">
                    <div className="downloadTabs" role="tablist" aria-label="Operating system">
                        <button className="downloadTab downloadTab--active" type="button" role="tab" aria-selected="true">
                            Windows
                        </button>
                        <button className="downloadTab" type="button" role="tab" aria-selected="false" disabled>
                            macOS
                        </button>
                        <button className="downloadTab" type="button" role="tab" aria-selected="false" disabled>
                            Linux
                        </button>
                    </div>

                    <div className="downloadHubGrid">
                        <article className="downloadHubCard">
                            <div className="downloadHubCard__top">
                                <div>
                                    <div className="downloadHubCard__kicker">Windows</div>
                                    <div className="downloadHubCard__title">BrainTrain IDE</div>
                                    <div className="downloadHubCard__meta">Version 0.1.0 (placeholder)</div>
                                </div>
                                <a className="button button--primary" href="#" onClick={(e) => e.preventDefault()}>
                                    Download .exe
                                </a>
                            </div>
                            <div className="downloadHubCard__body">
                                <div className="downloadHubRow">
                                    <div className="downloadHubRow__label">Checksum</div>
                                    <div className="downloadHubRow__value">SHA256: (coming soon)</div>
                                </div>
                                <div className="downloadHubRow">
                                    <div className="downloadHubRow__label">Requirements</div>
                                    <div className="downloadHubRow__value">Windows 10/11, 8GB RAM, GPU optional</div>
                                </div>
                            </div>
                        </article>

                        <article className="downloadHubCard">
                            <div className="downloadHubCard__kicker">Version history</div>
                            <div className="downloadHubList">
                                <div className="downloadHubList__item">
                                    <div className="downloadHubList__title">0.1.0</div>
                                    <div className="downloadHubList__meta">Initial public build (placeholder)</div>
                                </div>
                                <div className="downloadHubList__item">
                                    <div className="downloadHubList__title">0.0.x</div>
                                    <div className="downloadHubList__meta">Internal previews</div>
                                </div>
                            </div>
                            <a
                                className="button button--outline"
                                href="/docs"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs')
                                }}
                            >
                                Read release notes
                            </a>
                        </article>

                        <article className="downloadHubCard">
                            <div className="downloadHubCard__kicker">GPU compatibility</div>
                            <div className="downloadHubTable">
                                <div className="downloadHubTable__head">
                                    <div>Vendor</div>
                                    <div>Status</div>
                                    <div>Notes</div>
                                </div>
                                <div className="downloadHubTable__row">
                                    <div>NVIDIA</div>
                                    <div>Supported</div>
                                    <div>Recommended for training speed</div>
                                </div>
                                <div className="downloadHubTable__row">
                                    <div>AMD</div>
                                    <div>Experimental</div>
                                    <div>Depends on ROCm / driver stack</div>
                                </div>
                                <div className="downloadHubTable__row">
                                    <div>CPU</div>
                                    <div>Supported</div>
                                    <div>Slower training, fully offline</div>
                                </div>
                            </div>
                        </article>

                        <article className="downloadHubCard downloadHubCard--cta">
                            <div>
                                <div className="downloadHubCard__kicker">Enterprise</div>
                                <div className="downloadHubCard__title">Need offline licensing or air-gapped installs?</div>
                                <div className="downloadHubCard__meta">Request access for regulated deployments.</div>
                            </div>
                            <a
                                className="button button--primary"
                                href="/pricing"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/pricing')
                                }}
                            >
                                View pricing
                            </a>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default DownloadHubPage
