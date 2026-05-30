"use client";

import { Search, X } from "lucide-react";
import { useBlogStore } from "@/lib/store/use-blog-store";

export function BlogSearch() {
  const { searchQuery, setSearchQuery } = useBlogStore();

  return (
    <div className="w-full max-w-2xl mx-auto -mt-8 relative z-20 px-4">
      <div className="relative group shadow-ring rounded-full overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-[#9fe870]">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#9fe870] transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari gagasan..."
          className="w-full bg-white dark:bg-[#1a1b18] text-[#0e0f0c] dark:text-white h-16 pl-14 pr-14 rounded-full border-none focus:outline-none text-lg font-semibold"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-6 flex items-center text-gray-400 hover:text-[#0e0f0c] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="mt-4 flex justify-center gap-3">
        {["All", "Productivity", "Finance", " PARA"].map((cat) => (
          <button
            key={cat}
            onClick={() => useBlogStore.getState().setSelectedCategory(cat)}
            className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-transparent hover:border-[#9fe870]/30"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
