import { useMemo, useState } from 'react'
import './App.css'

function AgenticPage() {
    const [activeCenterTab, setActiveCenterTab] = useState('suite')

    const centerTabs = useMemo(
        () => [
            {
                key: 'suite',
                title: 'Suite of development tools',
                icon: 'suite',
                items: [
                    {
                        label: 'AI tool calling',
                        headline: 'AI tool calling.',
                        body: 'Call AI tools and components without friction.',
                        tools: [
                            {
                                name: 'Get data warehouse tables',
                                desc: 'Search the warehouse using multiple strategies and return ranked results.',
                                type: 'Tool',
                            },
                            {
                                name: 'Onboarding expert',
                                desc: 'Draft onboarding emails with the right context, tone, and guardrails.',
                                type: 'Assistant',
                            },
                            {
                                name: 'Compare images',
                                desc: 'Compare two images and return a detailed summary of differences.',
                                type: 'Tool',
                            },
                            {
                                name: 'Send email',
                                desc: 'Send an email with templated content and attachments to approved recipients.',
                                type: 'Tool',
                            },
                        ],
                        code:
                            "# AI Tool\n" +
                            "def get_data_warehouse_tables(search_terms: str) -> 'Markdown':\n" +
                            "    \"\"\"\n" +
                            "    Search for tables on the data warehouse\n" +
                            "    using multiple search strategies and\n" +
                            "    return ranked results.\n" +
                            "\n" +
                            "    Use this tool to find information about\n" +
                            "    past performance like historical financial\n" +
                            "    results, stock volume or even our shipping\n" +
                            "    results.\n" +
                            "\n" +
                            "    Parameters\n" +
                            "    ----------\n" +
                            "    search_terms: str\n" +
                            "\"\"\"\n" +
                            "    ...\n",
                    },
                ],
            },
            {
                key: 'components',
                title: 'Pre-built pluggable agentic components',
                icon: 'components',
                items: [
                    {
                        label: 'Pre-built components',
                        headline: 'Library of pre-built agentic AI tools.',
                        body: 'Enhance your agentic applications with AI tools that can be built, customized, and deployed with a single line of code.',
                        tools: [
                            { name: 'Connectors', desc: 'Plug into data sources and tools using pre-built connectors.', type: 'Tool' },
                            { name: 'Templates', desc: 'Start from proven patterns and extend with your own logic.', type: 'Tool' },
                            { name: 'Evaluations', desc: 'Assess quality and risk using repeatable evaluation workflows.', type: 'Tool' },
                        ],
                        code:
                            'from datarobot import ...\n\n' +
                            '# Compose agents + tools as reusable components\n' +
                            'workflow = build_workflow(\n' +
                            "    tools=['warehouse_search', 'onboarding_expert'],\n" +
                            "    models=['llm', 'predictive_model'],\n" +
                            ')\n',
                    },
                ],
            },
            {
                key: 'deployment',
                title: 'Agentic AI pipeline deployment',
                icon: 'deployment',
                items: [
                    {
                        label: 'Deploy anywhere',
                        headline: 'Effortlessly utilize NVIDIA GPUs & NVIDIA Enterprise AI products.',
                        body: 'Optimize cost, latency and availability by running GPUs on any cloud, on-premise, and hybrid cloud—removing complex setup, tuning, and troubleshooting.',
                        tools: [
                            { name: 'Single-click deployment', desc: 'Quickly deploy agentic applications with consistent quality.', type: 'Tool' },
                            { name: 'Managed infrastructure', desc: 'Focus on building impactful agentic applications not managing resources.', type: 'Tool' },
                            { name: 'Hot swap tools', desc: 'Update tools without breaking pipelines or needing cross-team support.', type: 'Tool' },
                        ],
                        code:
                            "prediction_environment = datarobot.PredictionEnvironment(\n" +
                            "    resource_name='my serverless environment',\n" +
                            "    platform='datarobotServerless',\n" +
                            ")\n\n" +
                            "TEXTGEN_REGISTERED_MODEL_ID = 'your-model-id-here'\n\n" +
                            "registered_model = datarobot.RegisteredModel.get(\n" +
                            "    resource_name='Registered NIM Model',\n" +
                            "    id=TEXTGEN_REGISTERED_MODEL_ID,\n" +
                            ")\n\n" +
                            "deployment = datarobot.Deployment(\n" +
                            "    resource_name='NIM - Llama 3.3 70B',\n" +
                            "    registered_model_version_id=registered_model.version_id,\n" +
                            "    prediction_environment_id=prediction_environment.id,\n" +
                            ")\n",
                    },
                ],
            },
            {
                key: 'governance',
                title: 'Agentic AI governance and observability',
                icon: 'governance',
                items: [
                    {
                        label: 'Govern and monitor',
                        headline: 'Keep your agents running safely and securely.',
                        body: 'Trace and monitor every workflow, input, and output—down to the underlying data—so you can mitigate issues fast and meet compliance requirements.',
                        tools: [
                            { name: 'Bolt-on governance', desc: 'Track and govern any AI app built anywhere with just a few lines of code.', type: 'Tool' },
                            { name: 'Guard models', desc: 'Detect and mitigate misuse, threats, and hallucinations in real time.', type: 'Tool' },
                            { name: 'Audit-ready reports', desc: 'Generate detailed health reports automatically.', type: 'Tool' },
                        ],
                        code:
                            "base_url = 'https://app.datarobot.com/api/v2/deployments/<id>/'\n" +
                            "api_key = os.getenv('DATAROBOT_API_KEY')\n" +
                            "client = OpenAI(base_url=base_url, api_key=api_key)\n\n" +
                            "completion = client.chat.completions.create(\n" +
                            "  model='datarobot-deployed-llm',\n" +
                            "  messages=[\n" +
                            "    {'role':'system','content':'you are a helpful assistant.'},\n" +
                            "    {'role':'user','content':'where is Datarobot HQ\'ed'},\n" +
                            "  ],\n" +
                            ")\n",
                    },
                ],
            },
        ],
        []
    )

    const activeTab = centerTabs.find((t) => t.key === activeCenterTab) || centerTabs[0]
    const activeItem = activeTab.items[0]

    const benefitCards =
        activeCenterTab === 'deployment'
            ? [
                {
                    title: 'Flexible infrastructure support',
                    body: 'Deploy on any cloud, on-premises, or hybrid environment using GPUs, optimizing for latency and cost.',
                },
                {
                    title: 'Simplified deployment',
                    body: 'Use pre-built workflows and managed environments with minimal configuration and consistent quality gates.',
                },
                {
                    title: 'Streamlined operations',
                    body: 'Automatically manage runtimes and scaling while keeping cost, latency, and availability in balance.',
                },
                {
                    title: 'Built in security',
                    body: 'Protect production pipelines with authentication, secrets management, and hardened environments.',
                },
            ]
            : [
                {
                    title: 'Custom metrics',
                    body: 'Track what matters most — like GPU costs or PII risks — by defining your own monitoring metrics.',
                },
                {
                    title: 'Full tracing and lineage',
                    body: 'Trace every output back to its inputs, tools, and decisions for complete auditability while being compatible with open telemetry.',
                },
                {
                    title: 'Service health and data drift',
                    body: 'Monitor for performance degradation and uncover text or location-based data drift in production.',
                },
                {
                    title: 'Automated reporting',
                    body: 'Generate detailed health reports automatically to meet stakeholder and compliance requirements.',
                },
            ]

    const galleryItems = [
        'Find and search',
        'Onboarding expert',
        'Compare images',
        'Create predictive model',
        'Get AI catalog dataset',
        'Offline anomaly detection',
        'Send email',
        'Data preprocessing',
        'Model evaluation',
        'Deploy',
        'Time series forecasting',
        'Text summarization tool',
    ]

    const governanceTopRows = [
        {
            icon: 'vector',
            title: 'Vector database monitoring and updating',
            body: 'Trace how AI responses align with your vector database to identify issues and improve accuracy.',
        },
        {
            icon: 'approval',
            title: 'Approval workflows',
            body: 'Set up custom approval agentic workflows to govern team decisions and ensure smooth operations.',
        },
    ]

    return (
        <>
            <section className="agenticHero" id="agentic-ai">
                <div className="container agenticHero__inner">
                    <p className="agenticHero__kicker">Enterprise AI Suite / AI Platform</p>
                    <h1 className="agenticHero__title">Agentic AI</h1>

                    <div className="agenticHeroLayout">
                        <div className="agenticHeroVisual" aria-hidden="true">
                            <div className="agenticHeroVisual__barcode agenticHeroVisual__barcode--top" />
                            <div className="agenticHeroVisual__barcode agenticHeroVisual__barcode--bottom" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="agenticCenter">
                <div className="container agenticCenter__inner">
                    <div className="agenticCenter__left" aria-label="Agentic AI center navigation">
                        {centerTabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`agenticCenterTab ${tab.key === activeCenterTab ? 'agenticCenterTab--active' : ''}`}
                                onClick={() => setActiveCenterTab(tab.key)}
                            >
                                <span className={`agenticCenterTab__icon agenticCenterTab__icon--${tab.icon}`} aria-hidden="true" />
                                <span className="agenticCenterTab__label">{tab.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="agenticCenter__right">
                        <div className="agenticCenterHeader">
                            <div className={`agenticCenterHeader__icon agenticCenterHeader__icon--${activeTab.icon}`} aria-hidden="true" />
                            <h2 className="agenticCenterHeader__title">{activeTab.title}</h2>
                        </div>
                        <div className="agenticCenterDivider" aria-hidden="true" />

                        <div className="agenticCenterBody">
                            {activeCenterTab === 'governance' && (
                                <div className="agenticGovTop" aria-label="Governance capabilities">
                                    {governanceTopRows.map((row) => (
                                        <div key={row.title} className="agenticGovTopRow">
                                            <div className="agenticGovTopRow__left">
                                                <span
                                                    className={`agenticGovTopRow__icon agenticGovTopRow__icon--${row.icon}`}
                                                    aria-hidden="true"
                                                />
                                                <div className="agenticGovTopRow__title">{row.title}</div>
                                            </div>
                                            <div className="agenticGovTopRow__body">{row.body}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="agenticCenterLead">
                                <strong>{activeItem.headline}</strong> {activeItem.body}
                            </p>

                            {activeCenterTab === 'governance' && (
                                <p className="agenticCenterMonitorLead">
                                    <strong>End-to-end monitoring for agents and tools.</strong> Monitor every agent and tool in production with
                                    detailed metrics tailored to your business&apos; goals.
                                </p>
                            )}

                            <div
                                className={`agenticCenterDemo ${activeCenterTab === 'suite' ? 'agenticCenterDemo--split' : 'agenticCenterDemo--single'}`}
                            >
                                {activeCenterTab === 'suite' && (
                                    <div className="agenticToolList" aria-label="Tool list">
                                        {activeItem.tools.map((tool) => (
                                            <div key={tool.name} className="agenticToolCard">
                                                <div className="agenticToolCard__top">
                                                    <div className="agenticToolCard__name">{tool.name}</div>
                                                    <div className="agenticToolCard__pill">{tool.type}</div>
                                                </div>
                                                <div className="agenticToolCard__desc">{tool.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeCenterTab === 'components' ? (
                                    <div className="agenticGallery" aria-label="Tools gallery">
                                        <div className="agenticGallery__top">Tools gallery</div>
                                        <div className="agenticGallery__grid">
                                            {galleryItems.map((item) => (
                                                <div key={item} className="agenticGallery__card">
                                                    <div className="agenticGallery__name">{item}</div>
                                                    <div className="agenticGallery__pill">Tool</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : activeCenterTab === 'governance' ? (
                                    <div className="agenticTracePanel" aria-label="Tracing preview">
                                        <div className="agenticTracePanel__frame">
                                            <div className="agenticTracePanel__top">Tracing</div>
                                            <div className="agenticTracePanel__body">
                                                <div className="agenticTracePanel__col agenticTracePanel__col--left" />
                                                <div className="agenticTracePanel__col agenticTracePanel__col--mid" />
                                                <div className="agenticTracePanel__col agenticTracePanel__col--right" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`agenticCodePanel ${activeCenterTab === 'suite' ? '' : 'agenticCodePanel--wide'}`}
                                        aria-label="Code preview"
                                    >
                                        <div className="agenticCodePanel__top">
                                            <div className="agenticCodePanel__dot" />
                                            <div className="agenticCodePanel__dot" />
                                            <div className="agenticCodePanel__dot" />
                                            <div className="agenticCodePanel__title">{activeItem.label}</div>
                                        </div>
                                        <pre className="agenticCodePanel__pre">
                                            <code>{activeItem.code}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {activeCenterTab === 'suite' && (
                                <div className="agenticCenterRows" aria-label="Platform capabilities">
                                    <div className="agenticCenterRow">
                                        <div className="agenticCenterRow__left">
                                            <span className="agenticCenterRow__icon agenticCenterRow__icon--open" aria-hidden="true" />
                                            <div className="agenticCenterRow__title">Open architecture</div>
                                        </div>
                                        <div className="agenticCenterRow__body">
                                            Call any LLM or AI tool deployed in DataRobot with authentication from any dev environment.
                                        </div>
                                    </div>

                                    <div className="agenticCenterRow">
                                        <div className="agenticCenterRow__left">
                                            <span className="agenticCenterRow__icon agenticCenterRow__icon--data" aria-hidden="true" />
                                            <div className="agenticCenterRow__title">Data registry</div>
                                        </div>
                                        <div className="agenticCenterRow__body">
                                            Give agents seamless access to datasets, and prepare or transform them as needed.
                                        </div>
                                    </div>

                                    <div className="agenticCenterRow">
                                        <div className="agenticCenterRow__left">
                                            <span className="agenticCenterRow__icon agenticCenterRow__icon--tool" aria-hidden="true" />
                                            <div className="agenticCenterRow__title">Tool registry</div>
                                        </div>
                                        <div className="agenticCenterRow__body">
                                            Easily manage and version control AI tools by storing them in a single team accessible repository.
                                        </div>
                                    </div>

                                    <div className="agenticCenterRow">
                                        <div className="agenticCenterRow__left">
                                            <span className="agenticCenterRow__icon agenticCenterRow__icon--vector" aria-hidden="true" />
                                            <div className="agenticCenterRow__title">Vector store</div>
                                        </div>
                                        <div className="agenticCenterRow__body">
                                            Power RAG workflows with vector databases, embedding models, and re-rankers.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeCenterTab === 'components' && (
                                <div className="agenticCenterRows" aria-label="Component capabilities">
                                    <div className="agenticCenterRow">
                                        <div className="agenticCenterRow__left">
                                            <span className="agenticCenterRow__icon agenticCenterRow__icon--open" aria-hidden="true" />
                                            <div className="agenticCenterRow__title">Chat securely with data sources</div>
                                        </div>
                                        <div className="agenticCenterRow__body">
                                            Query and analyze across sources, tables, and warehouses in a self-service way.
                                        </div>
                                    </div>
                                    <div className="agenticCenterRow">
                                        <div className="agenticCenterRow__left">
                                            <span className="agenticCenterRow__icon agenticCenterRow__icon--data" aria-hidden="true" />
                                            <div className="agenticCenterRow__title">Incorporate forecasts</div>
                                        </div>
                                        <div className="agenticCenterRow__body">
                                            Bring time series predictions into apps with automated summaries and monitoring.
                                        </div>
                                    </div>
                                    <div className="agenticCenterRow">
                                        <div className="agenticCenterRow__left">
                                            <span className="agenticCenterRow__icon agenticCenterRow__icon--tool" aria-hidden="true" />
                                            <div className="agenticCenterRow__title">Generate personalized content</div>
                                        </div>
                                        <div className="agenticCenterRow__body">
                                            Turn outputs into emails or customer-facing responses with templates and controls.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(activeCenterTab === 'deployment' || activeCenterTab === 'governance') && (
                                <div className="agenticBenefitGrid" aria-label="Benefits">
                                    {benefitCards.map((benefit) => (
                                        <article key={benefit.title} className="agenticBenefit">
                                            <div className="agenticBenefit__title">{benefit.title}</div>
                                            <div className="agenticBenefit__body">{benefit.body}</div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="differenceSection">
                <div className="container">
                    <h2 className="differenceSection__title">The DataRobot difference</h2>

                    <div className="agenticGrid">
                        <article className="agenticCard">
                            <div className="diffIcon" aria-hidden="true" />
                            <h3 className="agenticCard__title">Foundational agents</h3>
                            <p className="agenticCard__body">
                                Agents that are easy to stand up and infuse into your organization's specific processes and systems.
                            </p>
                        </article>

                        <article className="agenticCard agenticCard--withBadge">
                            <div className="agenticCard__badge">
                                <span className="badge">SAP</span>
                                <span className="badgeText">Co-developed for SAP</span>
                            </div>
                            <div className="diffIcon" aria-hidden="true" />
                            <h3 className="agenticCard__title">Business agents</h3>
                            <p className="agenticCard__body">
                                Integrations, data models and UIs that make it easy to build and integrate your own agents into your tools.
                            </p>
                            <p className="agenticCard__fineprint">
                                The exclusive agentic AI partner fully certified to run inside the SAP ecosystem.
                            </p>
                        </article>

                        <article className="agenticCard">
                            <div className="diffIcon" aria-hidden="true" />
                            <h3 className="agenticCard__title">Purpose-built agents</h3>
                            <p className="agenticCard__body">
                                Service-led delivery of agents, built and managed to help you quickly create a full agentic workforce.
                            </p>
                        </article>

                        <article className="agenticWide">
                            <div className="agenticWide__top">
                                <div>
                                    <h3 className="agenticWide__title">Agent Workforce Platform</h3>
                                    <p className="agenticWide__subtitle">
                                        The only end-to-end agent workforce platform for secure, scalable, production-grade agents.
                                    </p>
                                </div>
                                <div className="agenticWide__logos" aria-label="Partner logos">
                                    <span className="badge">NVIDIA</span>
                                    <span className="badgeText">Co-engineered with NVIDIA</span>
                                </div>
                            </div>
                            <div className="barcodeAccent" aria-hidden="true" />
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AgenticPage
