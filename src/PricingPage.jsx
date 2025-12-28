import './App.css'

function PricingPage({ navigate }) {
    return (
        <>
            <section className="pricingHero">
                <div className="container pricingHero__inner">
                    <p className="pricingHero__kicker">Pricing</p>
                    <h1 className="pricingHero__title">Desktop-first Vision AI. Clear tiers.</h1>
                    <p className="pricingHero__subtitle">No payment flow yet. Request access when you’re ready.</p>
                </div>
            </section>

            <section className="pricingMain">
                <div className="container">
                    <div className="pricingGrid">
                        <article className="pricingCard">
                            <div className="pricingCard__top">
                                <div className="pricingCard__tier">Free</div>
                                <div className="pricingCard__price">$0</div>
                                <div className="pricingCard__note">Local-first workflow for individuals.</div>
                            </div>
                            <ul className="pricingList">
                                <li>Dataset manager + annotation + training</li>
                                <li>Reproducible runs and export pipeline</li>
                                <li>Community support</li>
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
                                <div className="pricingCard__tier">Pro</div>
                                <div className="pricingCard__price">Early access</div>
                                <div className="pricingCard__note">For teams standardizing workflows.</div>
                            </div>
                            <ul className="pricingList">
                                <li>Workspace metadata sync</li>
                                <li>Team templates and audit-ready exports</li>
                                <li>Priority support</li>
                            </ul>
                            <a className="button button--primary" href="#" onClick={(e) => e.preventDefault()}>
                                Request access
                            </a>
                        </article>

                        <article className="pricingCard">
                            <div className="pricingCard__top">
                                <div className="pricingCard__tier">Enterprise</div>
                                <div className="pricingCard__price">Contact</div>
                                <div className="pricingCard__note">Air-gapped installs, offline licensing, compliance.</div>
                            </div>
                            <ul className="pricingList">
                                <li>Offline deployment support</li>
                                <li>Security review and procurement</li>
                                <li>Custom onboarding</li>
                            </ul>
                            <a className="button button--outline" href="#" onClick={(e) => e.preventDefault()}>
                                Talk to us
                            </a>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default PricingPage
