import './App.css'

function AboutPage() {
    return (
        <>
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker">Company</p>
                    <h1 className="aboutHero__title">About ML FORGE</h1>
                    <p className="aboutHero__subtitle">
                        We help teams deliver trusted Vision AI—from datasets to deployment—with reproducibility, governance, and local-first workflows.
                    </p>
                    <div className="aboutHero__cta">
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
                            Download ML FORGE
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
                            Request access
                        </a>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">What we build</h2>
                        <p className="sectionHeader__subtitle">A unified IDE for Vision AI workflows—datasets, annotation, training, evaluation, and deployment.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Reproducible Vision AI</div>
                            <p className="unifyCard__body">Deterministic workflows with explicit configs, locked datasets, and full artifact lineage for production reliability.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Local-first execution</div>
                            <p className="unifyCard__body">Train and evaluate on your machines. Operates offline. Your data stays with you—no cloud dependency.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Audit-ready artifacts</div>
                            <p className="unifyCard__body">Every export tied to dataset version, training config, metrics, and logs—designed for regulated environments.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">
                        How we work
                    </h2>
                    <p className="unifyHeading__subtitle">
                        Built for Vision AI teams—ML engineers, CV engineers, and robotics teams—who need production reliability.
                    </p>

                    <div className="aboutSplit">
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Trusted outcomes</h3>
                            <p className="aboutSplit__body">
                                Establish reliable, repeatable workflows that help your organization scale Vision AI initiatives while meeting
                                compliance requirements. Every model export includes full lineage—dataset version, config snapshot, metrics, and logs.
                            </p>
                            <div className="aboutSplit__cta">
                                <a 
                                    className="button button--primary" 
                                    href="/docs"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (window.location.pathname !== '/docs') {
                                            window.location.href = '/docs'
                                        }
                                    }}
                                >
                                    View documentation
                                </a>
                                <a 
                                    className="button button--outline" 
                                    href="/download"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (window.location.pathname !== '/download') {
                                            window.location.href = '/download'
                                        }
                                    }}
                                >
                                    Download ML FORGE
                                </a>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Datasets</span>
                                <span className="aboutChip">Annotation</span>
                                <span className="aboutChip">Training</span>
                                <span className="aboutChip">Evaluation</span>
                                <span className="aboutChip">Export</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AboutPage
