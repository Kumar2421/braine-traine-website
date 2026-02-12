import './GuaranteesBoundariesPage.css'

function GuaranteesBoundariesPage({ navigate }) {
    return (
        <>
            <section className="aboutHero gbHero">
                <div className="container aboutHero__inner gbHero__inner">
                    <p className="aboutHero__kicker">Trust boundaries</p>
                    <h1 className="aboutHero__title">Guarantees &amp; Boundaries</h1>
                    <p className="aboutHero__subtitle">
                        This section defines what ML FORGE guarantees at the system level—and what it explicitly does not guarantee—so engineering teams can
                        reason about risk, reproducibility, and operational ownership before adopting it.
                    </p>

                    <div className="aboutHero__cta gbHero__cta">
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
                            href="/docs"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/docs')
                            }}
                        >
                            Read documentation
                        </a>
                    </div>
                </div>
            </section>

            <section className="aboutSection gbSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Guarantees</h2>
                        <p className="sectionHeader__subtitle">What ML FORGE guarantees when you run workflows on your infrastructure.</p>
                    </div>

                    <div className="unifyGrid gbGrid" role="list">
                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Execution</div>
                            <div className="unifyCard__title">Local execution by default</div>
                            <p className="unifyCard__body">
                                Training, evaluation, and export run on your infrastructure. ML FORGE does not require sending datasets or model artifacts to a third-party
                                service to execute core workflows.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Determinism</div>
                            <div className="unifyCard__title">Deterministic workflow artifacts</div>
                            <p className="unifyCard__body">
                                Given the same dataset version, configuration, and runtime environment, ML FORGE produces repeatable, inspectable outputs and preserves the
                                inputs used to produce them.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Traceability</div>
                            <div className="unifyCard__title">Lineage across the lifecycle</div>
                            <p className="unifyCard__body">
                                ML FORGE records the lineage chain from dataset version → run configuration → execution outputs → evaluation results → export bundle, so you can
                                attribute a deployed artifact back to its originating evidence.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Reproducibility</div>
                            <div className="unifyCard__title">Reproducible run context capture</div>
                            <p className="unifyCard__body">
                                ML FORGE stores the configuration and run metadata needed to re-run or audit an experiment, including parameterization and the artifact set
                                produced by that run.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Exports</div>
                            <div className="unifyCard__title">Audit-ready exports</div>
                            <p className="unifyCard__body">
                                Export bundles are packaged with the associated evidence (e.g., metrics, configs, and run identifiers) required to verify what was trained and
                                how it was produced.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Control</div>
                            <div className="unifyCard__title">Explicit control surfaces</div>
                            <p className="unifyCard__body">
                                Workflow actions are executed as explicit steps (not silent background decisions), making it clear what happened, when it happened, and what
                                inputs were used.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="aboutSection gbSection gbSection--tight">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Boundaries</h2>
                        <p className="sectionHeader__subtitle">What ML FORGE does not guarantee, and what remains your responsibility.</p>
                    </div>

                    <div className="unifyGrid gbGrid" role="list">
                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Outcomes</div>
                            <div className="unifyCard__title">No guarantee of model quality</div>
                            <p className="unifyCard__body">
                                ML FORGE cannot guarantee accuracy, robustness, fairness, or business performance targets. Those outcomes depend on data quality, labeling
                                policy, model choice, and evaluation design.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Environment</div>
                            <div className="unifyCard__title">No guarantee of environment equivalence</div>
                            <p className="unifyCard__body">
                                Reproducibility depends on your runtime. ML FORGE does not guarantee identical results across materially different hardware, drivers,
                                CUDA/toolchain versions, or nondeterministic libraries.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Data</div>
                            <div className="unifyCard__title">No guarantee of labeling correctness</div>
                            <p className="unifyCard__body">
                                ML FORGE does not guarantee that annotations are accurate, consistent, or complete; it provides workflow structure and evidence capture, not
                                domain truth.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Compliance</div>
                            <div className="unifyCard__title">No guarantee of regulatory compliance by itself</div>
                            <p className="unifyCard__body">
                                ML FORGE supports auditability and traceability, but it does not replace your governance program (access controls, retention policies, approval
                                workflows, validation protocols, and compliance sign-off).
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Process</div>
                            <div className="unifyCard__title">No guarantee against operational misuse</div>
                            <p className="unifyCard__body">
                                ML FORGE does not prevent poor experimental design, leakage, inappropriate metrics, or improper deployment decisions; it makes the evidence
                                reviewable, but accountability remains with the team.
                            </p>
                        </article>

                        <article className="unifyCard gbCard" role="listitem">
                            <div className="unifyCard__kicker">Production</div>
                            <div className="unifyCard__title">No guarantee of production performance</div>
                            <p className="unifyCard__body">
                                ML FORGE does not guarantee inference latency, throughput, memory footprint, or hardware compatibility in downstream environments; those must be
                                validated against your target deployment constraints.
                            </p>
                        </article>
                    </div>

                    <div className="gbClosing">
                        For engineers, these guarantees and boundaries matter because they make ML FORGE a reliable system for evidence-backed, deterministic work—while
                        keeping responsibility for data, environments, and acceptance criteria where it belongs: with the team operating the pipeline.
                    </div>
                </div>
            </section>

            <section className="ctaBand">
                <div className="container ctaBand__inner">
                    <div className="ctaBand__copy">
                        <h2 className="ctaBand__title">Ready to run the workflow locally?</h2>
                        <p className="ctaBand__subtitle">Start with the guided workflow automation page, then follow docs when you’re ready to go deeper.</p>
                    </div>
                    <div className="ctaBand__actions">
                        <a
                            className="button button--primary"
                            href="/workflow-automation"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/workflow-automation')
                            }}
                        >
                            See the workflow
                        </a>
                        <a
                            className="button button--outline"
                            href="/docs"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate('/docs')
                            }}
                        >
                            Open docs
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}

export default GuaranteesBoundariesPage
