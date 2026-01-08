import './App.css'

function YoloWorkflowPage({ navigate }) {
    return (
        <>
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker">Canonical use case</p>
                    <h1 className="aboutHero__title">End-to-end vision model workflow in ML FORGE</h1>
                    <p className="aboutHero__subtitle">
                        A concrete, end-to-end example you can adapt: import data, label, train locally, evaluate, and export to ONNX/TensorRT — with dataset locks, config snapshots,
                        and full lineage. YOLO is a common starting point, but the workflow supports other model families and task types.
                    </p>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Inputs → Outputs</h2>
                        <p className="sectionHeader__subtitle">What you start with, what ML FORGE produces, and what you ship.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Inputs</div>
                            <p className="unifyCard__body">
                                Image folders or video files, labels (optional), and a target task type (detection, segmentation, classification, pose).
                                You stay in control of storage and infrastructure.
                            </p>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Core artifacts</div>
                            <p className="unifyCard__body">
                                Immutable dataset version, approved labels, config snapshot, metrics report, checkpoints, and a reproducibility chain.
                            </p>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Outputs</div>
                            <p className="unifyCard__body">
                                Export bundles for deployment (ONNX / TensorRT), including model + class map + dataset version + metrics + config snapshot.
                            </p>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Why it matters</div>
                            <p className="unifyCard__body">
                                You can re-run any result later and explain exactly what changed: data, labels, config, or model — without cloud lock-in or notebook drift.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Model adaptation</h2>
                        <p className="sectionHeader__subtitle">Same lifecycle. Swap the model/task-specific parts without losing traceability.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Detection (YOLO-style)</div>
                            <p className="unifyCard__body">
                                Bounding boxes + class names. Optimize for mAP, latency, and false positives. Great for real-world inspection and monitoring.
                            </p>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Segmentation</div>
                            <p className="unifyCard__body">
                                Masks or polygons. Optimize for IoU/Dice and boundary quality. Use when “where exactly” matters, not just “what”.
                            </p>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Classification</div>
                            <p className="unifyCard__body">
                                Image-level labels. Optimize for accuracy/precision/recall, plus calibration if decisions have cost.
                            </p>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Pose / keypoints</div>
                            <p className="unifyCard__body">
                                Keypoints + skeletons. Optimize for PCK/OKS and robustness. Useful for ergonomics, safety, and sports analytics.
                            </p>
                        </article>
                    </div>

                    <div className="aboutSplit" style={{ marginTop: '32px' }}>
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">What changes when you adapt?</h3>
                            <p className="aboutSplit__body">
                                The lifecycle stays the same: dataset versioning, review gates, config snapshots, runs, and exports. What changes are the label schema, model head,
                                metrics, and export target constraints.
                            </p>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Dataset version</span>
                                <span className="aboutChip">Label schema</span>
                                <span className="aboutChip">Metrics</span>
                                <span className="aboutChip">Export target</span>
                                <span className="aboutChip">Lineage</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">
                        Step-by-step <span className="unifyHeading__muted">workflow</span>
                    </h2>
                    <p className="unifyHeading__subtitle">Short captions + screenshot-style panels, using the same UI patterns as the rest of the site.</p>

                    <div className="platformStack">
                        <section className="platformPanel platformPanel--build">
                            <div className="platformPanel__inner">
                                <div className="platformCopy">
                                    <h3 className="platformCopy__title">
                                        1) Import a dataset and create an <span className="platformCopy__titleAccent">immutable version</span>
                                    </h3>
                                    <div className="platformCopy__lede">Bring images or videos into ML FORGE and lock the dataset before training.</div>
                                    <ul className="platformBullets">
                                        <li className="platformBullets__item">Detect corrupted files and duplicates before they leak into training.</li>
                                        <li className="platformBullets__item">Create deterministic train/val/test splits.</li>
                                        <li className="platformBullets__item">Lock the dataset version so results remain reproducible.</li>
                                    </ul>
                                </div>

                                <div className="platformVisual" aria-hidden="true">
                                    <div className="platformWindow">
                                        <div className="platformWindow__top">
                                            <span className="platformWindow__dot platformWindow__dot--red" />
                                            <span className="platformWindow__dot platformWindow__dot--yellow" />
                                            <span className="platformWindow__dot platformWindow__dot--green" />
                                        </div>
                                        <div className="platformWindow__body">
                                            <div className="platformChart platformChart--dataset">
                                                <div className="platformChart__grid" />
                                                <div className="platformChart__dataset-bars" />
                                                <div className="platformChart__dataset-labels">
                                                    <span className="platformChart__label">Person</span>
                                                    <span className="platformChart__label">Car</span>
                                                    <span className="platformChart__label">Bike</span>
                                                    <span className="platformChart__label">Sign</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="platformPanel platformPanel--train">
                            <div className="platformPanel__inner">
                                <div className="platformCopy">
                                    <h3 className="platformCopy__title">
                                        2) Label with review gates and <span className="platformCopy__titleAccent">approve</span> training-ready annotations
                                    </h3>
                                    <div className="platformCopy__lede">Make labels attributable and auditable — then lock them into the dataset version.</div>
                                    <ul className="platformBullets">
                                        <li className="platformBullets__item">Track label changes across dataset versions.</li>
                                        <li className="platformBullets__item">Use review gates before training to avoid “mystery improvements.”</li>
                                        <li className="platformBullets__item">Keep a clean lineage chain for audits and handoffs.</li>
                                    </ul>
                                </div>

                                <div className="platformVisual" aria-hidden="true">
                                    <div className="platformWindow">
                                        <div className="platformWindow__top">
                                            <span className="platformWindow__dot platformWindow__dot--red" />
                                            <span className="platformWindow__dot platformWindow__dot--yellow" />
                                            <span className="platformWindow__dot platformWindow__dot--green" />
                                        </div>
                                        <div className="platformWindow__body">
                                            <div className="platformChart platformChart--confusion">
                                                <div className="platformChart__grid" />
                                                <div className="platformChart__confusion-matrix" />
                                                <div className="platformChart__confusion-labels">
                                                    <span className="platformChart__matrix-label">Review: Approved</span>
                                                    <span className="platformChart__matrix-label">Version: v1.2.3</span>
                                                    <span className="platformChart__matrix-label">Changes: 14</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="platformPanel platformPanel--logs">
                            <div className="platformPanel__inner">
                                <div className="platformCopy">
                                    <h3 className="platformCopy__title">
                                        3) Train the model with an explicit <span className="platformCopy__titleAccent">config snapshot</span>
                                    </h3>
                                    <div className="platformCopy__lede">Run locally (or on-prem) with full metric visibility and deterministic artifacts.</div>
                                    <ul className="platformBullets">
                                        <li className="platformBullets__item">Track loss + task metrics (mAP, IoU/Dice, accuracy), learning rate, and checkpoints per run.</li>
                                        <li className="platformBullets__item">Capture GPU + environment fingerprint for reproducibility.</li>
                                        <li className="platformBullets__item">Compare runs without guesswork — same dataset version, different config.</li>
                                    </ul>
                                </div>

                                <div className="platformVisual" aria-hidden="true">
                                    <div className="platformWindow">
                                        <div className="platformWindow__top">
                                            <span className="platformWindow__dot platformWindow__dot--red" />
                                            <span className="platformWindow__dot platformWindow__dot--yellow" />
                                            <span className="platformWindow__dot platformWindow__dot--green" />
                                        </div>
                                        <div className="platformWindow__body">
                                            <div className="platformChart platformChart--loss">
                                                <div className="platformChart__grid" />
                                                <div className="platformChart__loss-curve" />
                                                <div className="platformChart__loss-labels">
                                                    <span className="platformChart__axis-label platformChart__axis-label--y">Loss</span>
                                                    <span className="platformChart__axis-label platformChart__axis-label--x">Epoch</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Export and deploy</h2>
                        <p className="sectionHeader__subtitle">Ship vision models to on-prem and edge targets with deterministic bundles.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Export formats</div>
                            <p className="unifyCard__body">ONNX for portability, TensorRT for NVIDIA acceleration, and additional formats for target runtimes.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Bundle everything</div>
                            <p className="unifyCard__body">Model artifact, class map, dataset version, metrics report, and config snapshot travel together.</p>
                        </article>
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Local-first guarantee</div>
                            <p className="unifyCard__body">
                                Runs locally. Your data never leaves your machine. Works on 8–16GB RAM setups for many datasets and experiments (GPU recommended for training).
                            </p>
                        </article>
                    </div>

                    <div className="aboutSplit" style={{ marginTop: '32px' }}>
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">Want the full walkthrough?</h3>
                            <p className="aboutSplit__body">
                                This page is the canonical story. For deeper details on dataset types, export formats, and best practices, use the documentation.
                            </p>
                            <div className="aboutSplit__cta">
                                <a
                                    className="button button--primary"
                                    href="/docs"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs')
                                    }}
                                >
                                    Read documentation
                                </a>
                                <a
                                    className="button button--outline"
                                    href="/download"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/download')
                                    }}
                                >
                                    Download for desktop
                                </a>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Detection</span>
                                <span className="aboutChip">Segmentation</span>
                                <span className="aboutChip">Classification</span>
                                <span className="aboutChip">Local-first</span>
                                <span className="aboutChip">Deterministic</span>
                                <span className="aboutChip">Audit-ready</span>
                                <span className="aboutChip">ONNX</span>
                                <span className="aboutChip">TensorRT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="aboutSection">
                <div className="container">
                    <div className="sectionHeader">
                        <h2 className="sectionHeader__title">Need help?</h2>
                        <p className="sectionHeader__subtitle">Use the docs for step-by-step instructions. These pages map directly to the workflow above.</p>
                    </div>

                    <div className="unifyGrid">
                        <article className="unifyCard">
                            <div className="unifyCard__kicker">1) Dataset</div>
                            <p className="unifyCard__body">How dataset types, validation, splits, and version locks work.</p>
                            <a
                                className="button button--outline"
                                href="/docs/core-workflow/dataset-manager"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs/core-workflow/dataset-manager')
                                }}
                            >
                                Dataset Manager
                            </a>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">2) Label + review</div>
                            <p className="unifyCard__body">Annotation tools, review gates, and approval rules before training.</p>
                            <a
                                className="button button--outline"
                                href="/docs/core-workflow/annotation-studio"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs/core-workflow/annotation-studio')
                                }}
                            >
                                Annotation Studio
                            </a>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">3) Train</div>
                            <p className="unifyCard__body">Training prerequisites, configs, metrics, runs, and reproducibility rules.</p>
                            <a
                                className="button button--outline"
                                href="/docs/core-workflow/training-and-runs"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs/core-workflow/training-and-runs')
                                }}
                            >
                                Training Engine
                            </a>
                        </article>

                        <article className="unifyCard">
                            <div className="unifyCard__kicker">Start here</div>
                            <p className="unifyCard__body">A short end-to-end tutorial you can complete once and reuse forever.</p>
                            <a
                                className="button button--outline"
                                href="/docs/getting-started/first-project"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs/getting-started/first-project')
                                }}
                            >
                                Your first project
                            </a>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default YoloWorkflowPage
