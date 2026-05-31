import { getBlogPosts, getBlogCategoriesList } from "@/lib/dal";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogSearch } from "@/components/blog/blog-search";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { BlogBreakingNews } from "@/components/blog/blog-breaking-news";
import dynamic from "next/dynamic";

const NewsletterForm = dynamic(() => import("@/components/blog/newsletter-form").then(mod => mod.NewsletterForm), {
  loading: () => <div className="h-[76px] w-full max-w-lg mx-auto bg-white/20 rounded-full animate-pulse" />
});

export const metadata = {
  title: "Blog | Ngaturin - Wawasan Finansial & Produktivitas",
  description: "Gagasan soal produktivitas, Metode PARA, dan strategi finansial kelas kakap dari tim Ngaturin.",
  openGraph: {
    title: "Blog | Ngaturin - Wawasan Finansial & Produktivitas",
    description: "Gagasan soal produktivitas, Metode PARA, dan strategi finansial kelas kakap dari tim Ngaturin.",
    url: "/blog",
    siteName: "Ngaturin",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Ngaturin - Wawasan Finansial & Produktivitas",
    description: "Gagasan soal produktivitas, Metode PARA, dan strategi finansial kelas kakap dari tim Ngaturin.",
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const heroPosts = posts.slice(0, 3);
  const gridPosts = posts.slice(3);

  const dbCategories = await getBlogCategoriesList();
  const uniqueCategories = ["All", ...dbCategories.map(c => c.name)];

  return (
    <main className="min-h-screen bg-[#ffffff] dark:bg-[#0e0f0c] transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-12">
        <BlogHero posts={heroPosts} />
        
        <BlogBreakingNews posts={posts.slice(0, 8)} />
        
        <div className="flex flex-col lg:flex-row gap-12 mt-16">
          <div className="flex-1 min-w-0">
            <BlogSearch categories={uniqueCategories} />
            <BlogGrid posts={posts} />
          </div>
          
          <BlogSidebar posts={posts} categories={uniqueCategories} />
        </div>
      </div>
      
      {/* Newsletter CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#9fe870] to-[#bbf099] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-[#163300] leading-[0.9] mb-6 uppercase tracking-tight">
            Jangan Lewatkan <br />
            <span className="text-white">Artikel Terbaru</span>
          </h2>
          <p className="text-xl font-bold text-[#163300]/80 mb-12 max-w-2xl mx-auto">
            Dapatkan wawasan finansial dan produktivitas eksklusif mingguan yang dirancang untuk mengubah cara kamu mengelola uang.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
