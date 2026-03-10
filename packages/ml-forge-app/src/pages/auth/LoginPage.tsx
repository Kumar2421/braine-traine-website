import { LoginForm } from "../../components/forms/login-form"
import { SEO } from "../../utils/SEO";

export default function LoginPage() {
  return (
    <>
      <SEO title="Login" />
      <div className="grid min-h-svh lg:grid-cols-2 bg-black text-white selection:bg-primary/30 font-sans">
        <div className="flex flex-col gap-4 p-6 md:p-10 border-r border-white/5 relative z-10 bg-black">
          <div className="flex justify-center gap-2 md:justify-start mb-12">
            <a href="/" className="flex items-center gap-2 font-black tracking-tighter text-2xl group italic uppercase">
              <img src="/logo.jpeg" alt="ML Forge" className="w-8 h-8 rounded shadow-[0_0_15px_rgba(102,255,153,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 object-cover" />
              ML Forge<span className="text-primary italic">.</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest mb-4">
                  Access Protocol Delta-9
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase mb-2">Welcome Back<span className="text-primary">.</span></h1>
                <p className="text-gray-500 text-sm font-medium">Initialize your sovereign workspace kernel to begin orchestration.</p>
              </div>
              <LoginForm className="glass-card p-0 bg-transparent border-none shadow-none" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-700 font-mono uppercase tracking-widest">
            <span>© 2026 FORGE KERNEL // SECURE</span>
            <span>v4.2.0-STABLE</span>
          </div>
        </div>

        {/* Animated Branding Section: Neural Kernel Fabric */}
        <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
          {/* Dashboard Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #66FF9933 1px, transparent 1px), linear-gradient(to bottom, #66FF9933 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }} />

          {/* Floating Technical Labels */}
          <div className="absolute top-10 left-10 font-mono text-[9px] text-gray-800 uppercase tracking-widest">System_Topology // Active</div>
          <div className="absolute bottom-10 right-10 font-mono text-[9px] text-gray-800 uppercase tracking-widest">Inference_Engine // Standby</div>

          {/* Central Neural Kernel Animation */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <svg className="w-[600px] h-[600px]" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#66FF9900" />
                  <stop offset="50%" stopColor="#66FF99" />
                  <stop offset="100%" stopColor="#66FF9900" />
                </linearGradient>
              </defs>

              {/* Orbiting Rings */}
              <circle cx="300" cy="300" r="220" stroke="#66FF99" strokeWidth="0.5" strokeDasharray="4 8" className="opacity-10 animate-[spin_60s_linear_infinite]" />
              <circle cx="300" cy="300" r="160" stroke="#66FF99" strokeWidth="0.5" strokeDasharray="10 20" className="opacity-20 animate-[spin_40s_linear_infinite_reverse]" />

              {/* Connecting Lines with Flow */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <g key={i} transform={`rotate(${angle} 300 300)`}>
                  <line x1="300" y1="300" x2="300" y2="80" stroke="#66FF99" strokeWidth="0.5" className="opacity-10" />
                  <circle cx="300" cy="80" r="4" fill="#000" stroke="#66FF99" strokeWidth="1" className="animate-pulse" />
                  {/* Data Flow Particle */}
                  <circle r="2" fill="#66FF99" filter="url(#glow)">
                    <animateMotion
                      dur={`${2 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                      path="M 300 300 L 300 80"
                      begin={`${i * 0.4}s`}
                    />
                  </circle>
                </g>
              ))}

              {/* Peripheral Nodes Content */}
              <g transform="translate(300, 80)" className="animate-float">
                <rect x="-40" y="-12" width="80" height="24" rx="2" fill="#111" stroke="#66FF99" strokeWidth="0.5" opacity="0.8" />
                <text x="0" y="4" textAnchor="middle" fill="#66FF99" fontSize="8" fontFamily="Space Mono" fontWeight="bold">SENS_01</text>
              </g>

              {/* Central Kernel Core */}
              <g transform="translate(300, 300)">
                {/* Outer Core Glow */}
                <circle r="40" fill="#66FF99" className="opacity-5 animate-pulse" />
                <circle r="30" fill="#66FF99" className="opacity-10 animate-pulse" />

                {/* Core Symbol */}
                <rect x="-15" y="-15" width="30" height="30" rx="4" fill="#66FF99" filter="url(#glow)" className="animate-[spin_4s_ease-in-out_infinite]" />
                <rect x="-10" y="-10" width="20" height="20" rx="2" fill="#000" />
                <circle r="3" fill="#66FF99" className="animate-pulse" />
              </g>
            </svg>

            {/* Overlay Text */}
            <div className="absolute bottom-24 text-center">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Neural <span className="text-primary">Kernel.</span></h2>
              <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Orchestrating Sovereign Intelligence</p>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, -10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
      </div>
    </>
  )
}
