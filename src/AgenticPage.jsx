import { useMemo, useState } from 'react'
import './App.css'

function AgenticPage({ navigate }) {
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
                                desc: 'Search for tables on the data warehouse using multiple search strategies and return ranked results.',
                                type: 'Tool',
                            },
                            {
                                name: 'Onboarding expert',
                                desc: 'Sends an email with the content of body to the recipient defined.',
                                type: 'Assistant',
                            },
                            {
                                name: 'Compare images',
                                desc: 'Compare two images using NVIDIA Cosmos Vision Model and highlight the differences.',
                                type: 'Tool',
                            },
                            {
                                name: 'Send email',
                                desc: 'Sends an email with the content of body to the recipient defined.',
                                type: 'Tool',
                            },
                        ],
                        code:
                            'def get_data_warehouse_tables(search_terms: str) -> Markdown:\n' +
                            '    """\n' +
                            '    Search for tables on the data warehouse using multiple\n' +
                            '    search strategies and return ranked results. Use this tool\n' +
                            '    to find information about past performance like historical\n' +
                            '    financial results, stock volume or even our shipping\n' +
                            '    information.\n' +
                            '\n' +
                            '    Parameters:\n' +
                            '        search_terms: str - Terms to search for in table names\n' +
                            '                          and descriptions.\n' +
                            '    """\n' +
                            '    results = TableSearch().search(search_terms)\n' +
                            '    return Markdown(results.to_markdown())\n',
                    },
                ],
            },
            {
                key: 'components',
                title: 'Pre-built pluggable agentic components',
                icon: 'components',
                items: [
                    {
                        label: 'Dataset Manager',
                        headline: 'Dataset Manager.',
                        body: 'The Dataset Manager is the foundation of BrainTrain. Every model, training run, evaluation, and export begins here.',
                        tools: [
                            { name: 'Import datasets', desc: 'Import raw images and videos. Support multiple task types and models. All dataset operations are explicit, traceable, and reproducible.', type: 'Component', enabled: true },
                            { name: 'Version & validate', desc: 'Review, validate, and version data. Create deterministic splits. Manage classes and identities. Guarantee reproducibility.', type: 'Component', enabled: true },
                            { name: 'Split Manager', desc: 'Create deterministic train / validation / test splits with percentage-based or fixed-size splits. Per-class distribution awareness.', type: 'Component', enabled: true },
                            { name: 'Class Manager', desc: 'Create, rename, merge, or deactivate classes. View class frequency and imbalance. Detect unused or missing classes.', type: 'Component', enabled: true },
                            { name: 'Annotation Studio', desc: 'Label images and videos for Vision AI tasks. Apply consistent annotations. Review and approve changes before training.', type: 'Component', enabled: true },
                            { name: 'Dataset tools', desc: 'Duplicate image detection, corrupted file cleanup, dataset statistics, class distribution analysis. All changes create new dataset versions.', type: 'Component', enabled: true },
                        ],
                        code:
                            '# Dataset Manager Workflow\n' +
                            'from braintrain import DatasetManager\n' +
                            '\n' +
                            '# Import and validate dataset\n' +
                            'dataset = DatasetManager.import(\n' +
                            '    path="./images",\n' +
                            '    task_type="detection"\n' +
                            ')\n' +
                            '\n' +
                            '# Create deterministic splits\n' +
                            'dataset.create_splits(\n' +
                            '    train=0.7,\n' +
                            '    val=0.2,\n' +
                            '    test=0.1\n' +
                            ')\n' +
                            '\n' +
                            '# Lock for training\n' +
                            'version = dataset.lock()\n',
                    },
                ],
            },
            {
                key: 'deployment',
                title: 'Agentic AI pipeline deployment',
                icon: 'deployment',
                items: [
                    {
                        label: 'Training Engine',
                        headline: 'Training Engine.',
                        body: 'Run reproducible Vision AI training with explicit configs, tracked metrics, and immutable artifacts. Training always happens locally or on user-controlled infrastructure.',
                        tools: [
                            { name: 'Model selection', desc: 'Select model architecture (YOLOv5/YOLOv8). Choose task type (Detection/Classification). Model selection determines input requirements and output format.', type: 'Control' },
                            { name: 'GPU monitoring', desc: 'Real-time GPU metrics: utilization, temperature, VRAM usage. CPU fallback support. Hardware transparency prevents silent over-allocation.', type: 'Control' },
                            { name: 'Training config', desc: 'Epochs, batch size, learning rate, optimizer (Adam/SGD), scheduler (Cosine/Step/Linear). All configs are explicit and versioned.', type: 'Control' },
                            { name: 'Live metrics', desc: 'Training loss curve, accuracy/mAP curve, learning rate curve. Real-time updates during training. All metrics tied to dataset version.', type: 'Control' },
                            { name: 'Checkpoints', desc: 'Save every N epochs, keep last N, save best only. All checkpoints are versioned artifacts. Resume training anytime.', type: 'Control' },
                        ],
                        code:
                            '# Training Engine Configuration\n' +
                            'from braintrain import TrainingEngine\n' +
                            '\n' +
                            'engine = TrainingEngine(\n' +
                            '    model="yolov8",\n' +
                            '    dataset_version=dataset.lock(),\n' +
                            '    device="gpu",\n' +
                            '    epochs=100,\n' +
                            '    batch_size=16,\n' +
                            '    learning_rate=0.001,\n' +
                            '    optimizer="adam",\n' +
                            '    scheduler="cosine"\n' +
                            ')\n' +
                            '\n' +
                            '# Run training with live metrics\n' +
                            'run = engine.train()\n',
                    },
                ],
            },
            {
                key: 'evaluation',
                title: 'Evaluation, Export & Deployment',
                icon: 'deployment',
                items: [
                    {
                        label: 'Export & Deployment',
                        headline: 'Export & Deployment.',
                        body: 'Convert trained models into deployment-ready formats for edge devices, servers, mobile apps, and production inference pipelines. All exports are deterministic and tied to model version, dataset snapshot, and training configuration.',
                        tools: [
                            { name: 'Export formats', desc: 'ONNX (universal), TorchScript (PyTorch), TensorRT (NVIDIA GPU), TensorFlow Lite (mobile), CoreML (Apple), OpenVINO (Intel), NCNN (mobile).', type: 'Export' },
                            { name: 'Quantization', desc: 'FP32 (full precision), FP16 (half precision, 2× smaller), INT8 (quantized, smallest size). Accuracy trade-offs clearly shown.', type: 'Export' },
                            { name: 'Evaluation metrics', desc: 'mAP, precision, recall, confusion matrix, per-class metrics. Compare runs with fixed datasets and deterministic metrics.', type: 'Metric' },
                            { name: 'Benchmarking', desc: 'Compare models, runs, and configurations. Track performance evolution. Export benchmark results for compliance.', type: 'Metric' },
                            { name: 'Reproducibility', desc: 'Every export tied to model ID, dataset version, training run, and export configuration. Guarantees deterministic results.', type: 'Export' },
                        ],
                        code:
                            '# Export Model for Deployment\n' +
                            'from braintrain import ExportEngine\n' +
                            '\n' +
                            'export = ExportEngine(\n' +
                            '    model=run.best_checkpoint,\n' +
                            '    format="onnx",\n' +
                            '    precision="fp16",\n' +
                            '    device="cpu",\n' +
                            '    optimize=True\n' +
                            ')\n' +
                            '\n' +
                            '# Generate deployment artifact\n' +
                            'artifact = export.generate()\n' +
                            '# Includes: model, config, class map, dataset version, metrics\n',
                    },
                ],
            },
            {
                key: 'governance',
                title: 'Agentic AI governance and observability',
                icon: 'governance',
                items: [
                    {
                        label: 'Governance & Observability',
                        headline: 'Governance and observability.',
                        body: 'Trace workflows and outputs to ensure safety, quality, and compliance. Training Logs provide a real-time, immutable, and auditable record of everything that happens during training.',
                        tools: [
                            { name: 'Training Logs', desc: 'Real-time, immutable training logs. Capture dataset loading, model initialization, training loop progress, loss/metrics, checkpoints, warnings, and errors.', type: 'Artifact' },
                            { name: 'End-to-end lineage', desc: 'Dataset → Version → Training Run → Metrics → Export tracked end-to-end. Every artifact tied to immutable dataset snapshot and explicit configuration.', type: 'Artifact' },
                            { name: 'Config snapshots', desc: 'Immutable configs captured per run for deterministic reproduction. All training parameters versioned and auditable.', type: 'Artifact' },
                            { name: 'Audit-ready exports', desc: 'Export model artifacts with complete metadata: dataset version, training run ID, config snapshot, metrics, and logs.', type: 'Artifact' },
                            { name: 'Hardware tracking', desc: 'CPU/GPU model, CUDA version, memory usage, library versions logged for full hardware reproducibility.', type: 'Artifact' },
                        ],
                        code:
                            '# Reproducibility Chain\n' +
                            'dataset_version = dataset.lock()\n' +
                            'training_run = engine.train(dataset_version)\n' +
                            'metrics = training_run.evaluate()\n' +
                            'export = ExportEngine(training_run.best_checkpoint)\n' +
                            '\n' +
                            '# Complete lineage tracking\n' +
                            'lineage = {\n' +
                            '    "dataset": dataset_version.id,\n' +
                            '    "run": training_run.id,\n' +
                            '    "config": training_run.config_snapshot,\n' +
                            '    "metrics": metrics,\n' +
                            '    "export": export.artifact_hash\n' +
                            '}\n',
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
                    title: 'Deployment controls',
                    body: 'Manage environments, reliability, and scaling with practical controls.',
                },
                {
                    title: 'Latency and cost',
                    body: 'Optimize cost, latency, and availability across clouds and on-prem.',
                },
                {
                    title: 'Observability',
                    body: 'Understand inputs, outputs, and performance across workflows.',
                },
                {
                    title: 'Production readiness',
                    body: 'Ship pipelines with repeatable configurations and runtime checks.',
                },
            ]
            : activeCenterTab === 'evaluation'
                ? [
                    {
                        title: 'Comparable runs',
                        body: 'Benchmark performance across versions with clear per-class metrics and summaries.',
                    },
                    {
                        title: 'Portable exports',
                        body: 'Export models and metadata for production environments without runtime coupling.',
                    },
                    {
                        title: 'Quantization clarity',
                        body: 'See accuracy vs performance trade-offs explicitly before shipping.',
                    },
                    {
                        title: 'Edge and on-prem',
                        body: 'Ship artifacts for offline deployment with configs and class mappings included.',
                    },
                ]
                : [
                    {
                        title: 'Traceability',
                        body: 'Track inputs, configs, and outputs end-to-end for auditability.',
                    },
                    {
                        title: 'Immutable artifacts',
                        body: 'Keep outputs tied to the exact workflow definition that produced them.',
                    },
                    {
                        title: 'Monitoring',
                        body: 'Monitor every workflow, tool call, and downstream outcome.',
                    },
                    {
                        title: 'Governance',
                        body: 'Meet enterprise security and compliance requirements by design.',
                    },
                ]

    const galleryItems = activeCenterTab === 'components' && activeTab.items[0].tools ? activeTab.items[0].tools : []

    const governanceTopRows = [
        {
            icon: 'vector',
            title: 'Dataset → Version → Training Run → Metrics → Export',
            body: 'Trace every artifact back to an immutable dataset snapshot and explicit configuration.',
        },
        {
            icon: 'approval',
            title: 'Review & lock gates',
            body: 'Freeze datasets before training to keep results reproducible and audit-friendly.',
        },
    ]

    return (
        <>
            <section className="agenticHero" id="agentic-ai">
                <div className="container agenticHero__inner">
                    <p className="agenticHero__kicker">ENTERPRISE AI SUITE / AI PLATFORM</p>
                    <h1 className="agenticHero__title">Agentic AI</h1>
                </div>

                <div className="agenticHeroBand">
                    <div className="container agenticHeroBand__inner">
                        <div className="agenticHeroBand__copy">
                        </div>
                        <div className="agenticHeroBand__visual" aria-hidden="true">
                            <div className="agenticHeroVisual">
                                <div className="agenticHeroVisual__barcode agenticHeroVisual__barcode--top" />
                                <div className="agenticHeroVisual__barcode agenticHeroVisual__barcode--bottom" />
                                <div className="agenticHeroVisual__blocks">
                                    <div className="block block--black" />
                                    <div className="block block--a" />
                                    <div className="block block--black" />
                                    <div className="block block--d" />
                                    <div className="block block--e" />
                                    <div className="block block--f" />
                                    <div className="block block--g" />
                                    <div className="block block--black" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="differenceSection">
                <div className="container">
                    <div className="differenceSection__header">
                        <h2 className="differenceSection__title">The DataRobot difference</h2>
                    </div>

                    <div className="differenceSection__frame">
                        <div className="agenticGrid">
                            <article className="agenticCard">
                                <div className="diffIcon diffIcon--workflow" aria-hidden="true" />
                                <h3 className="agenticCard__title">Develop multi-agent workflows by connecting, building, and managing AI tools</h3>
                                <div className="agenticCard__bodyWrap">
                                    <p className="agenticCard__body">
                                        Leverage LLMs, generative workflows, vector databases, predictive models, and multimodal data using a flexible unified
                                        platform or pre-built components.
                                    </p>
                                </div>
                            </article>

                            <article className="agenticCard">
                                <div className="diffIcon diffIcon--deploy" aria-hidden="true" />
                                <h3 className="agenticCard__title">Deploy complex agentic pipelines anywhere</h3>
                                <div className="agenticCard__bodyWrap">
                                    <p className="agenticCard__body">
                                        Optimize cost, latency, and availability by managing multiple AI tool deployments across clouds or on premise on leading
                                        GPUs without specialized infrastructure skills.
                                    </p>
                                </div>
                            </article>

                            <article className="agenticCard">
                                <div className="diffIcon diffIcon--shield" aria-hidden="true" />
                                <h3 className="agenticCard__title">Ensure safety with enterprise-grade security, monitoring, and governance</h3>
                                <div className="agenticCard__bodyWrap">
                                    <p className="agenticCard__body">
                                        Trace and monitor every workflow, input, and output — down to the underlying data — to ensure production quality and
                                        meet enterprise compliance standards.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section className="agenticCenter">
                <div className="container agenticCenter__inner">
                    <div className="agenticCenter__left" aria-label="Vision AI training navigation">
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

                            {activeCenterTab === 'suite' && (
                                <div className="agenticCenterSection">
                                    <h3 className="agenticCenterSection__title">
                                        Teams that <span className="agenticCenterSection__highlight">build</span> agents
                                    </h3>
                                    <p className="agenticCenterSection__subtitle">Build enterprise-grade agents on your terms.</p>
                                </div>
                            )}
                            <p className="agenticCenterLead">
                                <strong>{activeItem.headline}</strong> {activeItem.body}
                            </p>

                            {activeCenterTab === 'governance' && (
                                <p className="agenticCenterMonitorLead">
                                    <strong>End-to-end lineage for datasets, runs, and exports.</strong> Keep every result traceable to inputs,
                                    configs, and immutable artifacts.
                                </p>
                            )}

                            <div className="agenticDemoFrame">
                                <div
                                    className={`agenticCenterDemo ${activeCenterTab === 'suite' ? 'agenticCenterDemo--split' : 'agenticCenterDemo--single'}`}
                                >
                                    {activeCenterTab === 'suite' && (
                                        <div className="agenticSuiteGrid">
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
                                            <div className="agenticSuiteCharts">
                                                <div className="agenticSuiteChart">
                                                    <div className="agenticSuiteChart__title">API Calls</div>
                                                    <div className="agenticSuiteChart__mini">
                                                        <svg viewBox="0 0 200 80" preserveAspectRatio="none">
                                                            <path d="M 0,70 L 30,65 L 60,55 L 90,45 L 120,40 L 150,35 L 180,30 L 200,28" stroke="rgba(132, 247, 168, 0.8)" strokeWidth="2" fill="none" />
                                                            <path d="M 0,70 L 30,65 L 60,55 L 90,45 L 120,40 L 150,35 L 180,30 L 200,28 L 200,80 L 0,80 Z" fill="rgba(132, 247, 168, 0.1)" />
                                                        </svg>
                                                    </div>
                                                    <div className="agenticSuiteChart__value">1.2M</div>
                                                </div>
                                                <div className="agenticSuiteChart">
                                                    <div className="agenticSuiteChart__title">Tool Usage</div>
                                                    <div className="agenticSuiteChart__mini">
                                                        <svg viewBox="0 0 200 80" preserveAspectRatio="none">
                                                            <rect x="10" y="50" width="25" height="30" fill="rgba(132, 247, 168, 0.6)" />
                                                            <rect x="45" y="40" width="25" height="40" fill="rgba(173, 191, 255, 0.6)" />
                                                            <rect x="80" y="35" width="25" height="45" fill="rgba(255, 214, 67, 0.6)" />
                                                            <rect x="115" y="45" width="25" height="35" fill="rgba(132, 247, 168, 0.6)" />
                                                            <rect x="150" y="30" width="25" height="50" fill="rgba(173, 191, 255, 0.6)" />
                                                            <rect x="185" y="25" width="10" height="55" fill="rgba(255, 214, 67, 0.6)" />
                                                        </svg>
                                                    </div>
                                                    <div className="agenticSuiteChart__value">847</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeCenterTab === 'components' ? (
                                        <div className="agenticGallery" aria-label="Components gallery">
                                            <div className="agenticGallery__header">
                                                <div className="agenticGallery__top">Pre-built components</div>
                                                <button type="button" className="agenticGallery__action">
                                                    View all
                                                </button>
                                            </div>
                                            <div className="agenticGallery__grid">
                                                {galleryItems.map((item, index) => (
                                                    <div key={index} className={`agenticGallery__card ${item.enabled ? 'agenticGallery__card--enabled' : ''}`}>
                                                        <div className="agenticGallery__content">
                                                            <div className="agenticGallery__name">{item.name}</div>
                                                            <div className="agenticGallery__desc">{item.desc}</div>
                                                        </div>
                                                        <div className="agenticGallery__footer">
                                                            <div className="agenticGallery__pill">{item.type}</div>
                                                            {item.enabled && <div className="agenticGallery__check" aria-label="Enabled">✓</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : activeCenterTab === 'governance' ? (
                                        <div className="agenticTracePanel" aria-label="Tracing preview">
                                            <div className="agenticTracePanel__frame">
                                                <div className="agenticTracePanel__top">Training Logs & Lineage</div>
                                                <div className="agenticTracePanel__body">
                                                    <div className="agenticTracePanel__col agenticTracePanel__col--left">
                                                        <div className="agenticTracePanel__list">
                                                            <div className="agenticTracePanel__item agenticTracePanel__item--active">
                                                                <div className="agenticTracePanel__itemStatus">Success</div>
                                                                <div className="agenticTracePanel__itemTime">2025-01-31 16:29:20</div>
                                                                <div className="agenticTracePanel__itemDuration">8.00s</div>
                                                            </div>
                                                            <div className="agenticTracePanel__item">
                                                                <div className="agenticTracePanel__itemStatus">Success</div>
                                                                <div className="agenticTracePanel__itemTime">2025-01-31 16:29:22</div>
                                                                <div className="agenticTracePanel__itemDuration">6.50s</div>
                                                            </div>
                                                            <div className="agenticTracePanel__item">
                                                                <div className="agenticTracePanel__itemStatus">Success</div>
                                                                <div className="agenticTracePanel__itemTime">2025-01-31 16:29:28</div>
                                                                <div className="agenticTracePanel__itemDuration">5.20s</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="agenticTracePanel__col agenticTracePanel__col--mid">
                                                        <div className="agenticTracePanel__timeline">
                                                            <div className="agenticTracePanel__timelineItem">
                                                                <div className="agenticTracePanel__timelineLabel">Dataset Load</div>
                                                                <div className="agenticTracePanel__timelineBar" style={{ width: '15%' }} />
                                                            </div>
                                                            <div className="agenticTracePanel__timelineItem">
                                                                <div className="agenticTracePanel__timelineLabel">Model Init</div>
                                                                <div className="agenticTracePanel__timelineBar" style={{ width: '10%' }} />
                                                            </div>
                                                            <div className="agenticTracePanel__timelineItem">
                                                                <div className="agenticTracePanel__timelineLabel">Training Loop</div>
                                                                <div className="agenticTracePanel__timelineBar" style={{ width: '60%' }} />
                                                            </div>
                                                            <div className="agenticTracePanel__timelineItem">
                                                                <div className="agenticTracePanel__timelineLabel">Checkpoint</div>
                                                                <div className="agenticTracePanel__timelineBar" style={{ width: '15%' }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="agenticTracePanel__col agenticTracePanel__col--right">
                                                        <div className="agenticTracePanel__details">
                                                            <div className="agenticTracePanel__detailTitle">Dataset Version</div>
                                                            <div className="agenticTracePanel__detailValue agenticTracePanel__detailValue--highlight">v1.2.3</div>
                                                            <div className="agenticTracePanel__detailTitle">Config Snapshot</div>
                                                            <div className="agenticTracePanel__detailValue agenticTracePanel__detailValue--highlight">config_20250131_162920</div>
                                                            <div className="agenticTracePanel__detailTitle">Metrics</div>
                                                            <div className="agenticTracePanel__detailValue agenticTracePanel__detailValue--highlight">mAP: 0.892</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : activeCenterTab === 'deployment' ? (
                                        <div className="agenticChartPanel" aria-label="Training metrics chart">
                                            <div className="agenticChartPanel__top">
                                                <div className="agenticChartPanel__title">Training Metrics</div>
                                                <div className="agenticChartPanel__pill">Live</div>
                                            </div>
                                            <div className="agenticChartPanel__chart agenticChartPanel__chart--training">
                                                <div className="agenticChartPanel__yaxis">
                                                    <span>1.0</span>
                                                    <span>0.8</span>
                                                    <span>0.6</span>
                                                    <span>0.4</span>
                                                    <span>0.2</span>
                                                    <span>0.0</span>
                                                </div>
                                                <div className="agenticChartPanel__chartArea">
                                                    <svg className="agenticChartPanel__svg" viewBox="0 0 500 200" preserveAspectRatio="none">
                                                        <defs>
                                                            <linearGradient id="lossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor="rgba(132, 247, 168, 0.4)" />
                                                                <stop offset="50%" stopColor="rgba(132, 247, 168, 0.15)" />
                                                                <stop offset="100%" stopColor="rgba(132, 247, 168, 0.02)" />
                                                            </linearGradient>
                                                            <linearGradient id="mAPGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor="rgba(173, 191, 255, 0.4)" />
                                                                <stop offset="50%" stopColor="rgba(173, 191, 255, 0.15)" />
                                                                <stop offset="100%" stopColor="rgba(173, 191, 255, 0.02)" />
                                                            </linearGradient>
                                                        </defs>
                                                        {/* Grid lines */}
                                                        <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                        <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                        <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                        <line x1="0" y1="160" x2="500" y2="160" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                        {/* Training Loss curve */}
                                                        <path d="M 0,180 L 25,170 L 50,160 L 75,150 L 100,140 L 125,130 L 150,120 L 175,110 L 200,100 L 225,92 L 250,85 L 275,80 L 300,75 L 325,72 L 350,70 L 375,69 L 400,68 L 425,67.5 L 450,67 L 475,66.5 L 500,66 L 500,200 L 0,200 Z" fill="url(#lossGradient)" />
                                                        <path d="M 0,180 L 25,170 L 50,160 L 75,150 L 100,140 L 125,130 L 150,120 L 175,110 L 200,100 L 225,92 L 250,85 L 275,80 L 300,75 L 325,72 L 350,70 L 375,69 L 400,68 L 425,67.5 L 450,67 L 475,66.5 L 500,66" stroke="rgba(132, 247, 168, 1)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                                        {/* mAP curve */}
                                                        <path d="M 0,190 L 25,185 L 50,175 L 75,160 L 100,145 L 125,130 L 150,115 L 175,100 L 200,85 L 225,72 L 250,60 L 275,50 L 300,42 L 325,36 L 350,32 L 375,29 L 400,27 L 425,25.5 L 450,24 L 475,23 L 500,22 L 500,200 L 0,200 Z" fill="url(#mAPGradient)" />
                                                        <path d="M 0,190 L 25,185 L 50,175 L 75,160 L 100,145 L 125,130 L 150,115 L 175,100 L 200,85 L 225,72 L 250,60 L 275,50 L 300,42 L 325,36 L 350,32 L 375,29 L 400,27 L 425,25.5 L 450,24 L 475,23 L 500,22" stroke="rgba(173, 191, 255, 1)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                                        {/* Current point indicators */}
                                                        <circle cx="500" cy="66" r="5" fill="rgba(132, 247, 168, 1)" stroke="rgba(11, 15, 18, 0.8)" strokeWidth="2" />
                                                        <circle cx="500" cy="22" r="5" fill="rgba(173, 191, 255, 1)" stroke="rgba(11, 15, 18, 0.8)" strokeWidth="2" />
                                                    </svg>
                                                    <div className="agenticChartPanel__xaxis">
                                                        <span>0</span>
                                                        <span>20</span>
                                                        <span>40</span>
                                                        <span>60</span>
                                                        <span>80</span>
                                                        <span>100</span>
                                                    </div>
                                                    <div className="agenticChartPanel__legend">
                                                        <div className="agenticChartPanel__legendItem">
                                                            <div className="agenticChartPanel__legendDot agenticChartPanel__legendDot--loss" />
                                                            <span>Training Loss</span>
                                                        </div>
                                                        <div className="agenticChartPanel__legendItem">
                                                            <div className="agenticChartPanel__legendDot agenticChartPanel__legendDot--map" />
                                                            <span>mAP</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="agenticChartPanel__meta">
                                                <div className="agenticChartMetaItem">
                                                    <div className="agenticChartMetaItem__label">Current Epoch</div>
                                                    <div className="agenticChartMetaItem__value">100/100</div>
                                                </div>
                                                <div className="agenticChartMetaItem">
                                                    <div className="agenticChartMetaItem__label">Training Loss</div>
                                                    <div className="agenticChartMetaItem__value">0.068</div>
                                                </div>
                                                <div className="agenticChartMetaItem">
                                                    <div className="agenticChartMetaItem__label">mAP</div>
                                                    <div className="agenticChartMetaItem__value">0.892</div>
                                                </div>
                                                <div className="agenticChartMetaItem">
                                                    <div className="agenticChartMetaItem__label">GPU Utilization</div>
                                                    <div className="agenticChartMetaItem__value">98%</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : activeCenterTab === 'evaluation' ? (
                                        <div className="agenticChartPanel" aria-label="Export formats">
                                            <div className="agenticChartPanel__top">
                                                <div className="agenticChartPanel__title">Export Formats</div>
                                                <div className="agenticChartPanel__pill">Available</div>
                                            </div>
                                            <div className="agenticChartPanel__formats">
                                                <div className="agenticChartFormatCard">
                                                    <div className="agenticChartFormatCard__name">ONNX</div>
                                                    <div className="agenticChartFormatCard__desc">Universal, framework-agnostic format</div>
                                                    <div className="agenticChartFormatCard__tags">
                                                        <span>FP32</span>
                                                        <span>FP16</span>
                                                        <span>INT8</span>
                                                    </div>
                                                </div>
                                                <div className="agenticChartFormatCard">
                                                    <div className="agenticChartFormatCard__name">TensorRT</div>
                                                    <div className="agenticChartFormatCard__desc">NVIDIA GPU-optimized inference</div>
                                                    <div className="agenticChartFormatCard__tags">
                                                        <span>FP32</span>
                                                        <span>FP16</span>
                                                        <span>INT8</span>
                                                    </div>
                                                </div>
                                                <div className="agenticChartFormatCard">
                                                    <div className="agenticChartFormatCard__name">CoreML</div>
                                                    <div className="agenticChartFormatCard__desc">Apple ML framework</div>
                                                    <div className="agenticChartFormatCard__tags">
                                                        <span>FP32</span>
                                                        <span>FP16</span>
                                                        <span>INT8</span>
                                                    </div>
                                                </div>
                                                <div className="agenticChartFormatCard">
                                                    <div className="agenticChartFormatCard__name">TensorFlow Lite</div>
                                                    <div className="agenticChartFormatCard__desc">Mobile and edge devices</div>
                                                    <div className="agenticChartFormatCard__tags">
                                                        <span>FP32</span>
                                                        <span>INT8</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className={`agenticCodePanel ${activeCenterTab === 'suite' ? 'agenticCodePanel--wide' : ''}`} aria-label="Example code">
                                        <div className="agenticCodePanel__top">{activeItem.label}</div>
                                        <pre className="agenticCodePanel__code">
                                            <code>{activeItem.code}</code>
                                        </pre>
                                    </div>
                                </div>
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
                                            Easily manage and version control all of your AI tools by storing them in a single team accessible repository.
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
                                <div className="agenticBenefitGrid" aria-label="Component capabilities">
                                    <article className="agenticBenefit">
                                        <div className="agenticBenefit__icon agenticBenefit__icon--chat" aria-hidden="true" />
                                        <div className="agenticBenefit__title">Chat securely with data sources</div>
                                        <div className="agenticBenefit__body">Empower data decision makers to query and analyze data across data sources, tables, or data warehouses in a self-service way.</div>
                                    </article>
                                    <article className="agenticBenefit">
                                        <div className="agenticBenefit__icon agenticBenefit__icon--forecast" aria-hidden="true" />
                                        <div className="agenticBenefit__title">Incorporate high fidelity forecasts</div>
                                        <div className="agenticBenefit__body">Incorporate time series predictions into your agentic AI apps with automatically generated summaries.</div>
                                    </article>
                                    <article className="agenticBenefit">
                                        <div className="agenticBenefit__icon agenticBenefit__icon--content" aria-hidden="true" />
                                        <div className="agenticBenefit__title">Generate personalized content</div>
                                        <div className="agenticBenefit__body">Give your agents the ability to turn outputs or predictions into usable emails or personalized customer-facing content.</div>
                                    </article>
                                </div>
                            )}

                            {(activeCenterTab === 'deployment' || activeCenterTab === 'governance' || activeCenterTab === 'evaluation') && (
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

        </>
    )
}

export default AgenticPage
