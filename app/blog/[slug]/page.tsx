import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { getBlogPostBySlug, getBlogPosts, getBlogComments } from "@/lib/dal";
import { BlogContentRenderer } from "@/components/blog/blog-content-renderer";
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogAuthor } from "@/components/blog/blog-author";
import { BlogComments } from "@/components/blog/blog-comments";
import { BlogShareSidebar } from "@/components/blog/blog-share-sidebar";

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

  const title = `${post.title} | Ngaturin Blog`;
  const description = post.excerpt;
  const imageUrl = post.cover_image_url;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      section: post.category,
      authors: ["Ngaturin Team"],
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
      creator: "@ngaturin",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();
  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const comments = await getBlogComments(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.cover_image_url ? [post.cover_image_url] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      "@type": "Organization",
      name: "Ngaturin Team",
    },
    description: post.excerpt,
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0e0f0c] pb-20">
      <ReadingProgressBar />

      <div className="container mx-auto px-6 pt-28 lg:pt-32">
        <Link 
          href="/blog"
          className="inline-flex items-center text-gray-500 hover:text-[#0e0f0c] dark:hover:text-white font-bold transition-colors mb-8 group uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Blog
        </Link>

        <article className="max-w-[896px] mx-auto">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-[#9fe870] text-[#163300] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                {post.category}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight text-[#0e0f0c] dark:text-white leading-[0.85] mb-8 [font-feature-settings:'calt'_1]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-500 font-bold border-y border-gray-100 dark:border-white/5 py-6 text-sm uppercase tracking-wider">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#9fe870]" />
                {post.published_at ? format(new Date(post.published_at), "d MMMM yyyy", { locale: id }) : "Draft"}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-[#9fe870]" />
                {post.reading_time} menit baca
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.cover_image_url && (
            <div className="relative w-full h-[480px] mb-16 rounded-[40px] overflow-hidden shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px]">
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
          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Sticky Share Sidebar (Desktop Only) */}
            <BlogShareSidebar title={post.title} slug={post.slug} />

            {/* Main Content */}
            <main className="flex-1 max-w-[768px] min-w-0">
              <BlogContentRenderer content={post.content} />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="bg-[#f9faf9] dark:bg-[#1a1b18] text-gray-500 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-[#9fe870] hover:text-[#0e0f0c] dark:hover:text-white transition-colors cursor-default"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Box */}
              <BlogAuthor />

              {/* Comments Section */}
              <BlogComments postSlug={post.slug} initialComments={comments} />

            </main>
          </div>
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="max-w-[1280px] mx-auto mt-32 border-t border-gray-100 dark:border-white/5 pt-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0e0f0c] dark:text-white mb-10 tracking-tight">
              ARTIKEL TERKAIT
            </h2>
            <BlogGrid posts={relatedPosts} />
          </div>
        )}
      </div>
    </div>
  );
}
