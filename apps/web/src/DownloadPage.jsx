import './App.css'

function DownloadPage() {
    return (
        <>
            <section className="downloadHero">
                <div className="container downloadHero__inner">
                    <p className="downloadHero__kicker">Downloads</p>
                    <h1 className="downloadHero__title">Desktop app</h1>
                    <p className="downloadHero__subtitle">
                        Download installers for Windows, macOS, and Linux. Choose the build that matches your OS and CPU.
                    </p>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">What you get</h2>
                        <p className="sectionHeader__subtitle">A local-first Vision AI workflow you can trust: deterministic runs, traceable exports, and no cloud runtime dependency.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Local-first execution</div>
                            <p className="unifyCard__body">Training and evaluation run on your machines. Your datasets stay with you—offline by design.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Deterministic artifacts</div>
                            <p className="unifyCard__body">Configs, dataset versions, metrics, and exports are tied together so results can be reproduced and reviewed.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Audit-ready exports</div>
                            <p className="unifyCard__body">Export bundles include the evidence you need: run identifiers, logs, metrics, and checksums.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="downloadSection">
                <div className="container">
                    <div className="osGrid">
                        <article className="osCard">
                            <div className="osCard__top">
                                <div className="osIcon osIcon--windows" aria-hidden="true" />
                                <div>
                                    <div className="osCard__kicker">Windows</div>
                                    <h3 className="osCard__title">Windows 10/11</h3>
                                </div>
                            </div>
                            <p className="osCard__body">Recommended: 64-bit installer.</p>
                            <div className="osCard__actions">
                                <a className="button button--primary" href="#">Download .exe</a>
                                <a className="button button--outline" href="#">Download .msi</a>
                            </div>
                            <div className="osCard__links">
                                <a className="osLink" href="#">Checksums</a>
                                <a className="osLink" href="#">Release notes</a>
                                <a className="osLink" href="#">Install help</a>
                            </div>
                        </article>

                        <article className="osCard">
                            <div className="osCard__top">
                                <div className="osIcon osIcon--mac" aria-hidden="true" />
                                <div>
                                    <div className="osCard__kicker">macOS</div>
                                    <h3 className="osCard__title">Apple Silicon / Intel</h3>
                                </div>
                            </div>
                            <p className="osCard__body">Choose the build for your CPU architecture.</p>
                            <div className="osCard__actions">
                                <a className="button button--primary" href="#">Download (Apple Silicon)</a>
                                <a className="button button--outline" href="#">Download (Intel)</a>
                            </div>
                            <div className="osCard__links">
                                <a className="osLink" href="#">Checksums</a>
                                <a className="osLink" href="#">Release notes</a>
                                <a className="osLink" href="#">Gatekeeper help</a>
                            </div>
                        </article>

                        <article className="osCard">
                            <div className="osCard__top">
                                <div className="osIcon osIcon--linux" aria-hidden="true" />
                                <div>
                                    <div className="osCard__kicker">Linux</div>
                                    <h3 className="osCard__title">Ubuntu / Fedora / Debian</h3>
                                </div>
                            </div>
                            <p className="osCard__body">Pick your preferred package format.</p>
                            <div className="osCard__actions">
                                <a className="button button--primary" href="#">Download .deb</a>
                                <a className="button button--outline" href="#">Download .rpm</a>
                            </div>
                            <div className="osCard__links">
                                <a className="osLink" href="#">Checksums</a>
                                <a className="osLink" href="#">Release notes</a>
                                <a className="osLink" href="#">CLI install</a>
                            </div>
                        </article>
                    </div>

                    <div className="downloadBottom">
                        <article className="downloadBottom__card">
                            <div>
                                <div className="downloadCard__meta">Security</div>
                                <h3 className="downloadCard__title">Verify your download</h3>
                                <p className="downloadCard__body">Use checksums to validate installer integrity before installing.</p>
                            </div>
                            <div className="downloadCard__actions">
                                <a className="button button--primary" href="#">View checksums</a>
                                <a className="button button--outline" href="#">Learn more</a>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">Next: run an end-to-end workflow</h2>
                    <p className="unifyHeading__subtitle">Start with a concrete, reproducible walkthrough, then adapt it to your model type and dataset.</p>

                    <div className="aboutSplit">
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Get to first export</h3>
                            <p className="aboutSplit__body">
                                Follow a canonical workflow: import a dataset, annotate with review gates, lock inputs, run training, compare results, and export an audit-ready bundle.
                            </p>
                            <div className="aboutSplit__cta">
                                <a
                                    className="button button--primary"
                                    href="/use-cases/yolo"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (window.location.pathname !== '/use-cases/yolo') {
                                            window.location.href = '/use-cases/yolo'
                                        }
                                    }}
                                >
                                    View the workflow
                                </a>
                                <a
                                    className="button button--outline"
                                    href="/docs"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (window.location.pathname !== '/docs') {
                                            window.location.href = '/docs'
                                        }
                                    }}
                                >
                                    Read the docs
                                </a>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Dataset</span>
                                <span className="aboutChip">Annotate</span>
                                <span className="aboutChip">Lock</span>
                                <span className="aboutChip">Train</span>
                                <span className="aboutChip">Evaluate</span>
                                <span className="aboutChip">Export</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default DownloadPage
