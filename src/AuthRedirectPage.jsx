import './App.css'

import { useEffect, useMemo, useState } from 'react'

function AuthRedirectPage({ navigate }) {
    const token = useMemo(() => new URLSearchParams(window.location.search || '').get('token') || '', [])
    const [attempted, setAttempted] = useState(false)

    useEffect(() => {
        if (!token) return
        const t = window.setTimeout(() => {
            setAttempted(true)
        }, 900)

        window.location.href = `braintrain://auth?token=${encodeURIComponent(token)}`

        return () => {
            window.clearTimeout(t)
        }
    }, [token])

    return (
        <>
            <section className="whyHero">
                <div className="container whyHero__inner">
                    <p className="whyHero__kicker">IDE Login</p>
                    <h1 className="whyHero__title">Connecting to BrainTrain…</h1>
                    <p className="whyHero__subtitle">
                        Your browser will hand off to the BrainTrain IDE using a short-lived exchange token.
                    </p>
                </div>
            </section>

            <section className="whyMain">
                <div className="container">
                    <div className="whyGrid">
                        <article className="whyCard">
                            <div className="whyCard__title">Exchange token</div>
                            <div className="whyCard__body">
                                {token ? 'Issued. Attempting deep link…' : 'Missing token. Please restart login from the IDE.'}
                            </div>
                        </article>

                        <article className="whyCard">
                            <div className="whyCard__title">If the IDE is not detected</div>
                            <div className="whyCard__body">
                                {attempted
                                    ? 'BrainTrain IDE not detected. Please install the IDE and try again.'
                                    : 'If the IDE does not open automatically, you may not have it installed yet.'}
                            </div>
                            <div className="dashActions" style={{ marginTop: 12 }}>
                                <a
                                    className="button button--primary"
                                    href="/download"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/download')
                                    }}
                                >
                                    Download IDE
                                </a>
                                <a
                                    className="button button--outline"
                                    href="/login"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/login')
                                    }}
                                >
                                    Back to login
                                </a>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AuthRedirectPage
