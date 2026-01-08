import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

function AgenticPage({ navigate }) {
    const [activeSection, setActiveSection] = useState('suite')
    const observerRef = useRef(null)
    const rightColRef = useRef(null)

    const centerTabs = useMemo(
        () => [
            {
                key: 'suite',
                title: 'Suite of development tools',
                icon: 'suite',
                items: [
                    {
                        label: 'Agent Blueprint',
                        headline: 'Vision AI Workflow.',
                        body: 'Complete end-to-end pipeline for building, training, and deploying Vision AI models with full reproducibility and traceability. Use the desktop UI or automation hooks when you need them.',
                        tools: [
                            {
                                name: 'Dataset Management',
                                desc: 'Import, version, validate, and manage image and video datasets. Create deterministic splits, manage classes, and ensure reproducibility.',
                                type: 'Component',
                            },
                            {
                                name: 'Annotation Studio',
                                desc: 'Label images and videos with review-gated changes. Full annotation history and dataset version safety.',
                                type: 'Component',
                            },
                            {
                                name: 'Training Engine',
                                desc: 'Run reproducible Vision AI training with explicit configs, tracked metrics, and immutable artifacts.',
                                type: 'Component',
                            },
                            {
                                name: 'Export & Deployment',
                                desc: 'Convert trained models into deployment-ready formats: ONNX, TensorRT, CoreML, TensorFlow Lite, and more.',
                                type: 'Component',
                            },
                        ],
                        code:
                            'agent_blueprint:\n' +
                            '  name: vision-ai-build-and-ship\n' +
                            '  objective: "Train and deploy a Vision AI model with deterministic artifacts"\n' +
                            '  tools:\n' +
                            '    - dataset_manager\n' +
                            '    - annotation_studio\n' +
                            '    - training_engine\n' +
                            '    - export_engine\n' +
                            '  guardrails:\n' +
                            '    reproducibility: required\n' +
                            '    dataset_lock: required\n' +
                            '    config_snapshot: required\n' +
                            '  outputs:\n' +
                            '    - run_id\n' +
                            '    - metrics_report\n' +
                            '    - model_artifact\n' +
                            '    - lineage_graph\n',
                    },
                ],
            },
            {
                key: 'components',
                title: 'Pre-built pluggable agentic components',
                icon: 'components',
                items: [
                    {
                        label: 'Tool Registry',
                        headline: 'Dataset Manager.',
                        body: 'The Dataset Manager is the foundation of ML FORGE. Every model, training run, evaluation, and export begins here — with explicit versions and repeatable inputs.',
                        tools: [
                            { name: 'Import datasets', desc: 'Import raw images and videos. Support multiple task types and models. All dataset operations are explicit, traceable, and reproducible.', type: 'Component', enabled: true },
                            { name: 'Version & validate', desc: 'Review, validate, and version data. Create deterministic splits. Manage classes and identities. Guarantee reproducibility.', type: 'Component', enabled: true },
                            { name: 'Split Manager', desc: 'Create deterministic train / validation / test splits with percentage-based or fixed-size splits. Per-class distribution awareness.', type: 'Component', enabled: true },
                            { name: 'Class Manager', desc: 'Create, rename, merge, or deactivate classes. View class frequency and imbalance. Detect unused or missing classes.', type: 'Component', enabled: true },
                            { name: 'Annotation Studio', desc: 'Label images and videos for Vision AI tasks. Apply consistent annotations. Review and approve changes before training.', type: 'Component', enabled: true },
                            { name: 'Dataset tools', desc: 'Duplicate image detection, corrupted file cleanup, dataset statistics, class distribution analysis. All changes create new dataset versions.', type: 'Component', enabled: true },
                        ],
                        code:
                            'tool_registry:\n' +
                            '  dataset_manager:\n' +
                            '    produces: [dataset_version]\n' +
                            '    guarantees: [immutable_snapshot, deterministic_splits]\n' +
                            '  annotation_studio:\n' +
                            '    produces: [approved_labels]\n' +
                            '    gates: [review_required]\n' +
                            '  training_engine:\n' +
                            '    consumes: [dataset_version, config_snapshot]\n' +
                            '    produces: [run_id, metrics, checkpoints]\n' +
                            '  export_engine:\n' +
                            '    consumes: [checkpoint, export_target]\n' +
                            '    produces: [artifact_hash, export_bundle]\n',
                    },
                ],
            },
            {
                key: 'deployment',
                title: 'Agentic AI pipeline deployment',
                icon: 'deployment',
                items: [
                    {
                        label: 'Run Configuration',
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
                            'run_config:\n' +
                            '  dataset_version: v1.2.3\n' +
                            '  model: yolov8\n' +
                            '  device: gpu\n' +
                            '  hyperparams:\n' +
                            '    epochs: 100\n' +
                            '    batch_size: 16\n' +
                            '    lr: 0.001\n' +
                            '    optimizer: adam\n' +
                            '  policy:\n' +
                            '    fail_on_data_drift: true\n' +
                            '    checkpoint_strategy: best_only\n' +
                            '  telemetry:\n' +
                            '    metrics: [loss, map, lr]\n' +
                            '    hardware: [gpu_util, vram]\n',
                    },
                ],
            },
            {
                key: 'evaluation',
                title: 'Evaluation, Export & Deployment',
                icon: 'deployment',
                items: [
                    {
                        label: 'Deployment Blueprint',
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
                            'deployment_blueprint:\n' +
                            '  input:\n' +
                            '    run_id: run_2025_01_31_162920\n' +
                            '    checkpoint: best\n' +
                            '  target:\n' +
                            '    format: onnx\n' +
                            '    precision: fp16\n' +
                            '    device_class: edge_or_server\n' +
                            '  bundle:\n' +
                            '    includes: [model, class_map, dataset_version, config_snapshot, metrics]\n' +
                            '    artifact_hash: sha256:...\n' +
                            '  validation:\n' +
                            '    required: [metrics_report, reproducibility_chain]\n',
                    },
                ],
            },
            {
                key: 'governance',
                title: 'Agentic AI governance and observability',
                icon: 'governance',
                items: [
                    {
                        label: 'Governance Policy',
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
                            'governance_policy:\n' +
                            '  lineage:\n' +
                            '    required: true\n' +
                            '    chain: [dataset_version, run_id, config_snapshot, metrics, export_hash]\n' +
                            '  approvals:\n' +
                            '    dataset_lock: required\n' +
                            '    export_release: required\n' +
                            '  logging:\n' +
                            '    training_logs: immutable\n' +
                            '    environment_fingerprint: required\n' +
                            '  reporting:\n' +
                            '    generate: [run_report, export_report]\n',
                    },
                ],
            },
        ],
        []
    )

    const contentByKey = useMemo(() => {
        const map = {}
        centerTabs.forEach((tab) => {
            map[tab.key] = tab.items?.[0]
        })
        return map
    }, [centerTabs])

    const evaluationItem = contentByKey.evaluation

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

    const sections = useMemo(
        () => [
            { id: 'suite', title: 'Suite of development tools', icon: 'suite' },
            { id: 'components', title: 'Pre-built pluggable agentic components', icon: 'components' },
            { id: 'deployment', title: 'Agentic AI pipeline deployment', icon: 'deployment' },
            { id: 'governance', title: 'Agentic AI governance and observability', icon: 'governance' },
        ],
        []
    )

    const scrollToSection = (id) => {
        const el = document.getElementById(id)
        if (!el) return

        const rootEl = rightColRef.current
        const useRoot = !!rootEl && rootEl.scrollHeight > rootEl.clientHeight + 1
        if (useRoot) {
            const top = Math.max(0, el.offsetTop - 16)
            rootEl.scrollTo({ top, behavior: 'smooth' })
            return
        }

        const y = el.getBoundingClientRect().top + window.scrollY - 92
        window.scrollTo({ top: y, behavior: 'smooth' })
    }

    const renderPanel = (tabKey) => {
        const item = contentByKey[tabKey] || {}

        if (tabKey === 'suite') {
            return (
                <>
                    <div className="agenticCenterHeader">
                        <div className="agenticCenterHeader__icon agenticCenterHeader__icon--suite" aria-hidden="true" />
                        <h2 className="agenticCenterHeader__title">Suite of development tools</h2>
                    </div>
                    <div className="agenticCenterDivider" aria-hidden="true" />

                    <div className="agenticCenterBody">
                        <div className="agenticCenterSection">
                            <h3 className="agenticCenterSection__title">
                                Teams that <span className="agenticCenterSection__highlight">build</span> Vision AI
                            </h3>
                            <p className="agenticCenterSection__subtitle">
                                Complete desktop-first IDE for reproducible Vision AI training and deployment. <strong>Runs locally.</strong>
                            </p>
                        </div>

                        <p className="agenticCenterLead">
                            <strong>{item.headline}</strong> {item.body}
                        </p>
                        <p className="agenticCenterSubLead">
                            Code-first Vision AI workflow development tools. Build Vision AI pipelines anywhere with greater velocity, then seamlessly prepare them for deployment. <strong>Use the visual IDE</strong> — or the Python API.
                        </p>

                        <div className="agenticDemoFrame">
                            <div className="agenticCenterDemo agenticCenterDemo--split">
                                <div className="agenticToolList" aria-label="Tool list">
                                    {(item.tools || []).map((tool) => (
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

                                <div className="agenticCodePanel agenticCodePanel--wide" aria-label="Example code">
                                    <div className="agenticCodePanel__top">{item.label}</div>
                                    <pre className="agenticCodePanel__code">
                                        <code>{item.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="agenticCenterRows" aria-label="Platform capabilities">
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--open" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Local-first execution</div>
                                </div>
                                <div className="agenticCenterRow__body">
                                    All training happens locally or on user-controlled infrastructure. No cloud dependencies, no hidden services.
                                </div>
                            </div>

                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--data" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Versioned datasets</div>
                                </div>
                                <div className="agenticCenterRow__body">
                                    Every dataset change creates a new version. Locked versions are immutable and guarantee reproducibility.
                                </div>
                            </div>

                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--tool" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Explicit configuration</div>
                                </div>
                                <div className="agenticCenterRow__body">
                                    All training parameters are explicit and versioned. Same dataset + same config = same result, every time.
                                </div>
                            </div>

                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--vector" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">End-to-end lineage</div>
                                </div>
                                <div className="agenticCenterRow__body">
                                    Track Dataset → Version → Training Run → Metrics → Export. Every artifact tied to immutable snapshots.
                                </div>
                            </div>
                        </div>

                        <div className="agenticCenterDivider" aria-hidden="true" />

                        <div className="agenticCenterSection">
                            <h3 className="agenticCenterSection__title">
                                A workflow you can <span className="agenticCenterSection__highlight">repeat</span>
                            </h3>
                            <p className="agenticCenterSection__subtitle">Designed for teams that ship models under real constraints: deadlines, audits, and changing datasets.</p>
                        </div>

                        <div className="agenticBenefitGrid" aria-label="Workflow outcomes">
                            <article className="agenticBenefit">
                                <div className="agenticBenefit__icon agenticBenefit__icon--chat" aria-hidden="true" />
                                <div className="agenticBenefit__title">Faster iteration loops</div>
                                <div className="agenticBenefit__body">Shorten build → train → evaluate cycles with a single source of truth for data, config, and artifacts.</div>
                            </article>
                            <article className="agenticBenefit">
                                <div className="agenticBenefit__icon agenticBenefit__icon--forecast" aria-hidden="true" />
                                <div className="agenticBenefit__title">Fewer integration failures</div>
                                <div className="agenticBenefit__body">Avoid brittle glue scripts by keeping dataset state, metrics, and exports inside one reproducible pipeline.</div>
                            </article>
                            <article className="agenticBenefit">
                                <div className="agenticBenefit__icon agenticBenefit__icon--content" aria-hidden="true" />
                                <div className="agenticBenefit__title">Audit-friendly by default</div>
                                <div className="agenticBenefit__body">Immutable versions, explicit configs, and deterministic exports make reviews and compliance less painful.</div>
                            </article>
                        </div>
                    </div>
                </>
            )
        }

        if (tabKey === 'components') {
            return (
                <>
                    <div className="agenticCenterHeader">
                        <div className="agenticCenterHeader__icon agenticCenterHeader__icon--components" aria-hidden="true" />
                        <h2 className="agenticCenterHeader__title">Pre-built pluggable agentic components</h2>
                    </div>
                    <div className="agenticCenterDivider" aria-hidden="true" />

                    <div className="agenticCenterBody">
                        <p className="agenticCenterLead">
                            <strong>{item.headline}</strong> {item.body}
                        </p>

                        <div className="agenticDemoFrame">
                            <div className="agenticCenterDemo agenticCenterDemo--single">
                                <div className="agenticGallery" aria-label="Components gallery">
                                    <div className="agenticGallery__header">
                                        <div className="agenticGallery__top">Pre-built components</div>
                                        <button type="button" className="agenticGallery__action">
                                            View all
                                        </button>
                                    </div>
                                    <div className="agenticGallery__grid">
                                        {(item.tools || []).map((t, index) => (
                                            <div key={index} className={`agenticGallery__card ${t.enabled ? 'agenticGallery__card--enabled' : ''}`}>
                                                <div className="agenticGallery__content">
                                                    <div className="agenticGallery__name">{t.name}</div>
                                                    <div className="agenticGallery__desc">{t.desc}</div>
                                                </div>
                                                <div className="agenticGallery__footer">
                                                    <div className="agenticGallery__pill">{t.type}</div>
                                                    {t.enabled && (
                                                        <div className="agenticGallery__check" aria-label="Enabled">
                                                            ✓
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="agenticCodePanel" aria-label="Example code">
                                    <div className="agenticCodePanel__top">{item.label}</div>
                                    <pre className="agenticCodePanel__code">
                                        <code>{item.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="agenticBenefitGrid" aria-label="Component capabilities">
                            <article className="agenticBenefit">
                                <div className="agenticBenefit__icon agenticBenefit__icon--chat" aria-hidden="true" />
                                <div className="agenticBenefit__title">Dataset lifecycle management</div>
                                <div className="agenticBenefit__body">
                                    Import, validate, version, and manage image and video datasets with explicit metadata and deterministic splits.
                                </div>
                            </article>
                            <article className="agenticBenefit">
                                <div className="agenticBenefit__icon agenticBenefit__icon--forecast" aria-hidden="true" />
                                <div className="agenticBenefit__title">Annotation with review gates</div>
                                <div className="agenticBenefit__body">Label images and videos with review-gated changes, full history, and dataset version safety.</div>
                            </article>
                            <article className="agenticBenefit">
                                <div className="agenticBenefit__icon agenticBenefit__icon--content" aria-hidden="true" />
                                <div className="agenticBenefit__title">Reproducible training runs</div>
                                <div className="agenticBenefit__body">Run training with explicit configs, tracked metrics, and immutable artifacts tied to dataset versions.</div>
                            </article>
                        </div>

                        <div className="agenticCenterDivider" aria-hidden="true" />

                        <div className="agenticCenterSection">
                            <h3 className="agenticCenterSection__title">
                                Compose the pipeline with <span className="agenticCenterSection__highlight">explicit interfaces</span>
                            </h3>
                            <p className="agenticCenterSection__subtitle">Each component produces versioned artifacts you can inspect, review, and reuse across runs.</p>
                        </div>

                        <div className="agenticCenterRows" aria-label="Component design principles">
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--data" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Versioned inputs</div>
                                </div>
                                <div className="agenticCenterRow__body">Every stage consumes immutable dataset snapshots, not mutable folders.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--tool" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Deterministic outputs</div>
                                </div>
                                <div className="agenticCenterRow__body">Same data + same config yields the same artifacts, checksums, and results.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--open" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Pluggable hooks</div>
                                </div>
                                <div className="agenticCenterRow__body">Add custom dataset checks, export steps, or evaluation logic without rewriting the workflow.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--vector" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Traceable dependencies</div>
                                </div>
                                <div className="agenticCenterRow__body">Every artifact links back to its producing run, config snapshot, and dataset version.</div>
                            </div>
                        </div>
                    </div>
                </>
            )
        }

        if (tabKey === 'deployment') {
            const evalItem = evaluationItem || {}

            return (
                <>
                    <div className="agenticCenterHeader">
                        <div className="agenticCenterHeader__icon agenticCenterHeader__icon--deployment" aria-hidden="true" />
                        <h2 className="agenticCenterHeader__title">Agentic AI pipeline deployment</h2>
                    </div>
                    <div className="agenticCenterDivider" aria-hidden="true" />

                    <div className="agenticCenterBody">
                        <p className="agenticCenterLead">
                            <strong>{item.headline}</strong> {item.body}
                        </p>

                        <div className="agenticDemoFrame">
                            <div className="agenticCenterDemo agenticCenterDemo--single">
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
                                                <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                <line x1="0" y1="160" x2="500" y2="160" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                                <path d="M 0,180 L 25,170 L 50,160 L 75,150 L 100,140 L 125,130 L 150,120 L 175,110 L 200,100 L 225,92 L 250,85 L 275,80 L 300,75 L 325,72 L 350,70 L 375,69 L 400,68 L 425,67.5 L 450,67 L 475,66.5 L 500,66 L 500,200 L 0,200 Z" fill="url(#lossGradient)" />
                                                <path d="M 0,180 L 25,170 L 50,160 L 75,150 L 100,140 L 125,130 L 150,120 L 175,110 L 200,100 L 225,92 L 250,85 L 275,80 L 300,75 L 325,72 L 350,70 L 375,69 L 400,68 L 425,67.5 L 450,67 L 475,66.5 L 500,66" stroke="rgba(132, 247, 168, 1)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                                <path d="M 0,190 L 25,185 L 50,175 L 75,160 L 100,145 L 125,130 L 150,115 L 175,100 L 200,85 L 225,72 L 250,60 L 275,50 L 300,42 L 325,36 L 350,32 L 375,29 L 400,27 L 425,25.5 L 450,24 L 475,23 L 500,22 L 500,200 L 0,200 Z" fill="url(#mAPGradient)" />
                                                <path d="M 0,190 L 25,185 L 50,175 L 75,160 L 100,145 L 125,130 L 150,115 L 175,100 L 200,85 L 225,72 L 250,60 L 275,50 L 300,42 L 325,36 L 350,32 L 375,29 L 400,27 L 425,25.5 L 450,24 L 475,23 L 500,22" stroke="rgba(173, 191, 255, 1)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
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

                                <div className="agenticCodePanel" aria-label="Example code">
                                    <div className="agenticCodePanel__top">{item.label}</div>
                                    <pre className="agenticCodePanel__code">
                                        <code>{item.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="agenticBenefitGrid" aria-label="Benefits">
                            {(item.tools || []).map((t) => (
                                <article key={t.name} className="agenticBenefit">
                                    <div className="agenticBenefit__icon agenticBenefit__icon--forecast" aria-hidden="true" />
                                    <div className="agenticBenefit__title">{t.name}</div>
                                    <div className="agenticBenefit__body">{t.desc}</div>
                                </article>
                            ))}
                        </div>

                        <div className="agenticCenterRows" aria-label="Deployment checklist">
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--data" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Lock the dataset version</div>
                                </div>
                                <div className="agenticCenterRow__body">Freeze inputs before training so runs remain comparable and reproducible.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--tool" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Capture the config snapshot</div>
                                </div>
                                <div className="agenticCenterRow__body">Store every hyperparameter and runtime option as a first-class artifact.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--open" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Export with explicit targets</div>
                                </div>
                                <div className="agenticCenterRow__body">Choose runtime format and precision (FP32/FP16/INT8) based on deployment constraints.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--vector" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Attach evaluation evidence</div>
                                </div>
                                <div className="agenticCenterRow__body">Keep per-run metrics and comparisons tied to immutable dataset snapshots for review.</div>
                            </div>
                        </div>

                        <div className="agenticCenterDivider" aria-hidden="true" />

                        <p className="agenticCenterLead">
                            <strong>{evalItem.headline}</strong> {evalItem.body}
                        </p>

                        <div className="agenticDemoFrame">
                            <div className="agenticCenterDemo agenticCenterDemo--single">
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

                                <div className="agenticCodePanel" aria-label="Example code">
                                    <div className="agenticCodePanel__top">{evalItem.label}</div>
                                    <pre className="agenticCodePanel__code">
                                        <code>{evalItem.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="agenticBenefitGrid" aria-label="Evaluation and export capabilities">
                            {(evalItem.tools || []).map((t) => (
                                <article key={t.name} className="agenticBenefit">
                                    <div className="agenticBenefit__icon agenticBenefit__icon--chat" aria-hidden="true" />
                                    <div className="agenticBenefit__title">{t.name}</div>
                                    <div className="agenticBenefit__body">{t.desc}</div>
                                </article>
                            ))}
                        </div>
                    </div>
                </>
            )
        }

        if (tabKey === 'governance') {
            return (
                <>
                    <div className="agenticCenterHeader">
                        <div className="agenticCenterHeader__icon agenticCenterHeader__icon--governance" aria-hidden="true" />
                        <h2 className="agenticCenterHeader__title">Agentic AI governance and observability</h2>
                    </div>
                    <div className="agenticCenterDivider" aria-hidden="true" />

                    <div className="agenticCenterBody">
                        <div className="agenticGovTop" aria-label="Governance capabilities">
                            {governanceTopRows.map((row) => (
                                <div key={row.title} className="agenticGovTopRow">
                                    <div className="agenticGovTopRow__left">
                                        <span className={`agenticGovTopRow__icon agenticGovTopRow__icon--${row.icon}`} aria-hidden="true" />
                                        <div className="agenticGovTopRow__title">{row.title}</div>
                                    </div>
                                    <div className="agenticGovTopRow__body">{row.body}</div>
                                </div>
                            ))}
                        </div>

                        <p className="agenticCenterMonitorLead">
                            <strong>End-to-end lineage for datasets, runs, and exports.</strong> Keep every result traceable to inputs, configs, and immutable artifacts.
                        </p>

                        <div className="agenticDemoFrame">
                            <div className="agenticCenterDemo agenticCenterDemo--single">
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

                                <div className="agenticCodePanel" aria-label="Example code">
                                    <div className="agenticCodePanel__top">{item.label}</div>
                                    <pre className="agenticCodePanel__code">
                                        <code>{item.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="agenticBenefitGrid" aria-label="Benefits">
                            {(item.tools || []).map((t) => (
                                <article key={t.name} className="agenticBenefit">
                                    <div className="agenticBenefit__icon agenticBenefit__icon--content" aria-hidden="true" />
                                    <div className="agenticBenefit__title">{t.name}</div>
                                    <div className="agenticBenefit__body">{t.desc}</div>
                                </article>
                            ))}
                        </div>

                        <div className="agenticCenterDivider" aria-hidden="true" />

                        <div className="agenticCenterSection">
                            <h3 className="agenticCenterSection__title">
                                Trust comes from <span className="agenticCenterSection__highlight">evidence</span>
                            </h3>
                            <p className="agenticCenterSection__subtitle">Make every result reviewable: inputs, configs, environment, and outputs — all tied together.</p>
                        </div>

                        <div className="agenticCenterRows" aria-label="Governance controls">
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--open" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Run-level traceability</div>
                                </div>
                                <div className="agenticCenterRow__body">Every training run produces a complete set of logs, metrics, config snapshots, and artifact hashes.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--data" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Immutable dataset locks</div>
                                </div>
                                <div className="agenticCenterRow__body">Lock datasets before training to prevent silent drift between runs and reviews.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--tool" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Config snapshots</div>
                                </div>
                                <div className="agenticCenterRow__body">Keep a deterministic record of all training and export parameters for later reproduction.</div>
                            </div>
                            <div className="agenticCenterRow">
                                <div className="agenticCenterRow__left">
                                    <span className="agenticCenterRow__icon agenticCenterRow__icon--vector" aria-hidden="true" />
                                    <div className="agenticCenterRow__title">Audit-ready exports</div>
                                </div>
                                <div className="agenticCenterRow__body">Bundle the model artifact together with dataset version, run IDs, metrics, logs, and checksums.</div>
                            </div>
                        </div>
                    </div>
                </>
            )
        }

        return null
    }

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect()

        const observed = sections
            .map((s) => document.getElementById(s.id))
            .filter(Boolean)

        if (observed.length === 0) return

        const rootEl = rightColRef.current
        const useRoot = !!rootEl && rootEl.scrollHeight > rootEl.clientHeight + 1
        const rootTop = () => (useRoot ? rootEl.getBoundingClientRect().top : 0)
        const scrollTarget = useRoot ? rootEl : window

        let rafId = null
        const updateFromScroll = () => {
            if (rafId) return
            rafId = window.requestAnimationFrame(() => {
                rafId = null
                const offset = 120
                const top0 = rootTop()
                const best = observed
                    .map((el) => ({
                        id: el.id,
                        top: el.getBoundingClientRect().top - top0,
                    }))
                    .sort((a, b) => Math.abs(a.top - offset) - Math.abs(b.top - offset))[0]

                if (best?.id) setActiveSection(best.id)
            })
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => {
                        if (b.intersectionRatio !== a.intersectionRatio) return b.intersectionRatio - a.intersectionRatio
                        return a.boundingClientRect.top - b.boundingClientRect.top
                    })
                if (visible.length > 0) setActiveSection(visible[0].target.id)
            },
            {
                root: useRoot ? rootEl : null,
                threshold: [0.2, 0.35, 0.5, 0.65],
                rootMargin: '-25% 0px -65% 0px',
            }
        )

        observed.forEach((el) => observerRef.current.observe(el))

        scrollTarget.addEventListener('scroll', updateFromScroll, { passive: true })
        window.addEventListener('resize', updateFromScroll, { passive: true })
        updateFromScroll()

        return () => {
            scrollTarget.removeEventListener('scroll', updateFromScroll)
            window.removeEventListener('resize', updateFromScroll)
            if (rafId) window.cancelAnimationFrame(rafId)
            if (observerRef.current) observerRef.current.disconnect()
        }
    }, [sections])

    return (
        <>
            <section className="agenticHero" id="agentic-ai">
                <div className="container agenticHero__inner">
                    <p className="agenticHero__kicker">VISION AI IDE / DESKTOP-FIRST PLATFORM</p>
                    <h1 className="agenticHero__title">Vision AI Workflow</h1>
                </div>

                <div className="agenticHeroBand">
                    <div className="container agenticHeroBand__inner">
                        <div className="agenticHeroBand__copy">
                            <p className="agenticHeroBand__text">
                                A practical end-to-end workflow for Vision AI teams: datasets → annotation → training → evaluation → export.
                                Replace notebook glue, brittle scripts, and cloud GPU waiting with a desktop-first pipeline.
                                Canonical use case: train and deploy a YOLO-based model locally (export to ONNX/TensorRT).
                                NVIDIA GPU recommended for training; CPU-only is supported (slower).
                                <strong>Runs locally.</strong> <strong>No data leaves your machine.</strong> <strong>Deterministic &amp; reproducible by default.</strong>
                            </p>
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
                        <h2 className="differenceSection__title">The ML FORGE difference</h2>
                    </div>

                    <div className="differenceSection__frame">
                        <div className="agenticGrid">
                            <article className="agenticCard">
                                <div className="diffIcon diffIcon--workflow" aria-hidden="true" />
                                <h3 className="agenticCard__title">Complete Vision AI workflow — fewer scripts, fewer moving parts</h3>
                                <div className="agenticCard__bodyWrap">
                                    <p className="agenticCard__body">
                                        Stop stitching together notebooks, CLI scripts, and one-off labeling tools. Manage datasets, annotate, train, evaluate, and export in one place — with fewer moving parts.
                                    </p>
                                </div>
                            </article>

                            <article className="agenticCard">
                                <div className="diffIcon diffIcon--deploy" aria-hidden="true" />
                                <h3 className="agenticCard__title">Local-first execution with full reproducibility</h3>
                                <div className="agenticCard__bodyWrap">
                                    <p className="agenticCard__body">
                                        Run everything locally or on your infrastructure. Every dataset snapshot, training config, and export is deterministic and reproducible — no cloud lock-in, no hidden dependencies.
                                    </p>
                                </div>
                            </article>

                            <article className="agenticCard">
                                <div className="diffIcon diffIcon--shield" aria-hidden="true" />
                                <h3 className="agenticCard__title">Enterprise-ready with full traceability</h3>
                                <div className="agenticCard__bodyWrap">
                                    <p className="agenticCard__body">
                                        Track Dataset → Version → Training Run → Metrics → Export. Every artifact stays tied to immutable inputs and explicit configs — audit-ready when compliance matters.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section className="agenticCenter">
                <div className="container agenticCenter__inner">
                    <div className="agenticCenter__left" aria-label="Agentic AI navigation">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`agenticCenterTab ${s.id === activeSection ? 'agenticCenterTab--active' : ''}`}
                                onClick={() => scrollToSection(s.id)}
                            >
                                <span className={`agenticCenterTab__icon agenticCenterTab__icon--${s.icon}`} aria-hidden="true" />
                                <span className="agenticCenterTab__label">{s.title}</span>
                            </button>
                        ))}
                    </div>

                    <div ref={rightColRef} className="agenticCenter__right agenticCenter__right--stack">
                        {sections.map((s) => (
                            <section key={s.id} id={s.id} className="agenticCenterPanel">
                                {renderPanel(s.id)}
                            </section>
                        ))}
                    </div>
                </div>
            </section>

        </>
    )
}

export default AgenticPage
