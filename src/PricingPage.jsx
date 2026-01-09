import './App.css'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { getPricingPlans, getUserSubscriptionSummary, formatPriceWithInterval } from './utils/razorpayApi'
import { useToast } from './utils/toast'
import { LoadingSpinner } from './components/LoadingSpinner'

function PricingPage({ navigate }) {
    const toast = useToast()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [plans, setPlans] = useState([])
    const [subscriptionSummary, setSubscriptionSummary] = useState(null)
    const [billingInterval, setBillingInterval] = useState('monthly') // 'monthly' or 'yearly'
    const [processingPlan, setProcessingPlan] = useState(null)

    useEffect(() => {
        const loadSession = async () => {
            const { data } = await supabase.auth.getSession()
            setSession(data?.session)
        }
        loadSession()
        loadPricingData()
    }, [])

    const loadPricingData = async () => {
        setLoading(true)
        try {
            const [plansResult, summaryResult] = await Promise.all([
                getPricingPlans(),
                getUserSubscriptionSummary(),
            ])

            if (plansResult.data) {
                // Show all plans except enterprise, include free
                setPlans(plansResult.data.filter(p => p.plan_key !== 'enterprise'))
            } else {
                // Fallback: Use default plans if database doesn't have them yet
                setPlans([
                    {
                        plan_id: '1',
                        plan_key: 'free',
                        plan_name: 'Free — Explore',
                        description: 'Build, label, and train locally — evaluate ML FORGE before committing.',
                        price_monthly: 0,
                        price_yearly: 0,
                        features: [
                            'Model Zoo access (most pre-trained models)',
                            'Dataset Manager (full core access)',
                            'Annotation Studio (basic tools)',
                            'Basic augmentations',
                            'Training access (small & medium models)',
                            'Inference execution allowed'
                        ],
                        limitations: [
                            'Face dataset conversion',
                            'Advanced augmentations',
                            'Export formats',
                            'Benchmarking'
                        ]
                    },
                    {
                        plan_id: '2',
                        plan_key: 'data_pro',
                        plan_name: 'Data Pro — Prepare',
                        description: 'Advanced dataset preparation and transformation for serious projects.',
                        price_monthly: 4900,
                        price_yearly: 49000,
                        features: [
                            'Everything in Free',
                            'Full Dataset Manager',
                            'Face recognition dataset creation',
                            'Full augmentation suite',
                            'Advanced preprocessing tools',
                            'Dataset version locking'
                        ],
                        limitations: [
                            'Advanced training (auto-tuning)',
                            'Full benchmarking',
                            'Export & deployment'
                        ]
                    },
                    {
                        plan_id: '3',
                        plan_key: 'train_pro',
                        plan_name: 'Train Pro — Build',
                        description: 'Train, tune, and analyze models with full visibility and logs.',
                        price_monthly: 9900,
                        price_yearly: 99000,
                        features: [
                            'Everything in Data Pro',
                            'Full Annotation Studio',
                            'Review & approval workflows',
                            'Team collaboration',
                            'Advanced training engine',
                            'Auto-tuning',
                            'Shared GPU access',
                            'Full training logs',
                            'Full inference visibility'
                        ],
                        limitations: [
                            'Limited export formats',
                            'Limited benchmarking presets'
                        ]
                    },
                    {
                        plan_id: '4',
                        plan_key: 'deploy_pro',
                        plan_name: 'Deploy Pro — Ship',
                        description: 'Production-grade export, benchmarking, and deployment.',
                        price_monthly: 19900,
                        price_yearly: 199000,
                        features: [
                            'Everything unlocked',
                            'Full export formats (ONNX, TensorRT, CoreML, etc.)',
                            'Full inference & benchmarking',
                            'Edge, on-prem, offline deployment',
                            'Full audit logs',
                            'Priority GPU scheduling'
                        ],
                        limitations: []
                    }
                ])
            }
            if (summaryResult.data) {
                setSubscriptionSummary(summaryResult.data)
            }
        } catch (error) {
            console.error('Error loading pricing data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectPricing = (planKey) => {
        // Check if user is logged in
        if (!session) {
            toast.error('Please log in to continue')
            navigate(`/login?next=${encodeURIComponent(`/pricing?plan=${planKey}&interval=${billingInterval}`)}`)
            return
        }
        // Navigate to checkout page with plan selection
        navigate(`/checkout?plan=${planKey}&interval=${billingInterval}`)
    }

    const getPlanPrice = (plan) => {
        if (plan.plan_key === 'free') return '$0'
        const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly
        if (price === null || price === undefined) return 'Contact Sales'
        return formatPriceWithInterval(price, billingInterval)
    }

    const isCurrentPlan = (planKey) => {
        return subscriptionSummary?.plan_type === planKey && subscriptionSummary?.subscription_status === 'active'
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <LoadingSpinner />
            </div>
        )
    }
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
                                Start free and validate your local workflow. Upgrade only when you need deeper data prep, training control, or production exports.
                                <strong>No gotchas — limitations are explicit.</strong>
                                Typical workflow: train and deploy a YOLO model locally. NVIDIA GPU recommended for training; CPU-only is supported (slower).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pricingMain">
                <div className="container">
                    {/* Billing Interval Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', gap: '12px' }}>
                        <button
                            className={`button ${billingInterval === 'monthly' ? 'button--primary' : 'button--outline'}`}
                            onClick={() => setBillingInterval('monthly')}
                            style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                            Monthly
                        </button>
                        <button
                            className={`button ${billingInterval === 'yearly' ? 'button--primary' : 'button--outline'}`}
                            onClick={() => setBillingInterval('yearly')}
                            style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                            Yearly <span style={{ fontSize: '12px', opacity: 0.8 }}>(Save 17%)</span>
                        </button>
                    </div>

                    <div className="pricingGrid pricingGrid--four">
                        {plans.length > 0 ? plans.map((plan) => {
                            const isCurrent = isCurrentPlan(plan.plan_key)
                            const isFree = plan.plan_key === 'free'
                            const isHighlight = plan.plan_key === 'data_pro'
                            const isPremium = plan.plan_key === 'deploy_pro'

                            return (
                                <article
                                    key={plan.plan_id}
                                    className={`pricingCard ${isHighlight ? 'pricingCard--highlight' : ''} ${isPremium ? 'pricingCard--premium' : ''}`}
                                >
                                    <div className="pricingCard__top">
                                        <div className="pricingCard__tier">{plan.plan_name}</div>
                                        <div className="pricingCard__price">{getPlanPrice(plan)}</div>
                                        <div className="pricingCard__note">{plan.description}</div>
                                    </div>
                                    <ul className="pricingList">
                                        {plan.features && Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                                            <li key={idx}>✅ {feature}</li>
                                        ))}
                                        {plan.limitations && Array.isArray(plan.limitations) && plan.limitations.map((limitation, idx) => (
                                            <li key={idx} className="pricingList__limitation">❌ {limitation}</li>
                                        ))}
                                    </ul>
                                    {isCurrent ? (
                                        <div className="button button--outline button--disabled">
                                            Current Plan
                                        </div>
                                    ) : (
                                        <button
                                            className="button button--primary"
                                            onClick={() => handleSelectPricing(plan.plan_key)}
                                            disabled={processingPlan === plan.plan_key}
                                        >
                                            {processingPlan === plan.plan_key ? 'Processing...' : 'Choose this plan'}
                                        </button>
                                    )}
                                </article>
                            )
                        }) : (
                            // Fallback display if plans haven't loaded yet
                            <>
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
                                    <button className="button button--primary" onClick={() => handleSelectPricing('free')}>
                                        Choose this plan
                                    </button>
                                </article>

                                <article className="pricingCard pricingCard--highlight">
                                    <div className="pricingCard__top">
                                        <div className="pricingCard__tier">Data Pro — Prepare</div>
                                        <div className="pricingCard__price">$49/month</div>
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
                                    <button className="button button--primary" onClick={() => handleSelectPricing('data_pro')}>
                                        Choose this plan
                                    </button>
                                </article>

                                <article className="pricingCard">
                                    <div className="pricingCard__top">
                                        <div className="pricingCard__tier">Train Pro — Build</div>
                                        <div className="pricingCard__price">$99/month</div>
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
                                    <button className="button button--primary" onClick={() => handleSelectPricing('train_pro')}>
                                        Choose this plan
                                    </button>
                                </article>

                                <article className="pricingCard pricingCard--premium">
                                    <div className="pricingCard__top">
                                        <div className="pricingCard__tier">Deploy Pro — Ship</div>
                                        <div className="pricingCard__price">$199/month</div>
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
                                    <button className="button button--primary" onClick={() => handleSelectPricing('deploy_pro')}>
                                        Choose this plan
                                    </button>
                                </article>
                            </>
                        )}
                    </div>

                    <div className="pricingComparison">
                        <h2 className="pricingComparison__title">Feature Comparison</h2>
                        <p className="pricingComparison__subtitle">See what’s included in each plan. Upgrade when you outgrow your current workflow — no surprises.</p>

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

            <section className="unify unify--dark">
                <div className="container">
                    <h2 className="unifyHeading">Proof-driven pricing</h2>
                    <p className="unifyHeading__subtitle">Choose the tier that matches the stage you are in — then upgrade only when you need deeper control or shipping guarantees.</p>

                    <div className="aboutSplit">
                        <div className="aboutSplit__copy">
                            <h3 className="aboutSplit__title">A typical upgrade story</h3>
                            <p className="aboutSplit__body">
                                Start with a reproducible local workflow. When you need deterministic dataset prep and locking, move to Data Pro. When you need deeper training visibility and tuning, move to Train Pro. When it’s time to ship, Deploy Pro unlocks production exports and benchmarks.
                            </p>
                            <div className="aboutSplit__cta">
                                <button
                                    type="button"
                                    className="button button--primary"
                                    onClick={() => handleSelectPricing('free')}
                                >
                                    Start free
                                </button>
                                <button
                                    type="button"
                                    className="button button--outline"
                                    onClick={() => navigate('/use-cases/yolo')}
                                >
                                    See the workflow
                                </button>
                            </div>
                        </div>
                        <div className="aboutSplit__panel" aria-hidden="true">
                            <div className="aboutChipRow">
                                <span className="aboutChip">Local-first</span>
                                <span className="aboutChip">Deterministic</span>
                                <span className="aboutChip">Dataset locks</span>
                                <span className="aboutChip">Training logs</span>
                                <span className="aboutChip">Benchmarks</span>
                                <span className="aboutChip">Exports</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default PricingPage
