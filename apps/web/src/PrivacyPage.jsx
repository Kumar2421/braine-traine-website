import './App.css'

function PrivacyPage() {
    const updated = 'January 7, 2026'

    return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
            <section className="aboutHero" style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker" style={{ color: 'rgba(255,255,255,0.7)' }}>Legal</p>
                    <h1 className="aboutHero__title" style={{ color: '#fff' }}>Privacy Policy</h1>
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
                            This Privacy Policy explains how ML FORGE collects, uses, and protects personal information when you use our website
                            and application (the “Service”).
                        </p>

                        <h2 style={{ marginTop: 18 }}>1. Information We Collect</h2>
                        <ul>
                            <li>Account data (email, name, authentication identifiers, basic profile metadata).</li>
                            <li>Security and audit data (login events, device/browser info, IP address, and administrative actions).</li>
                            <li>Usage data (feature usage, app performance metrics, and product analytics).</li>
                            <li>
                                Billing metadata (subscription status, plan identifiers, payment/order references). Payments may be processed by a
                                third‑party provider and we do not store full card details.
                            </li>
                        </ul>

                        <h2>2. How We Use Information</h2>
                        <ul>
                            <li>To provide, maintain, and improve the Service.</li>
                            <li>To authenticate users, secure accounts, prevent abuse, and enforce policies.</li>
                            <li>To provide support and send service communications (password resets, critical updates).</li>
                            <li>To comply with legal obligations and resolve disputes.</li>
                        </ul>

                        <h2>3. Sharing & Processors</h2>
                        <p>
                            We may share information with trusted processors strictly to operate the Service (for example: authentication,
                            database hosting, and payment processing), and as required by law.
                        </p>

                        <h2>4. Data Retention</h2>
                        <p>
                            We retain personal data for as long as needed to provide the Service, comply with legal obligations, and enforce our
                            agreements. Retention may vary by data type.
                        </p>

                        <h2>5. Security</h2>
                        <p>
                            We use reasonable technical and organizational measures to protect your data. No method of transmission or storage
                            is 100% secure.
                        </p>

                        <h2>6. Your Rights</h2>
                        <p>
                            Depending on your location, you may have rights to access, correct, delete, or export your data, and to object to or
                            restrict certain processing.
                        </p>

                        <h2>7. Changes</h2>
                        <p>
                            We may update this Privacy Policy from time to time. Continued use of the Service after changes become effective
                            means you accept the updated policy.
                        </p>

                        <h2>8. Contact</h2>
                        <p>
                            For privacy questions, contact support. You can also review our{' '}
                            <a href="/terms" style={{ color: '#84f7a8', textDecoration: 'underline' }}>Terms & Conditions</a>
                            {' '}and our{' '}
                            <a href="/docs" style={{ color: '#84f7a8', textDecoration: 'underline' }}>documentation</a>.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PrivacyPage
