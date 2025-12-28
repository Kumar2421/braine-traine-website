import './App.css'

function WhyPage() {
    return (
        <>
            <section className="whyHero">
                <div className="container whyHero__inner">
                    <p className="whyHero__kicker">Why BrainTrain</p>
                    <h1 className="whyHero__title">A trust layer for local Vision AI.</h1>
                    <p className="whyHero__subtitle">
                        Engineer-to-engineer: deterministic workflows, artifact lineage, and zero cloud lock-in by default.
                    </p>
                </div>
            </section>

            <section className="whyMain">
                <div className="container">
                    <div className="whyGrid">
                        <article className="whyCard">
                            <div className="whyCard__title">Local-first Vision AI</div>
                            <div className="whyCard__body">Train and evaluate on your machines. Operates offline. Your data stays with you.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">Deterministic training</div>
                            <div className="whyCard__body">Explicit configs, locked inputs, repeatable runs. No hidden state.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">Full artifact lineage</div>
                            <div className="whyCard__body">Every export stays tied to config, data snapshot, metrics, and the exact run.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">No cloud lock-in</div>
                            <div className="whyCard__body">The website is a control plane and distribution hub, not your training runtime.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">IDE-native workflows</div>
                            <div className="whyCard__body">Datasets → annotate → lock → train → evaluate → export, inside one tool.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">Built for regulated environments</div>
                            <div className="whyCard__body">Auditability, reproducibility, and offline deployment paths for real operations.</div>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default WhyPage
