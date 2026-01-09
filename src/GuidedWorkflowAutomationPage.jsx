import './GuidedWorkflowAutomationPage.css'

function GuidedWorkflowAutomationPage({ navigate }) {
    return (
        <>
            <section className="aboutHero gwaHero">
                <div className="container aboutHero__inner gwaHero__inner">
                    <p className="aboutHero__kicker">Workflow</p>
                    <h1 className="aboutHero__title">Guided Workflow Automation for Reproducible Vision AI</h1>
                    <p className="aboutHero__subtitle">
                        Accelerate repetitive tasks inside your deterministic Vision AI workflow — without losing control, traceability, or reproducibility.
                    </p>

                    <div className="gwaHero__grid">
                        <ul className="gwaHeroBullets" aria-label="Key points">
                            <li>Local automation — runs on your machine</li>
                            <li>Deterministic suggestions, not unpredictable agents</li>
                            <li>Traceable and auditable decisions</li>
                        </ul>

                        <div className="gwaHeroVisual" aria-label="Hero visual">
                            <div className="gwaHeroVisual__kicker">Hero visual</div>
                            <div className="gwaHeroVisual__body">
                                Simple graphic showing automation assisting a workflow step.
                            </div>
                            <div className="gwaHeroVisual__flow" aria-hidden="true">
                                <div className="gwaFlowNode">Dataset</div>
                                <div className="gwaFlowArrow" />
                                <div className="gwaFlowNode gwaFlowNode--assist">Train</div>
                                <div className="gwaFlowArrow" />
                                <div className="gwaFlowNode gwaFlowNode--assist">Evaluate</div>
                                <div className="gwaFlowArrow" />
                                <div className="gwaFlowNode gwaFlowNode--assist">Export</div>
                            </div>
                        </div>
                    </div>

                    <div className="aboutHero__cta gwaHero__cta">
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

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">What this feature does</h2>
                        <p className="sectionHeader__subtitle">An assistive execution mode inside the ML FORGE lifecycle — scoped, reviewable, and reproducible.</p>
                    </div>

                    <div className="aboutSplit gwaSplit">
                        <div className="aboutSplit__copy">
                            <p className="aboutSplit__body">
                                Guided Workflow Automation in ML FORGE surfaces suggestions, flags inconsistencies, and accelerates repeatable steps — while preserving explicit control,
                                reproducibility, and artifact lineage.
                            </p>
                            <div className="gwaMiniList" aria-label="Definition bullets">
                                <div className="gwaMiniList__item">It enhances your workflow — it does not replace it.</div>
                                <div className="gwaMiniList__item">It operates inside the same dataset → training → evaluation → export pipeline.</div>
                                <div className="gwaMiniList__item">It never runs training or exports without your approval.</div>
                            </div>
                        </div>
                        <div className="aboutSplit__panel gwaPanel" aria-label="Definition panel">
                            <div className="gwaPanel__kicker">Assistive mode</div>
                            <div className="gwaPanel__title">Suggestions with evidence</div>
                            <div className="gwaPanel__body">
                                Each recommendation is attached to inputs, configs, and run artifacts — so teams can review and reproduce outcomes.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">The problem it solves</h2>
                        <p className="sectionHeader__subtitle">Reduce iteration friction without turning your workflow into a black box.</p>
                    </div>

                    <div className="gwaTwoCol">
                        <div className="gwaCard">
                            <div className="gwaCard__kicker">Common friction</div>
                            <ul className="gwaCard__list" aria-label="Problems">
                                <li>Repetitive configuration tuning across similar datasets</li>
                                <li>Manual evaluation loops and comparison work</li>
                                <li>Missing or inconsistent audit artifacts between runs</li>
                                <li>Slow, error-prone export configuration for target environments</li>
                            </ul>
                        </div>

                        <div className="gwaCard">
                            <div className="gwaCard__kicker">Outcomes</div>
                            <ul className="gwaCard__list" aria-label="Outcomes">
                                <li>Fewer manual steps in each iteration cycle</li>
                                <li>More consistent evaluation insights and comparisons</li>
                                <li>Better traceability across data, config, metrics, and exports</li>
                                <li>Reduced cycle time from dataset changes to deployable bundles</li>
                            </ul>
                        </div>
                    </div>

                    <div className="gwaDivider" aria-hidden="true" />

                    <div className="gwaFlowCard" aria-label="Problem to outcome flow">
                        <div className="gwaFlowCard__title">Problem → outcome</div>
                        <div className="gwaFlowCard__row" aria-hidden="true">
                            <div className="gwaFlowPill">Manual steps</div>
                            <div className="gwaFlowArrow" />
                            <div className="gwaFlowPill gwaFlowPill--good">Faster cycles</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Where automation lives in the workflow</h2>
                        <p className="sectionHeader__subtitle">Not a separate product surface — a mode inside the pipeline you already use in ML FORGE.</p>
                    </div>

                    <div className="gwaWorkflow" aria-label="Workflow diagram">
                        <div className="gwaWorkflow__step">Dataset</div>
                        <div className="gwaWorkflow__arrow" aria-hidden="true" />
                        <div className="gwaWorkflow__step gwaWorkflow__step--assist">Train</div>
                        <div className="gwaWorkflow__arrow" aria-hidden="true" />
                        <div className="gwaWorkflow__step gwaWorkflow__step--assist">Evaluate</div>
                        <div className="gwaWorkflow__arrow" aria-hidden="true" />
                        <div className="gwaWorkflow__step gwaWorkflow__step--assist">Export</div>
                    </div>

                    <p className="gwaNote">
                        Assistance appears at the moments where engineers typically lose time: training setup, evaluation review, run-to-run comparison, and export preparation.
                    </p>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Guided assistance in action</h2>
                        <p className="sectionHeader__subtitle">Core behaviors — scoped to accelerate decisions, not replace them.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard gwaCap">
                            <div className="unifyCard__kicker">Training setup</div>
                            <p className="unifyCard__body">Suggests training parameters based on prior runs and your project history.</p>
                        </article>
                        <article className="unifyCard gwaCap">
                            <div className="unifyCard__kicker">Regression signals</div>
                            <p className="unifyCard__body">Highlights evaluation regressions early, before you ship the wrong model.</p>
                        </article>
                        <article className="unifyCard gwaCap">
                            <div className="unifyCard__kicker">Export presets</div>
                            <p className="unifyCard__body">Recommends export formats and presets aligned to your runtime target.</p>
                        </article>
                        <article className="unifyCard gwaCap">
                            <div className="unifyCard__kicker">Annotation checks</div>
                            <p className="unifyCard__body">Alerts you to annotation inconsistencies and dataset quality risks.</p>
                        </article>
                        <article className="unifyCard gwaCap">
                            <div className="unifyCard__kicker">Anomaly flags</div>
                            <p className="unifyCard__body">Flags anomalous performance shifts after training completes.</p>
                        </article>
                        <article className="unifyCard gwaCap">
                            <div className="unifyCard__kicker">Reproducibility risks</div>
                            <p className="unifyCard__body">Surfaces missing artifacts, mismatched configs, and non-repeatable inputs.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark gwaBoundaries">
                <div className="container">
                    <h2 className="unifyHeading">What you still control</h2>
                    <p className="unifyHeading__subtitle">Automation helps you move faster — but it never takes ownership of engineering decisions.</p>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">You decide</div>
                            <p className="unifyCard__body">Model architecture and selection.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">You approve</div>
                            <p className="unifyCard__body">Final approval to run training and accept results.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">You own quality</div>
                            <p className="unifyCard__body">Dataset labeling quality and review decisions.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">You ship</div>
                            <p className="unifyCard__body">Export and deployment decisions, plus production rollout.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">ML FORGE guarantees with guided automation</h2>
                        <p className="sectionHeader__subtitle">The same site-level principles, applied to automation behavior.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard gwaGuarantee">
                            <div className="unifyCard__kicker">Deterministic runs</div>
                            <p className="unifyCard__body">Repeated workflows yield consistent results when inputs match.</p>
                        </article>
                        <article className="unifyCard gwaGuarantee">
                            <div className="unifyCard__kicker">Explicit artifacts</div>
                            <p className="unifyCard__body">Suggestions and outcomes stay tied to data, config, and metrics.</p>
                        </article>
                        <article className="unifyCard gwaGuarantee">
                            <div className="unifyCard__kicker">Local-first execution</div>
                            <p className="unifyCard__body">Runs on your machine; no cloud dependency required.</p>
                        </article>
                        <article className="unifyCard gwaGuarantee">
                            <div className="unifyCard__kicker">Audit-ready workflow</div>
                            <p className="unifyCard__body">Decisions are visible, reviewable, and attributable.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Concrete example: assisted training run</h2>
                        <p className="sectionHeader__subtitle">Same deterministic workflow — fewer manual steps, clearer evidence, and decisions you can defend later.</p>
                    </div>

                    <div className="gwaSteps" aria-label="Example steps">
                        <div className="gwaStep">
                            <div className="gwaStep__num">1</div>
                            <div className="gwaStep__body">Import dataset</div>
                        </div>
                        <div className="gwaStep">
                            <div className="gwaStep__num">2</div>
                            <div className="gwaStep__body">Suggest train/validation splits</div>
                        </div>
                        <div className="gwaStep">
                            <div className="gwaStep__num">3</div>
                            <div className="gwaStep__body">Review and approve annotations</div>
                        </div>
                        <div className="gwaStep">
                            <div className="gwaStep__num">4</div>
                            <div className="gwaStep__body">Suggest training parameters based on prior runs</div>
                        </div>
                        <div className="gwaStep">
                            <div className="gwaStep__num">5</div>
                            <div className="gwaStep__body">Evaluate and surface regressions against your baseline</div>
                        </div>
                        <div className="gwaStep">
                            <div className="gwaStep__num">6</div>
                            <div className="gwaStep__body">Recommend export presets aligned to your target</div>
                        </div>
                    </div>

                    <div className="gwaExampleNote">Same deterministic pipeline — the automation reduces busywork, not accountability.</div>
                </div>
            </section>

            <section className="ctaBand">
                <div className="container ctaBand__inner">
                    <h2 className="ctaBand__title">Start automating your Vision AI workflow with confidence.</h2>
                    <div className="ctaBand__row">
                        <p className="ctaBand__subtitle">Locally, deterministically, and with full traceability — without adding a separate control surface.</p>
                        <div className="ctaBand__actions">
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
                                View documentation
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default GuidedWorkflowAutomationPage
