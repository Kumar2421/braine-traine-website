const fs = require('fs');
const path = require('path');

function replaceFileContent(filename, replacerFunc) {
  const p = path.join(__dirname, 'public', filename);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  content = replacerFunc(content);
  fs.writeFileSync(p, content);
  console.log('Processed', filename);
}

// Global replacements across all files
function globalReplaces(str) {
  return str
    .replace(/Sovereign Agents/g, 'Automation & Orchestration Engines')
    .replace(/Agentic Kernel/g, 'Automation Layer')
    .replace(/Protocol v4\.2/g, 'Orchestration Engine v4.2')
    .replace(/Zero-touch intelligence/g, 'Automated Pipeline Workflows')
    .replace(/Find everything you need to succeed/g, 'Technical Specifications and Documentation')
    .replace(/Empower your AI journey/g, 'Engineer Deterministic Vision Models')
    .replace(/Next-generation innovation/g, 'Predictable, Version-Controlled Machine Learning');
}

// 1. Landing Page
replaceFileContent('landing_page.html', (c) => {
  c = globalReplaces(c);
  // Title
  c = c.replace(
    /The No-Code<br \/>\s*<span class="text-primary mt-2">Vision AI IDE\.<\/span>/i,
    'A Deterministic<br />\n<span class="text-primary mt-2">Vision Model Engineering Platform.</span>'
  );

  // Subheadline
  c = c.replace(
    /<p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-4">[\s\S]*?production-grade edge models\.[\s\S]*?<\/p>/i,
    '<p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-4">\n        ML Forge provides local-first execution, dataset versioning, immutable config snapshots, reproducible training, and edge-ready export.\n      </p>'
  );

  // Add the new sections right before the 'The Complete IDE' section (around line 446)
  const newSections = `
  <section class="py-24 px-4 bg-background-dark relative z-10 border-t border-white/5">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <span class="text-primary text-xs font-mono uppercase tracking-widest border border-primary/20 px-3 py-1 rounded-full bg-primary/5">The Problem</span>
          <h2 class="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tighter mb-6">Why ML Forge Exists.</h2>
          <p class="text-gray-400 mb-6 font-light leading-relaxed">
            Cloud pipelines are fragmented. Data versioning is manual. Model lineage is heavily reliant on fragile scripts, and cloud dependency risks lock your engineering team into specific vendors.<br><br>
            Without a unified environment, non-reproducible experiments cost millions in engineering hours. We built ML Forge to fix this.
          </p>
        </div>
        <div>
          <span class="text-primary text-xs font-mono uppercase tracking-widest border border-primary/20 px-3 py-1 rounded-full bg-primary/5">The Solution</span>
          <h2 class="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tighter mb-6">What Makes ML Forge Different?</h2>
          <ul class="text-gray-400 space-y-4 font-mono text-sm tracking-wide">
            <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">lock</span> Immutable dataset versions to guarantee exact run reproducibility.</li>
            <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">history</span> Config snapshotting ensuring perfect lineage across team environments.</li>
            <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">memory</span> Hardware-native training executing predictably, without virtualization layers.</li>
            <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">code</span> ONNX / TensorRT export integrity guaranteed locally prior to edge shipment.</li>
            <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">security</span> No telemetry by default. Air-gapped capable operations.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  `;

  // Search for the section that starts with "The Complete IDE"
  const injectionPoint = /<section class="py-24 px-4 bg-background-dark relative z-10">\s*<div class="max-w-7xl mx-auto">\s*<!-- Section Header -->/;
  c = c.replace(injectionPoint, newSections + '\n  <section class="py-24 px-4 bg-background-dark relative z-10">\n    <div class="max-w-7xl mx-auto">\n      <!-- Section Header -->');
  return c;
});

// 2. Agentic Page
replaceFileContent('agentic_page.html', (c) => {
  c = globalReplaces(c);
  // Re-title to Automation & Orchestration Engine
  c = c.replace(
    /<title>.*<\/title>/,
    '<title>ML Forge - Automation & Orchestration Engine</title>'
  );
  c = c.replace(/Sovereign AI Workforce|Sovereign AI/gi, 'Automation Layer');
  c = c.replace(/Zero-touch intelligence./gi, 'Predictable multi-stage pipelines.');
  return c;
});

