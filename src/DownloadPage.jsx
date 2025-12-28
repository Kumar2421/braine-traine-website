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
        </>
    )
}

export default DownloadPage
