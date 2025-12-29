import './App.css'

function SecurityPage() {
    return (
        <>
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker">Security &amp; Privacy</p>
                    <h1 className="aboutHero__title">Offline-first, by design.</h1>
                    <p className="aboutHero__subtitle">
                        BrainTrain's website is a control plane. Execution stays on your machines. Your data never leaves your infrastructure.
                    </p>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Security guarantees</h2>
                        <p className="sectionHeader__subtitle">Built for teams who need offline execution, air-gapped deployments, and data sovereignty.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Offline-first guarantee</div>
                            <p className="unifyCard__body">The IDE runs locally and can operate offline. The website never becomes your runtime.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No dataset uploads</div>
                            <p className="unifyCard__body">No images, videos, or datasets are uploaded to BrainTrain's website. Your data stays with you.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No cloud inference</div>
                            <p className="unifyCard__body">Inference does not run on BrainTrain servers. Deployments remain your responsibility.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No cloud training</div>
                            <p className="unifyCard__body">Training runs on your workstation or on-prem systems. The website does not expose training endpoints.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">License = metadata only</div>
                            <p className="unifyCard__body">Licenses are control-plane artifacts: tier, expiry, and offline signature metadata for the IDE.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Deterministic ML philosophy</div>
                            <p className="unifyCard__body">Explicit configs, locked inputs, repeatable runs. Audit-ready artifacts are first-class.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">
                        Designed for regulated environments
                    </h2>
                    <p className="unifyHeading__subtitle">
                        Air-gapped installs, offline licensing, and compliance-ready workflows for healthcare, manufacturing, and government deployments.
                    </p>

                    <div className="aboutSplit">
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Data sovereignty</h3>
                            <p className="aboutSplit__body">
                                Your datasets, models, and training runs never touch BrainTrain servers. The website is a control plane for licensing and distribution—not a runtime. Perfect for air-gapped environments and regulated industries.
                            </p>
                            <div className="aboutSplit__cta">
                                <a 
                                    className="button button--primary" 
                                    href="/download"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (window.location.pathname !== '/download') {
                                            window.location.href = '/download'
                                        }
                                    }}
                                >
                                    Download BrainTrain
                                </a>
                                <a 
                                    className="button button--outline" 
                                    href="/request-access"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (window.location.pathname !== '/request-access') {
                                            window.location.href = '/request-access'
                                        }
                                    }}
                                >
                                    Request enterprise access
                                </a>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Offline</span>
                                <span className="aboutChip">Air-gapped</span>
                                <span className="aboutChip">On-prem</span>
                                <span className="aboutChip">Compliance</span>
                                <span className="aboutChip">Audit-ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SecurityPage
