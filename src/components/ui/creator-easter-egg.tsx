"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Shield, Cpu, Zap, Code, ExternalLink, Link as LinkIcon, Globe } from "lucide-react";

export function CreatorEasterEgg() {
  const [clickCount, setClickCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global Keyboard Shortcut: Cmd/Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    // We increment click count.
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsOpen(true);
        return 0;
      }
      return next;
    });

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset click count after 2 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
  };

  return (
    <>
      <div 
        className="px-6 py-5 border-b border-[rgba(15,23,42,0.06)] relative group cursor-pointer flex items-center gap-3 h-[88px]"
        onClick={handleLogoClick}
      >
        <Link href="/dashboard" className="flex items-center gap-3 w-full" onClick={(e) => {
            if (clickCount > 0) e.preventDefault();
        }}>
          <div className="relative shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)] shadow-[0_4px_14px_rgba(15,23,42,0.05)] bg-white rounded-[14px] w-[48px] h-[48px] overflow-hidden border border-[rgba(15,23,42,0.04)]">
            <Image
              src="/logo.png"
              alt="SecureFlow AI"
              width={48}
              height={48}
              className="w-full h-full object-contain p-1"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[13px] font-bold text-slate-900 tracking-[-0.01em] leading-tight">
              SECUREFLOW AI
            </h1>
            <p className="text-[11px] font-medium text-slate-500 tracking-[0.02em]">
              Media Intelligence
            </p>
          </div>
        </Link>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-white font-technical">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-white/50">
                <span className="text-emerald-400">CREATOR // 001</span>
                <span>SECUREFLOW AI</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row">
              
              {/* Left Column */}
              <div className="w-full md:w-[40%] p-8 border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-editorial tracking-tight mb-1 text-white">
                  Rishvin Reddy
                </h2>
                <p className="text-sm text-emerald-400 tracking-wide mb-8 font-bold">
                  B.Tech CSE
                </p>

                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-white/40" />
                    <span>Engineering</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-white/40" />
                    <span>Cybersecurity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-white/40" />
                    <span>IoT & Blockchain</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-white/40" />
                    <span>Full-Stack</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full md:w-[60%] p-8 space-y-8 bg-black/40">
                
                <div>
                  <h3 className="text-xs text-white/40 tracking-[0.2em] mb-3 uppercase">Project</h3>
                  <p className="text-lg text-white font-editorial">SecureFlow AI</p>
                  <p className="text-sm text-white/60 mt-1 leading-relaxed">
                    A media intelligence platform built for the Cloudinary AI Hackathon 2026. Designed to unify security analysis, AI processing, and real-time transformations.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs text-white/40 tracking-[0.2em] mb-3 uppercase">Technology</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Next.js 14", "TypeScript", "Cloudinary AI", "Supabase", "React", "TailwindCSS"].map((tech) => (
                      <span key={tech} className="px-2.5 py-1 text-[10px] uppercase tracking-wider border border-white/20 rounded bg-white/5 text-white/80">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[10px] text-white/30 tracking-[0.2em]">
                    VERSION V5.x <br/>
                    CLOUDINARY AI HACKATHON
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <a href="https://github.com/rishvin" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                      <Code className="w-5 h-5" />
                    </a>
                    <a href="https://linkedin.com/in/rishvin" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                      <LinkIcon className="w-5 h-5" />
                    </a>
                    <a href="https://rishvin.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
