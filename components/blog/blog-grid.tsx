"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Fuse from "fuse.js";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, Tag, ChevronRight } from "lucide-react";
import { BlogPostMetadata } from "@/types/blog";
import { useBlogStore } from "@/lib/store/use-blog-store";

interface BlogGridProps {
  posts: BlogPostMetadata[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  const { searchQuery, selectedCategory } = useBlogStore();

  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: ["title", "excerpt", "category", "tags"],
      threshold: 0.4,
    });
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (selectedCategory !== "All") {
      result = result.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery) {
      result = fuse.search(searchQuery).map((r) => r.item);
    }

    return result;
  }, [posts, searchQuery, selectedCategory, fuse]);

  if (filteredPosts.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-2xl font-black text-[#0e0f0c] dark:text-white mb-2 uppercase italic">
          Gagasan tidak ditemukan.
        </h3>
        <p className="text-gray-500 font-semibold">
          Coba kata kunci lain atau pilih kategori yang berbeda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
      {filteredPosts.map((post, index) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group block bg-white dark:bg-[#1a1b18] rounded-[30px] border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/5"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            {post.cover_image_url ? (
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={index < 2}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-[#9fe870]/10 flex items-center justify-center">
                <span className="text-4xl font-black text-[#9fe870]/20">NGATURIN</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="px-4 py-1.5 bg-[#9fe870] text-[#163300] text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                {post.category}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {post.reading_time || 5} MIN
              </span>
              <span>•</span>
              <span>{post.published_at ? format(new Date(post.published_at), "dd MMM yyyy", { locale: id }) : "Draft"}</span>
            </div>

            <h2 className="text-2xl font-black text-[#0e0f0c] dark:text-white leading-[1.1] mb-4 group-hover:text-[#9fe870] transition-colors line-clamp-2">
              {post.title}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 font-semibold leading-relaxed line-clamp-3 mb-8">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
              <div className="flex gap-2">
                {post.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#9fe870] group-hover:text-[#163300] transition-all">
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
