# Ngaturin Blog System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance, visually bold blog system (Index & Detail) using Next.js Server Components, Zustand, and Fuse.js with strict performance guardrails.

**Architecture:** Hybrid approach using Server Components for SEO-critical data (Detail Page) and Client Components for interactive filtering (Index Page). Strict data miniaturization for client-side search.

**Tech Stack:** Next.js (App Router), Supabase, Zustand, Fuse.js, Tailwind CSS (Vanilla).

---

### Task 1: Data Access Layer (DAL) & Types

**Files:**
- Modify: `lib/dal.ts`
- Modify: `types/blog.ts` (if needed)

- [ ] **Step 1: Update BlogPost type**
Ensure `BlogPost` type aligns with the schema and lightweight metadata needs.

```typescript
// types/blog.ts
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image_url?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  author_id: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogPostMetadata = Omit<BlogPost, 'content'> & {
  reading_time?: number;
};
```

- [ ] **Step 2: Add DAL fetching functions**
Implement `getBlogPosts` (metadata only) and `getBlogPostBySlug`.

```typescript
// lib/dal.ts
export const getBlogPosts = cache(async (): Promise<BlogPostMetadata[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, category, tags, cover_image_url, published_at, status, is_featured")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("DAL: Error fetching blog posts:", error);
    return [];
  }

  return (data || []).map(post => ({
    ...post,
    reading_time: Math.ceil((post.excerpt?.length || 0) / 200) // Placeholder logic
  }));
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("DAL: Error fetching post by slug:", error);
    return null;
  }
  return data;
});
```

- [ ] **Step 3: Commit**
`git add lib/dal.ts types/blog.ts && git commit -m "feat(blog): add dal fetching and types"`

---

### Task 2: Zustand Store for Blog Filters

**Files:**
- Create: `lib/store/use-blog-store.ts`

- [ ] **Step 1: Create the store**
Implement search and category filters.

```typescript
// lib/store/use-blog-store.ts
import { create } from 'zustand';

interface BlogState {
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  resetFilters: () => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  searchQuery: '',
  selectedCategory: 'All',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  resetFilters: () => set({ searchQuery: '', selectedCategory: 'All' }),
}));
```

- [ ] **Step 2: Commit**
`git add lib/store/use-blog-store.ts && git commit -m "feat(blog): add zustand filter store"`

---

### Task 3: Blog Index Page & Components

**Files:**
- Modify: `app/blog/page.tsx`
- Create: `components/blog/blog-hero.tsx`
- Create: `components/blog/blog-grid.tsx`
- Create: `components/blog/blog-search.tsx`

- [ ] **Step 1: Implement BlogHero (Billboard Style)**
Use `Wise Sans 900` style (Inter Black fallback).

```typescript
// components/blog/blog-hero.tsx
import Image from "next/image";
import Link from "next/link";
import { BlogPostMetadata } from "@/types/blog";

export function BlogHero({ post }: { post: BlogPostMetadata }) {
  return (
    <section className="relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-12 group border border-border/50">
      <Image 
        src={post.cover_image_url || "/placeholder.jpg"} 
        alt={post.title}
        fill
        priority
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
        <span className="bg-[#9fe870] text-[#163300] px-4 py-1 rounded-full text-sm font-bold w-fit mb-4">
          {post.category}
        </span>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-4xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter uppercase max-w-4xl hover:text-[#9fe870] transition-colors">
            {post.title}
          </h2>
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Implement BlogSearch (Zustand-bound)**

```typescript
// components/blog/blog-search.tsx
"use client";
import { useBlogStore } from "@/lib/store/use-blog-store";
import { Search } from "lucide-react";

export function BlogSearch() {
  const { searchQuery, setSearchQuery } = useBlogStore();
  return (
    <div className="relative mb-8">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <input 
        type="text"
        placeholder="Cari wawasan finansial..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-secondary/50 border-none rounded-2xl py-4 pl-12 pr-4 font-semibold focus:ring-2 focus:ring-[#9fe870] transition-all"
      />
    </div>
  );
}
```

- [ ] **Step 3: Implement BlogGrid (Fuse.js Integration)**
Ensure content is NOT included in data.

```typescript
// components/blog/blog-grid.tsx
"use client";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { BlogPostMetadata } from "@/types/blog";
import { useBlogStore } from "@/lib/store/use-blog-store";
import Link from "next/link";
import Image from "next/image";

