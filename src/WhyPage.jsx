import './App.css'

function WhyPage() {
    return (
        <>
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker">Why BrainTrain</p>
                    <h1 className="aboutHero__title">A trust layer for local Vision AI.</h1>
                    <p className="aboutHero__subtitle">
                        Engineer-to-engineer: deterministic workflows, artifact lineage, and zero cloud lock-in by default. Built for teams who cannot afford silent failures.
                    </p>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Why choose BrainTrain</h2>
                        <p className="sectionHeader__subtitle">Designed for Vision AI teams who need production reliability, reproducibility, and data sovereignty.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Local-first Vision AI</div>
                            <p className="unifyCard__body">Train and evaluate on your machines. Operates offline. Your data stays with you—no cloud dependency.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Deterministic training</div>
                            <p className="unifyCard__body">Explicit configs, locked inputs, repeatable runs. No hidden state. Every run is reproducible.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Full artifact lineage</div>
                            <p className="unifyCard__body">Every export stays tied to config, data snapshot, metrics, and the exact run. Audit-ready by default.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No cloud lock-in</div>
                            <p className="unifyCard__body">The website is a control plane and distribution hub, not your training runtime. Your infrastructure, your control.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">IDE-native workflows</div>
                            <p className="unifyCard__body">Datasets → annotate → lock → train → evaluate → export, inside one tool. No context switching.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Built for regulated environments</div>
                            <p className="unifyCard__body">Auditability, reproducibility, and offline deployment paths for real operations. Compliance-ready.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">
                        Built for teams who cannot afford silent failures
                    </h2>
                    <p className="unifyHeading__subtitle">
                        Manufacturing quality inspection, robotics labs, smart surveillance, and medical imaging teams rely on BrainTrain for production-grade Vision AI workflows.
                    </p>

                    <div className="aboutSplit">
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Production reliability</h3>
                            <p className="aboutSplit__body">
                                Vision systems fail in production when data and training inputs drift. BrainTrain makes every input explicit and file-backed so you can reproduce results across machines and over time. No silent failures. No hidden state. Just deterministic workflows.
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
                                    href="/agentic-ai"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (window.location.pathname !== '/agentic-ai') {
                                            window.location.href = '/agentic-ai'
                                        }
                                    }}
                                >
                                    View workflow
                                </a>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Reproducible</span>
                                <span className="aboutChip">Deterministic</span>
                                <span className="aboutChip">Audit-ready</span>
                                <span className="aboutChip">Offline</span>
                                <span className="aboutChip">Production-grade</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default WhyPage
