import './App.css'

function SecurityPage() {
    return (
        <>
            <section className="whyHero">
                <div className="container whyHero__inner">
                    <p className="whyHero__kicker">Security &amp; Privacy</p>
                    <h1 className="whyHero__title">Offline-first, by design.</h1>
                    <p className="whyHero__subtitle">BrainTrain’s website is a control plane. Execution stays on your machines.</p>
                </div>
            </section>

            <section className="whyMain">
                <div className="container">
                    <div className="whyGrid">
                        <article className="whyCard">
                            <div className="whyCard__title">Offline-first guarantee</div>
                            <div className="whyCard__body">The IDE runs locally and can operate offline. The website never becomes your runtime.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">No dataset uploads</div>
                            <div className="whyCard__body">No images, videos, or datasets are uploaded to BrainTrain’s website.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">No cloud inference</div>
                            <div className="whyCard__body">Inference does not run on BrainTrain servers. Deployments remain your responsibility.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">No cloud training</div>
                            <div className="whyCard__body">Training runs on your workstation or on-prem systems. The website does not expose training endpoints.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">License = metadata only</div>
                            <div className="whyCard__body">Licenses are control-plane artifacts: tier, expiry, and offline signature metadata for the IDE.</div>
                        </article>
                        <article className="whyCard">
                            <div className="whyCard__title">Deterministic ML philosophy</div>
                            <div className="whyCard__body">Explicit configs, locked inputs, repeatable runs. Audit-ready artifacts are first-class.</div>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SecurityPage
