import { getBlogPosts } from "@/lib/dal";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogSearch } from "@/components/blog/blog-search";
import { BlogGrid } from "@/components/blog/blog-grid";

export const metadata = {
  title: "Blog | Ngaturin - Wawasan Finansial & Produktivitas",
  description: "Gagasan soal produktivitas, Metode PARA, dan strategi finansial kelas kakap dari tim Ngaturin.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-[#ffffff] dark:bg-[#0e0f0c] transition-colors duration-300">
      <BlogHero />
      
      <div className="max-w-7xl mx-auto px-6">
        <BlogSearch />
        
        <div className="mt-20">
          <BlogGrid posts={posts} />
        </div>
      </div>
      
      {/* Footer-like call to action */}
      <section className="py-24 px-6 border-t border-gray-100 dark:border-white/5 bg-[#f9faf9] dark:bg-[#121310]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#0e0f0c] dark:text-white leading-[0.9] mb-8">
            SIAP <span className="text-[#9fe870]">MENGATUR</span> HIDUP?
          </h2>
          <p className="text-xl font-semibold text-gray-500 mb-12">
            Gabung dengan ribuan orang lainnya yang sudah mulai mengelola keuangan dan produktivitas dengan cara yang benar.
          </p>
          <div className="flex justify-center">
            <a 
              href="/auth/sign-up"
              className="px-10 py-5 bg-[#9fe870] text-[#163300] rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#9fe870]/20"
            >
              MULAI GRATIS SEKARANG
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