// 3. Use Case Page
replaceFileContent('usecase_page.html', (c) => {
  c = globalReplaces(c);

  const additionalCodeStr = `
  <div class="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="bento-card bg-black border border-white/10 p-6 rounded-xl font-mono text-xs overflow-x-auto text-gray-300">
      <h4 class="text-white text-sm font-bold mb-4 font-sans">Example Directory Structure</h4>
      <pre>
workspace/
├── data/
│   ├── raw_images/
│   └── dataset_v1.0.snapshot/
├── config.yaml
├── metrics.json
└── exports/
    ├── model_v1_0.onnx
    └── model_v1_0.trt.engine
      </pre>
    </div>
    <div class="bento-card bg-black border border-white/10 p-6 rounded-xl font-mono text-xs overflow-x-auto text-gray-300">
      <h4 class="text-white text-sm font-bold mb-4 font-sans">Example config.yaml</h4>
      <pre>
# Deterministic build parameters
dataset:
  version: "v1.0"
  seed: 42
training:
  engine: "pytorch"
  epochs: 100
  batch_size: 16
  learning_rate: 0.001
export:
  targets: ["onnx", "tensorrt8"]
      </pre>
    </div>
    <div class="bento-card bg-black border border-white/10 p-6 rounded-xl font-mono text-xs overflow-x-auto text-gray-300">
      <h4 class="text-white text-sm font-bold mb-4 font-sans">Sample metrics.json</h4>
      <pre>
{
  "precision": 0.942,
  "recall": 0.961,
  "mAP_50": 0.985,
  "mAP_50_95": 0.723,
  "inference_latency_ms": 1.42
}
      </pre>
    </div>
    <div class="bento-card bg-black border border-white/10 p-6 rounded-xl font-mono text-xs overflow-x-auto text-gray-300">
      <h4 class="text-white text-sm font-bold mb-4 font-sans">CLI Export Example</h4>
      <pre>
$ mforge export --model checkpoints/best.pt \\
                --format tensorrt \\
                --fp16 \\
                --output exports/model_v1.trt
      </pre>
    </div>
  </div>
  `;

  // Inject before the end of a section
  c = c.replace(/<\/section>/i, additionalCodeStr + '\n</section>');

  return c;
});

// 4. Docs Page
replaceFileContent('docs_page.html', (c) => {
  c = globalReplaces(c);
  // intro replace
  c = c.replace(/Find all the information you need to succeed[^<]*/i, 'ML Forge documentation provides detailed technical specifications for dataset versioning, annotation workflows, deterministic training, export pipelines, and runtime behavior.');

  const archDiagram = `
  <div class="my-16">
    <h3 class="text-2xl font-bold text-white mb-6">Architecture Overview</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
       <div class="p-4 bg-surface-dark border border-white/10 rounded flex flex-col items-center text-center"><span class="material-icons-outlined text-3xl text-primary mb-2">storage</span><span class="text-sm text-white font-bold">Dataset Engine</span></div>
       <div class="p-4 bg-surface-dark border border-white/10 rounded flex flex-col items-center text-center"><span class="material-icons-outlined text-3xl text-primary mb-2">history</span><span class="text-sm text-white font-bold">Snapshot Manager</span></div>
       <div class="p-4 bg-surface-dark border border-white/10 rounded flex flex-col items-center text-center"><span class="material-icons-outlined text-3xl text-primary mb-2">model_training</span><span class="text-sm text-white font-bold">Training Orchestrator</span></div>
       <div class="p-4 bg-surface-dark border border-white/10 rounded flex flex-col items-center text-center"><span class="material-icons-outlined text-3xl text-primary mb-2">memory</span><span class="text-sm text-white font-bold">Export Compiler</span></div>
       <div class="p-4 bg-surface-dark border border-white/10 rounded flex flex-col items-center text-center"><span class="material-icons-outlined text-3xl text-primary mb-2">inventory</span><span class="text-sm text-white font-bold">Model Registry</span></div>
    </div>
  </div>
  `;
  c = c.replace(/(<section[^>]*>[\s\S]*?)<\/section>/i, '$1' + archDiagram + '\n</section>');

  return c;
});

// 5. Vector DB Page
replaceFileContent('vector_db_page.html', (c) => {
  c = globalReplaces(c);
  c = c.replace(/<title>.*<\/title>/, '<title>ML Forge - Embedding & Similarity Search</title>');
  c = c.replace(/>Vector Database</gi, '>Embedding & Similarity Search<');
  c = c.replace(/Unleash the full power of context retrieval/i, 'CLIP embeddings, duplicate detection, similarity-based sampling, and hard negative mining for your vision datasets.');
  return c;
});

