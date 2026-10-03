"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Filter, FileWarning, ArrowRight, LayoutGrid, FileText, ShieldAlert, CheckCircle2, Sparkles, Command, X } from "lucide-react";
import Link from "next/link";
import { EvidenceList } from "@/app/dashboard/evidence/EvidenceList";
import { useRouter, useSearchParams } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SearchClient({ initialAnalyses, initialQuery }: { initialAnalyses: any[], initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Simple stats
  const totalAssets = initialAnalyses?.length || 0;
  const totalEvidence = initialAnalyses?.filter(a => a.risk_score > 0).length || 0;
  const totalReports = initialAnalyses?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] relative overflow-hidden flex flex-col items-center">
      
      {/* Ambient background gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_10%,rgba(79,70,229,0.045),transparent_30%),radial-gradient(circle_at_10%_70%,rgba(37,99,235,0.035),transparent_30%)]" />
      
      {/* Subtle animated grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Main Content Container */}
      <div className="w-full max-w-5xl mx-auto px-8 pt-16 pb-24 relative z-10">
        
        {/* -- Hero / Header ---------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 mb-6 text-[10px] font-technical tracking-[0.2em] uppercase text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            Intelligence / Search
          </div>
          
          <h1 className="text-4xl md:text-5xl font-editorial font-medium text-gray-900 tracking-tight leading-[1.1] mb-4">
            Find anything.<br />Understand everything.
          </h1>
          
          <p className="text-gray-500 font-ui text-[15px] max-w-xl mx-auto leading-relaxed">
            Search across media, security evidence, AI findings, reports, and transformed assets from one intelligent workspace.
          </p>
        </motion.div>

        {/* -- Search Bar ------------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-3xl mx-auto mb-16 relative"
        >
          {/* Subtle cursor-following glow simulation */}
          <div className={`absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-md transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
          
          <form onSubmit={handleSearch} className="relative group">
            <div className={`absolute inset-0 bg-white rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-all duration-300 border ${isFocused ? 'border-blue-400/50 shadow-[0_8px_32px_rgba(37,99,235,0.12)]' : 'border-gray-200/60'}`} />
            
            <div className="relative flex items-center px-6 py-4">
              <Sparkles className={`w-5 h-5 mr-4 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
              
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search your intelligence..."
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-[17px] font-ui text-gray-900 placeholder:text-gray-400"
              />
              
              <div className="flex items-center gap-2">
                {!query && (
                  <div className="hidden sm:flex items-center gap-1 text-[11px] font-technical tracking-widest text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <Command className="w-3 h-3" /> K
                  </div>
                )}
                {query && (
                  <button type="button" onClick={() => { setQuery(''); router.push('/dashboard/search'); }} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Suggestions Dropdown (simulated with Framer Motion) */}
            <AnimatePresence>
              {isFocused && !query && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-full bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[16px] p-4 shadow-xl z-50 flex flex-col gap-1"
                >
                  <div className="text-[10px] font-technical tracking-widest uppercase text-gray-400 mb-2 px-2">Suggestions</div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {["laptop", "person", "high risk", "suspicious file", "architecture"].map(tag => (
                      <button 
                        key={tag}
                        onMouseDown={() => {
                          setQuery(tag);
                          router.push(`/dashboard/search?q=${encodeURIComponent(tag)}`);
                        }}
                        className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-100 text-[13px] font-ui text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* -- Bento Intelligence Grid -------------------------------------- */}
        {!initialQuery && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="w-full flex flex-col gap-6"
          >
            <div className="text-[10px] font-technical tracking-[0.2em] uppercase text-gray-400 text-center mb-2">
              Intelligence Overview
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "MEDIA", count: totalAssets, label: "Assets indexed", icon: LayoutGrid, link: "Explore media" },
                { title: "SECURITY EVIDENCE", count: totalEvidence, label: "Findings indexed", icon: ShieldAlert, link: "Review evidence" },
                { title: "REPORTS", count: totalReports, label: "Reports generated", icon: FileText, link: "View reports" },
              ].map((item, idx) => (
                <div key={idx} className="group relative bg-white/60 backdrop-blur-md rounded-[20px] p-6 border border-gray-200/60 shadow-[0_4px_24px_rgba(15,23,42,0.02)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[10px] font-technical tracking-widest text-gray-500 uppercase">{item.title}</div>
                    <div className="text-[10px] font-technical text-gray-300">0{idx + 1}</div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-4xl font-editorial font-medium text-gray-900 mb-1">{item.count}</div>
                    <div className="text-sm font-ui text-gray-500">{item.label}</div>
                  </div>
                  
                  <div className="mt-auto flex items-center text-[13px] font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    {item.link} <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="w-full mt-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[20px] p-8 text-white relative overflow-hidden group shadow-lg">
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.8),transparent_50%)]" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-technical tracking-widest text-gray-400 uppercase mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Search Intelligence
                  </div>
                  <h3 className="text-xl font-editorial font-medium mb-2">Your search understands more than names.</h3>
                  <p className="text-sm font-ui text-gray-400">Semantic search across metadata, AI tags, and moderation results is enabled by default.</p>
                </div>
                
                <div className="flex gap-4">
                  {["Metadata", "AI Tags", "Findings"].map(tag => (
                    <div key={tag} className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                      <span className="text-[11px] font-technical tracking-widest uppercase text-gray-300">{tag}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* -- Search Results & Filters ------------------------------------- */}
        {initialQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div className="text-[11px] font-technical tracking-widest text-gray-500 uppercase">
                {totalAssets} RESULTS
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-medium text-gray-600 hover:text-gray-900 shadow-sm transition-all flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
              </div>
            </div>
            
            {initialAnalyses.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-white rounded-[24px] p-12 text-center border border-gray-200 shadow-sm flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-technical tracking-widest uppercase text-gray-400 mb-4">Search Complete</div>
                <h3 className="text-2xl font-editorial font-medium text-gray-900 mb-2">No matching intelligence found.</h3>
                <p className="text-gray-500 font-ui text-sm mb-8 max-w-sm">
                  We searched Media, Evidence, Reports, and AI Findings. Try a broader keyword or removing filters.
                </p>
                <button onClick={() => { setQuery(''); router.push('/dashboard/search'); }} className="px-6 py-2.5 bg-gray-900 text-white rounded-[12px] text-xs font-semibold shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
                  Clear Search
                </button>
              </motion.div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <EvidenceList analyses={initialAnalyses} />
              </div>
            )}
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
