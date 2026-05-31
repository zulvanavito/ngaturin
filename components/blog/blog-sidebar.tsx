"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Mail, ChevronRight } from "lucide-react";
import { BlogPostMetadata } from "@/types/blog";
import { useBlogStore } from "@/lib/store/use-blog-store";
import { cn } from "@/lib/utils";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { useToast } from "@/lib/toast-context";


export function BlogSidebar({ posts, categories }: { posts: BlogPostMetadata[], categories: string[] }) {
  const { selectedCategory, setSelectedCategory } = useBlogStore();
  const { showToast } = useToast();
  const [newsletterState, newsletterAction, isPending] = useActionState(subscribeNewsletter, null);

  useEffect(() => {
    if (newsletterState?.status === "success") {
      showToast("success", newsletterState.message);
    } else if (newsletterState?.status === "error") {
      showToast("error", newsletterState.message);
    } else if (newsletterState?.status === "info") {
      showToast("info", newsletterState.message);
    }
  }, [newsletterState, showToast]);

  const categoryCounts = categories.filter(c => c !== "All").map((cat) => ({
    name: cat,
    count: posts.filter((p) => p.category === cat).length,
  }));

  // Get top 5 recent posts for "Popular"
  const popularPosts = posts.slice(0, 5);

  return (
    <aside className="w-full lg:w-[320px] shrink-0 space-y-12">
      {/* Categories Widget */}
      <div className="bg-[#f9faf9] dark:bg-[#121310] rounded-[30px] p-8 border border-gray-100 dark:border-white/5 shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px]">
        <h3 className="font-black text-2xl text-[#0e0f0c] dark:text-white mb-6 uppercase tracking-tight">
          Kategori
        </h3>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => setSelectedCategory("All")}
              className={cn(
                "w-full flex items-center justify-between text-left font-bold text-[15px] p-3 rounded-[16px] transition-all",
                selectedCategory === "All"
                  ? "bg-[#9fe870] text-[#163300]"
                  : "text-gray-500 hover:bg-white dark:hover:bg-[#1a1b18] hover:text-[#0e0f0c] dark:hover:text-white"
              )}
            >
              Semua Topik
              <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded-md">
                {posts.length}
              </span>
            </button>
          </li>
          {categoryCounts.map((cat) => (
            <li key={cat.name}>
              <button
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "w-full flex items-center justify-between text-left font-bold text-[15px] p-3 rounded-[16px] transition-all",
                  selectedCategory === cat.name
                    ? "bg-[#9fe870] text-[#163300]"
                    : "text-gray-500 hover:bg-white dark:hover:bg-[#1a1b18] hover:text-[#0e0f0c] dark:hover:text-white"
                )}
              >
                {cat.name}
                {cat.count > 0 && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-md",
                    selectedCategory === cat.name 
                      ? "bg-[#163300]/20 text-[#163300]" 
                      : "bg-black/5 dark:bg-white/5"
                  )}>
                    {cat.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Articles Widget */}
      <div className="bg-[#f9faf9] dark:bg-[#121310] rounded-[30px] p-8 border border-gray-100 dark:border-white/5 shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px]">
        <h3 className="font-black text-2xl text-[#0e0f0c] dark:text-white mb-6 uppercase tracking-tight">
          Pilihan Editor
        </h3>
        <div className="space-y-6">
          {popularPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex gap-4 items-center"
            >
              <span className="text-3xl font-black text-gray-200 dark:text-white/10 group-hover:text-[#9fe870] transition-colors leading-none">
                0{index + 1}
              </span>
              <div>
                <p className="text-[10px] font-bold text-[#9fe870] uppercase tracking-widest mb-1">
                  {post.published_at
                    ? format(new Date(post.published_at), "dd MMM yyyy", {
                        locale: id,
                      })
                    : "Draft"}
                </p>
                <h4 className="font-bold text-[#0e0f0c] dark:text-white leading-tight line-clamp-2 group-hover:text-[#9fe870] transition-colors text-sm">
                  {post.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Widget */}
      <div className="bg-[#0e0f0c] rounded-[30px] p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#9fe870] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        <Mail className="w-8 h-8 text-[#9fe870] mb-4" />
        <h3 className="font-black text-2xl text-white mb-2 leading-tight tracking-tight">
          Wawasan Eksklusif
        </h3>
        <p className="text-gray-400 text-sm font-medium mb-6">
          Dapatkan artikel finansial terbaik langsung ke inbox Anda setiap minggu.
        </p>
        <form action={newsletterAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Alamat email Anda"
            className="w-full bg-white/10 text-white placeholder-gray-500 rounded-full px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#9fe870] text-sm font-semibold border border-white/10"
            required
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#9fe870] hover:bg-[#8ade5a] text-[#163300] font-black py-3.5 px-6 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 text-sm uppercase tracking-wider disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isPending ? "Memproses..." : "Berlangganan"}
            {!isPending && <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </form>
      </div>
    </aside>
  );
}
