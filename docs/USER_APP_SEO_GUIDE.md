# User App SEO Integration Guide (Ngaturin Blog)

Karena User Application berada di repository terpisah, gunakan panduan ini untuk mengintegrasikan SEO dynamic metadata dan sitemap menggunakan data dari database Supabase yang sama.

## 1. Dynamic Metadata (`app/blog/[slug]/page.tsx`)

Implementasikan fungsi `generateMetadata` untuk menyuntikkan Meta Title, Description, dan OpenGraph tags secara dinamis.

```typescript
import { Metadata, ResolvingMetadata } from 'next'
import { createClient } from '@/lib/supabase/server' // Sesuaikan dengan path lib Anda

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, cover_image_url, canonical_url')
    .eq('slug', slug)
    .single()

  if (!post) {
    return {
      title: 'Post Not Found | Ngaturin Blog',
    }
  }

  const previousImages = (await parent).openGraph?.images || []
  const title = post.meta_title || post.title
  const description = post.meta_description || post.excerpt

  return {
    title: `${title} | Ngaturin Blog`,
    description: description,
    alternates: {
      canonical: post.canonical_url || `https://ngaturin.com/blog/${slug}`,
    },
    openGraph: {
      title: title,
      description: description,
      images: post.cover_image_url ? [post.cover_image_url, ...previousImages] : previousImages,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  }
}
```

## 2. Dynamic Sitemap (`app/sitemap.ts`)

Buat file `sitemap.ts` di root folder `app` untuk menghasilkan `sitemap.xml` secara otomatis.

```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://ngaturin.com' // Ganti dengan domain produksi Anda

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  const blogEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...blogEntries,
  ]
}
```

## 3. Robots.txt (`app/robots.txt`)

Pastikan Google Bot dapat menemukan sitemap Anda.

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://ngaturin.com/sitemap.xml',
  }
}
```

## 4. Analytics (Vercel / GA4)

Tambahkan di `app/layout.tsx` (User App):

```typescript
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 5. Dynamic Categories (Navigation/Filters)

Gunakan tabel `blog_categories` untuk merender menu kategori secara dinamis di User App.

```typescript
export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_categories')
    .select('name, slug')
    .order('name')
  
  return data || []
}
```

Tabel `blog_posts` tetap menyimpan nama kategori di kolom `category`. Anda bisa melakukan filter seperti biasa:
`supabase.from('blog_posts').select('*').eq('category', 'Investasi')`

## 6. Real-time View Counter

Untuk menambah jumlah kunjungan setiap kali artikel dibaca, panggil RPC `increment_post_view` di dalam `useEffect` atau Server Component pada halaman detail artikel (`app/blog/[slug]/page.tsx`).

```typescript
// Contoh di User App (Client Component)
useEffect(() => {
  const incrementView = async () => {
    await supabase.rpc('increment_post_view', { post_slug: slug })
  }
  incrementView()
}, [slug])
```

Anda sekarang bisa mengurutkan artikel berdasarkan popularitas:
```typescript
const { data: popularPosts } = await supabase
  .from('blog_posts')
  .select('title, slug')
  .order('view_count', { ascending: false })
  .limit(5)
```

## 7. Author Profiles (JOIN Query)

Untuk menampilkan data penulis di User App, gunakan sintaks JOIN di dalam query `select`.

```typescript
const { data: post } = await supabase
  .from('blog_posts')
  .select(`
    *,
    blog_authors (
      name,
      avatar_url,
      bio
    )
  `)
  .eq('slug', slug)
  .single();
```

Jangan lupa untuk menambahkan metadata author di `generateMetadata`:
```typescript
return {
  title: post.meta_title || post.title,
  authors: [{ name: post.blog_authors?.name }],
  // ...
}
```


## 9. Visual Consistency (Syncing Styles)

Agar tampilan di User App identik dengan Admin Editor, ikuti langkah berikut:

1.  **Install Tailwind Typography:** `npm install -D @tailwindcss/typography`.
2.  **Config Tailwind:** Tambahkan plugin `typography` di `tailwind.config.ts`.
3.  **Custom Styles:** Sesuaikan radius gambar dan font di dalam objek `typography` di config agar match dengan aesthetic "Wise".
4.  **CSS Global:** Pastikan mendukung `text-align` dengan menambahkan class helper di CSS global jika diperlukan.

Daftar Class Wajib pada Wrapper Artikel:
- `prose`: Mengaktifkan styling otomatis.
- `prose-slate`: (Atau warna lain) menentukan palet warna dasar.
- `max-w-none`: Mencegah pemotongan lebar otomatis oleh plugin prose.
- `font-wise`: (Opsional) jika Anda menggunakan font kustom.