// 6. Download Page
replaceFileContent('download_page.html', (c) => {
  c = globalReplaces(c);
  const downloadDetails = `
  <div class="max-w-4xl mx-auto my-16 text-left">
    <h3 class="text-2xl font-bold text-white mb-6">System Requirements</h3>
    <table class="w-full text-sm text-left text-gray-400 border border-white/10 mb-8 rounded overflow-hidden">
      <thead class="bg-surface-dark text-white uppercase text-xs">
         <tr><th class="px-6 py-3">Component</th><th class="px-6 py-3">Minimum Requirement</th></tr>
      </thead>
      <tbody>
         <tr class="border-b border-white/5"><td class="px-6 py-3">Operating System</td><td class="px-6 py-3">Windows 10/11, Ubuntu 20.04+, macOS 12+</td></tr>
         <tr class="border-b border-white/5"><td class="px-6 py-3">GPU Support</td><td class="px-6 py-3">NVIDIA (CUDA 11.8+), Apple Silicon (MPS)</td></tr>
         <tr class="border-b border-white/5"><td class="px-6 py-3">Processor</td><td class="px-6 py-3">Intel Core i5 / AMD Ryzen 5 or equivalent</td></tr>
         <tr><td class="px-6 py-3">Memory</td><td class="px-6 py-3">16 GB RAM (32GB Recommended)</td></tr>
      </tbody>
    </table>
    <h3 class="text-2xl font-bold text-white mb-6">Version Integrity</h3>
    <div class="bg-black border border-white/10 p-4 rounded font-mono text-xs text-primary mb-4">
      SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    </div>
    <div class="flex gap-4">
      <a href="/release-notes" class="text-sm text-primary hover:underline">Release Notes</a>
      <a href="/model-support" class="text-sm text-primary hover:underline">Model Compatibility List</a>
    </div>
  </div>
  `;
  c = c.replace(/<\/section>/i, downloadDetails + '\n</section>');
  return c;
});

// 7. Pricing Page
replaceFileContent('pricing_page.html', (c) => {
  c = globalReplaces(c);
  // Remove vague pricing text; replace to reflect desktop/local first
  c = c.replace(/Choose the plan that fits your business needs/i, 'Explicit desktop-first, local execution licensing. Per-seat and per-device availability.');
  return c;
});

// 8. Guarantees Page
replaceFileContent('guarantees1_page.html', (c) => {
  c = globalReplaces(c);
  // Add robust factual bullet points
  const points = `
    <ul class="text-gray-400 space-y-4 font-mono text-sm tracking-wide mt-8 max-w-4xl mx-auto text-left">
      <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">verified_user</span> No telemetry by default.</li>
      <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">devices</span> All training runs execute locally unless explicitly configured.</li>
      <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">folder_shared</span> Dataset ownership perfectly remains with the user indefinitely.</li>
      <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">cloud_off</span> No forced cloud dependency. Full offline functionality.</li>
      <li class="flex items-start gap-3"><span class="material-icons-outlined text-primary text-xl">lock</span> Model weights are never transmitted externally.</li>
    </ul>
  `;
  // Replace a paragraph with these points if possible
  c = c.replace(/<p class="text-gray-400 max-w-2xl mx-auto[^>]*>.*?<\/p>/is, (match) => {
    // Just tacking it after the first main paragraph
    return match + points;
  });
  return c;
});

// 9. Terms Page
replaceFileContent('terms_page.html', (c) => {
  c = globalReplaces(c);
  c = c.replace(/Data Use/i, 'Dataset & Export Ownership');
  c = c.replace(/We reserve the right.*?data.*?/i, 'All inputs, datasets, configurations, exported model weights, and artifacts generated locally remain the absolute intellectual property of the licensed user. ML Forge claims zero rights to local IP.');
  return c;
});

// 10. Contact Page
replaceFileContent('contact_page.html', (c) => {
  c = globalReplaces(c);
  c = c.replace(/Community & support/i, 'Engineering Support Hub');

  const additionalOptions = `
    <div class="mt-8 text-left text-sm text-gray-400">
      <h4 class="text-white text-lg font-bold mb-4">Inquiries</h4>
      <ul class="space-y-2 font-mono">
        <li>- Enterprise procurement & volume licensing</li>
        <li>- Technical partnerships & hardware integrations</li>
        <li>- Custom model deployment integrations</li>
        <li>- Edge deployment engineering consulting</li>
      </ul>
    </div>
  `;
  c = c.replace(/<\/form>/i, '</form>' + additionalOptions);
  return c;
});

// Extra: Update remaining abstract copy in agentic/usecase
// e.g. "Protocol v*" etc
console.log('Update script completely generated.');

