import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BlogPostMetadata } from "@/types/blog";

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
          <Link key={post.id} href={`/blog/${post.slug}`} className="snap-start shrink-0 w-[300px] bg-white dark:bg-[#1a1b18] p-5 rounded-[20px] border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-transform shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px]">
            <p className="text-[10px] font-bold text-[#9fe870] mb-2 uppercase tracking-widest">
              {post.published_at ? format(new Date(post.published_at), "dd MMM HH:mm", { locale: id }) : "Draft"}
            </p>
            <h4 className="font-bold leading-snug line-clamp-2 text-[#0e0f0c] dark:text-white">
              {post.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
