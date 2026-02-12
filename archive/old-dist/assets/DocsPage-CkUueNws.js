import{r,j as e}from"./index-UkIvKgPy.js";function g(){const[i,l]=r.useState(()=>window.location.pathname||"/docs");r.useEffect(()=>{const n=()=>l(window.location.pathname||"/docs");return window.addEventListener("popstate",n),()=>window.removeEventListener("popstate",n)},[]);const t=n=>{!n||n===window.location.pathname||(window.history.pushState({},"",n),l(n),window.scrollTo({top:0,behavior:"smooth"}))},d=r.useMemo(()=>({"/docs/getting-started/what-is-mlforge":{group:"Getting started",title:"What is ML FORGE",lede:"ML FORGE is a desktop-first Vision AI IDE built for local execution, deterministic pipelines, and reproducible results.",sections:[{title:"Why this exists",body:"Vision systems fail in production when data and training inputs drift. ML FORGE makes every input explicit and file-backed so you can reproduce results across machines and over time."},{title:"What ML FORGE is",body:"A local-first IDE for the end-to-end computer vision workflow: dataset → annotation → review → train → evaluate → export. It is designed for offline, on-prem, and edge environments."},{title:"What ML FORGE does not try to solve",body:"It is not a cloud SaaS, not AutoML, and not an agent/LLM orchestration platform. ML FORGE focuses on deterministic vision workflows and audit-ready artifacts."},{title:"Who ML FORGE is for",body:"ML engineers, CV engineers, robotics teams, and applied AI teams building production vision systems in regulated or reliability-critical environments."},{title:"Who ML FORGE is not for",body:"Teams looking for hosted training infrastructure, cloud-managed pipelines, or generic ML platform features."}]},"/docs/getting-started/install":{group:"Getting started",title:"Install ML FORGE",lede:"Install ML FORGE locally. GPU is optional. CPU is supported.",sections:[{title:"Why this exists",body:"Local installation keeps your data and artifacts on your machine and removes hidden dependencies. It also enables offline and air-gapped deployments."},{title:"Supported OS",body:"Windows, macOS, and Linux."},{title:"Offline installation philosophy",body:"ML FORGE is designed to run without cloud accounts. Installers and dependencies can be staged and installed offline when required by policy."},{title:"Where ML FORGE stores data locally",body:"All project state lives inside your workspace. Datasets, annotations, runs, exports, and configs are file-backed and reviewable."},{title:"What gets installed",body:"The IDE, a local runtime for executing pipelines, and a local artifact store. No hidden background services."}]},"/docs/getting-started/workspace-overview":{group:"Getting started",title:"ML FORGE Workspace Overview",lede:"A workspace is a root folder. Projects live inside it. Everything is file-backed.",sections:[{title:"Why this exists",body:"A predictable on-disk layout makes runs reproducible, reviewable, and easy to hand off. It also makes audits practical."},{title:"Workspace structure",body:`workspace/
 ├─ datasets/
 ├─ annotations/
 ├─ runs/
 ├─ exports/
 └─ configs/`},{title:"Why this structure matters",body:"Each stage writes explicit artifacts. You can pin dataset snapshots, diff configs, and verify exactly what produced a model export."}]},"/docs/getting-started/first-project":{group:"Getting started",title:"Your First Vision AI Project",lede:"A step-by-step tutorial that mirrors the ML FORGE workflow.",sections:[{title:"Why this exists",body:"If you can do the workflow once end-to-end, you can reproduce it forever. This tutorial teaches the exact sequence ML FORGE enforces."},{title:"Step-by-step",body:`1) Create workspace
2) Import dataset
3) Annotate a few samples
4) Review & lock
5) Run training
6) View metrics
7) Export model`},{title:"Result",body:"If you can do this once, you can reproduce it forever."}]},"/docs/core-workflow/dataset-manager":{group:"Core workflow",title:"Dataset Manager",lede:"The Dataset Manager is the foundation of ML FORGE. Every model, training run, evaluation, and export begins here.",sections:[{title:"Overview",body:`ML FORGE treats datasets as versioned, immutable, and auditable assets — not folders of files.

The Dataset Manager provides a complete lifecycle for Vision AI datasets:

Import raw images and videos
Support multiple task types and models
Review, validate, and version data
Create deterministic splits
Manage classes and identities
Apply dataset tools safely
Guarantee reproducibility across training and export

All dataset operations are explicit, traceable, and reproducible.`},{title:"Supported Dataset Types",body:`ML FORGE supports multi-model and multi-task datasets:

Image Classification
Object Detection (YOLO-style)
Instance Segmentation (future-ready)
Face Recognition datasets
Multi-task datasets (shared images, different labels)
Video datasets (frame-based)

Each dataset explicitly declares its type and compatible models.`},{title:"Dataset Lifecycle",body:`A dataset in ML FORGE follows this lifecycle:

Upload dataset
Preview & explore
Validate structure
Manage classes
Configure splits
Apply tools (optional)
Create version snapshot
Lock for training
Use in training and export

Once locked, a dataset version is immutable.`},{title:"Your Datasets",body:`The Your Datasets view lists all datasets in the workspace.

Each dataset shows:

Dataset name
Dataset type
Total images / videos
Current version
Lock state (Draft / Locked)
Last modified time

Datasets can be reused across:

Multiple models
Multiple experiments
Multiple exports

Deleting or modifying a dataset never affects locked versions.`},{title:"Upload Dataset",body:`Purpose

Upload raw data into ML FORGE’s managed dataset system.

Supported Inputs

Image folders
Video files
Pre-labeled datasets (YOLO, COCO, custom JSON)
Face recognition folder structures

Upload Behavior

Files are copied into ML FORGE-managed storage
Metadata is generated automatically
Dataset enters Draft state
No training is allowed at this stage

Uploading data does not make it training-ready.`},{title:"Preview & Explore",body:`Purpose

Inspect dataset contents before annotation or training.

Capabilities

Image and video preview
Frame navigation for videos
Zoom and pan
Resolution and format inspection
Quick detection of corrupted files

Face Recognition Preview

View images grouped by identity
Detect identities with insufficient samples
Identify extreme imbalance across identities

This step prevents bad data from entering the pipeline.`},{title:"Validate Dataset",body:`Purpose

Ensure dataset correctness before training.

Validation Checks

File readability and format
Annotation file integrity
Class consistency
Missing or empty labels
Duplicate files
Face identity structure validation

Validation Results

Errors – must be fixed
Warnings – recommended fixes
Passed checks

Validation results are stored with the dataset version.

Only validated datasets can be locked and trained.`},{title:"Split Manager",body:`Purpose

Create deterministic train / validation / test splits.

Features

Percentage-based or fixed-size splits
Deterministic assignment (same input → same split)
Per-class distribution awareness
Identity-safe splits for face recognition

Rules

Splits are versioned
Changing a split creates a new dataset version
Training always references an explicit split

This guarantees fair and repeatable evaluation.`},{title:"Class Manager",body:`Purpose

Manage dataset classes and label definitions.

Capabilities

Create, rename, merge, or deactivate classes
View class frequency and imbalance
Detect unused or missing classes
Map external labels to internal classes

Important Rule

Any class change creates a new dataset version.

This prevents silent label drift across experiments.`},{title:"Tools",body:`Purpose

Safely operate on datasets without custom scripts.

Available Tools

Duplicate image detection
Corrupted file cleanup
Dataset statistics
Class distribution analysis
Identity imbalance detection (face datasets)
Face embedding inspection (future)

Safety Model

Tools never modify data silently
Every tool action is recorded
All changes create a new dataset version`},{title:"Versioning",body:`Purpose

Track every meaningful dataset change.

What Creates a New Version

Adding or removing files
Annotation updates
Class changes
Split changes
Tool-based cleanup

Version Properties

Immutable once locked
Fully traceable
Referenced by training runs and exports

Dataset versions are permanent records.`},{title:"Face Recognition Dataset Support",body:`ML FORGE provides first-class support for face recognition datasets.

Features

Identity-based dataset structure
Identity imbalance detection
Identity-aware train/val/test splits
Identity-level validation checks
Embedding visualization (planned)

This ensures fair and stable face recognition training.`},{title:"Multi-Model Dataset Support",body:`A single dataset can be reused across:

Different architectures
Different backbones
Different training configs

Models reference datasets by version, not by path.`},{title:"Reproducibility Guarantee",body:`Every dataset version records:

Input files
Annotations
Classes
Splits
Tool operations

Training, evaluation, and export always link back to the exact dataset version.

Key Design Principle

If you cannot reproduce the dataset, you cannot trust the model.

ML FORGE enforces dataset discipline so production failures don’t happen silently.`}]},"/docs/core-workflow/annotation-studio":{group:"Core workflow",title:"Annotation Studio",lede:"Annotation Studio is ML FORGE’s controlled environment for labeling vision datasets with review-gated changes, full history, and dataset version safety.",sections:[{title:"Purpose",body:`Annotation Studio enables teams to:

Label images and videos for Vision AI tasks
Apply consistent annotations across datasets
Review and approve changes before training
Preserve full annotation history
Prevent silent label drift

No annotation directly affects training until it is reviewed and locked.`},{title:"Supported Annotation Tasks",body:`Annotation Studio supports:

Object Detection (bounding boxes)
Image Classification
Face Recognition (identity tagging)
Instance Segmentation (planned / phase-gated)
Video frame annotation (frame-based)

Each dataset explicitly defines its annotation mode.`},{title:"Workspace Layout",body:`Annotation Studio is divided into five core regions:

Image Browser (left)
Annotation Canvas (center)
Tool Bar (top)
Class Panel (right)
Dataset Review Panel (right-bottom)

Each region operates independently but is synchronized.`},{title:"Image Browser",body:`Purpose

Browse, filter, and select dataset images for annotation.

Features

Thumbnail grid view
Image search by filename
Multi-select mode
Scroll-based lazy loading
Dataset progress indicator

Filters

You can filter images by:

All images
Unlabeled
Labeled
Reviewed
Review pending
Auto-annotated
Auto-pending review

Filters allow annotators and reviewers to focus on specific states.`},{title:"Annotation Canvas",body:`Purpose

Create and edit annotations directly on the image.

Capabilities

High-performance zoom and pan
Pixel-accurate bounding box placement
Resize and reposition annotations
Multi-object annotation per image
Keyboard shortcuts for speed

Interaction Model

Click to select
Drag to move
Resize from corners
Undo / Redo supported per image session

Canvas operations are non-destructive until saved.`},{title:"Annotation Tools",body:`Available Tools

Select
Bounding Box
Polygon (future)
Erase / Delete
Duplicate annotation
Adjust box precision
Auto-align helpers

Tool Rules

Tools only operate on the active image
Changes are tracked immediately
All actions are reversible until review`},{title:"Class Panel",body:`Purpose

Assign semantic meaning to annotations.

Features

Class search
Class selection dropdown
Active class highlighting
Class usage count
Class-level color coding

Rules

Classes come from Dataset Manager
New classes cannot be created here
Class changes update annotation metadata
Invalid classes are blocked

This ensures consistency across datasets.`},{title:"Auto-Annotate (Optional)",body:`Purpose

Accelerate labeling using pre-trained models.

Behavior

Uses selected model for inference
Generates draft annotations
Marks results as Auto-Pending
Requires human review before acceptance

Safety Guarantees

Auto-annotations never train directly
Confidence thresholds are configurable
All auto labels are traceable`},{title:"Review & Approval Flow",body:`Annotation States

Each image exists in one of the following states:

Unlabeled
Labeled
Review Pending
Reviewed

Review Rules

Annotators submit images for review
Reviewers approve or request changes
Only reviewed annotations are eligible for training
Review actions are logged

This enforces dataset quality at scale.`},{title:"Dataset Review Panel",body:`Purpose

Provide real-time dataset health visibility.

Summary Metrics

Total images
Annotated images
Reviewed images
Unlabeled images
Class count
Last modified timestamp

Health Checks

Images without annotations
Unreviewed labeled images
Classes with insufficient samples
Annotation imbalance

Health checks guide dataset readiness decisions.`},{title:"Multi-User Collaboration",body:`Supported Roles

Annotator
Reviewer
Dataset Owner

Behavior

Concurrent annotation supported
Conflict-safe saves
Review permissions enforced
Change ownership recorded

All actions are auditable.`},{title:"Annotation History",body:`Purpose

Maintain full traceability of label changes.

Tracked Data

Who made the change
What was changed
When it happened
Previous annotation state
Review decisions

Annotation history is immutable once locked.`},{title:"Dataset Versioning Impact",body:`Annotation changes:

Do NOT modify locked dataset versions
Create new dataset drafts
Require re-validation if rules change
Are snapshot into dataset versions

Training always references a specific dataset version.`},{title:"Performance & Stability",body:`Annotation Studio is optimized for:

Large datasets
High-resolution images
Long annotation sessions
Low-latency interaction

Operations are local-first when possible.`},{title:"Best Practices",body:`Validate datasets before annotation
Keep annotation sessions focused
Review frequently, not at the end
Watch class imbalance early
Lock datasets before training`},{title:"Common Errors & Warnings",body:`Missing annotations
Unreviewed images
Class mismatch
Incomplete dataset splits

These must be resolved before training.`},{title:"Relationship to Training",body:`Training Engine only accepts:

Reviewed annotations
Locked dataset versions
Valid class definitions
Deterministic splits

Annotation Studio enforces these guarantees upstream.`}]},"/docs/core-workflow/review-and-lock":{group:"Core workflow",title:"Training Logs",lede:"The Training Logs tab provides a real-time, immutable, and auditable record of everything that happens during a training run.",sections:[{title:"Overview",body:`It is designed for:

Debugging failed runs
Understanding training behavior
Auditing experiments
Reproducing results exactly

Unlike cloud dashboards, ML FORGE logs are local, explicit, and permanent.`},{title:"Purpose of Training Logs",body:`Training Logs answer four critical questions:

What happened during training?
When did it happen?
Why did it happen?
Can this run be reproduced exactly?

Every training run generates a complete log stream tied to:

Dataset snapshot
Model version
Training configuration
Hardware environment`},{title:"Log Scope",body:`Training Logs capture:

Dataset loading and validation
Model initialization
Hardware detection (CPU / GPU)
Training loop progress
Loss and metric updates
Optimizer and scheduler behavior
Checkpoint saving
Warnings and errors
Graceful stop / crash events

No information is hidden or aggregated away.`},{title:"Log Stream Layout",body:`Location: Top navigation → Training Logs

The interface is split into three logical sections:

1. Run Selector

Select which training run’s logs to view.

Each run is identified by:

Run ID
Model name
Dataset version
Timestamp
Status (Running / Completed / Failed / Stopped)

Switching runs immediately reloads the corresponding log stream.

2. Live Log Console

The main panel displays logs in chronological order.

Log Characteristics

Timestamped
Ordered
Color-coded by severity
Streamed live during training

Logs continue updating while training is active.

3. Log Controls

Controls typically include:

Auto-scroll toggle
Pause log streaming
Clear view (does not delete logs)
Copy selected lines
Export logs to file

These controls affect viewing only, not the underlying logs.`},{title:"Log Levels",body:`Training Logs use standard severity levels:

INFO

General progress updates:

Dataset loaded
Epoch started / completed
Checkpoint saved

DEBUG

Detailed internal operations:

Tensor shapes
Batch iteration details
Augmentation operations

Useful for advanced debugging.

WARNING

Non-fatal issues:

Missing optional dependencies
Minor data inconsistencies
Performance fallbacks

Training continues.

ERROR

Critical failures:

Invalid dataset structure
CUDA out-of-memory
Model incompatibility
Runtime exceptions

Training stops or fails.`},{title:"Training Phase Coverage",body:`Logs are grouped implicitly by training phases.

Initialization Phase

Includes:

Model loading
Weight initialization
Device selection
Dependency checks

Example events:

GPU detected
Model architecture resolved
Config parsed successfully

Dataset Phase

Includes:

Dataset snapshot loading
Split verification
Class consistency checks
Label validation

This ensures training inputs are stable and reproducible.

Training Loop Phase

Includes:

Epoch start/end
Batch processing
Loss values
Learning rate updates

Each step is logged deterministically.

Checkpoint Phase

Includes:

Checkpoint save triggers
File paths
Best-model selection logic

Logs explicitly state why a checkpoint was saved.

Completion Phase

Includes:

Training summary
Final metrics
Total runtime
Exit status`},{title:"Hardware & Environment Logs",body:`Training Logs record the execution environment:

CPU / GPU model
CUDA version
GPU memory usage
Device temperature (if available)
Library versions

This ensures full hardware reproducibility.`},{title:"Failure & Recovery Logs",body:`If a run fails, logs capture:

Exact failure point
Stack trace
Resource state
Last completed step

This allows:

Root cause analysis
Config correction
Safe reruns`},{title:"Log Persistence",body:`Training Logs are:

Stored locally
Immutable after run completion
Tied permanently to the training run

Deleting logs requires explicit user action.`},{title:"Exporting Logs",body:`Logs can be exported as:

Plain text
Structured log file

Exported logs include:

Run metadata
Full log stream
Environment summary

This is critical for:

Compliance
Team sharing
Long-term archiving`},{title:"Relationship to Other Tabs",body:`Training Logs are tightly integrated with:

Training Dashboard → metrics visualization
Dataset Manager → dataset snapshot reference
Export → exported models reference their training logs
Benchmark → performance comparisons reference logs

Logs act as the ground truth layer of the system.`},{title:"Best Practices",body:`Always review logs after a failed run
Export logs for important experiments
Use logs to compare behavior across model versions
Keep logs alongside exported artifacts
Treat logs as part of your experiment record`},{title:"Why ML FORGE Logs Are Different",body:`ML FORGE logs are:

Local-first
Deterministic
Non-aggregated
Fully auditable
Developer-readable

They are designed for serious ML engineering, not marketing dashboards.`}]},"/docs/core-workflow/training-and-runs":{group:"Core workflow",title:"Training Engine (Training Dashboard)",lede:"The Training Engine is the execution core of ML FORGE. It transforms locked datasets and selected models into deterministic training runs with full metric tracking, GPU visibility, and export-ready artifacts.",sections:[{title:"Overview",body:"Training always happens locally or on user-controlled infrastructure."},{title:"Purpose",body:`The Training Engine is designed to:

Run reproducible Vision AI training
Eliminate configuration ambiguity
Provide real-time metrics and GPU visibility
Capture every artifact needed for audit and export
Prevent accidental training on unstable datasets

Training is never allowed unless prerequisites are satisfied.`},{title:"Training Prerequisites",body:`Before training can start:

Dataset must be reviewed
Dataset version must be locked
Model must be installed
Device (CPU/GPU) must be available
Required weights must be downloaded

If any condition fails, training is blocked.`},{title:"Top Control Bar",body:`Model Selector

Select the model architecture to train.

Supported examples:

YOLOv5 / YOLOv8
Detection / Classification / (Segmentation – phase gated)

Model selection determines:

Input requirements
Output format
Metric definitions

Dataset Selector

Select the locked dataset version.

Displayed information:

Dataset name
Task type (Detection / Classification)
Version ID

Training always references an immutable dataset snapshot.

Training Controls

Available actions:

Training – Active training session
Pause – Temporarily stop training without losing state
Stop – Terminate training run
Download Required – Indicates missing weights or dependencies

Training state is always explicit.`},{title:"GPU Status Panel",body:`GPU Ready Indicator

Shows whether the selected device is ready.

Displayed states:

GPU Ready
CPU Fallback
GPU Not Available

GPU Metrics (Live)

Displayed in real time:

GPU Name
Temperature
Utilization (%)
VRAM usage (used / total)

This ensures transparency and prevents silent over-allocation.`},{title:"Left Panel – Training Configuration",body:`Basic Settings

Model

Selected architecture
Installation status
Model size tier (Small / Medium / Core)

Device

CPU or GPU selection
Device switching allowed before training

Input Settings

Input Size

Controls image resizing before training.
Must match model constraints
Applied consistently across splits

Training Settings

Batch Size

Images processed per step
Automatically validated against VRAM

Epochs

Total training iterations
Displayed with live progress

Learning Rate

Initial learning rate
Scheduler-aware

Optimizer

Supported:

Adam
SGD
Others (model dependent)

Scheduler

Supported:

Cosine
Step
Linear
Fixed

Augmentation Settings

Controlled via configuration toggle.
Uses dataset-safe augmentations
Applied deterministically
Logged per run

Checkpoint Settings

Save Every N Epochs
Controls checkpoint frequency.

Keep Last N
Automatically prunes older checkpoints.

Save Best Only
Stores best checkpoint based on evaluation metric.

All checkpoints are versioned artifacts.`},{title:"Dataset Summary Panel",body:`Displays immutable dataset facts:

Total image count
Class count
Split distribution (Train / Val / Test)

This ensures training transparency and guards against silent dataset drift.`},{title:"Model Summary Panel",body:`Displays:

Task type (Detection, Classification)
Model speed tier
Core size
Installation status

Ensures alignment between dataset and model.`},{title:"Live Training Stats",body:`Displayed during training:

Current epoch
Current step
Current loss
Effective learning rate
Estimated time remaining (ETA)

All values update in real time.`},{title:"Training Metrics Panel",body:`Loss Curve

Training loss over epochs
Smoothed visualization
Used for convergence validation

Accuracy / mAP Curve

Metric depends on task
Detection → mAP
Classification → Accuracy

Displayed per epoch for trend analysis.

Learning Rate Curve

Shows scheduler behavior
Helps debug convergence issues

GPU Stats Widget

Real-time visualization of:

Utilization
Memory pressure
Thermal state

Critical for debugging OOM and performance issues.`},{title:"Training Progress Bar",body:`Bottom progress bar shows:

Overall training progress
Epoch completion
Last checkpoint timestamp

Training state is never ambiguous.`},{title:"Training Artifacts",body:`Each training run produces:

Model weights
Training logs
Metric history
Config snapshot
Dataset reference
Environment metadata

Artifacts are immutable and exportable.`},{title:"Determinism & Reproducibility",body:`ML FORGE guarantees:

Same dataset version + same config = same result
No silent parameter changes
No mutable training state
Full lineage tracking

Every run can be reproduced later.`},{title:"Failure Handling",body:`If training fails:

Error is logged
Partial artifacts preserved
Dataset remains unchanged
User can resume or restart safely
No data corruption occurs.`},{title:"Relationship to Other Tabs",body:`Dataset Manager → supplies locked dataset
Annotation Studio → supplies reviewed labels
Training Logs → detailed execution logs
Inference → test trained model
Benchmark → compare multiple runs
Export → package model for deployment`},{title:"Best Practices",body:`Always review dataset health before training
Watch class imbalance early
Monitor GPU memory usage
Save best checkpoints
Export only reviewed runs`}]},"/docs/core-workflow/evaluation-and-benchmarks":{group:"Core workflow",title:"Evaluation & Benchmarks",lede:"Compare runs, metrics, and models tied directly to the dataset and config that produced them.",sections:[{title:"Why this exists",body:"Without consistent benchmarks, teams ship regressions. ML FORGE ties comparisons to dataset version and config so results remain meaningful."},{title:"What you can do",body:"Metric comparison, run-to-run comparison, and regression detection."}]},"/docs/core-workflow/export-and-deployment":{group:"Core workflow",title:"Export & Deployment",lede:"The Export tab is where trained or pre-trained models are converted into deployment-ready formats for edge devices, servers, mobile apps, and production inference pipelines.",sections:[{title:"Overview",body:`ML FORGE exports models locally, with full reproducibility, explicit configuration, and zero cloud dependency.

The Export workflow enables you to:

Convert models into industry-standard inference formats
Apply precision and quantization optimizations
Target CPU, GPU, or edge hardware
Track export jobs and logs
Produce immutable, reusable artifacts

All exports are deterministic and tied to:

Model version
Dataset snapshot
Training configuration
Export configuration`},{title:"Available Models Panel",body:`Location: Left sidebar → Available Models

This panel lists all models available for export.

What you see

Model name (e.g. YOLOv8)
Model type (Pretrained / Trained)
Download status
File size
Creation date
Local model path

Supported model sources

Pretrained models (Model Zoo)
Locally trained models
Imported custom checkpoints

Only models marked Downloaded can be exported.`},{title:"Export Format Selection",body:`Location: Main panel → Select the target format for your model export

Each card represents a supported export format.`},{title:"Supported Export Formats",body:`ONNX

Universal, framework-agnostic format
Ideal for cross-platform deployment
Supports FP32 / FP16 / INT8
CPU compatible
Use when: deploying to heterogeneous environments or inference runtimes.

TorchScript

PyTorch-optimized serialized format
Production-ready for PyTorch inference
Supports FP32 / FP16 / INT8
CPU compatible
Use when: staying fully inside the PyTorch ecosystem.

TensorRT

NVIDIA GPU-optimized inference engine
Maximum performance and lowest latency
Requires GPU
Supports FP32 / FP16 / INT8
Use when: deploying on NVIDIA GPUs for real-time inference.

TensorFlow Lite

Lightweight format for mobile and edge devices
Optimized for low-power inference
Supports FP32 / INT8
CPU compatible
Use when: deploying to Android, embedded, or edge devices.

CoreML

Apple ML framework
Native support for iOS and macOS
Supports FP32 / FP16 / INT8
CPU compatible
Use when: deploying to Apple devices.

NCNN

Tencent NCNN inference framework
Designed for mobile and embedded systems
Supports FP32 / INT8
CPU compatible
Use when: deploying to Android or embedded Linux.

OpenVINO

Intel-optimized inference toolkit
Optimized for Intel CPUs and accelerators
Supports FP32 / FP16 / INT8
Use when: deploying on Intel hardware.

SafeTensors

Secure and fast tensor serialization format
Prevents arbitrary code execution
Supports FP32 / FP16
CPU compatible
Use when: storing or distributing weights securely.`},{title:"Compatibility Indicators",body:`Each export card displays:

Compatible status
CPU / GPU requirements
Dependency count
Supported precision modes

These checks are evaluated before export, preventing invalid configurations.`},{title:"Export Settings",body:`Location: Below format selection

Device Selection

Choose where the export should be optimized for:

Auto – ML FORGE selects the optimal device
CPU – CPU-only export
GPU – GPU-optimized export

Quantization

Controls numerical precision and model size.

FP32 – Full Precision
Best accuracy
Largest file size

FP16 – Half Precision
2× smaller than FP32
Good balance of speed and accuracy

INT8 – Quantized
Smallest size
Fastest inference
May reduce accuracy

INT8 is recommended for edge and mobile deployment.

Dynamic Input Shapes

Allow Variable Input Sizes
Enables dynamic batch sizes
Supports variable image dimensions
Useful for real-world inference pipelines

Optimization

Enable Optimizations
Applies:

Graph simplification
Operator fusion
Inference-time optimizations

Recommended for production exports.`},{title:"Start Export",body:`Action: Click Start Export

This triggers:

Model conversion
Precision application
Optimization
Artifact generation

Exports run locally on your machine.`},{title:"Export Jobs & Logs",body:`Location: Right panel → Export Logs

Export Logs

Real-time logs during export
Error reporting
Dependency resolution output

If no export is running:

“No logs yet. Start an export to see logs here.”`},{title:"Export Artifacts",body:`Location: Right panel → Export Artifacts

After completion, exported models appear here.

Each artifact includes:

Export format
Precision
Device target
Timestamp
Immutable artifact hash

Artifacts are reusable, shareable, and traceable.`},{title:"Reproducibility Guarantee",body:`Every export is tied to:

Model ID
Dataset version
Training run
Export configuration

This guarantees:

Deterministic results
Auditable lineage
Repeatable deployments`},{title:"Common Use Cases",body:`Export YOLO models for edge cameras
Convert trained models to TensorRT for GPU inference
Generate CoreML models for iOS apps
Package SafeTensors for secure distribution
Prepare OpenVINO models for Intel hardware`},{title:"Best Practices",body:`Use FP16 for GPU inference
Use INT8 for mobile or edge
Enable optimizations for production
Keep dynamic input enabled for flexible pipelines
Archive export artifacts alongside training logs`}]},"/docs/model-zoo":{group:"Models",title:"Model Zoo",lede:"Browse supported architectures, backbones, and task-specific presets that ML FORGE can train, evaluate, and export reproducibly.",sections:[{title:"Overview",body:"The Model Zoo is a curated set of model definitions that ML FORGE can run locally. Each entry declares supported tasks, expected dataset formats, and export targets."},{title:"What you get",body:`Task-ready presets
Deterministic configs
Reproducible training defaults
Export compatibility notes`},{title:"Design principle",body:"Models are referenced by explicit versions and pinned configs so training and exports are repeatable over time."}]},"/docs/reproducibility-and-lineage":{group:"Validation",title:"Benchmark",lede:"The Benchmark tab is used to compare models, runs, and configurations using consistent, repeatable evaluation criteria.",sections:[{title:"Overview",body:`Benchmarking in ML FORGE is:

Dataset-aware
Metric-driven
Version-locked
Audit-ready`},{title:"Purpose of Benchmarking",body:`The Benchmark tab answers:

Which model performs better?
Which configuration is optimal?
What trade-offs exist between accuracy and speed?
Is performance improving or regressing?

Benchmarks are comparative, not absolute.`},{title:"Benchmark Inputs",body:`A benchmark always includes:

One or more trained models
A fixed evaluation dataset
Explicit metric definitions

All comparisons use the same dataset snapshot.`},{title:"Supported Metrics",body:`Metrics depend on task type.

Object Detection

mAP
Precision
Recall
IoU

Classification

Accuracy
Precision
Recall
Confusion matrix

Segmentation

mIoU
Pixel accuracy
Class-wise metrics

Metrics are computed identically across runs.`},{title:"Model Comparison",body:`You can benchmark:

Different model architectures
Different training configs
Different dataset versions
Different checkpoints

Each comparison is timestamped and versioned.`},{title:"Performance Metrics",body:`In addition to accuracy, Benchmark captures:

Inference latency
Throughput (FPS)
Memory usage
Device utilization

This enables accuracy vs performance trade-off analysis.`},{title:"Visualization",body:`Benchmark results are shown as:

Side-by-side metric tables
Trend charts
Highlighted best-performing runs

Visuals are generated from stored results — not recomputed live.`},{title:"Benchmark History",body:`Benchmarks are saved and reusable.

You can:

Reopen past benchmarks
Compare new models against old ones
Track performance evolution over time

Nothing is overwritten.`},{title:"Failure Handling",body:`If a benchmark fails:

The failure is logged
Partial results are preserved
The cause is explained

Benchmarking never corrupts model artifacts.`},{title:"Exporting Benchmark Results",body:`Benchmark results can be exported as:

Tables
Reports
Structured data

Useful for:

Stakeholder reviews
Compliance
Research documentation`},{title:"Relationship to Other Tabs",body:`Benchmark connects to:

Training Logs → understand why metrics differ
Inference → validate qualitative behavior
Export → choose the best model to deploy

Benchmarking is the decision layer of ML FORGE.`},{title:"Best Practices",body:`Always benchmark before exporting
Compare against a known baseline
Keep datasets fixed
Use multiple metrics
Review logs for anomalies`},{title:"Why ML FORGE Benchmarking Is Different",body:`ML FORGE benchmarking is:

Local
Transparent
Deterministic
Dataset-version aware

No cloud black boxes. No hidden preprocessing.`}]},"/docs/ide-reference":{group:"Reference",title:"IDE Reference",lede:"What you see in the IDE and what it changes on disk.",sections:[{title:"Why this exists",body:"Trust comes from transparency. This page maps UI actions to on-disk files so you always know what changed."},{title:"Major panels",body:`Dataset Manager UI
Annotation UI
Training Dashboard
Metrics View`}]},"/docs/releases":{group:"Validation",title:"Inference",lede:"The Inference tab is where trained models are validated in real-world conditions before deployment.",sections:[{title:"Overview",body:`It allows you to run predictions on images, folders, or streams using exact exported weights and configs.

Inference in ML FORGE is:

Local-first
Deterministic
Artifact-driven
Fully traceable back to training`},{title:"Purpose of Inference",body:`The Inference tab answers:

How does the model behave on unseen data?
Are predictions correct, stable, and fast?
Is the exported model usable in production?
Does inference match training expectations?

Inference is not a demo — it is a validation stage.`},{title:"Supported Inference Modes",body:`ML FORGE supports multiple inference workflows:

Image Inference

Single image prediction
Visual overlay (boxes, masks, landmarks)
Confidence scores per class

Folder / Batch Inference

Run inference on a directory of images
Useful for sanity checks and QA
Produces aggregated results

Video Inference (optional)

Frame-by-frame prediction
Temporal consistency validation
Performance profiling

Camera / Stream (optional)

Real-time inference testing
Latency and throughput validation`},{title:"Model Selection",body:`Inference always runs using:

A specific trained model version
A fixed dataset snapshot (if applicable)
Explicit preprocessing configuration

You can select:

Last trained model
Best checkpoint
Exported artifact

No implicit model switching occurs.`},{title:"Inference Configuration",body:`Device Selection

Auto
CPU
GPU

Device choice affects:

Latency
Throughput
Precision support

Precision / Quantization

Depending on model export:

FP32 (maximum accuracy)
FP16 (balanced)
INT8 (fastest, smallest)

Inference precision must match export compatibility.

Input Settings

Fixed input size
Dynamic input (if enabled during export)
Batch size control

This ensures inference behavior matches deployment expectations.`},{title:"Visualization Layer",body:`The Inference tab provides rich visual feedback:

Bounding boxes
Segmentation masks
Keypoints
Class labels
Confidence scores

Visuals are rendered after model output, not during inference, preserving performance fidelity.`},{title:"Inference Logs",body:`Every inference run generates logs:

Model load events
Input preprocessing
Device usage
Runtime errors

These logs are separate from Training Logs but follow the same deterministic principles.`},{title:"Output Artifacts",body:`Inference outputs can be:

Viewed inline
Exported as images
Saved as structured JSON

This allows downstream evaluation and reporting.`},{title:"Reproducibility Guarantees",body:`Inference is reproducible because:

Model version is fixed
Preprocessing is explicit
Device choice is logged
No hidden defaults exist

If inference differs, logs explain why.`},{title:"When to Use Inference",body:`Use the Inference tab to:

Validate training quality
Debug mispredictions
Test export compatibility
Confirm deployment readiness

Inference is the last gate before Benchmarking and Export.`}]}}),[]),c=r.useMemo(()=>[{title:"Getting started",items:[{title:"What is ML FORGE",href:"/docs/getting-started/what-is-mlforge"},{title:"Install ML FORGE",href:"/docs/getting-started/install"},{title:"ML FORGE Workspace Overview",href:"/docs/getting-started/workspace-overview"},{title:"Your First Vision AI Project",href:"/docs/getting-started/first-project"}]},{title:"Core workflow",items:[{title:"Dataset Manager",href:"/docs/core-workflow/dataset-manager"},{title:"Annotation Studio",href:"/docs/core-workflow/annotation-studio"},{title:"Training Logs",href:"/docs/core-workflow/review-and-lock"},{title:"Training & Runs",href:"/docs/core-workflow/training-and-runs"},{title:"Evaluation & Benchmarks",href:"/docs/core-workflow/evaluation-and-benchmarks"},{title:"Export & Deployment",href:"/docs/core-workflow/export-and-deployment"}]},{title:"Models",items:[{title:"Model Zoo",href:"/docs/model-zoo"}]},{title:"Validation",items:[{title:"Inference",href:"/docs/releases"},{title:"Benchmark",href:"/docs/reproducibility-and-lineage"}]},{title:"Reference",items:[{title:"IDE Reference",href:"/docs/ide-reference"}]}],[]),p=i==="/docs"||i==="/docs/",s=d[i],o=d["/docs/getting-started/what-is-mlforge"];return e.jsx("div",{className:"docsTheme docsTheme--dark",children:p?e.jsxs(e.Fragment,{children:[e.jsx("section",{className:"docsIndexHero",children:e.jsxs("div",{className:"container docsIndexHero__inner",children:[e.jsxs("div",{className:"docsIndexHeroTop",children:[e.jsxs("div",{className:"docsIndexHeroCopy",children:[e.jsx("div",{className:"docsIndexHeroCopy__accent","aria-hidden":"true"}),e.jsxs("div",{className:"docsIndexHeroCopy__text",children:[e.jsx("h1",{className:"docsIndexHero__title",children:"Welcome to ML FORGE documentation"}),e.jsx("p",{className:"docsIndexHero__subtitle",children:"Everything you need to build, train, evaluate, and ship Vision AI — with deterministic, local-first workflows. Start here if you’re setting up a reproducible workflow on your own hardware."})]})]}),e.jsx("a",{className:"docsIndexHeroTop__pill",href:"#",onClick:n=>{n.preventDefault(),window.scrollTo({top:0,behavior:"smooth"})},children:"Back to top"})]}),e.jsx("div",{className:"docsIndexSearch",role:"search","aria-label":"Search documentation",children:e.jsx("input",{className:"docsIndexSearch__input",type:"search",placeholder:"Search datasets, training, configs, exports…"})})]})}),e.jsx("section",{className:"docsIndex",children:e.jsxs("div",{className:"container",children:[e.jsxs("div",{className:"docsIndexGrid",children:[e.jsxs("a",{className:"docsTopicCard",href:"/docs/getting-started/what-is-mlforge",onClick:n=>{n.preventDefault(),t("/docs/getting-started/what-is-mlforge")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Get Started"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Install ML FORGE, understand the workspace model, and run your first reproducible Vision AI project."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/core-workflow/dataset-manager",onClick:n=>{n.preventDefault(),t("/docs/core-workflow/dataset-manager")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Dataset Manager"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Import, organize, version, and snapshot image and video datasets with explicit metadata and repeatable inputs."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/core-workflow/annotation-studio",onClick:n=>{n.preventDefault(),t("/docs/core-workflow/annotation-studio")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Annotation Studio"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Label and review vision data with review-gated changes, audit history, and fewer labeling regressions."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/model-zoo",onClick:n=>{n.preventDefault(),t("/docs/model-zoo")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Model Zoo"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Browse supported model architectures, backbones, tasks, and export-ready presets."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/core-workflow/review-and-lock",onClick:n=>{n.preventDefault(),t("/docs/core-workflow/review-and-lock")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Training Logs"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Real-time, immutable training logs for debugging, auditing, and reproducing any run."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/core-workflow/training-and-runs",onClick:n=>{n.preventDefault(),t("/docs/core-workflow/training-and-runs")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Training & Runs"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Run training with explicit configs, tracked metrics, and immutable artifacts — locally or on-prem."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/core-workflow/evaluation-and-benchmarks",onClick:n=>{n.preventDefault(),t("/docs/core-workflow/evaluation-and-benchmarks")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Evaluation & Benchmarks"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Compare runs, metrics, and models tied directly to the dataset snapshot and config that produced them."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/core-workflow/export-and-deployment",onClick:n=>{n.preventDefault(),t("/docs/core-workflow/export-and-deployment")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Export & Deployment"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Export models with configs and metrics for edge, on-prem, or offline deployment — without cloud lock-in."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/releases",onClick:n=>{n.preventDefault(),t("/docs/releases")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Inference"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Validate models on real-world images, batches, or streams using exported artifacts."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/reproducibility-and-lineage",onClick:n=>{n.preventDefault(),t("/docs/reproducibility-and-lineage")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"Benchmark"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Compare models and runs with fixed datasets and deterministic metrics."})]}),e.jsxs("a",{className:"docsTopicCard",href:"/docs/ide-reference",onClick:n=>{n.preventDefault(),t("/docs/ide-reference")},children:[e.jsxs("div",{className:"docsTopicCard__titleRow",children:[e.jsx("div",{className:"docsTopicCard__title",children:"IDE Reference"}),e.jsx("span",{className:"docsTopicCard__arrow","aria-hidden":"true",children:"→"})]}),e.jsx("div",{className:"docsTopicCard__body",children:"Detailed reference for ML FORGE UI panels, controls, and workflows."})]})]}),e.jsx("div",{className:"docsIndexBottom",children:e.jsx("a",{className:"docsIndexBottom__link",href:"#",children:"Looking for documentation from earlier ML FORGE builds?"})})]})})]}):e.jsx("section",{className:"docsShell",children:e.jsxs("div",{className:"container docsShell__inner",children:[e.jsx("aside",{className:"docsSidebar","aria-label":"Documentation navigation",children:c.map(n=>e.jsxs("div",{children:[e.jsx("div",{className:"docsSidebar__section",children:n.title}),n.items.map(a=>e.jsx("a",{className:`docsSidebar__link ${a.href===i?"docsSidebar__link--active":""}`,href:a.href,onClick:u=>{u.preventDefault(),t(a.href)},children:a.title},a.href))]},n.title))}),e.jsxs("article",{className:"docsContent","aria-label":"Documentation content",children:[e.jsxs("div",{className:"docsContent__meta",children:[e.jsx("span",{className:"docsPill",children:"ML FORGE Docs"}),e.jsx("span",{className:"docsMetaDot","aria-hidden":"true"}),e.jsx("span",{children:(s||o).group})]}),e.jsx("h1",{className:"docsHero__title",style:{marginTop:12},children:(s||o).title}),e.jsx("p",{className:"docsP",children:(s||o).lede}),(s||o).sections.map(n=>e.jsxs("div",{children:[e.jsx("h2",{className:"docsH2",children:n.title}),e.jsx("p",{className:"docsP",style:{whiteSpace:"pre-line"},children:n.body})]},n.title))]})]})})})}export{g as default};
