/**
 * ML Forge Shared Components
 * This script injects the consistent Supabase-style Navbar and Footer across all pages.
 */

const SHARED_STYLES = `
<style>
  :root {
    --primary: #66FF99;
    --primary-hover: #52E085;
    --background-dark: #0B0B0B;
    --surface-dark: #141414;
  }
  .text-primary { color: #66FF99; }
  .bg-primary { background-color: #66FF99; }
  .border-primary { border-color: rgba(102, 255, 153, 0.4); }
  
  @keyframes pulse-signal {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }
  .pulse-signal {
    animation: pulse-signal 2s infinite;
  }
</style>
`;
const NAVBAR_HTML = SHARED_STYLES + `
<nav id="global-navbar" class="fixed top-0 left-0 right-0 z-[100] border-b border-[#ffffff08] bg-black/70 backdrop-blur-xl">
  <div class="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-12">
      <a href="landing_page.html" class="flex items-center gap-3 group">
        <img src="logo.jpeg" alt="ML Forge" class="w-8 h-8 rounded shadow-[0_0_15px_rgba(102,255,153,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 object-cover" />
        <span class="text-base font-black tracking-tighter uppercase italic text-white group-hover:text-primary transition-colors">ML FORGE</span>
      </a>
      <div class="hidden lg:flex items-center gap-8 text-[13px] font-medium text-gray-400">
        <div class="relative group">
          <button class="flex items-center gap-1 hover:text-white transition-colors py-5 text-glow-hover">Product</span></button>
          <div class="absolute top-full left-0 w-64 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-1 group-hover:translate-y-0">
            <div class="bg-[#111] border border-[#ffffff08] rounded-xl p-3 shadow-2xl backdrop-blur-xl">
              <a href="landing_page.html" class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group/item">
                <span class="material-icons-outlined text-primary">space_dashboard</span>
                <div>
                  <div class="text-white text-[13px] font-bold mb-1">IDE Overview</div>
                  <div class="text-gray-500 text-[11px] leading-relaxed">The industrial vision-first environment.</div>
                </div>
              </a>
              <a href="workflow_page.html" class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group/item">
                <span class="material-symbols-outlined text-primary">account_tree</span>
                <div>
                  <div class="text-white text-[13px] font-bold mb-1">Workflows</div>
                  <div class="text-gray-500 text-[11px] leading-relaxed">Deterministic training pipelines.</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div class="relative group">
          <button class="flex items-center gap-1 hover:text-white transition-colors py-5 text-glow-hover">Solutions </button>
          <div class="absolute top-full left-0 w-64 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-1 group-hover:translate-y-0">
             <div class="bg-[#111] border border-[#ffffff08] rounded-xl p-3 shadow-2xl">
              <a href="agentic_page.html" class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group/item">
                <span class="material-icons-outlined text-primary">psychology</span>
                <div>
                  <div class="text-white text-[13px] font-bold mb-1">Agentic AI</div>
                  <div class="text-gray-500 text-[11px] leading-relaxed">Self-healing data protocols.</div>
                </div>
              </a>
              <a href="usecase_page.html" class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group/item">
                <span class="material-icons-outlined text-primary">rocket_launch</span>
                <div>
                  <div class="text-white text-[13px] font-bold mb-1">Use Cases</div>
                  <div class="text-gray-500 text-[11px] leading-relaxed">End-to-end vision benchmarks.</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div class="relative group">
          <button class="flex items-center gap-1 hover:text-white transition-colors py-5 text-glow-hover">Developers </button>
          <div class="absolute top-full left-0 w-64 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-1 group-hover:translate-y-0">
             <div class="bg-[#111] border border-[#ffffff08] rounded-xl p-3 shadow-2xl">
              <a href="docs_page.html" class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group/item">
                <span class="material-icons-outlined text-primary">description</span>
                <div>
                  <div class="text-white text-[13px] font-bold mb-1">Documentation</div>
                  <div class="text-gray-500 text-[11px] leading-relaxed">SDKs, APIs and integrations.</div>
                </div>
              </a>
              <a href="vector_db_page.html" class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group/item">
                <span class="material-icons-outlined text-primary">database</span>
                <div>
                  <div class="text-white text-[13px] font-bold mb-1">Vector DB</div>
                  <div class="text-gray-500 text-[11px] leading-relaxed">High-dimensional search.</div>
                </div>
              </a>
              <a href="guarantees1_page.html" class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group/item">
                <span class="material-icons-outlined text-primary">verified_user</span>
                <div>
                  <div class="text-white text-[13px] font-bold mb-1">Guarantees</div>
                  <div class="text-gray-500 text-[11px] leading-relaxed">Sovereign safety boundaries.</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <a href="pricing_page.html" class="hover:text-white transition-colors py-5 text-glow-hover">Pricing</a>
      </div>
    </div>
    <div id="auth-buttons" class="flex items-center gap-6">
      <a href="contact_page.html" class="hidden sm:block text-[13px] font-medium text-gray-500 hover:text-white transition-colors">Contact</a>
      <a id="login-btn" href="/login"
        class="bg-primary hover:bg-primary-hover text-black text-[12px] font-black uppercase italic tracking-tighter px-6 py-2 rounded-sm shadow-[0_4px_14px_0_rgba(102,255,153,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0">
        login
      </a>
      <a id="account-btn" href="/dashboard"
        class="hidden bg-white/10 hover:bg-white/20 text-white text-[12px] font-black uppercase italic tracking-tighter px-6 py-2 rounded-sm border border-white/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
        <span class="material-icons-outlined text-[14px]">account_circle</span>
        Account
      </a>
    </div>
  </div>
</nav>
<div class="h-16"></div>
`;

