import './App.css'

function AboutPage() {
    return (
        <>
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker">Company</p>
                    <h1 className="aboutHero__title">About DataRobot</h1>
                    <p className="aboutHero__subtitle">
                        We help teams deliver trusted AI—from experimentation to production—with governance, observability, and enterprise
                        controls.
                    </p>
                    <div className="aboutHero__cta">
                        <a className="button button--primary" href="#">Request a demo</a>
                        <a className="button button--outline" href="#">Contact sales</a>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">What we build</h2>
                        <p className="sectionHeader__subtitle">A unified platform for agentic apps, ML, governance, and operations.</p>
                    </div>

                    <div className="aboutGrid">
                        <article className="aboutCard">
                            <h3 className="aboutCard__title">Enterprise-ready AI</h3>
                            <p className="aboutCard__body">Bring guardrails, audit trails, and policy controls to every workflow.</p>
                        </article>
                        <article className="aboutCard">
                            <h3 className="aboutCard__title">Faster time-to-value</h3>
                            <p className="aboutCard__body">Accelerate delivery with repeatable patterns and production deployment paths.</p>
                        </article>
                        <article className="aboutCard">
                            <h3 className="aboutCard__title">Observability by design</h3>
                            <p className="aboutCard__body">Monitor performance, cost, and risk—end-to-end across agents and models.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="aboutSection aboutSection--alt">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">How we work</h2>
                        <p className="sectionHeader__subtitle">
                            Built for cross-functional teams—data science, engineering, and governance—working together.
                        </p>
                    </div>

                    <div className="aboutSplit">
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Trusted outcomes</h3>
                            <p className="aboutSplit__body">
                                Establish reliable, repeatable workflows that help your organization scale AI initiatives while meeting
                                compliance requirements.
                            </p>
                            <div className="aboutSplit__cta">
                                <a className="button button--primary" href="#">Explore resources</a>
                                <a className="button button--outline" href="#">View documentation</a>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Security</span>
                                <span className="aboutChip">Monitoring</span>
                                <span className="aboutChip">Governance</span>
                                <span className="aboutChip">Deployment</span>
                                <span className="aboutChip">Evaluation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AboutPage