export function BlogGrid({ posts }: { posts: BlogPostMetadata[] }) {
  const { searchQuery, selectedCategory } = useBlogStore();

  const fuse = useMemo(() => new Fuse(posts, {
    keys: ["title", "excerpt", "tags"],
    threshold: 0.3
  }), [posts]);

  const filteredPosts = useMemo(() => {
    let result = searchQuery ? fuse.search(searchQuery).map(r => r.item) : posts;
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }
    return result;
  }, [searchQuery, selectedCategory, fuse, posts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {filteredPosts.map(post => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="group">
          <div className="border border-border/50 rounded-[2rem] overflow-hidden bg-card hover:border-[#9fe870]/50 transition-all duration-300">
             <div className="relative aspect-video">
                <Image src={post.cover_image_url || "/placeholder.jpg"} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
             </div>
             <div className="p-6">
                <span className="text-[#9fe870] font-bold text-xs uppercase mb-2 block">{post.category}</span>
                <h3 className="text-2xl font-black leading-tight mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
             </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Update Index Page Entry Point**

```typescript
// app/blog/page.tsx
import { getBlogPosts } from "@/lib/dal";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogSearch } from "@/components/blog/blog-search";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featuredPost = posts.find(p => p.is_featured) || posts[0];
  
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {featuredPost && <BlogHero post={featuredPost} />}
      <div className="mt-20">
        <h2 className="text-5xl font-black mb-8 uppercase tracking-tighter">Wawasan Terbaru</h2>
        <BlogSearch />
        <BlogGrid posts={posts} />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Commit**
`git add app/blog/page.tsx components/blog/ && git commit -m "feat(blog): implement index page with Billboard style and search"`

---

### Task 4: Blog Detail Page ([slug])

**Files:**
- Create: `app/blog/[slug]/page.tsx`
- Create: `components/blog/blog-content-renderer.tsx`

- [ ] **Step 1: Implement Content Renderer (Readability Focus)**

```typescript
// components/blog/blog-content-renderer.tsx
export function BlogContentRenderer({ content }: { content: string }) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none 
      prose-headings:font-black prose-headings:tracking-tighter 
      prose-p:text-foreground/80 prose-p:leading-relaxed
      prose-img:rounded-[2rem]">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

- [ ] **Step 2: Implement Detail Page with generateStaticParams**

```typescript
// app/blog/[slug]/page.tsx
import { getBlogPosts, getBlogPostBySlug } from "@/lib/dal";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BlogContentRenderer } from "@/components/blog/blog-content-renderer";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 font-bold">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-black leading-[0.85] tracking-tighter uppercase mb-8">
          {post.title}
        </h1>
        
        <div className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-12 border border-border/50">
          <Image src={post.cover_image_url || "/placeholder.jpg"} alt={post.title} fill className="object-cover" />
        </div>

        <div className="flex flex-col md:flex-row gap-12 relative">
          {/* Sticky Sidebar */}
          <aside className="hidden md:block w-12 sticky top-24 h-fit">
            <button className="p-3 bg-secondary rounded-full hover:bg-[#9fe870] transition-colors mb-4">
              <Share2 className="w-5 h-5" />
            </button>
          </aside>

          {/* Readability Optimized Content */}
          <div className="flex-1 max-w-[768px]">
             <BlogContentRenderer content={post.content} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**
`git add app/blog/[slug]/page.tsx components/blog/blog-content-renderer.tsx && git commit -m "feat(blog): implement detail page with static params and readability focus"`

---

### Task 5: Final Validation & SEO

- [ ] **Step 1: Add Metadata to Detail Page**
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | Ngaturin Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.cover_image_url],
    },
  };
}
```

- [ ] **Step 2: Final performance check**
Ensure no unused libraries and images are optimized. Run `npm run build` to verify static page generation.

- [ ] **Step 3: Commit**
`git commit -m "feat(blog): add SEO metadata and performance cleanup"`