const FOOTER_HTML = `
<footer class="bg-[#020202] border-t border-[#ffffff08] pt-24 pb-12">
    <div class="max-w-[1200px] mx-auto px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-24">
        <div class="col-span-2">
          <a href="landing_page.html" class="flex items-center gap-3 mb-8 group">
            <img src="logo.jpeg" alt="ML Forge" class="w-10 h-10 rounded shadow-[0_0_15px_rgba(102,255,153,0.2)] transition-transform group-hover:scale-110 object-cover" />
            <span class="text-lg font-black tracking-tighter uppercase italic text-white group-hover:text-primary transition-colors">ML FORGE</span>
          </a>
          <p class="text-gray-500 text-sm max-w-xs mb-8 leading-relaxed">The local-first Vision AI IDE. Built for engineers who demand sovereignty and performance.</p>
          <div class="flex gap-5">
            <a href="#" class="text-gray-600 hover:text-white transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387c.6.113.793-.258.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921c.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
            <a href="#" class="text-gray-600 hover:text-white transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg></a>
          </div>
        </div>
        <div>
          <h5 class="text-sm font-bold text-white mb-6 tracking-tight">Product</h5>
          <ul class="space-y-4 text-[13px] text-gray-500">
            <li><a href="landing_page.html" class="hover:text-primary transition-colors">IDE Overview</a></li>
            <li><a href="workflow_page.html" class="hover:text-primary transition-colors">Workflows</a></li>
            <li><a href="agentic_page.html" class="hover:text-primary transition-colors">Agentic AI</a></li>
            <li><a href="download_page.html" class="hover:text-primary transition-colors">Downloads</a></li>
          </ul>
        </div>
        <div>
          <h5 class="text-sm font-bold text-white mb-6 tracking-tight">Developers</h5>
          <ul class="space-y-4 text-[13px] text-gray-500">
            <li><a href="docs_page.html" class="hover:text-primary transition-colors">Documentation</a></li>
            <li><a href="vector_db_page.html" class="hover:text-primary transition-colors">Vector DB</a></li>
            <li><a href="usecase_page.html" class="hover:text-primary transition-colors">Use Cases</a></li>
            <li><a href="guarantees1_page.html" class="hover:text-primary transition-colors">Guarantees</a></li>
          </ul>
        </div>
        <div>
          <h5 class="text-sm font-bold text-white mb-6 tracking-tight">Resources</h5>
          <ul class="space-y-4 text-[13px] text-gray-500">
            <li><a href="pricing_page.html" class="hover:text-primary transition-colors">Pricing</a></li>
            <li><a href="contact_page.html" class="hover:text-primary transition-colors">Support</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">System Status</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">Changelog</a></li>
          </ul>
        </div>
        <div>
          <h5 class="text-sm font-bold text-white mb-6 tracking-tight">Company</h5>
          <ul class="space-y-4 text-[13px] text-gray-500">
            <li><a href="privacy_page.html" class="hover:text-primary transition-colors">Privacy</a></li>
            <li><a href="terms_page.html" class="hover:text-primary transition-colors">Terms</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">Careers</a></li>
          </ul>
        </div>
      </div>
      <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-[11px] text-gray-600 font-medium">© 2026 ML Forge Inc. Built for sovereign AI infrastructure.</p>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 text-[11px] text-gray-600 font-medium">
            <div class="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] shadow-[0_0_5px_rgba(62,207,142,0.5)]"></div>
            All systems operational
          </div>
        </div>
      </div>
    </div>
</footer>
`;

function injectComponents() {
  // Prevent duplicate injection
  if (document.getElementById('global-navbar')) return;

  // Inject Navbar at the beginning of body
  const navbarContainer = document.getElementById('navbar-placeholder');
  if (navbarContainer) {
    navbarContainer.innerHTML = NAVBAR_HTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', NAVBAR_HTML);
  }

  // Inject Footer at the end of body or placeholder
  const footerContainer = document.getElementById('footer-placeholder');
  if (footerContainer) {
    footerContainer.innerHTML = FOOTER_HTML;
  } else {
    const main = document.querySelector('main');
    // Only inject if there's no footer already
    if (!document.querySelector('footer')) {
      if (main) {
        main.insertAdjacentHTML('beforeend', FOOTER_HTML);
      } else {
        document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
      }
    }
  }
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectComponents();
    checkUserSession();
  });
} else {
  injectComponents();
  checkUserSession();
}

/**
 * Check Supabase session and toggle Account button
 */
function checkUserSession() {
  try {
    const projectRef = 'ccogznilfcqzpqtvbcne';
    const sessionKey = `sb-${projectRef}-auth-token`;
    const sessionData = localStorage.getItem(sessionKey);

    if (sessionData) {
      const loginBtn = document.getElementById('login-btn');
      const accountBtn = document.getElementById('account-btn');

      if (loginBtn && accountBtn) {
        loginBtn.classList.add('hidden');
        accountBtn.classList.remove('hidden');
      }
    }
  } catch (e) {
    console.error('Error checking session:', e);
  }
}
