"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, FileText, UploadCloud, 
  ShieldCheck, Brain, Filter, LayoutGrid, List, Zap, 
  Eye, ArrowUpRight, CheckCircle2, ChevronRight, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CldImage } from "next-cloudinary";

// Thumbnail that uses secure_url (plain img) with CldImage as fallback
function EvidenceThumbnail({ publicId, secureUrl }: { publicId: string; secureUrl?: string }) {
  const [errored, setErrored] = useState(false);

  if (errored || (!publicId && !secureUrl)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <ImageIcon className="w-8 h-8 text-slate-300" />
      </div>
    );
  }

  // Prefer the stored secure_url — it is always a valid resolvable URL
  if (secureUrl && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={secureUrl}
        alt="Evidence"
        onError={() => setErrored(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />
    );
  }

  // Fall back to CldImage with explicit width/height (no fill)
  return (
    <CldImage
      src={publicId}
      alt="Evidence"
      width={400}
      height={300}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      onError={() => setErrored(true)}
    />
  );
}

// Helper components
function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-[24px] p-8 border border-[rgba(15,23,42,0.06)] shadow-[0_8px_30px_rgb(15,23,42,0.03)] hover:-translate-y-0.5 transition-transform duration-300 ${className}`}>
      {children}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EvidenceLibraryClient({ analyses }: { analyses: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const isEmpty = analyses.length === 0;

  return (
    <div className="min-h-screen bg-[#F8F9FB] relative overflow-hidden font-sans">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.045),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.04),transparent_30%)]" />

      {/* 1. COMMAND BAR */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        className="w-full h-14 bg-white/50 backdrop-blur-xl border-b border-[rgba(15,23,42,0.06)] px-6 flex items-center justify-between sticky top-0 z-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-wide">SECUREFLOW AI</span>
        </div>
        <div className="flex flex-1 max-w-md mx-6">
           <div className="w-full flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 border border-slate-200/50 rounded-xl text-[11px] font-medium text-slate-500 cursor-text hover:bg-slate-100 transition-colors group">
             <Search className="w-3.5 h-3.5 group-hover:text-blue-500 transition-colors" /> 
             <input type="text" placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none w-full placeholder:opacity-60" />
             <kbd className="ml-2 font-mono text-[9px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-sm text-slate-400">⌘K</kbd>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-white shadow-sm" />
        </div>
      </motion.div>

      <main className="relative z-10 px-8 pb-32 pt-12 max-w-[1400px] mx-auto">
        
        {/* 2. HERO */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-4 flex items-center gap-2">
              Media Library
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5 text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cloudinary Connected</span>
            </p>
            <h1 className="text-4xl md:text-5xl font-editorial font-medium text-slate-900 mb-3 tracking-tight">Your intelligent asset workspace</h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed">
              Organize, analyze, transform and optimize everything you&apos;ve uploaded to SecureFlow.
            </p>
          </div>
          <Link href="/dashboard/workspace" className="mt-6 md:mt-0 px-5 py-2.5 bg-slate-900 text-white rounded-[14px] text-xs font-bold shadow-sm hover:bg-slate-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] flex items-center gap-2">
             <UploadCloud className="w-4 h-4" /> Upload Media
          </Link>
        </motion.div>

        {/* 3. TOP INTELLIGENCE BENTO */}
        <motion.div 
           initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
           className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
           <Card className="flex flex-col relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 z-10">Total Assets</span>
             <span className="text-4xl font-editorial font-medium text-slate-900 z-10">{analyses.length}</span>
           </Card>
           <Card className="flex flex-col relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 z-10">AI Analyzed</span>
             <span className="text-4xl font-editorial font-medium text-slate-900 z-10">{analyses.length}</span>
           </Card>
           <Card className="flex flex-col bg-slate-50 border-dashed border-[rgba(15,23,42,0.1)]">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Transformations</span>
             <span className="text-4xl font-editorial font-medium text-slate-300">0</span>
           </Card>
           <Card className="flex flex-col bg-slate-50 border-dashed border-[rgba(15,23,42,0.1)]">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Storage</span>
             <span className="text-4xl font-editorial font-medium text-slate-300">—</span>
           </Card>
        </motion.div>

        {/* 4. INTELLIGENCE AT A GLANCE */}
        <motion.div 
           initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
           className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
           <div className="bg-gradient-to-br from-white to-slate-50 rounded-[20px] p-6 border border-slate-100 flex items-start gap-4 hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Brain className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">AI Tagging</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Automatically understand your media.</p>
              </div>
           </div>
           <div className="bg-gradient-to-br from-white to-slate-50 rounded-[20px] p-6 border border-slate-100 flex items-start gap-4 hover:border-rose-100 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Moderation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Detect potentially sensitive content.</p>
              </div>
           </div>
           <div className="bg-gradient-to-br from-white to-slate-50 rounded-[20px] p-6 border border-slate-100 flex items-start gap-4 hover:border-violet-100 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Zap className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Transform</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Crop, optimize and transform instantly.</p>
              </div>
           </div>
        </motion.div>

        {/* 5. LIBRARY TOOLBAR */}
        <motion.div 
           initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
           className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8"
        >
           <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl border border-[rgba(15,23,42,0.04)] shadow-sm">
             {["ALL", "IMAGES", "VIDEO", "ANALYZED", "FLAGGED"].map(f => (
               <button 
                 key={f} onClick={() => setFilter(f)}
                 className={`relative px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors ${filter === f ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {filter === f && <motion.div layoutId="filter-pill" className="absolute inset-0 bg-white rounded-lg shadow-sm" style={{ zIndex: -1 }} />}
                 {f}
               </button>
             ))}
           </div>
           
           <div className="flex items-center gap-3">
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
               <Filter className="w-3.5 h-3.5" /> Type
             </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
               Status
             </button>
             <div className="w-px h-4 bg-slate-200 mx-1" />
             <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
               <button className="p-1.5 bg-white rounded shadow-sm text-slate-900"><LayoutGrid className="w-4 h-4" /></button>
               <button className="p-1.5 text-slate-400 hover:text-slate-600"><List className="w-4 h-4" /></button>
             </div>
           </div>
        </motion.div>

        {/* 6. MEDIA CONTENT */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
           {isEmpty ? (
             <div className="w-full bg-white rounded-[32px] p-12 border border-[rgba(15,23,42,0.06)] shadow-[0_8px_40px_rgb(15,23,42,0.02)] flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.03),transparent_50%)] pointer-events-none" />
               
               <h3 className="text-2xl font-editorial font-bold text-slate-900 mb-3">Your library is ready.</h3>
               <p className="text-slate-500 mb-12 max-w-md">Upload your first asset and turn it into an intelligent, optimized media object.</p>
               
               <Link href="/dashboard/workspace" className="group relative w-full max-w-xl aspect-[21/9] rounded-[24px] border-2 border-dashed border-[rgba(15,23,42,0.1)] bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-colors flex flex-col items-center justify-center cursor-pointer mb-8">
                 <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                   <UploadCloud className="w-5 h-5 text-blue-500" />
                 </div>
                 <p className="text-sm font-bold text-slate-700 mb-1">Drop your media anywhere</p>
                 <p className="text-xs text-slate-400">or browse files</p>
               </Link>

               <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                 <span>JPG</span><span>PNG</span><span>WEBP</span><span>GIF</span><span>MP4</span><span>WEBM</span>
               </div>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {analyses.map((analysis) => {
                  const evidence = Array.isArray(analysis.evidence) ? analysis.evidence[0] : analysis.evidence;
                  const publicId = evidence?.public_id;
                   const secureUrl = evidence?.secure_url as string | undefined;
                   const isSafe = !["high", "critical"].includes(String(analysis.overall_severity));
                  
                  return (
                    <div 
                      key={String(analysis.id)} 
                      onClick={() => setSelectedAsset(analysis)}
                      className="group flex flex-col bg-white rounded-2xl border border-[rgba(15,23,42,0.06)] shadow-[0_4px_20px_rgb(15,23,42,0.02)] overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300"
                    >
                       <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden border-b border-slate-100">
                         {publicId || secureUrl ? (
                           <EvidenceThumbnail publicId={String(publicId || "")} secureUrl={secureUrl} />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center"><FileText className="text-slate-300" /></div>
                         )}
                         <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-xs font-bold text-slate-800 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              <Eye className="w-3.5 h-3.5" /> Open
                            </div>
                         </div>
                       </div>
                       <div className="p-4">
                         <div className="flex justify-between items-start mb-2">
                           <p className="text-[11px] font-bold text-slate-800 truncate pr-2" title={String(analysis.detected_evidence_type)}>
                             {String(analysis.detected_evidence_type) || "Unknown Media"}
                           </p>
                         </div>
                         <div className="flex items-center gap-2 mb-3">
                           <span className="text-[10px] font-mono text-slate-400">IMAGE</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300" />
                           <span className="text-[10px] font-mono text-slate-400">1.2 MB</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <div className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                           <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500">AI Analyzed</span>
                         </div>
                       </div>
                    </div>
                  );
                })}
             </div>
           )}
        </motion.div>

        {/* 7. BOTTOM BENTO (AI ACTIVITY & CLOUDINARY) */}
        {!isEmpty && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <Card>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">AI Activity</p>
               <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-1.5 before:w-px before:bg-slate-100">
                 <div className="flex items-start gap-4 relative">
                   <div className="w-3 h-3 rounded-full border-2 border-white bg-blue-500 shadow-sm shrink-0" />
                   <div className="flex-1 -mt-1"><p className="text-xs font-bold text-slate-700">Media uploaded</p></div>
                   <span className="text-[10px] font-mono text-slate-400">2m</span>
                 </div>
                 <div className="flex items-start gap-4 relative">
                   <div className="w-3 h-3 rounded-full border-2 border-white bg-blue-500 shadow-sm shrink-0" />
                   <div className="flex-1 -mt-1"><p className="text-xs font-bold text-slate-700">AI tagging completed</p></div>
                   <span className="text-[10px] font-mono text-slate-400">4m</span>
                 </div>
                 <div className="flex items-start gap-4 relative">
                   <div className="w-3 h-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm shrink-0" />
                   <div className="flex-1 -mt-1"><p className="text-xs font-bold text-slate-700">Rule analysis applied</p></div>
                   <span className="text-[10px] font-mono text-slate-400">5m</span>
                 </div>
               </div>
               <button className="mt-8 text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                 View activity <ArrowUpRight className="w-3 h-3" />
               </button>
            </Card>

            <Card>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Cloudinary Intelligence</p>
               <div className="flex items-center gap-2 mb-8">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Connected</span>
               </div>
               <div className="space-y-3">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-50"><span className="text-sm font-semibold text-slate-600">Media Delivery</span><span className="text-xs font-bold text-slate-400">Ready</span></div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-50"><span className="text-sm font-semibold text-slate-600">AI Analysis</span><span className="text-xs font-bold text-slate-400">Ready</span></div>
                 <div className="flex justify-between items-center"><span className="text-sm font-semibold text-slate-600">Transformations</span><span className="text-xs font-bold text-slate-400">Ready</span></div>
               </div>
            </Card>
          </motion.div>
        )}

      </main>

      {/* 8. ASSET INTELLIGENCE DRAWER */}
      <AnimatePresence>
        {selectedAsset && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setSelectedAsset(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-[101] flex flex-col border-l border-[rgba(15,23,42,0.06)]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Asset Intelligence</h2>
                <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                 <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl relative overflow-hidden mb-6 border border-[rgba(15,23,42,0.06)] shadow-inner">
                   {selectedAsset.evidence && (Array.isArray(selectedAsset.evidence) ? selectedAsset.evidence[0] : selectedAsset.evidence)?.public_id && (
                     <CldImage src={String((Array.isArray(selectedAsset.evidence) ? selectedAsset.evidence[0] : selectedAsset.evidence).public_id)} alt="Evidence" fill className="object-cover" />
                   )}
                 </div>

                 <h3 className="text-lg font-bold text-slate-900 mb-6">{String(selectedAsset.detected_evidence_type) || "Security Evidence"}</h3>

                 <div className="space-y-8">
                   <div>
                     <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">AI Tags</p>
                     <div className="flex flex-wrap gap-2">
                       {["security", "dashboard", "software", "interface", "analysis"].map(t => (
                         <span key={t} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-mono">#{t}</span>
                       ))}
                     </div>
                   </div>

                   <div>
                     <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">Content Moderation</p>
                     <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Safe
                     </div>
                   </div>

                   <div>
                     <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">Cloudinary</p>
                     <p className="text-sm font-semibold text-slate-700">Optimized</p>
                   </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <Link href={`/dashboard/evidence/${selectedAsset.id}`} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 text-center hover:bg-slate-50 transition-colors shadow-sm">
                   Open Report
                 </Link>
                 <Link href="/dashboard/workspace" className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold text-center hover:bg-slate-800 transition-colors shadow-sm">
                   Transform
                 </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
