"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, CornerDownLeft } from "lucide-react";

const COMMANDS = [
  { group: "ACTIONS", name: "New Analysis", path: "/dashboard/analysis/new", icon: "⊕" },
  { group: "ACTIONS", name: "Analyze Text", path: "/dashboard/analysis/new", icon: "▤" },
  { group: "NAVIGATION", name: "Command Center", path: "/dashboard", icon: "⊞" },
  { group: "NAVIGATION", name: "Findings", path: "/dashboard/findings", icon: "⚠" },
  { group: "NAVIGATION", name: "Reports", path: "/dashboard/reports", icon: "≡" },
  { group: "NAVIGATION", name: "Evidence Library", path: "/dashboard/evidence", icon: "⌗" },
  { group: "NAVIGATION", name: "Archive", path: "/dashboard/archive", icon: "⚑" },
  { group: "SYSTEM", name: "Pipeline Viewer", path: "/dashboard/pipeline", icon: "⑆" },
  { group: "SYSTEM", name: "System Status", path: "/dashboard/status", icon: "●" },
  { group: "SYSTEM", name: "Configuration", path: "/dashboard/configuration", icon: "⚙" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = search.trim() === "" 
    ? COMMANDS 
    : COMMANDS.filter((cmd) => cmd.name.toLowerCase().includes(search.toLowerCase()) || cmd.group.toLowerCase().includes(search.toLowerCase()));

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setActiveIndex(0); }, [search]);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        handleSelect(filteredCommands[activeIndex].path);
      } else if (search.trim()) {
        handleSelect(`/dashboard/search?q=${encodeURIComponent(search.trim())}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[--color-ink]/20 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-[--color-background] border border-[--color-rule] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "var(--font-technical)" }}
      >
        <div className="p-5 border-b border-[--color-rule] flex items-center gap-4 bg-[--color-surface]">
          <Search className="w-5 h-5 text-[--color-ink-3]" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="TYPE A COMMAND OR SEARCH..." 
            className="flex-1 bg-transparent outline-none text-sm text-[--color-ink] placeholder:text-[--color-ink-4] tracking-widest uppercase"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="font-ui text-[10px] uppercase text-[--color-ink-4] tracking-wider border border-[--color-rule-light] px-2 py-1 bg-[--color-background]">
            ESC to close
          </div>
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto" ref={listRef}>
          {filteredCommands.length === 0 ? (
            <div className="px-6 py-12 text-center flex flex-col gap-2">
              <span className="text-[--color-ink-4] text-xs tracking-widest uppercase">No commands found for &quot;{search}&quot;</span>
              <button 
                onClick={() => handleSelect(`/dashboard/search?q=${encodeURIComponent(search.trim())}`)}
                className="text-blue-500 font-bold text-sm hover:underline"
              >
                Press Enter to search Cloudinary assets →
              </button>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(
                filteredCommands.reduce((acc, cmd) => {
                  if (!acc[cmd.group]) acc[cmd.group] = [];
                  acc[cmd.group].push(cmd);
                  return acc;
                }, {} as Record<string, typeof COMMANDS>)
              ).map(([group, groupCommands]) => (
                <div key={group} className="mb-2">
                  <div className="px-6 py-3 font-technical text-[10px] tracking-widest uppercase text-[--color-ink-4]">
                    {group}
                  </div>
                  {groupCommands.map((cmd) => {
                    const idx = filteredCommands.findIndex(c => c.name === cmd.name);
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={cmd.name}
                        className={`w-full text-left px-6 py-3 text-xs tracking-widest uppercase flex items-center justify-between transition-colors outline-none
                          ${isActive ? "bg-[--color-ink] text-[--color-background]" : "text-[--color-ink-2] hover:bg-[--color-surface-2] hover:text-[--color-ink]"}
                        `}
                        onClick={() => handleSelect(cmd.path)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? "text-[--color-background-alt]" : "text-[--color-ink-4]"}>{cmd.icon}</span>
                          <span>{cmd.name}</span>
                        </div>
                        {isActive && <CornerDownLeft className="w-3 h-3 opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 border-t border-[--color-rule] flex justify-between items-center bg-[--color-surface]">
          <span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">
            <span className="font-bold">↑↓</span> to navigate
          </span>
          <span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">
            <span className="font-bold">↵</span> to select
          </span>
        </div>
      </div>
    </div>
  );
}
