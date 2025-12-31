import './App.css'

function PricingPage({ navigate }) {
    return (
        <>
            <section className="pricingHero">
                <div className="container pricingHero__inner">
                    <p className="pricingHero__kicker">PRICING</p>
                    <h1 className="pricingHero__title">Desktop-first Vision AI. Clear tiers.</h1>
                </div>

                <div className="pricingHeroBand">
                    <div className="container pricingHeroBand__inner">
                        <div className="pricingHeroBand__copy">
                            <p className="pricingHeroBand__text">
                                Try the full pipeline for free. Upgrade to unlock advanced features progressively. <strong>No gotchas — limitations are explicit.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pricingMain">
                <div className="container">
                    <div className="pricingGrid pricingGrid--four">
                        <article className="pricingCard">
                            <div className="pricingCard__top">
                                <div className="pricingCard__tier">Free — Explore</div>
                                <div className="pricingCard__price">$0</div>
                                <div className="pricingCard__note">Build, label, and train locally — evaluate ML FORGE before committing.</div>
                            </div>
                            <ul className="pricingList">
                                <li>✅ Model Zoo access (most pre-trained models)</li>
                                <li>✅ Dataset Manager (full core access)</li>
                                <li>✅ Annotation Studio (basic tools)</li>
                                <li>✅ Basic augmentations</li>
                                <li>✅ Training access (small & medium models)</li>
                                <li>✅ Inference execution allowed</li>
                                <li className="pricingList__limitation">❌ Face dataset conversion</li>
                                <li className="pricingList__limitation">❌ Advanced augmentations</li>
                                <li className="pricingList__limitation">❌ Export formats</li>
                                <li className="pricingList__limitation">❌ benchmarking</li>
                            </ul>
                            <a
                                className="button button--outline"
                                href="/download"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/download')
                                }}
                            >
                                Download
                            </a>
                        </article>

                        <article className="pricingCard pricingCard--highlight">
                            <div className="pricingCard__top">
                                <div className="pricingCard__tier">Data Pro — Prepare</div>
                                <div className="pricingCard__price">Early access</div>
                                <div className="pricingCard__note">Advanced dataset preparation and transformation for serious projects.</div>
                            </div>
                            <ul className="pricingList">
                                <li>✅ Everything in Free</li>
                                <li>✅ Full Dataset Manager</li>
                                <li>✅ Face recognition dataset creation</li>
                                <li>✅ Full augmentation suite</li>
                                <li>✅ Advanced preprocessing tools</li>
                                <li>✅ Dataset version locking</li>
                                <li className="pricingList__limitation">❌ Advanced training (auto-tuning)</li>
                                <li className="pricingList__limitation">❌ Full benchmarking</li>
                                <li className="pricingList__limitation">❌ Export & deployment</li>
                            </ul>
                            <div className="button button--primary button--disabled">
                                Coming soon
                            </div>
                        </article>

                        <article className="pricingCard">
                            <div className="pricingCard__top">
                                <div className="pricingCard__tier">Train Pro — Build</div>
                                <div className="pricingCard__price">comming soon</div>
                                <div className="pricingCard__note">Train, tune, and analyze models with full visibility and logs.</div>
                            </div>
                            <ul className="pricingList">
                                <li>✅ Everything in Data Pro</li>
                                <li>✅ Full Annotation Studio</li>
                                <li>✅ Review & approval workflows</li>
                                <li>✅ Team collaboration</li>
                                <li>✅ Advanced training engine</li>
                                <li>✅ Auto-tuning</li>
                                <li>✅ Shared GPU access</li>
                                <li>✅ Full training logs</li>
                                <li>✅ Full inference visibility</li>
                                <li className="pricingList__limitation">❌ Limited export formats</li>
                                <li className="pricingList__limitation">❌ Limited benchmarking presets</li>
                            </ul>
                            <div className="button button--outline button--disabled">
                                Coming soon
                            </div>
                        </article>

                        <article className="pricingCard pricingCard--premium">
                            <div className="pricingCard__top">
                                <div className="pricingCard__tier">Deploy Pro — Ship</div>
                                <div className="pricingCard__price">Early access</div>
                                <div className="pricingCard__note">Production-grade export, benchmarking, and deployment.</div>
                            </div>
                            <ul className="pricingList">
                                <li>✅ Everything unlocked</li>
                                <li>✅ Full export formats (ONNX, TensorRT, CoreML, etc.)</li>
                                <li>✅ Full inference & benchmarking</li>
                                <li>✅ Edge, on-prem, offline deployment</li>
                                <li>✅ Full audit logs</li>
                                <li>✅ Priority GPU scheduling</li>
                            </ul>
                            <div className="button button--primary button--disabled">
                                Coming soon
                            </div>
                        </article>
                    </div>

                    <div className="pricingComparison">
                        <h2 className="pricingComparison__title">Feature Comparison</h2>
                        <p className="pricingComparison__subtitle">See what's included in each plan. Upgrade messaging is clear — no surprises.</p>

                        <div className="pricingTableWrapper">
                            <div className="pricingTable">
                                <div className="pricingTable__head">
                                    <div className="pricingTable__cell">Feature</div>
                                    <div className="pricingTable__cell">Free</div>
                                    <div className="pricingTable__cell">Data Pro</div>
                                    <div className="pricingTable__cell">Train Pro</div>
                                    <div className="pricingTable__cell">Deploy Pro</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Model Zoo</div>
                                    <div className="pricingTable__cell" data-label="Free">✅ Most models</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">✅ Most models</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅ All models</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ All models</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Dataset Manager</div>
                                    <div className="pricingTable__cell" data-label="Free">✅ Core access</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">✅ Full access</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅ Full access</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ Full access</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Face Dataset Conversion</div>
                                    <div className="pricingTable__cell" data-label="Free">❌</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">✅</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Annotation Tools</div>
                                    <div className="pricingTable__cell" data-label="Free">✅ Basic</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">Full + Review</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅ Full + Review</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ Full + Review</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Training</div>
                                    <div className="pricingTable__cell" data-label="Free">✅ Small/Medium</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">✅ Small/Medium</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅ All + Auto-tune</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ All + Auto-tune</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Inference Visibility</div>
                                    <div className="pricingTable__cell" data-label="Free">Basic</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">⚠️ Limited
                                    </div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅ Full</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ Full</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Training Logs</div>
                                    <div className="pricingTable__cell" data-label="Free">✅ Basic</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">✅ Basic</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅ Full</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ Full</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Export Formats</div>
                                    <div className="pricingTable__cell" data-label="Free">❌</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">❌</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">⚠️ Limited</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ All formats</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Benchmarking</div>
                                    <div className="pricingTable__cell" data-label="Free">❌</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">❌</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">⚠️ Limited</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ Full</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Team Collaboration</div>
                                    <div className="pricingTable__cell" data-label="Free">❌</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">✅</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">✅</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅</div>
                                </div>

                                <div className="pricingTable__row">
                                    <div className="pricingTable__cell pricingTable__cell--label">Deployment</div>
                                    <div className="pricingTable__cell" data-label="Free">❌</div>
                                    <div className="pricingTable__cell" data-label="Data Pro">❌</div>
                                    <div className="pricingTable__cell" data-label="Train Pro">❌</div>
                                    <div className="pricingTable__cell" data-label="Deploy Pro">✅ Edge/On-prem</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pricingUpgrade">
                        <h2 className="pricingUpgrade__title">
                            Clear upgrade path for teams who <span className="pricingUpgrade__titleMuted">cannot afford</span>
                            <br />
                            <span className="pricingUpgrade__titleMuted">silent failures</span>
                        </h2>
                        <div className="pricingUpgrade__grid">
                            <article className="pricingUpgrade__card">
                                <div className="pricingUpgrade__cardTitle">Run inference, upgrade to use benchmarks</div>
                                <div className="pricingUpgrade__cardBody">Inference executes in Free tier , Upgrade to Train Pro use benchmarks</div>
                                <div className="pricingUpgrade__cardBrand">Free → Train Pro</div>
                                <div className="pricingUpgrade__cardBar" aria-hidden="true" />
                            </article>
                            <article className="pricingUpgrade__card">
                                <div className="pricingUpgrade__cardTitle">Prepare datasets faster with Data Pro</div>
                                <div className="pricingUpgrade__cardBody">Unlock face recognition dataset conversion, advanced augmentations, and full preprocessing tools.</div>
                                <div className="pricingUpgrade__cardBrand">Free → Data Pro</div>
                                <div className="pricingUpgrade__cardBar" aria-hidden="true" />
                            </article>
                            <article className="pricingUpgrade__card">
                                <div className="pricingUpgrade__cardTitle">Unlock auto-tuning in Train Pro</div>
                                <div className="pricingUpgrade__cardBody">Access all models, auto-tuning, team collaboration, and full training logs for serious workflows.</div>
                                <div className="pricingUpgrade__cardBrand">Data Pro → Train Pro</div>
                                <div className="pricingUpgrade__cardBar" aria-hidden="true" />
                            </article>
                            <article className="pricingUpgrade__card">
                                <div className="pricingUpgrade__cardTitle">Ship models with Deploy Pro</div>
                                <div className="pricingUpgrade__cardBody">Export to production formats, run full benchmarks, and deploy to edge or on-prem environments.</div>
                                <div className="pricingUpgrade__cardBrand">Train Pro → Deploy Pro</div>
                                <div className="pricingUpgrade__cardBar" aria-hidden="true" />
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default PricingPage
