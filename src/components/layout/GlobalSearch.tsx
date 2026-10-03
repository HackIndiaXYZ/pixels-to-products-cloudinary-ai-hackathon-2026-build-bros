"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function GlobalSearch() {
  const [os, setOs] = useState("CMD");
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOs(window.navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl");
    }
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
  };

  return (
    <motion.button 
      onClick={handleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.995 }}
      animate={{
        borderColor: isFocused ? "rgba(59,130,246,0.5)" : isHovered ? "rgba(209,213,219,0.8)" : "rgba(229,231,235,0.6)",
        boxShadow: isFocused 
          ? "0 0 0 4px rgba(59,130,246,0.1), 0 1px 2px rgba(15,23,42,0.05)" 
          : isHovered
            ? "0 4px 12px rgba(15,23,42,0.03), 0 1px 2px rgba(15,23,42,0.02)"
            : "0 1px 2px rgba(15,23,42,0.02)",
      }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-between w-full max-w-[520px] h-[50px] px-4 rounded-[14px] bg-white/70 backdrop-blur-sm border outline-none text-left"
    >
      <div className="flex items-center gap-3">
        <Search className={`w-[18px] h-[18px] transition-colors ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className={`text-[15px] transition-colors ${isFocused ? 'text-gray-900' : 'text-gray-500'}`}>
          Search evidence, reports, assets...
        </span>
      </div>
      
      <div className={`flex items-center justify-center h-[24px] px-2 rounded-md border text-[11px] font-medium font-technical tracking-widest uppercase transition-colors ${isFocused ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
        {os} K
      </div>
    </motion.button>
  );
}
