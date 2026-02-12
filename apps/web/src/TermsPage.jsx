import './App.css'

function TermsPage() {
    const updated = 'January 7, 2026'

    return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
            <section className="aboutHero" style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker" style={{ color: 'rgba(255,255,255,0.7)' }}>Legal</p>
                    <h1 className="aboutHero__title" style={{ color: '#fff' }}>Terms & Conditions</h1>
                    <p className="aboutHero__subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>Last updated: {updated}</p>
                </div>
            </section>

            <section className="aboutSection" style={{ background: '#000' }}>
                <div className="container" style={{ maxWidth: 920 }}>
                    <div
                        className="unifyCard"
                        style={{
                            padding: 28,
                            background: '#000',
                            border: '1px solid rgba(255,255,255,0.10)',
                            boxShadow: 'none',
                            color: '#fff',
                        }}
                    >
                        <p style={{ marginTop: 0, color: 'rgba(255,255,255,0.8)' }}>
                            These Terms govern your use of ML FORGE, a desktop-first Vision AI IDE for dataset management, annotation, training,
                            evaluation, and export (the “Service”).
                        </p>

                        <h2 style={{ marginTop: 18 }}>1. Agreement</h2>
                        <p>
                            By accessing or using the Service, you agree to these Terms. If you are using the Service on behalf of an
                            organization, you represent that you have authority to bind that organization.
                        </p>

                        <h2>2. Eligibility & Accounts</h2>
                        <p>
                            You must provide accurate information, keep your credentials secure, and promptly notify us of unauthorized use.
                            You are responsible for activities under your account.
                        </p>

                        <h2>3. Acceptable Use</h2>
                        <p>You agree not to misuse the Service. For example, you may not:</p>
                        <ul>
                            <li>Access or attempt to access systems, data, or accounts you are not authorized to access.</li>
                            <li>Disrupt, overload, or probe the Service or its security.</li>
                            <li>Upload, process, or create content that is unlawful, harmful, or infringes third‑party rights.</li>
                            <li>
                                Use the Service to violate privacy laws (including surveillance or biometric rules) or to train models on data you
                                do not have rights to use.
                            </li>
                        </ul>

                        <h2>4. Your Data & Content</h2>
                        <p>
                            You retain ownership of your datasets, labels, models, and other content you provide (“Customer Content”). You
                            represent that you have the rights and permissions necessary to use Customer Content with the Service.
                        </p>

                        <h2>5. Software & Intellectual Property</h2>
                        <p>
                            The Service, including the website, application, and documentation, is owned by ML FORGE and protected by
                            intellectual property laws. Except as explicitly allowed, you may not copy, modify, distribute, sell, lease, or
                            reverse engineer the Service.
                        </p>

                        <h2>6. Subscriptions, Billing & Payments</h2>
                        <p>
                            Paid features may require a subscription. Prices, billing intervals, included limits, and plan terms are described
                            on the pricing page and may change. Payment processing may be handled by a third‑party provider.
                        </p>
                        <p>
                            Unless required by law or stated otherwise for a specific plan, payments are non‑refundable. Enterprise contracts may
                            have separate written terms that override these Terms.
                        </p>

                        <h2>7. Privacy</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                            Our collection and use of personal information is described in our{' '}
                            <a href="/privacy" style={{ color: '#84f7a8', textDecoration: 'underline' }}>Privacy Policy</a>.
                        </p>

                        <h2>8. Third‑Party Services</h2>
                        <p>
                            The Service may integrate with third‑party services (for example: authentication, payment processing, or analytics).
                            Your use of third‑party services is governed by their terms.
                        </p>

                        <h2>9. Availability, Updates & Support</h2>
                        <p>
                            We may modify, update, suspend, or discontinue parts of the Service. We do not guarantee uninterrupted availability.
                            Support and service levels may vary by plan.
                        </p>

                        <h2>10. Disclaimers</h2>
                        <p>
                            The Service is provided “as is” and “as available”. To the maximum extent permitted by law, we disclaim all
                            warranties, including merchantability, fitness for a particular purpose, and non‑infringement.
                        </p>

                        <h2>11. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, ML FORGE will not be liable for indirect, incidental, special,
                            consequential, or punitive damages, or any loss of data, profits, revenues, or business opportunities.
                        </p>

                        <h2>12. Termination</h2>
                        <p>
                            We may suspend or terminate access to the Service if you violate these Terms, if required by law, or to protect the
                            security and integrity of the Service.
                        </p>

                        <h2>13. Changes to These Terms</h2>
                        <p>
                            We may update these Terms from time to time. Continued use of the Service after changes become effective means you
                            accept the updated Terms.
                        </p>

                        <h2>14. Contact</h2>
                        <p>
                            For questions, see our{' '}
                            <a href="/docs" style={{ color: '#84f7a8', textDecoration: 'underline' }}>documentation</a>
                            {' '}or contact support.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default TermsPage
