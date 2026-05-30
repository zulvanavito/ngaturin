import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BlogPostMetadata } from "@/types/blog";

export function BlogHero({ posts }: { posts: BlogPostMetadata[] }) {
  if (!posts || posts.length === 0) return null;
  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 3);

  return (
    <section className="mb-16">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Featured Post (65%) */}
        <Link href={`/blog/${mainPost.slug}`} className="group relative flex-[0.65] bg-[#121310] rounded-[30px] overflow-hidden min-h-[500px] border border-gray-200 dark:border-white/10 shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px]">
          {mainPost.cover_image_url && (
            <Image src={mainPost.cover_image_url} alt={mainPost.title} fill priority className="object-cover transition-transform duration-700 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="bg-[#9fe870] text-[#163300] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-4">
              {mainPost.category}
            </span>
            <h2 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase mb-4 text-white group-hover:text-[#9fe870] transition-colors line-clamp-3">
              {mainPost.title}
            </h2>
            <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>{mainPost.published_at ? format(new Date(mainPost.published_at), "dd MMM yyyy", { locale: id }) : "Draft"}</span>
              <span>•</span>
              <span>{mainPost.reading_time || 5} MIN</span>
            </div>
          </div>
        </Link>

        {/* Side Posts (35%) */}
        <div className="flex-[0.35] flex flex-col gap-6">
          {sidePosts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group relative flex-1 bg-[#121310] rounded-[30px] overflow-hidden min-h-[240px] border border-gray-200 dark:border-white/10 shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px]">
              {post.cover_image_url && (
                <Image src={post.cover_image_url} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <span className="bg-[#9fe870] text-[#163300] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mb-3">
                  {post.category}
                </span>
                <h3 className="text-2xl font-black leading-[1.1] tracking-tighter uppercase mb-2 text-white group-hover:text-[#9fe870] transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
