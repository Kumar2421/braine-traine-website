import './App.css'

import { useEffect, useMemo, useState } from 'react'

function DocsPage() {
    const [path, setPath] = useState(() => window.location.pathname || '/docs')

    useEffect(() => {
        const onPop = () => setPath(window.location.pathname || '/docs')
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [])

    const navigate = (nextPath) => {
        if (!nextPath || nextPath === window.location.pathname) return
        window.history.pushState({}, '', nextPath)
        setPath(nextPath)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const pages = useMemo(
        () => ({
            '/docs/getting-started/what-is-mlforge': {
                group: 'Getting started',
                title: 'What is ML FORGE',
                lede:
                    'ML FORGE is a desktop-first Vision AI IDE built for local execution, deterministic pipelines, and reproducible results.',
                sections: [
                    {
                        title: 'Why this exists',
                        body:
                            'Vision systems fail in production when data and training inputs drift. ML FORGE makes every input explicit and file-backed so you can reproduce results across machines and over time.',
                    },
                    {
                        title: 'What ML FORGE is',
                        body:
                            'A local-first IDE for the end-to-end computer vision workflow: dataset → annotation → review → train → evaluate → export. It is designed for offline, on-prem, and edge environments.',
                    },
                    {
                        title: 'What ML FORGE does not try to solve',
                        body:
                            'It is not a cloud SaaS, not AutoML, and not an agent/LLM orchestration platform. ML FORGE focuses on deterministic vision workflows and audit-ready artifacts.',
                    },
                    {
                        title: 'Who ML FORGE is for',
                        body:
                            'ML engineers, CV engineers, robotics teams, and applied AI teams building production vision systems in regulated or reliability-critical environments.',
                    },
                    {
                        title: 'Who ML FORGE is not for',
                        body: 'Teams looking for hosted training infrastructure, cloud-managed pipelines, or generic ML platform features.',
                    },
                ],
            },
            '/docs/getting-started/install': {
                group: 'Getting started',
                title: 'Install ML FORGE',
                lede: 'Install ML FORGE locally. GPU is optional. CPU is supported.',
                sections: [
                    {
                        title: 'Why this exists',
                        body:
                            'Local installation keeps your data and artifacts on your machine and removes hidden dependencies. It also enables offline and air-gapped deployments.',
                    },
                    {
                        title: 'Supported OS',
                        body: 'Windows, macOS, and Linux.',
                    },
                    {
                        title: 'Offline installation philosophy',
                        body:
                            'ML FORGE is designed to run without cloud accounts. Installers and dependencies can be staged and installed offline when required by policy.',
                    },
                    {
                        title: 'Where ML FORGE stores data locally',
                        body:
                            'All project state lives inside your workspace. Datasets, annotations, runs, exports, and configs are file-backed and reviewable.',
                    },
                    {
                        title: 'What gets installed',
                        body:
                            'The IDE, a local runtime for executing pipelines, and a local artifact store. No hidden background services.',
                    },
                ],
            },
            '/docs/getting-started/workspace-overview': {
                group: 'Getting started',
                title: 'ML FORGE Workspace Overview',
                lede: 'A workspace is a root folder. Projects live inside it. Everything is file-backed.',
                sections: [
                    {
                        title: 'Why this exists',
                        body:
                            'A predictable on-disk layout makes runs reproducible, reviewable, and easy to hand off. It also makes audits practical.',
                    },
                    {
                        title: 'Workspace structure',
                        body:
                            'workspace/\n ├─ datasets/\n ├─ annotations/\n ├─ runs/\n ├─ exports/\n └─ configs/',
                    },
                    {
                        title: 'Why this structure matters',
                        body:
                            'Each stage writes explicit artifacts. You can pin dataset snapshots, diff configs, and verify exactly what produced a model export.',
                    },
                ],
            },
            '/docs/getting-started/first-project': {
                group: 'Getting started',
                title: 'Your First Vision AI Project',
                lede: 'A step-by-step tutorial that mirrors the ML FORGE workflow.',
                sections: [
                    {
                        title: 'Why this exists',
                        body:
                            'If you can do the workflow once end-to-end, you can reproduce it forever. This tutorial teaches the exact sequence ML FORGE enforces.',
                    },
                    {
                        title: 'Step-by-step',
                        body:
                            '1) Create workspace\n2) Import dataset\n3) Annotate a few samples\n4) Review & lock\n5) Run training\n6) View metrics\n7) Export model',
                    },
                    {
                        title: 'Result',
                        body: 'If you can do this once, you can reproduce it forever.',
                    },
                ],
            },
            '/docs/core-workflow/dataset-manager': {
                group: 'Core workflow',
                title: 'Dataset Manager',
                lede: 'The Dataset Manager is the foundation of ML FORGE. Every model, training run, evaluation, and export begins here.',
                sections: [
                    {
                        title: 'Overview',
                        body:
                            "ML FORGE treats datasets as versioned, immutable, and auditable assets — not folders of files.\n\nThe Dataset Manager provides a complete lifecycle for Vision AI datasets:\n\nImport raw images and videos\nSupport multiple task types and models\nReview, validate, and version data\nCreate deterministic splits\nManage classes and identities\nApply dataset tools safely\nGuarantee reproducibility across training and export\n\nAll dataset operations are explicit, traceable, and reproducible.",
                    },
                    {
                        title: 'Supported Dataset Types',
                        body:
                            'ML FORGE supports multi-model and multi-task datasets:\n\nImage Classification\nObject Detection (YOLO-style)\nInstance Segmentation (future-ready)\nFace Recognition datasets\nMulti-task datasets (shared images, different labels)\nVideo datasets (frame-based)\n\nEach dataset explicitly declares its type and compatible models.',
                    },
                    {
                        title: 'Dataset Lifecycle',
                        body:
                            'A dataset in ML FORGE follows this lifecycle:\n\nUpload dataset\nPreview & explore\nValidate structure\nManage classes\nConfigure splits\nApply tools (optional)\nCreate version snapshot\nLock for training\nUse in training and export\n\nOnce locked, a dataset version is immutable.',
                    },
                    {
                        title: 'Your Datasets',
                        body:
                            'The Your Datasets view lists all datasets in the workspace.\n\nEach dataset shows:\n\nDataset name\nDataset type\nTotal images / videos\nCurrent version\nLock state (Draft / Locked)\nLast modified time\n\nDatasets can be reused across:\n\nMultiple models\nMultiple experiments\nMultiple exports\n\nDeleting or modifying a dataset never affects locked versions.',
                    },
                    {
                        title: 'Upload Dataset',
                        body:
                            "Purpose\n\nUpload raw data into ML FORGE’s managed dataset system.\n\nSupported Inputs\n\nImage folders\nVideo files\nPre-labeled datasets (YOLO, COCO, custom JSON)\nFace recognition folder structures\n\nUpload Behavior\n\nFiles are copied into ML FORGE-managed storage\nMetadata is generated automatically\nDataset enters Draft state\nNo training is allowed at this stage\n\nUploading data does not make it training-ready.",
                    },
                    {
                        title: 'Preview & Explore',
                        body:
                            'Purpose\n\nInspect dataset contents before annotation or training.\n\nCapabilities\n\nImage and video preview\nFrame navigation for videos\nZoom and pan\nResolution and format inspection\nQuick detection of corrupted files\n\nFace Recognition Preview\n\nView images grouped by identity\nDetect identities with insufficient samples\nIdentify extreme imbalance across identities\n\nThis step prevents bad data from entering the pipeline.',
                    },
                    {
                        title: 'Validate Dataset',
                        body:
                            'Purpose\n\nEnsure dataset correctness before training.\n\nValidation Checks\n\nFile readability and format\nAnnotation file integrity\nClass consistency\nMissing or empty labels\nDuplicate files\nFace identity structure validation\n\nValidation Results\n\nErrors – must be fixed\nWarnings – recommended fixes\nPassed checks\n\nValidation results are stored with the dataset version.\n\nOnly validated datasets can be locked and trained.',
                    },
                    {
                        title: 'Split Manager',
                        body:
                            'Purpose\n\nCreate deterministic train / validation / test splits.\n\nFeatures\n\nPercentage-based or fixed-size splits\nDeterministic assignment (same input → same split)\nPer-class distribution awareness\nIdentity-safe splits for face recognition\n\nRules\n\nSplits are versioned\nChanging a split creates a new dataset version\nTraining always references an explicit split\n\nThis guarantees fair and repeatable evaluation.',
                    },
                    {
                        title: 'Class Manager',
                        body:
                            'Purpose\n\nManage dataset classes and label definitions.\n\nCapabilities\n\nCreate, rename, merge, or deactivate classes\nView class frequency and imbalance\nDetect unused or missing classes\nMap external labels to internal classes\n\nImportant Rule\n\nAny class change creates a new dataset version.\n\nThis prevents silent label drift across experiments.',
                    },
                    {
                        title: 'Tools',
                        body:
                            'Purpose\n\nSafely operate on datasets without custom scripts.\n\nAvailable Tools\n\nDuplicate image detection\nCorrupted file cleanup\nDataset statistics\nClass distribution analysis\nIdentity imbalance detection (face datasets)\nFace embedding inspection (future)\n\nSafety Model\n\nTools never modify data silently\nEvery tool action is recorded\nAll changes create a new dataset version',
                    },
                    {
                        title: 'Versioning',
                        body:
                            'Purpose\n\nTrack every meaningful dataset change.\n\nWhat Creates a New Version\n\nAdding or removing files\nAnnotation updates\nClass changes\nSplit changes\nTool-based cleanup\n\nVersion Properties\n\nImmutable once locked\nFully traceable\nReferenced by training runs and exports\n\nDataset versions are permanent records.',
                    },
                    {
                        title: 'Face Recognition Dataset Support',
                        body:
                            'ML FORGE provides first-class support for face recognition datasets.\n\nFeatures\n\nIdentity-based dataset structure\nIdentity imbalance detection\nIdentity-aware train/val/test splits\nIdentity-level validation checks\nEmbedding visualization (planned)\n\nThis ensures fair and stable face recognition training.',
                    },
                    {
                        title: 'Multi-Model Dataset Support',
                        body:
                            'A single dataset can be reused across:\n\nDifferent architectures\nDifferent backbones\nDifferent training configs\n\nModels reference datasets by version, not by path.',
                    },
                    {
                        title: 'Reproducibility Guarantee',
                        body:
                            'Every dataset version records:\n\nInput files\nAnnotations\nClasses\nSplits\nTool operations\n\nTraining, evaluation, and export always link back to the exact dataset version.\n\nKey Design Principle\n\nIf you cannot reproduce the dataset, you cannot trust the model.\n\nML FORGE enforces dataset discipline so production failures don’t happen silently.',
                    },
                ],
            },
            '/docs/core-workflow/annotation-studio': {
                group: 'Core workflow',
                title: 'Annotation Studio',
                lede: 'Annotation Studio is ML FORGE’s controlled environment for labeling vision datasets with review-gated changes, full history, and dataset version safety.',
                sections: [
                    {
                        title: 'Purpose',
                        body:
                            'Annotation Studio enables teams to:\n\nLabel images and videos for Vision AI tasks\nApply consistent annotations across datasets\nReview and approve changes before training\nPreserve full annotation history\nPrevent silent label drift\n\nNo annotation directly affects training until it is reviewed and locked.',
                    },
                    {
                        title: 'Supported Annotation Tasks',
                        body:
                            'Annotation Studio supports:\n\nObject Detection (bounding boxes)\nImage Classification\nFace Recognition (identity tagging)\nInstance Segmentation (planned / phase-gated)\nVideo frame annotation (frame-based)\n\nEach dataset explicitly defines its annotation mode.',
                    },
                    {
                        title: 'Workspace Layout',
                        body:
                            'Annotation Studio is divided into five core regions:\n\nImage Browser (left)\nAnnotation Canvas (center)\nTool Bar (top)\nClass Panel (right)\nDataset Review Panel (right-bottom)\n\nEach region operates independently but is synchronized.',
                    },
                    {
                        title: 'Image Browser',
                        body:
                            'Purpose\n\nBrowse, filter, and select dataset images for annotation.\n\nFeatures\n\nThumbnail grid view\nImage search by filename\nMulti-select mode\nScroll-based lazy loading\nDataset progress indicator\n\nFilters\n\nYou can filter images by:\n\nAll images\nUnlabeled\nLabeled\nReviewed\nReview pending\nAuto-annotated\nAuto-pending review\n\nFilters allow annotators and reviewers to focus on specific states.',
                    },
                    {
                        title: 'Annotation Canvas',
                        body:
                            'Purpose\n\nCreate and edit annotations directly on the image.\n\nCapabilities\n\nHigh-performance zoom and pan\nPixel-accurate bounding box placement\nResize and reposition annotations\nMulti-object annotation per image\nKeyboard shortcuts for speed\n\nInteraction Model\n\nClick to select\nDrag to move\nResize from corners\nUndo / Redo supported per image session\n\nCanvas operations are non-destructive until saved.',
                    },
                    {
                        title: 'Annotation Tools',
                        body:
                            'Available Tools\n\nSelect\nBounding Box\nPolygon (future)\nErase / Delete\nDuplicate annotation\nAdjust box precision\nAuto-align helpers\n\nTool Rules\n\nTools only operate on the active image\nChanges are tracked immediately\nAll actions are reversible until review',
                    },
                    {
                        title: 'Class Panel',
                        body:
                            'Purpose\n\nAssign semantic meaning to annotations.\n\nFeatures\n\nClass search\nClass selection dropdown\nActive class highlighting\nClass usage count\nClass-level color coding\n\nRules\n\nClasses come from Dataset Manager\nNew classes cannot be created here\nClass changes update annotation metadata\nInvalid classes are blocked\n\nThis ensures consistency across datasets.',
                    },
                    {
                        title: 'Auto-Annotate (Optional)',
                        body:
                            'Purpose\n\nAccelerate labeling using pre-trained models.\n\nBehavior\n\nUses selected model for inference\nGenerates draft annotations\nMarks results as Auto-Pending\nRequires human review before acceptance\n\nSafety Guarantees\n\nAuto-annotations never train directly\nConfidence thresholds are configurable\nAll auto labels are traceable',
                    },
                    {
                        title: 'Review & Approval Flow',
                        body:
                            'Annotation States\n\nEach image exists in one of the following states:\n\nUnlabeled\nLabeled\nReview Pending\nReviewed\n\nReview Rules\n\nAnnotators submit images for review\nReviewers approve or request changes\nOnly reviewed annotations are eligible for training\nReview actions are logged\n\nThis enforces dataset quality at scale.',
                    },
                    {
                        title: 'Dataset Review Panel',
                        body:
                            'Purpose\n\nProvide real-time dataset health visibility.\n\nSummary Metrics\n\nTotal images\nAnnotated images\nReviewed images\nUnlabeled images\nClass count\nLast modified timestamp\n\nHealth Checks\n\nImages without annotations\nUnreviewed labeled images\nClasses with insufficient samples\nAnnotation imbalance\n\nHealth checks guide dataset readiness decisions.',
                    },
                    {
                        title: 'Multi-User Collaboration',
                        body:
                            'Supported Roles\n\nAnnotator\nReviewer\nDataset Owner\n\nBehavior\n\nConcurrent annotation supported\nConflict-safe saves\nReview permissions enforced\nChange ownership recorded\n\nAll actions are auditable.',
                    },
                    {
                        title: 'Annotation History',
                        body:
                            'Purpose\n\nMaintain full traceability of label changes.\n\nTracked Data\n\nWho made the change\nWhat was changed\nWhen it happened\nPrevious annotation state\nReview decisions\n\nAnnotation history is immutable once locked.',
                    },
                    {
                        title: 'Dataset Versioning Impact',
                        body:
                            'Annotation changes:\n\nDo NOT modify locked dataset versions\nCreate new dataset drafts\nRequire re-validation if rules change\nAre snapshot into dataset versions\n\nTraining always references a specific dataset version.',
                    },
                    {
                        title: 'Performance & Stability',
                        body:
                            'Annotation Studio is optimized for:\n\nLarge datasets\nHigh-resolution images\nLong annotation sessions\nLow-latency interaction\n\nOperations are local-first when possible.',
                    },
                    {
                        title: 'Best Practices',
                        body:
                            'Validate datasets before annotation\nKeep annotation sessions focused\nReview frequently, not at the end\nWatch class imbalance early\nLock datasets before training',
                    },
                    {
                        title: 'Common Errors & Warnings',
                        body:
                            'Missing annotations\nUnreviewed images\nClass mismatch\nIncomplete dataset splits\n\nThese must be resolved before training.',
                    },
                    {
                        title: 'Relationship to Training',
                        body:
                            'Training Engine only accepts:\n\nReviewed annotations\nLocked dataset versions\nValid class definitions\nDeterministic splits\n\nAnnotation Studio enforces these guarantees upstream.',
                    },
                ],
            },
            '/docs/core-workflow/review-and-lock': {
                group: 'Core workflow',
                title: 'Training Logs',
                lede: 'The Training Logs tab provides a real-time, immutable, and auditable record of everything that happens during a training run.',
                sections: [
                    {
                        title: 'Overview',
                        body:
                            'It is designed for:\n\nDebugging failed runs\nUnderstanding training behavior\nAuditing experiments\nReproducing results exactly\n\nUnlike cloud dashboards, ML FORGE logs are local, explicit, and permanent.',
                    },
                    {
                        title: 'Purpose of Training Logs',
                        body:
                            'Training Logs answer four critical questions:\n\nWhat happened during training?\nWhen did it happen?\nWhy did it happen?\nCan this run be reproduced exactly?\n\nEvery training run generates a complete log stream tied to:\n\nDataset snapshot\nModel version\nTraining configuration\nHardware environment',
                    },
                    {
                        title: 'Log Scope',
                        body:
                            'Training Logs capture:\n\nDataset loading and validation\nModel initialization\nHardware detection (CPU / GPU)\nTraining loop progress\nLoss and metric updates\nOptimizer and scheduler behavior\nCheckpoint saving\nWarnings and errors\nGraceful stop / crash events\n\nNo information is hidden or aggregated away.',
                    },
                    {
                        title: 'Log Stream Layout',
                        body:
                            'Location: Top navigation → Training Logs\n\nThe interface is split into three logical sections:\n\n1. Run Selector\n\nSelect which training run’s logs to view.\n\nEach run is identified by:\n\nRun ID\nModel name\nDataset version\nTimestamp\nStatus (Running / Completed / Failed / Stopped)\n\nSwitching runs immediately reloads the corresponding log stream.\n\n2. Live Log Console\n\nThe main panel displays logs in chronological order.\n\nLog Characteristics\n\nTimestamped\nOrdered\nColor-coded by severity\nStreamed live during training\n\nLogs continue updating while training is active.\n\n3. Log Controls\n\nControls typically include:\n\nAuto-scroll toggle\nPause log streaming\nClear view (does not delete logs)\nCopy selected lines\nExport logs to file\n\nThese controls affect viewing only, not the underlying logs.',
                    },
                    {
                        title: 'Log Levels',
                        body:
                            'Training Logs use standard severity levels:\n\nINFO\n\nGeneral progress updates:\n\nDataset loaded\nEpoch started / completed\nCheckpoint saved\n\nDEBUG\n\nDetailed internal operations:\n\nTensor shapes\nBatch iteration details\nAugmentation operations\n\nUseful for advanced debugging.\n\nWARNING\n\nNon-fatal issues:\n\nMissing optional dependencies\nMinor data inconsistencies\nPerformance fallbacks\n\nTraining continues.\n\nERROR\n\nCritical failures:\n\nInvalid dataset structure\nCUDA out-of-memory\nModel incompatibility\nRuntime exceptions\n\nTraining stops or fails.',
                    },
                    {
                        title: 'Training Phase Coverage',
                        body:
                            'Logs are grouped implicitly by training phases.\n\nInitialization Phase\n\nIncludes:\n\nModel loading\nWeight initialization\nDevice selection\nDependency checks\n\nExample events:\n\nGPU detected\nModel architecture resolved\nConfig parsed successfully\n\nDataset Phase\n\nIncludes:\n\nDataset snapshot loading\nSplit verification\nClass consistency checks\nLabel validation\n\nThis ensures training inputs are stable and reproducible.\n\nTraining Loop Phase\n\nIncludes:\n\nEpoch start/end\nBatch processing\nLoss values\nLearning rate updates\n\nEach step is logged deterministically.\n\nCheckpoint Phase\n\nIncludes:\n\nCheckpoint save triggers\nFile paths\nBest-model selection logic\n\nLogs explicitly state why a checkpoint was saved.\n\nCompletion Phase\n\nIncludes:\n\nTraining summary\nFinal metrics\nTotal runtime\nExit status',
                    },
                    {
                        title: 'Hardware & Environment Logs',
                        body:
                            'Training Logs record the execution environment:\n\nCPU / GPU model\nCUDA version\nGPU memory usage\nDevice temperature (if available)\nLibrary versions\n\nThis ensures full hardware reproducibility.',
                    },
                    {
                        title: 'Failure & Recovery Logs',
                        body:
                            'If a run fails, logs capture:\n\nExact failure point\nStack trace\nResource state\nLast completed step\n\nThis allows:\n\nRoot cause analysis\nConfig correction\nSafe reruns',
                    },
                    {
                        title: 'Log Persistence',
                        body:
                            'Training Logs are:\n\nStored locally\nImmutable after run completion\nTied permanently to the training run\n\nDeleting logs requires explicit user action.',
                    },
                    {
                        title: 'Exporting Logs',
                        body:
                            'Logs can be exported as:\n\nPlain text\nStructured log file\n\nExported logs include:\n\nRun metadata\nFull log stream\nEnvironment summary\n\nThis is critical for:\n\nCompliance\nTeam sharing\nLong-term archiving',
                    },
                    {
                        title: 'Relationship to Other Tabs',
                        body:
                            'Training Logs are tightly integrated with:\n\nTraining Dashboard → metrics visualization\nDataset Manager → dataset snapshot reference\nExport → exported models reference their training logs\nBenchmark → performance comparisons reference logs\n\nLogs act as the ground truth layer of the system.',
                    },
                    {
                        title: 'Best Practices',
                        body:
                            'Always review logs after a failed run\nExport logs for important experiments\nUse logs to compare behavior across model versions\nKeep logs alongside exported artifacts\nTreat logs as part of your experiment record',
                    },
                    {
                        title: 'Why ML FORGE Logs Are Different',
                        body:
                            'ML FORGE logs are:\n\nLocal-first\nDeterministic\nNon-aggregated\nFully auditable\nDeveloper-readable\n\nThey are designed for serious ML engineering, not marketing dashboards.',
                    },
                ],
            },
            '/docs/core-workflow/training-and-runs': {
                group: 'Core workflow',
                title: 'Training Engine (Training Dashboard)',
                lede: 'The Training Engine is the execution core of ML FORGE. It transforms locked datasets and selected models into deterministic training runs with full metric tracking, GPU visibility, and export-ready artifacts.',
                sections: [
                    {
                        title: 'Overview',
                        body:
                            'Training always happens locally or on user-controlled infrastructure.',
                    },
                    {
                        title: 'Purpose',
                        body:
                            'The Training Engine is designed to:\n\nRun reproducible Vision AI training\nEliminate configuration ambiguity\nProvide real-time metrics and GPU visibility\nCapture every artifact needed for audit and export\nPrevent accidental training on unstable datasets\n\nTraining is never allowed unless prerequisites are satisfied.',
                    },
                    {
                        title: 'Training Prerequisites',
                        body:
                            'Before training can start:\n\nDataset must be reviewed\nDataset version must be locked\nModel must be installed\nDevice (CPU/GPU) must be available\nRequired weights must be downloaded\n\nIf any condition fails, training is blocked.',
                    },
                    {
                        title: 'Top Control Bar',
                        body:
                            'Model Selector\n\nSelect the model architecture to train.\n\nSupported examples:\n\nYOLOv5 / YOLOv8\nDetection / Classification / (Segmentation – phase gated)\n\nModel selection determines:\n\nInput requirements\nOutput format\nMetric definitions\n\nDataset Selector\n\nSelect the locked dataset version.\n\nDisplayed information:\n\nDataset name\nTask type (Detection / Classification)\nVersion ID\n\nTraining always references an immutable dataset snapshot.\n\nTraining Controls\n\nAvailable actions:\n\nTraining – Active training session\nPause – Temporarily stop training without losing state\nStop – Terminate training run\nDownload Required – Indicates missing weights or dependencies\n\nTraining state is always explicit.',
                    },
                    {
                        title: 'GPU Status Panel',
                        body:
                            'GPU Ready Indicator\n\nShows whether the selected device is ready.\n\nDisplayed states:\n\nGPU Ready\nCPU Fallback\nGPU Not Available\n\nGPU Metrics (Live)\n\nDisplayed in real time:\n\nGPU Name\nTemperature\nUtilization (%)\nVRAM usage (used / total)\n\nThis ensures transparency and prevents silent over-allocation.',
                    },
                    {
                        title: 'Left Panel – Training Configuration',
                        body:
                            'Basic Settings\n\nModel\n\nSelected architecture\nInstallation status\nModel size tier (Small / Medium / Core)\n\nDevice\n\nCPU or GPU selection\nDevice switching allowed before training\n\nInput Settings\n\nInput Size\n\nControls image resizing before training.\nMust match model constraints\nApplied consistently across splits\n\nTraining Settings\n\nBatch Size\n\nImages processed per step\nAutomatically validated against VRAM\n\nEpochs\n\nTotal training iterations\nDisplayed with live progress\n\nLearning Rate\n\nInitial learning rate\nScheduler-aware\n\nOptimizer\n\nSupported:\n\nAdam\nSGD\nOthers (model dependent)\n\nScheduler\n\nSupported:\n\nCosine\nStep\nLinear\nFixed\n\nAugmentation Settings\n\nControlled via configuration toggle.\nUses dataset-safe augmentations\nApplied deterministically\nLogged per run\n\nCheckpoint Settings\n\nSave Every N Epochs\nControls checkpoint frequency.\n\nKeep Last N\nAutomatically prunes older checkpoints.\n\nSave Best Only\nStores best checkpoint based on evaluation metric.\n\nAll checkpoints are versioned artifacts.',
                    },
                    {
                        title: 'Dataset Summary Panel',
                        body:
                            'Displays immutable dataset facts:\n\nTotal image count\nClass count\nSplit distribution (Train / Val / Test)\n\nThis ensures training transparency and guards against silent dataset drift.',
                    },
                    {
                        title: 'Model Summary Panel',
                        body:
                            'Displays:\n\nTask type (Detection, Classification)\nModel speed tier\nCore size\nInstallation status\n\nEnsures alignment between dataset and model.',
                    },
                    {
                        title: 'Live Training Stats',
                        body:
                            'Displayed during training:\n\nCurrent epoch\nCurrent step\nCurrent loss\nEffective learning rate\nEstimated time remaining (ETA)\n\nAll values update in real time.',
                    },
                    {
                        title: 'Training Metrics Panel',
                        body:
                            'Loss Curve\n\nTraining loss over epochs\nSmoothed visualization\nUsed for convergence validation\n\nAccuracy / mAP Curve\n\nMetric depends on task\nDetection → mAP\nClassification → Accuracy\n\nDisplayed per epoch for trend analysis.\n\nLearning Rate Curve\n\nShows scheduler behavior\nHelps debug convergence issues\n\nGPU Stats Widget\n\nReal-time visualization of:\n\nUtilization\nMemory pressure\nThermal state\n\nCritical for debugging OOM and performance issues.',
                    },
                    {
                        title: 'Training Progress Bar',
                        body:
                            'Bottom progress bar shows:\n\nOverall training progress\nEpoch completion\nLast checkpoint timestamp\n\nTraining state is never ambiguous.',
                    },
                    {
                        title: 'Training Artifacts',
                        body:
                            'Each training run produces:\n\nModel weights\nTraining logs\nMetric history\nConfig snapshot\nDataset reference\nEnvironment metadata\n\nArtifacts are immutable and exportable.',
                    },
                    {
                        title: 'Determinism & Reproducibility',
                        body:
                            'ML FORGE guarantees:\n\nSame dataset version + same config = same result\nNo silent parameter changes\nNo mutable training state\nFull lineage tracking\n\nEvery run can be reproduced later.',
                    },
                    {
                        title: 'Failure Handling',
                        body:
                            'If training fails:\n\nError is logged\nPartial artifacts preserved\nDataset remains unchanged\nUser can resume or restart safely\nNo data corruption occurs.',
                    },
                    {
                        title: 'Relationship to Other Tabs',
                        body:
                            'Dataset Manager → supplies locked dataset\nAnnotation Studio → supplies reviewed labels\nTraining Logs → detailed execution logs\nInference → test trained model\nBenchmark → compare multiple runs\nExport → package model for deployment',
                    },
                    {
                        title: 'Best Practices',
                        body:
                            'Always review dataset health before training\nWatch class imbalance early\nMonitor GPU memory usage\nSave best checkpoints\nExport only reviewed runs',
                    },
                ],
            },
            '/docs/core-workflow/evaluation-and-benchmarks': {
                group: 'Core workflow',
                title: 'Evaluation & Benchmarks',
                lede: 'Compare runs, metrics, and models tied directly to the dataset and config that produced them.',
                sections: [
                    {
                        title: 'Why this exists',
                        body:
                            'Without consistent benchmarks, teams ship regressions. ML FORGE ties comparisons to dataset version and config so results remain meaningful.',
                    },
                    {
                        title: 'What you can do',
                        body: 'Metric comparison, run-to-run comparison, and regression detection.',
                    },
                ],
            },
            '/docs/core-workflow/export-and-deployment': {
                group: 'Core workflow',
                title: 'Export & Deployment',
                lede: 'The Export tab is where trained or pre-trained models are converted into deployment-ready formats for edge devices, servers, mobile apps, and production inference pipelines.',
                sections: [
                    {
                        title: 'Overview',
                        body:
                            'ML FORGE exports models locally, with full reproducibility, explicit configuration, and zero cloud dependency.\n\nThe Export workflow enables you to:\n\nConvert models into industry-standard inference formats\nApply precision and quantization optimizations\nTarget CPU, GPU, or edge hardware\nTrack export jobs and logs\nProduce immutable, reusable artifacts\n\nAll exports are deterministic and tied to:\n\nModel version\nDataset snapshot\nTraining configuration\nExport configuration',
                    },
                    {
                        title: 'Available Models Panel',
                        body:
                            'Location: Left sidebar → Available Models\n\nThis panel lists all models available for export.\n\nWhat you see\n\nModel name (e.g. YOLOv8)\nModel type (Pretrained / Trained)\nDownload status\nFile size\nCreation date\nLocal model path\n\nSupported model sources\n\nPretrained models (Model Zoo)\nLocally trained models\nImported custom checkpoints\n\nOnly models marked Downloaded can be exported.',
                    },
                    {
                        title: 'Export Format Selection',
                        body:
                            'Location: Main panel → Select the target format for your model export\n\nEach card represents a supported export format.',
                    },
                    {
                        title: 'Supported Export Formats',
                        body:
                            'ONNX\n\nUniversal, framework-agnostic format\nIdeal for cross-platform deployment\nSupports FP32 / FP16 / INT8\nCPU compatible\nUse when: deploying to heterogeneous environments or inference runtimes.\n\nTorchScript\n\nPyTorch-optimized serialized format\nProduction-ready for PyTorch inference\nSupports FP32 / FP16 / INT8\nCPU compatible\nUse when: staying fully inside the PyTorch ecosystem.\n\nTensorRT\n\nNVIDIA GPU-optimized inference engine\nMaximum performance and lowest latency\nRequires GPU\nSupports FP32 / FP16 / INT8\nUse when: deploying on NVIDIA GPUs for real-time inference.\n\nTensorFlow Lite\n\nLightweight format for mobile and edge devices\nOptimized for low-power inference\nSupports FP32 / INT8\nCPU compatible\nUse when: deploying to Android, embedded, or edge devices.\n\nCoreML\n\nApple ML framework\nNative support for iOS and macOS\nSupports FP32 / FP16 / INT8\nCPU compatible\nUse when: deploying to Apple devices.\n\nNCNN\n\nTencent NCNN inference framework\nDesigned for mobile and embedded systems\nSupports FP32 / INT8\nCPU compatible\nUse when: deploying to Android or embedded Linux.\n\nOpenVINO\n\nIntel-optimized inference toolkit\nOptimized for Intel CPUs and accelerators\nSupports FP32 / FP16 / INT8\nUse when: deploying on Intel hardware.\n\nSafeTensors\n\nSecure and fast tensor serialization format\nPrevents arbitrary code execution\nSupports FP32 / FP16\nCPU compatible\nUse when: storing or distributing weights securely.',
                    },
                    {
                        title: 'Compatibility Indicators',
                        body:
                            'Each export card displays:\n\nCompatible status\nCPU / GPU requirements\nDependency count\nSupported precision modes\n\nThese checks are evaluated before export, preventing invalid configurations.',
                    },
                    {
                        title: 'Export Settings',
                        body:
                            'Location: Below format selection\n\nDevice Selection\n\nChoose where the export should be optimized for:\n\nAuto – ML FORGE selects the optimal device\nCPU – CPU-only export\nGPU – GPU-optimized export\n\nQuantization\n\nControls numerical precision and model size.\n\nFP32 – Full Precision\nBest accuracy\nLargest file size\n\nFP16 – Half Precision\n2× smaller than FP32\nGood balance of speed and accuracy\n\nINT8 – Quantized\nSmallest size\nFastest inference\nMay reduce accuracy\n\nINT8 is recommended for edge and mobile deployment.\n\nDynamic Input Shapes\n\nAllow Variable Input Sizes\nEnables dynamic batch sizes\nSupports variable image dimensions\nUseful for real-world inference pipelines\n\nOptimization\n\nEnable Optimizations\nApplies:\n\nGraph simplification\nOperator fusion\nInference-time optimizations\n\nRecommended for production exports.',
                    },
                    {
                        title: 'Start Export',
                        body:
                            'Action: Click Start Export\n\nThis triggers:\n\nModel conversion\nPrecision application\nOptimization\nArtifact generation\n\nExports run locally on your machine.',
                    },
                    {
                        title: 'Export Jobs & Logs',
                        body:
                            'Location: Right panel → Export Logs\n\nExport Logs\n\nReal-time logs during export\nError reporting\nDependency resolution output\n\nIf no export is running:\n\n“No logs yet. Start an export to see logs here.”',
                    },
                    {
                        title: 'Export Artifacts',
                        body:
                            'Location: Right panel → Export Artifacts\n\nAfter completion, exported models appear here.\n\nEach artifact includes:\n\nExport format\nPrecision\nDevice target\nTimestamp\nImmutable artifact hash\n\nArtifacts are reusable, shareable, and traceable.',
                    },
                    {
                        title: 'Reproducibility Guarantee',
                        body:
                            'Every export is tied to:\n\nModel ID\nDataset version\nTraining run\nExport configuration\n\nThis guarantees:\n\nDeterministic results\nAuditable lineage\nRepeatable deployments',
                    },
                    {
                        title: 'Common Use Cases',
                        body:
                            'Export YOLO models for edge cameras\nConvert trained models to TensorRT for GPU inference\nGenerate CoreML models for iOS apps\nPackage SafeTensors for secure distribution\nPrepare OpenVINO models for Intel hardware',
                    },
                    {
                        title: 'Best Practices',
                        body:
                            'Use FP16 for GPU inference\nUse INT8 for mobile or edge\nEnable optimizations for production\nKeep dynamic input enabled for flexible pipelines\nArchive export artifacts alongside training logs',
                    },
                ],
            },
            '/docs/model-zoo': {
                group: 'Models',
                title: 'Model Zoo',
                lede: 'Browse supported architectures, backbones, and task-specific presets that ML FORGE can train, evaluate, and export reproducibly.',
                sections: [
                    {
                        title: 'Overview',
                        body:
                            'The Model Zoo is a curated set of model definitions that ML FORGE can run locally. Each entry declares supported tasks, expected dataset formats, and export targets.',
                    },
                    {
                        title: 'What you get',
                        body:
                            'Task-ready presets\nDeterministic configs\nReproducible training defaults\nExport compatibility notes',
                    },
                    {
                        title: 'Design principle',
                        body:
                            'Models are referenced by explicit versions and pinned configs so training and exports are repeatable over time.',
                    },
                ],
            },
            '/docs/reproducibility-and-lineage': {
                group: 'Validation',
                title: 'Benchmark',
                lede: 'The Benchmark tab is used to compare models, runs, and configurations using consistent, repeatable evaluation criteria.',
                sections: [
                    {
                        title: 'Overview',
                        body:
                            'Benchmarking in ML FORGE is:\n\nDataset-aware\nMetric-driven\nVersion-locked\nAudit-ready',
                    },
                    {
                        title: 'Purpose of Benchmarking',
                        body:
                            'The Benchmark tab answers:\n\nWhich model performs better?\nWhich configuration is optimal?\nWhat trade-offs exist between accuracy and speed?\nIs performance improving or regressing?\n\nBenchmarks are comparative, not absolute.',
                    },
                    {
                        title: 'Benchmark Inputs',
                        body:
                            'A benchmark always includes:\n\nOne or more trained models\nA fixed evaluation dataset\nExplicit metric definitions\n\nAll comparisons use the same dataset snapshot.',
                    },
                    {
                        title: 'Supported Metrics',
                        body:
                            'Metrics depend on task type.\n\nObject Detection\n\nmAP\nPrecision\nRecall\nIoU\n\nClassification\n\nAccuracy\nPrecision\nRecall\nConfusion matrix\n\nSegmentation\n\nmIoU\nPixel accuracy\nClass-wise metrics\n\nMetrics are computed identically across runs.',
                    },
                    {
                        title: 'Model Comparison',
                        body:
                            'You can benchmark:\n\nDifferent model architectures\nDifferent training configs\nDifferent dataset versions\nDifferent checkpoints\n\nEach comparison is timestamped and versioned.',
                    },
                    {
                        title: 'Performance Metrics',
                        body:
                            'In addition to accuracy, Benchmark captures:\n\nInference latency\nThroughput (FPS)\nMemory usage\nDevice utilization\n\nThis enables accuracy vs performance trade-off analysis.',
                    },
                    {
                        title: 'Visualization',
                        body:
                            'Benchmark results are shown as:\n\nSide-by-side metric tables\nTrend charts\nHighlighted best-performing runs\n\nVisuals are generated from stored results — not recomputed live.',
                    },
                    {
                        title: 'Benchmark History',
                        body:
                            'Benchmarks are saved and reusable.\n\nYou can:\n\nReopen past benchmarks\nCompare new models against old ones\nTrack performance evolution over time\n\nNothing is overwritten.',
                    },
                    {
                        title: 'Failure Handling',
                        body:
                            'If a benchmark fails:\n\nThe failure is logged\nPartial results are preserved\nThe cause is explained\n\nBenchmarking never corrupts model artifacts.',
                    },
                    {
                        title: 'Exporting Benchmark Results',
                        body:
                            'Benchmark results can be exported as:\n\nTables\nReports\nStructured data\n\nUseful for:\n\nStakeholder reviews\nCompliance\nResearch documentation',
                    },
                    {
                        title: 'Relationship to Other Tabs',
                        body:
                            'Benchmark connects to:\n\nTraining Logs → understand why metrics differ\nInference → validate qualitative behavior\nExport → choose the best model to deploy\n\nBenchmarking is the decision layer of ML FORGE.',
                    },
                    {
                        title: 'Best Practices',
                        body:
                            'Always benchmark before exporting\nCompare against a known baseline\nKeep datasets fixed\nUse multiple metrics\nReview logs for anomalies',
                    },
                    {
                        title: 'Why ML FORGE Benchmarking Is Different',
                        body:
                            'ML FORGE benchmarking is:\n\nLocal\nTransparent\nDeterministic\nDataset-version aware\n\nNo cloud black boxes. No hidden preprocessing.',
                    },
                ],
            },
            '/docs/ide-reference': {
                group: 'Reference',
                title: 'IDE Reference',
                lede: 'What you see in the IDE and what it changes on disk.',
                sections: [
                    {
                        title: 'Why this exists',
                        body:
                            'Trust comes from transparency. This page maps UI actions to on-disk files so you always know what changed.',
                    },
                    {
                        title: 'Major panels',
                        body:
                            'Dataset Manager UI\nAnnotation UI\nTraining Dashboard\nMetrics View',
                    },
                ],
            },
            '/docs/releases': {
                group: 'Validation',
                title: 'Inference',
                lede: 'The Inference tab is where trained models are validated in real-world conditions before deployment.',
                sections: [
                    {
                        title: 'Overview',
                        body:
                            'It allows you to run predictions on images, folders, or streams using exact exported weights and configs.\n\nInference in ML FORGE is:\n\nLocal-first\nDeterministic\nArtifact-driven\nFully traceable back to training',
                    },
                    {
                        title: 'Purpose of Inference',
                        body:
                            'The Inference tab answers:\n\nHow does the model behave on unseen data?\nAre predictions correct, stable, and fast?\nIs the exported model usable in production?\nDoes inference match training expectations?\n\nInference is not a demo — it is a validation stage.',
                    },
                    {
                        title: 'Supported Inference Modes',
                        body:
                            'ML FORGE supports multiple inference workflows:\n\nImage Inference\n\nSingle image prediction\nVisual overlay (boxes, masks, landmarks)\nConfidence scores per class\n\nFolder / Batch Inference\n\nRun inference on a directory of images\nUseful for sanity checks and QA\nProduces aggregated results\n\nVideo Inference (optional)\n\nFrame-by-frame prediction\nTemporal consistency validation\nPerformance profiling\n\nCamera / Stream (optional)\n\nReal-time inference testing\nLatency and throughput validation',
                    },
                    {
                        title: 'Model Selection',
                        body:
                            'Inference always runs using:\n\nA specific trained model version\nA fixed dataset snapshot (if applicable)\nExplicit preprocessing configuration\n\nYou can select:\n\nLast trained model\nBest checkpoint\nExported artifact\n\nNo implicit model switching occurs.',
                    },
                    {
                        title: 'Inference Configuration',
                        body:
                            'Device Selection\n\nAuto\nCPU\nGPU\n\nDevice choice affects:\n\nLatency\nThroughput\nPrecision support\n\nPrecision / Quantization\n\nDepending on model export:\n\nFP32 (maximum accuracy)\nFP16 (balanced)\nINT8 (fastest, smallest)\n\nInference precision must match export compatibility.\n\nInput Settings\n\nFixed input size\nDynamic input (if enabled during export)\nBatch size control\n\nThis ensures inference behavior matches deployment expectations.',
                    },
                    {
                        title: 'Visualization Layer',
                        body:
                            'The Inference tab provides rich visual feedback:\n\nBounding boxes\nSegmentation masks\nKeypoints\nClass labels\nConfidence scores\n\nVisuals are rendered after model output, not during inference, preserving performance fidelity.',
                    },
                    {
                        title: 'Inference Logs',
                        body:
                            'Every inference run generates logs:\n\nModel load events\nInput preprocessing\nDevice usage\nRuntime errors\n\nThese logs are separate from Training Logs but follow the same deterministic principles.',
                    },
                    {
                        title: 'Output Artifacts',
                        body:
                            'Inference outputs can be:\n\nViewed inline\nExported as images\nSaved as structured JSON\n\nThis allows downstream evaluation and reporting.',
                    },
                    {
                        title: 'Reproducibility Guarantees',
                        body:
                            'Inference is reproducible because:\n\nModel version is fixed\nPreprocessing is explicit\nDevice choice is logged\nNo hidden defaults exist\n\nIf inference differs, logs explain why.',
                    },
                    {
                        title: 'When to Use Inference',
                        body:
                            'Use the Inference tab to:\n\nValidate training quality\nDebug mispredictions\nTest export compatibility\nConfirm deployment readiness\n\nInference is the last gate before Benchmarking and Export.',
                    },
                ],
            },
        }),
        []
    )

    const navGroups = useMemo(
        () => [
            {
                title: 'Getting started',
                items: [
                    { title: 'What is ML FORGE', href: '/docs/getting-started/what-is-mlforge' },
                    { title: 'Install ML FORGE', href: '/docs/getting-started/install' },
                    { title: 'ML FORGE Workspace Overview', href: '/docs/getting-started/workspace-overview' },
                    { title: 'Your First Vision AI Project', href: '/docs/getting-started/first-project' },
                ],
            },
            {
                title: 'Core workflow',
                items: [
                    { title: 'Dataset Manager', href: '/docs/core-workflow/dataset-manager' },
                    { title: 'Annotation Studio', href: '/docs/core-workflow/annotation-studio' },
                    { title: 'Training Logs', href: '/docs/core-workflow/review-and-lock' },
                    { title: 'Training & Runs', href: '/docs/core-workflow/training-and-runs' },
                    { title: 'Evaluation & Benchmarks', href: '/docs/core-workflow/evaluation-and-benchmarks' },
                    { title: 'Export & Deployment', href: '/docs/core-workflow/export-and-deployment' },
                ],
            },
            {
                title: 'Models',
                items: [{ title: 'Model Zoo', href: '/docs/model-zoo' }],
            },
            {
                title: 'Validation',
                items: [
                    { title: 'Inference', href: '/docs/releases' },
                    { title: 'Benchmark', href: '/docs/reproducibility-and-lineage' },
                ],
            },
            {
                title: 'Reference',
                items: [{ title: 'IDE Reference', href: '/docs/ide-reference' }],
            },
        ],
        []
    )

    const isIndex = path === '/docs' || path === '/docs/'
    const currentPage = pages[path]
    const fallbackPage = pages['/docs/getting-started/what-is-mlforge']

    return (
        <div className="docsTheme docsTheme--dark">
            {isIndex ? (
                <>
                    <section className="docsIndexHero">
                        <div className="container docsIndexHero__inner">
                            <div className="docsIndexHeroTop">
                                <div className="docsIndexHeroCopy">
                                    <div className="docsIndexHeroCopy__accent" aria-hidden="true" />
                                    <div className="docsIndexHeroCopy__text">
                                        <h1 className="docsIndexHero__title">Welcome to ML FORGE documentation</h1>
                                        <p className="docsIndexHero__subtitle">
                                            Everything you need to build, train, evaluate, and ship Vision AI — with deterministic, local-first workflows.
                                            Start here if you’re training and deploying a YOLO model locally.
                                        </p>
                                    </div>
                                </div>

                                <a
                                    className="docsIndexHeroTop__pill"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                >
                                    Back to top
                                </a>
                            </div>

                            <div className="docsIndexSearch" role="search" aria-label="Search documentation">
                                <input
                                    className="docsIndexSearch__input"
                                    type="search"
                                    placeholder="Search datasets, training, configs, exports…"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="docsIndex">
                        <div className="container">
                            <div className="docsIndexGrid">
                                <a
                                    className="docsTopicCard"
                                    href="/docs/getting-started/what-is-mlforge"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/getting-started/what-is-mlforge')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Get Started</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Install ML FORGE, understand the workspace model, and run your first reproducible Vision AI project.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/core-workflow/dataset-manager"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/core-workflow/dataset-manager')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Dataset Manager</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Import, organize, version, and snapshot image and video datasets with explicit metadata and repeatable inputs.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/core-workflow/annotation-studio"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/core-workflow/annotation-studio')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Annotation Studio</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Label and review vision data with review-gated changes, audit history, and fewer labeling regressions.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/model-zoo"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/model-zoo')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Model Zoo</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Browse supported model architectures, backbones, tasks, and export-ready presets.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/core-workflow/review-and-lock"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/core-workflow/review-and-lock')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Training Logs</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Real-time, immutable training logs for debugging, auditing, and reproducing any run.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/core-workflow/training-and-runs"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/core-workflow/training-and-runs')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Training &amp; Runs</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Run training with explicit configs, tracked metrics, and immutable artifacts — locally or on-prem.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/core-workflow/evaluation-and-benchmarks"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/core-workflow/evaluation-and-benchmarks')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Evaluation &amp; Benchmarks</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Compare runs, metrics, and models tied directly to the dataset snapshot and config that produced them.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/core-workflow/export-and-deployment"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/core-workflow/export-and-deployment')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Export &amp; Deployment</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Export models with configs and metrics for edge, on-prem, or offline deployment — without cloud lock-in.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/releases"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/releases')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Inference</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Validate models on real-world images, batches, or streams using exported artifacts.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/reproducibility-and-lineage"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/reproducibility-and-lineage')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">Benchmark</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Compare models and runs with fixed datasets and deterministic metrics.
                                    </div>
                                </a>

                                <a
                                    className="docsTopicCard"
                                    href="/docs/ide-reference"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/docs/ide-reference')
                                    }}
                                >
                                    <div className="docsTopicCard__titleRow">
                                        <div className="docsTopicCard__title">IDE Reference</div>
                                        <span className="docsTopicCard__arrow" aria-hidden="true">→</span>
                                    </div>
                                    <div className="docsTopicCard__body">
                                        Detailed reference for ML FORGE UI panels, controls, and workflows.
                                    </div>
                                </a>

                            </div>

                            <div className="docsIndexBottom">
                                <a className="docsIndexBottom__link" href="#">Looking for documentation from earlier ML FORGE builds?</a>
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                <section className="docsShell">
                    <div className="container docsShell__inner">
                        <aside className="docsSidebar" aria-label="Documentation navigation">
                            {navGroups.map((group) => (
                                <div key={group.title}>
                                    <div className="docsSidebar__section">{group.title}</div>
                                    {group.items.map((item) => (
                                        <a
                                            key={item.href}
                                            className={`docsSidebar__link ${item.href === path ? 'docsSidebar__link--active' : ''}`}
                                            href={item.href}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                navigate(item.href)
                                            }}
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </aside>

                        <article className="docsContent" aria-label="Documentation content">
                            <div className="docsContent__meta">
                                <span className="docsPill">ML FORGE Docs</span>
                                <span className="docsMetaDot" aria-hidden="true" />
                                <span>{(currentPage || fallbackPage).group}</span>
                            </div>

                            <h1 className="docsHero__title" style={{ marginTop: 12 }}>
                                {(currentPage || fallbackPage).title}
                            </h1>
                            <p className="docsP">{(currentPage || fallbackPage).lede}</p>

                            {(currentPage || fallbackPage).sections.map((section) => (
                                <div key={section.title}>
                                    <h2 className="docsH2">{section.title}</h2>
                                    <p className="docsP" style={{ whiteSpace: 'pre-line' }}>
                                        {section.body}
                                    </p>
                                </div>
                            ))}

                        </article>
                    </div>
                </section>
            )}
        </div>
    )
}

export default DocsPage
