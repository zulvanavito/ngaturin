"use client";

import { Search, X } from "lucide-react";
import { useBlogStore } from "@/lib/store/use-blog-store";
import { cn } from "@/lib/utils";

interface BlogSearchProps {
  categories: string[];
}

export function BlogSearch({ categories }: BlogSearchProps) {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useBlogStore();

  return (
    <div className="w-full relative z-20 mb-10">
      <div className="relative group shadow-sm dark:shadow-none rounded-full overflow-hidden transition-all duration-300 focus-within:ring-4 focus-within:ring-[#9fe870]/30 border border-gray-200 dark:border-white/10">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-gray-400 group-focus-within:text-[#9fe870] transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari gagasan finansial..."
          className="w-full bg-white dark:bg-[#1a1b18] text-[#0e0f0c] dark:text-white h-20 pl-16 pr-16 rounded-full border-none focus:outline-none text-xl font-bold placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-6 flex items-center text-gray-400 hover:text-[#0e0f0c] dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border hover:scale-105 active:scale-95 shadow-sm",
              selectedCategory === cat 
                ? "bg-[#9fe870] text-[#163300] border-[#9fe870]" 
                : "bg-white dark:bg-[#1a1b18] text-gray-500 border-gray-200 dark:border-white/10 hover:border-[#9fe870]/50 hover:text-[#0e0f0c] dark:hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
