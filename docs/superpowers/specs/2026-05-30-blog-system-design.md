# Design Specification: Ngaturin Blog System (Billboard Style)

## 1. Overview
Implement a high-performance, visually bold blog system for Ngaturin inspired by the "Wise" design system. The system consists of an index page with featured content and a search-enabled grid, and a dynamic detail page optimized for readability.

## 2. User Intent & Success Criteria
- **Intent:** Provide a platform for financial and productivity insights that feels modern and bold.
- **Success Criteria:**
  - High lighthouse scores (Static rendering).
  - Consistent Wise branding (Bold typography, lime green accents).
  - Fast client-side searching and filtering.
  - SEO-friendly dynamic routes.

## 3. Architecture & Data Flow

### Data Layer (lib/dal.ts)
- `getBlogPosts()`: Fetches all published posts from Supabase. Cached via React `cache()`.
- `getBlogPostBySlug(slug: string)`: Fetches a single post by its slug.

### State Management (Zustand)
- **Store:** `blog-filter-store.ts`
- **State:** `searchQuery` (string), `selectedCategory` (string).
- **Purpose:** Synchronize search inputs and category filters across the blog index components.

### Search Engine (Fuse.js)
- **Implementation:** Client-side fuzzy search for the article grid.
- **Data Payload Restriction:** Fuse.js ONLY receives lightweight metadata: `id`, `slug`, `title`, `excerpt`, `category`, `tags`, `cover_image_url`, `published_at`, and calculated `reading_time`.
- **Content Security:** Full `content` (HTML/Markdown) MUST NOT be sent to the client-side search component.

### Routing
- `/blog`: Index page (Server Component fetches metadata -> Client Filtered Grid).
- `/blog/[slug]`: Detail page (Static Generation via `generateStaticParams`). Full article content is fetched and rendered server-side.

## 4. UI/UX Design (Wise Aesthetic)

### Index Page Layout
- **Featured Hero:** Full-width bold card with `rounded-[2.5rem]`. Headline using `Wise Sans 900` (Inter Black fallback), line-height `0.85`.
- **Filter Bar:** Search input and category chips using Lime Green (`#9fe870`) for active states.
- **Article Grid:** 2-column layout (responsive) with 30px radius cards.

### Detail Page Layout
- **Cover Header:** High-impact image with overlay title.
- **Article Body:** Max-width `768px` for readability. Line-height `1.6` for `Inter` body text.
- **Sticky Sidebar:** Share buttons and "Back to Index" link.

## 5. Performance Guardrails (MANDATORY)
- **Data Miniaturization:** The `getBlogPosts()` function for the index page must use a `.select()` query to exclude the `content` column.
- **Image Optimization:**
  - Use `next/image` for all images.
  - `priority={true}` ONLY for the Featured Hero cover image.
  - All other thumbnails must use lazy loading.
- **Bundle Efficiency:** 
  - Avoid heavy animation libraries (Framer Motion, GSAP). Use CSS transitions/transforms for Wise-style interactions (e.g., `scale(1.05)`).
  - Dynamic imports for Fuse.js if necessary to reduce initial bundle size.
- **Rendering Strategy:**
  - Index: Hybrid (Static fetch + Client filter).
  - Detail: SSG with `revalidate` (ISR) for fast updates.

## 5. Components to Create/Update
- `app/blog/page.tsx`: Index Entry Point.
- `app/blog/[slug]/page.tsx`: Detail Entry Point.
- `components/blog/blog-hero.tsx`: Featured post component.
- `components/blog/blog-grid.tsx`: Fuse.js enabled searchable list.
- `components/blog/blog-search.tsx`: Zustand-bound search input.
- `components/blog/blog-content-renderer.tsx`: Readability-optimized renderer.

## 6. Implementation Strategy
1. **DAL Update:** Add blog fetching functions to `lib/dal.ts`.
2. **State Store:** Create `lib/store/blog-store.ts`.
3. **Index Page:** Implement the billboard layout with search/filter.
4. **Detail Page:** Implement static dynamic route with `generateStaticParams`.
5. **SEO:** Add metadata generation for each post.

## 7. Security & Performance
- **RLS:** Ensure `blog_posts` table is queryable by public if status is 'published'.
- **Optimization:** Use Next.js `Image` for cover images with proper sizing.
