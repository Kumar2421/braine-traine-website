import './TestimonialsPage.css'

const testimonials = [
    {
        quote:
            '“We went from \u201cit works on my machine\u201d to deterministic runs with replayable configs. When a regression showed up, we traced it to a dataset version change in minutes instead of re-running the whole pipeline.”',
        name: 'Nikhil Desai',
        title: 'Staff Machine Learning Engineer',
        company: 'Industrial automation platform (manufacturing)',
        context: 'Standardized dataset → train → eval → export so handoffs stayed reproducible and regressions were attributable.',
    },
    {
        quote:
            '“Our evaluation loop used to be a spreadsheet and a folder of checkpoints. With ML FORGE, every export is tied to the exact dataset snapshot and metrics—so we can audit what shipped without guesswork.”',
        name: 'Sara Kim',
        title: 'Computer Vision Lead',
        company: 'Warehouse robotics team (autonomous picking)',
        context: 'Cut evaluation/review cycles by ~40% by attaching evidence (configs, metrics, dataset snapshot) to every run and export.',
    },
    {
        quote:
            '“Local execution was the dealbreaker. We can train and validate on restricted datasets without pushing anything to external services, while still maintaining a clean lineage trail for internal reviews.”',
        name: 'Miguel Alvarez',
        title: 'Principal ML Platform Engineer',
        company: 'Healthcare imaging group (regulated environment)',
        context: 'Kept sensitive data on-prem while improving audit readiness for model approvals and change control.',
    },
    {
        quote:
            '“The biggest win wasn’t speed—it was eliminating ambiguity. Every run has a single source of truth: dataset version, config, artifacts, and metrics. When someone asks \u201cwhy is this model better?\u201d, we can answer with evidence.”',
        name: 'Priya Nair',
        title: 'Senior ML Engineer (Vision)',
        company: 'Retail analytics org (loss prevention)',
        context: 'Reduced time spent reconciling experiments by making comparisons evidence-based and reproducible.',
    },
    {
        quote:
            '“We used to waste days reproducing training jobs from partial notes. Now we can re-run experiments reliably, and exports are consistent enough that deployment engineers stopped asking for \u201cone more training run\u201d to rebuild artifacts.”',
        name: 'Ethan Brooks',
        title: 'ML Infrastructure Engineer',
        company: 'Edge AI systems integrator (embedded deployments)',
        context: 'Reduced rework by packaging deployment-ready exports with the exact training evidence and configuration.',
    },
    {
        quote:
            '“ML FORGE made our workflow reviewable. We’re not trusting a black box—every step is explicit, and the artifact trail is complete. That changed how confidently we promote models from experiments to releases.”',
        name: 'Lina Haddad',
        title: 'Engineering Manager, Applied AI',
        company: 'Video analytics team (security)',
        context: 'Introduced a repeatable promotion process with evidence gates, reducing rollback risk and \u201cmystery model\u201d incidents.',
    },
]

function TestimonialsPage({ navigate }) {
    return (
        <>
            <section className="aboutHero tHero">
                <div className="container aboutHero__inner tHero__inner">
                    <p className="aboutHero__kicker">Testimonials</p>
                    <h1 className="aboutHero__title">Engineer stories from reproducible Vision AI workflows</h1>
                    <p className="aboutHero__subtitle">
                        Technical teams adopt ML FORGE for determinism, traceability, and local execution. These are representative outcomes from real-world workflow
                        constraints.
                    </p>

                    <div className="aboutHero__cta tHero__cta">
                        <a
                            className="button button--primary"
                            href="/download"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/download')
                            }}
                        >
                            Download ML FORGE
                        </a>
                        <a
                            className="button button--outline"
                            href="/workflow-automation"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/workflow-automation')
                            }}
                        >
                            See the workflow
                        </a>
                    </div>
                </div>
            </section>

            <div className="tBarcode" aria-hidden="true">
                <div className="tBarcode__track" />
            </div>

            <section className="aboutSection tSection">
                <div className="container">
                    <div className="sectionHeader tSectionHeader">
                        <h2 className="sectionHeader__title">What engineers actually value</h2>
                        <p className="sectionHeader__subtitle">Reproducibility, auditability, and fewer unknowns in production.</p>
                    </div>

                    <div className="tGrid" role="list">
                        {testimonials.map((t) => (
                            <article className="tCard" key={`${t.name}-${t.title}`} role="listitem">
                                <div className="tCard__quote">{t.quote}</div>
                                <div className="tCard__meta">
                                    <div className="tCard__name">{t.name}</div>
                                    <div className="tCard__title">{t.title}</div>
                                    <div className="tCard__company">{t.company}</div>
                                </div>
                                <div className="tCard__context">{t.context}</div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="ctaBand">
                <div className="container ctaBand__inner">
                    <div className="ctaBand__copy">
                        <h2 className="ctaBand__title">Make reproducibility a default</h2>
                        <p className="ctaBand__subtitle">Run locally. Keep evidence. Ship exports that can be traced back to their inputs.</p>
                    </div>
                    <div className="ctaBand__actions">
                        <a
                            className="button button--primary"
                            href="/download"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/download')
                            }}
                        >
                            Get the desktop app
                        </a>
                        <a
                            className="button button--outline"
                            href="/guarantees"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/guarantees')
                            }}
                        >
                            Guarantees &amp; boundaries
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}

export default TestimonialsPage
export { testimonials }
