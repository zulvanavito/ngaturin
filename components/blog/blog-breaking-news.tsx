import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BlogPostMetadata } from "@/types/blog";
import Image from "next/image";

export function BlogBreakingNews({ posts }: { posts: BlogPostMetadata[] }) {
  if (!posts || posts.length === 0) return null;
  
  return (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-3 h-3 bg-[#9fe870] rounded-full animate-pulse"></div>
        <h3 className="text-xl font-black tracking-tight uppercase">Berita Terbaru</h3>
      </div>
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbar">
        {posts.map(post => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group snap-start shrink-0 w-[320px] bg-white dark:bg-[#1a1b18] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-all duration-300 shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px] hover:border-[#9fe870]/50 hover:shadow-md flex gap-4 items-center">
            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              {post.cover_image_url ? (
                <Image src={post.cover_image_url} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-[#163300] flex items-center justify-center">
                   <span className="text-xs font-black text-[#9fe870]/50">N</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-[#9fe870] mb-1 uppercase tracking-widest truncate">
                {post.published_at ? format(new Date(post.published_at), "dd MMM HH:mm", { locale: id }) : "Draft"}
              </p>
              <h4 className="font-bold leading-snug text-sm line-clamp-2 text-[#0e0f0c] dark:text-white group-hover:text-[#9fe870] transition-colors">
                {post.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
