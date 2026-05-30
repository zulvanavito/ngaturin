"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ArrowRight, History, Tag, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFilterStore } from "@/lib/store/filter-store";

interface QuickLink {
  label: string;
  href: string;
  icon: typeof History;
}

const quickLinks: QuickLink[] = [
  { label: "Transaksi", href: "/dashboard/transactions", icon: History },
  { label: "Kategori", href: "/dashboard/categories", icon: Tag },
  { label: "Dompet", href: "/dashboard/wallets", icon: Wallet },
];

export function DashboardSearch() {
  const { searchQuery, setSearchQuery } = useFilterStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sync local query with global store
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ngaturin_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch { /* silent */ }
  }, []);

  const saveSearch = useCallback((term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("ngaturin_recent_searches", JSON.stringify(updated));
    } catch { /* silent */ }
  }, [recentSearches]);

  const handleSearch = (searchTerm?: string) => {
    const term = (searchTerm || localQuery).trim();
    if (!term) return;
    saveSearch(term);
    setIsFocused(false);
    
    // Update global store
    setSearchQuery(term);
    
    // Navigate to transactions page — the search will be handled via URL and store 
    router.push(`/dashboard/transactions?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem("ngaturin_recent_searches"); } catch { /* silent */ }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl group" id="tour-search-bar">

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari transaksi, kategori, menu..."
          className="w-full h-12 pl-11 pr-4 bg-white dark:bg-card border border-border/10 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
          style={{ fontFeatureSettings: '"calt"' }}
        />
      </div>

      {/* Dropdown */}
      {isFocused && (
        <div className="absolute left-0 right-0 top-14 z-50 bg-white dark:bg-card border border-border/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Navigate */}
          <div className="p-3 border-b border-border/5">
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2 mb-2" style={{ fontFeatureSettings: '"calt"' }}>
              Menu Cepat
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    setIsFocused(false);
                    router.push(link.href);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 hover:bg-primary/10 hover:text-primary text-xs font-semibold text-muted-foreground transition-all hover:scale-105 active:scale-95"
                >
                  <link.icon className="w-3 h-3" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
                  Pencarian Terakhir
                </p>
                <button
                  onClick={clearRecent}
                  className="text-[10px] font-black text-muted-foreground/60 hover:text-destructive transition-colors uppercase tracking-widest"
                >
                  Hapus
                </button>
              </div>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-muted/20 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <History className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate" style={{ fontFeatureSettings: '"calt"' }}>{term}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Search hint */}
          {localQuery.trim() && (
            <div className="p-3 border-t border-border/5">
              <button
                onClick={() => handleSearch()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                  Cari &quot;{localQuery}&quot; di transaksi
                </span>
                <ArrowRight className="w-3 h-3 text-primary ml-auto" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
