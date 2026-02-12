import './App.css'

function ManufacturingInspectionPage({ navigate }) {
    return (
        <>
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker">Manufacturing use case</p>
                    <h1 className="aboutHero__title">Edge Vision AI for Manufacturing Inspection</h1>
                    <p className="aboutHero__subtitle">
                        Production-grade Vision AI for real manufacturing environments. Build, validate, and deploy inspection models locally—where reliability, traceability, and reproducibility matter.
                    </p>
                    <p className="aboutHero__meta">Manufacturing • Quality Inspection • Edge AI • Offline Deployment</p>
                    <div className="aboutHero__cta">
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
                            View workflow documentation
                        </a>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Where Vision AI is used in manufacturing</h2>
                        <p className="sectionHeader__subtitle">
                            Manufacturing teams deploy Vision AI where inspection has to run at line speed, with stable decision thresholds and minimal tolerance for surprises.
                        </p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Assembly line defects</div>
                            <p className="unifyCard__body">Detect defects in continuous flow where inspection windows are measured in milliseconds and misses become downstream rework.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Surface inspection</div>
                            <p className="unifyCard__body">Find scratches, dents, cracks, pits, and coating issues under variable lighting and reflective materials.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Presence + alignment checks</div>
                            <p className="unifyCard__body">Verify components are present, seated, and oriented correctly when small shifts cause hard failures downstream.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Quality grading</div>
                            <p className="unifyCard__body">Classify and grade quality outcomes where the cost of false rejects is throughput loss and the cost of false accepts is customer impact.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">End-of-line inspection</div>
                            <p className="unifyCard__body">Validate final quality before shipment when inspection decisions become part of compliance evidence and incident records.</p>
                        </article>
                    </div>

                    <div className="aboutSplit" style={{ marginTop: '32px' }}>
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Industrial reality</h3>
                            <p className="aboutSplit__body">
                                These environments combine high-volume image streams, strict false-positive tolerance, offline/on-prem execution, and audit requirements. The differentiator is operational control:
                                what ran, on what data, with which configuration—and what was shipped.
                            </p>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">High-volume streams</span>
                                <span className="aboutChip">Low false rejects</span>
                                <span className="aboutChip">Offline / on-prem</span>
                                <span className="aboutChip">Audit evidence</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">The real challenges in production environments</h2>
                    <p className="unifyHeading__subtitle">This is not a research problem. It is a production reliability problem.</p>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Inconsistent training results</div>
                            <p className="unifyCard__body">Small environment differences create large outcome drift, making validation and rollbacks unreliable.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Dataset drift over time</div>
                            <p className="unifyCard__body">Lighting, tooling, suppliers, part revisions, and camera settings shift the data distribution continuously.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Annotation errors</div>
                            <p className="unifyCard__body">A small rate of label mistakes silently degrades performance and creates hard-to-debug inspection behavior.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Reproducibility gaps</div>
                            <p className="unifyCard__body">When incidents happen, teams can’t reliably reproduce past inspection decisions or prove what changed.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Cloud restrictions</div>
                            <p className="unifyCard__body">Factory policy, latency, connectivity, and compliance often eliminate cloud workflows entirely.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No tolerance for silent failure</div>
                            <p className="unifyCard__body">Models that degrade without traceable evidence create operational risk and erode trust in automation.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">How ML FORGE fits into the manufacturing workflow</h2>
                        <p className="sectionHeader__subtitle">A local execution system of record for Vision AI models.</p>
                    </div>

                    <div className="aboutSplit">
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Local by design</h3>
                            <p className="aboutSplit__body">
                                ML FORGE runs entirely on factory or engineering machines—no mandatory cloud path. It’s built for teams who need tight control over data and environments.
                            </p>
                            <h3 className="aboutSplit__title" style={{ marginTop: '18px' }}>Traceability by default</h3>
                            <p className="aboutSplit__body">
                                Datasets, runs, evaluations, and exports are treated as connected artifacts. You can always answer what changed, when it changed, and what shipped.
                            </p>
                            <h3 className="aboutSplit__title" style={{ marginTop: '18px' }}>Repeatable inspection pipelines</h3>
                            <p className="aboutSplit__body">
                                ML FORGE is designed for repeatable workflows so validation remains meaningful across machines and across time.
                            </p>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">No cloud dependency</span>
                                <span className="aboutChip">Explicit lineage</span>
                                <span className="aboutChip">Deterministic runs</span>
                                <span className="aboutChip">Audit-ready exports</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">End-to-end inspection workflow with ML FORGE</h2>
                        <p className="sectionHeader__subtitle">A narrative workflow optimized for production reality—not a tutorial.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">1) Dataset ingestion</div>
                            <p className="unifyCard__body">
                                Images captured from production cameras are ingested into explicit dataset versions. Data is treated as a controlled input, with no silent preprocessing.
                            </p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">2) Annotation &amp; review</div>
                            <p className="unifyCard__body">
                                Labeling uses review gates and traceable changes so corrections don’t disappear. Dataset versions reflect approved labels and remain audit-ready.
                            </p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">3) Model training</div>
                            <p className="unifyCard__body">
                                Training runs are deterministic with explicit configuration tracking. Results remain reproducible across machines—so you can validate changes confidently.
                            </p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">4) Evaluation &amp; validation</div>
                            <p className="unifyCard__body">
                                Compare inspection accuracy across dataset versions, detect regressions early, and validate changes with evidence suitable for production reviews.
                            </p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">5) Export &amp; deployment</div>
                            <p className="unifyCard__body">
                                Export to ONNX / TensorRT / edge-friendly formats with preserved hashes and lineage. Exports remain tied to dataset versions and training runs.
                            </p>
                        </article>
                    </div>

                    <div className="aboutSplit" style={{ marginTop: '32px' }}>
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Optional visual</h3>
                            <p className="aboutSplit__body">Artifact lineage map: Dataset → Run → Evaluation → Export bundle (hashes + timestamps)</p>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Dataset v</span>
                                <span className="aboutChip">Run ID</span>
                                <span className="aboutChip">Metrics</span>
                                <span className="aboutChip">Export hash</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">Where the inspection model runs in production</h2>
                    <p className="unifyHeading__subtitle">ML FORGE prepares deployment-ready, auditable models for edge environments.</p>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Edge devices</div>
                            <p className="unifyCard__body">Low-latency inference near the line with minimal network dependency.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Industrial PCs</div>
                            <p className="unifyCard__body">Station-level compute integrated with cameras, IO, and local logging.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">On-prem inference servers</div>
                            <p className="unifyCard__body">Centralize inference across stations while staying inside plant boundaries.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Air-gapped factories</div>
                            <p className="unifyCard__body">Operate under restricted connectivity where cloud paths are not an option.</p>
                        </article>
                    </div>

                    <div className="aboutSplit" style={{ marginTop: '32px' }}>
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Clear boundary</h3>
                            <p className="aboutSplit__body">ML FORGE is not the inference runtime. It prepares controlled exports with lineage for your production inference stack.</p>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Export-ready</span>
                                <span className="aboutChip">Auditable</span>
                                <span className="aboutChip">Edge-friendly</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Why reproducibility matters on the factory floor</h2>
                        <p className="sectionHeader__subtitle">When failures happen, the cost is operational and immediate.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Cost of failure</div>
                            <p className="unifyCard__body">Downtime, scrap, rework, blocked shipments, and quality escapes—manufacturing failures are never abstract.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Explainable decisions</div>
                            <p className="unifyCard__body">Quality incidents require evidence: what data, what run, what exported artifact—and why it behaved that way.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Reproducible history</div>
                            <p className="unifyCard__body">Audit, corrective actions, and customer disputes require reproducing historical models—not approximating them.</p>
                        </article>
                    </div>

                    <div className="aboutSplit" style={{ marginTop: '32px' }}>
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Optional visual</h3>
                            <p className="aboutSplit__body">Incident timeline showing how explicit dataset versions and deterministic runs shorten root-cause time.</p>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Dataset diff</span>
                                <span className="aboutChip">Run diff</span>
                                <span className="aboutChip">Export diff</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">What ML FORGE guarantees in manufacturing workflows</h2>
                    <p className="unifyHeading__subtitle">Governance and repeatability, designed for production accountability.</p>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Deterministic pipelines</div>
                            <p className="unifyCard__body">Runs are reproducible and comparable, so validation stays meaningful across time and machines.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Local execution</div>
                            <p className="unifyCard__body">Operate without cloud dependency in offline, on-prem, and air-gapped environments.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Explicit artifact lineage</div>
                            <p className="unifyCard__body">Datasets, training runs, evaluation reports, and exports remain connected and reviewable.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Audit-ready history</div>
                            <p className="unifyCard__body">Training and export history is available when incidents occur and evidence is required.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No silent changes</div>
                            <p className="unifyCard__body">Changes to models or data are explicit so regressions are explainable rather than mysterious.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Clear boundaries</h2>
                        <p className="sectionHeader__subtitle">ML FORGE is a reliable engineering system—not an autonomous factory controller.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Not an MES replacement</div>
                            <p className="unifyCard__body">ML FORGE does not replace factory execution systems or production planning infrastructure.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No auto-deploy</div>
                            <p className="unifyCard__body">ML FORGE does not deploy models automatically to production stations.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No accuracy guarantees</div>
                            <p className="unifyCard__body">ML FORGE does not guarantee inspection accuracy; it guarantees traceability and repeatability.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">No hardware management</div>
                            <p className="unifyCard__body">ML FORGE does not manage production hardware, cameras, PLCs, or factory networking.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">What teams achieve with ML FORGE</h2>
                    <p className="unifyHeading__subtitle">Conversion outcomes: faster iteration without losing control.</p>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Faster iteration</div>
                            <p className="unifyCard__body">Move quickly while keeping a controlled record of what changed and why.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Reduced inspection errors</div>
                            <p className="unifyCard__body">Tighten dataset integrity and validation loops so defects and false rejects are managed with evidence.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Confidence in behavior</div>
                            <p className="unifyCard__body">Deterministic runs and explicit exports reduce regressions and improve rollout confidence.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Easier audits</div>
                            <p className="unifyCard__body">Evidence stays tied to artifacts so investigations and compliance requests don’t derail teams.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Production reliability</div>
                            <p className="unifyCard__body">Treat models as governed engineering outputs—not fragile experiments.</p>
                        </article>
                    </div>

                    <div className="aboutSplit" style={{ marginTop: '32px' }}>
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Build Vision AI inspection systems you can trust in production.</h3>
                            <div className="aboutSplit__cta" style={{ marginTop: '16px' }}>
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
                                    Explore documentation
                                </a>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Reproducible</span>
                                <span className="aboutChip">Deterministic</span>
                                <span className="aboutChip">Audit-ready</span>
                                <span className="aboutChip">Offline</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ManufacturingInspectionPage
