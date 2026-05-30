import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, Clock, Share2, Tag } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/dal";
import { BlogContentRenderer } from "@/components/blog/blog-content-renderer";
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar";
import { Button } from "@/components/ui/button";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Ngaturin",
    };
  }

  return {
    title: `${post.title} | Ngaturin Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8F9F8] pb-20">
      {/* Article Progress Bar - Top Sticky */}
      <ReadingProgressBar />

      <div className="container mx-auto px-4 pt-8 lg:pt-12">
        {/* Back Button */}
        <Link 
          href="/blog"
          className="inline-flex items-center text-brand-dark/60 hover:text-brand-dark font-medium transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Blog
        </Link>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-brand-green text-brand-dark px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider shadow-sm">
                {post.category}
              </span>
              {post.is_featured && (
                <span className="bg-brand-dark text-white px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-brand-dark leading-[0.9] mb-8">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-brand-dark/60 font-medium border-y border-brand-dark/10 py-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-brand-green" />
                {post.published_at ? format(new Date(post.published_at), "d MMMM yyyy", { locale: id }) : "Draft"}
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-brand-green" />
                {post.reading_time} menit baca
              </div>
              <button className="flex items-center hover:text-brand-dark transition-colors ml-auto group">
                <Share2 className="w-5 h-5 mr-2 text-brand-green group-hover:scale-110 transition-transform" />
                Bagikan
              </button>
            </div>
          </header>

          {/* Featured Image */}
          {post.cover_image_url && (
            <div className="relative aspect-[21/9] w-full mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>
          )}

          {/* Content Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <main className="flex-1 max-w-[768px] mx-auto lg:mx-0 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm ring-1 ring-brand-dark/5">
              <BlogContentRenderer content={post.content} />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-16 pt-8 border-t border-brand-dark/10">
                  <h3 className="text-lg font-black text-brand-dark mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-brand-green" />
                    Tag Terkait
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="bg-brand-mint/50 text-brand-dark/70 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-brand-mint transition-colors cursor-default"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:block w-72 h-fit sticky top-24">
              <div className="bg-brand-dark text-white p-8 rounded-[2.5rem] shadow-xl">
                <h3 className="text-2xl font-black mb-4 leading-none tracking-tight">
                  Tingkatkan Literasi Finansialmu
                </h3>
                <p className="text-white/70 mb-6 text-sm leading-relaxed">
                  Gunakan Ngaturin untuk mengelola keuangan lebih cerdas dan capai tujuan finansialmu.
                </p>
                <Button className="w-full bg-brand-green text-brand-dark hover:bg-brand-pastel font-black rounded-full h-12 transition-all">
                  Mulai Sekarang
                </Button>
              </div>

              <div className="mt-8 p-8 border-2 border-brand-dark/5 rounded-[2.5rem]">
                <h4 className="font-black text-brand-dark mb-4">Bagikan Artikel</h4>
                <div className="flex gap-4">
                  <button className="p-3 bg-white shadow-sm ring-1 ring-brand-dark/10 rounded-2xl hover:bg-brand-mint transition-all hover:-translate-y-1">
                    <Share2 className="w-5 h-5 text-brand-dark" />
                  </button>
                  {/* Additional share icons could go here */}
                </div>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}
