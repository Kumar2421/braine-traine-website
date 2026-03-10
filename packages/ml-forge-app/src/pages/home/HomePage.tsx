import { useNavigate } from 'react-router-dom';
import { HOME_STATS, PAGE_CARDS } from '../../data/mockData';
import { SEO } from '../../utils/SEO';
import './HomePage.css';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <>
            <SEO title="Home" />
            <div className="home">
                {/* Background */}
                <div className="home-grid-bg" />
                <div className="glow-orb glow-1" />
                <div className="glow-orb glow-2" />

                {/* Badge */}
                <div className="hero-badge">
                    <span className="badge-dot" />
                    Model Deployment &amp; Export Center — v2.4
                </div>

                {/* Headline */}
                <h1 className="hero-h1">
                    Industrial-grade AI/ML<br />
                    <span className="hero-gradient">in one platform.</span>
                </h1>

                <p className="hero-sub">
                    From raw data to edge deployment —{' '}
                    <strong className="hero-strong">ML Forge</strong> unifies every step of
                    the ML lifecycle. Zero cloud friction. Maximum reproducibility.
                </p>

                {/* Stats */}
                <div className="stats-row">
                    {HOME_STATS.map((s) => (
                        <div key={s.label} className="stat">
                            <div className="stat-val">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Page Cards */}
                <div className="pages-grid">
                    {PAGE_CARDS.map((card) => (
                        <button
                            key={card.path}
                            className="page-card"
                            style={{
                                '--card-color': card.color,
                                '--card-grad': card.gradient,
                            } as React.CSSProperties}
                            onClick={() => navigate(card.path)}
                        >
                            <div className="card-num" style={{ color: card.color }}>
                                {card.num} — {card.title.split(' ').slice(-2).join(' ')}
                                <span className="card-num-line" style={{ background: card.color }} />
                            </div>

                            <div className="card-icon" style={{ color: card.color }}>
                                <span className="material-symbols-outlined">{card.icon}</span>
                            </div>

                            <h3 className="card-title">{card.title}</h3>
                            <p className="card-desc">{card.desc}</p>

                            <div className="card-tags">
                                {card.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="card-tag"
                                        style={{ borderColor: card.color, color: card.color }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="card-cta" style={{ color: card.color }}>
                                {card.cta}
                                <span className="material-symbols-outlined card-arrow">arrow_forward</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
