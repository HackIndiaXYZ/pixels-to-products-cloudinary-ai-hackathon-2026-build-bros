"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalSearch() {
  const [os, setOs] = useState("CMD");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOs(window.navigator.platform.toLowerCase().includes("mac") ? "⌘" : "CTRL");
    }
  }, []);

  return (
    <button 
      onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))}
      className="flex items-center gap-3 w-full max-w-xl text-[--color-ink-4] font-technical text-xs tracking-widest uppercase hover:text-[--color-ink-3] transition-colors group text-left outline-none"
    >
      <Search className="w-4 h-4" />
      <span className="flex-1">SEARCH EVIDENCE, REPORTS, ASSETS...</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">PRESS {os}+K</span>
    </button>
  );
}
