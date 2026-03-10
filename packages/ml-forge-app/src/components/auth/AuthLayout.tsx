import { useState, useEffect } from "react"

const testimonials = [
  {
    quote: "I gave @mlforge a try today and I was positively impressed! Very quick setup to get a working local deterministic model with robust engineering platforms automatically for you 👌 10/10 will play more",
    author: "@razvanilin",
    role: "ML Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0"
  },
  {
    quote: "Okay, I finally tried ML Forge today and wow... why did I wait so long? 😅 Went from 'how do I even start' to having auth + model pipeline + real-time updates working in like 20 minutes.",
    author: "@Aliahsan_sfv",
    role: "Software Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&backgroundColor=c0aede"
  },
  {
    quote: "ML Forge has completely changed our team's workflow. The deterministic model engineering approach means we get reproducible results every single time. No more guessing games with model outputs.",
    author: "@chen_ml_ops",
    role: "MLOps Lead",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty&backgroundColor=d1d4f9"
  },
  {
    quote: "What sets ML Forge apart is the local-first architecture. Our sensitive data never leaves our infrastructure, and the model performance is consistently better than cloud alternatives we've tested.",
    author: "@sarah_builds",
    role: "Principal Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patches&backgroundColor=b6e3f4"
  }
]

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        setIsTransitioning(false)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const t = testimonials[currentIndex]

  return (
    <div className="relative flex min-h-screen font-sans">

      {/* ── Documentation button — absolute top-right ── */}
      <div className="absolute top-5 right-6 z-20 hidden lg:block">
        <a
          href="/docs"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#d4d4d8] text-[12px] font-normal text-[#71717a] bg-white hover:bg-[#fafafa] hover:border-[#a1a1aa] transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Documentation
        </a>
      </div>

      {/* ── LEFT panel — form area ── */}
      <div className="w-full lg:w-[42%] bg-[#f5f5f4] flex flex-col min-h-screen relative overflow-hidden">

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#1c1917 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {/* Logo */}
        <div className="pt-7 pb-0 px-8 lg:px-12 z-10">
          <a href="/" className="inline-flex items-center gap-3 text-[15px] font-semibold tracking-tight">
            <img src="/ml-forge-icon.png" alt="ML Forge" className="w-9 h-9 rounded-md object-cover" />
            <span className="text-[16px] font-black italic uppercase tracking-tighter text-[#3ECF8E]">ml forge</span>
          </a>
        </div>

        {/* Form — centered in the panel */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-12 pb-8 pt-4 z-10">
          <div className="w-full max-w-[380px]">
            {children}
          </div>
        </div>

      </div>

      {/* ── RIGHT panel — rotating testimonials — hidden on mobile ── */}
      <div className="hidden lg:flex flex-1 bg-[#fafaf9] flex-col justify-center items-center px-12 xl:px-20 border-l border-[#e7e5e4]">
        <div
          className={`max-w-[460px] transition-all duration-400 ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
        >
          {/* Quote mark */}
          <svg viewBox="0 0 45 36" className="w-10 h-auto mb-5 text-[#d6d3d1]" fill="currentColor">
            <path d="M13.415.001C6.07 5.185.887 13.681.887 23.041c0 7.632 4.608 12.096 9.936 12.096 5.04 0 8.784-4.032 8.784-8.784 0-4.752-3.312-8.208-7.632-8.208-.864 0-2.016.144-2.304.288.72-4.896 5.328-10.656 9.936-13.536L13.415.001zm24.768 0c-7.2 5.184-12.384 13.68-12.384 23.04 0 7.632 4.608 12.096 9.936 12.096 4.896 0 8.784-4.032 8.784-8.784 0-4.752-3.456-8.208-7.776-8.208-.864 0-1.872.144-2.16.288.72-4.896 5.184-10.656 9.792-13.536L38.183.001z" />
          </svg>

          {/* Testimonial text */}
          <p className="text-[22px] leading-[1.55] text-[#44403c] font-normal tracking-tight mb-8">
            {t.quote}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <img
              src={t.avatar}
              alt={t.author}
              className="w-10 h-10 rounded-full object-cover bg-[#e7e5e4]"
            />
            <div>
              <p className="text-[14px] font-medium text-[#1c1917]">{t.author}</p>
              <p className="text-[12px] text-[#a8a29e]">{t.role}</p>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-1.5 mt-8">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className={`h-[5px] rounded-full transition-all duration-300 ${i === currentIndex
                  ? "w-5 bg-[#3ecf8e]"
                  : "w-[5px] bg-[#d6d3d1]"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
