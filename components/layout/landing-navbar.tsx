"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { useBlogStore } from "@/lib/store/use-blog-store";
import { cn } from "@/lib/utils";

const BLOG_CATEGORIES = ["Keuangan", "Investasi", "Produktivitas", "Karir"];

export function LandingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isBlog = pathname?.startsWith("/blog");
  const { selectedCategory, setSelectedCategory } = useBlogStore();

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    if (pathname !== "/blog") {
      router.push("/blog");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
      <nav className="w-full max-w-4xl border border-border/40 bg-background/80 dark:bg-background/60 backdrop-blur-3xl shadow-2xl shadow-black/5 dark:shadow-primary/5 rounded-full pointer-events-auto">
        <div className="flex justify-between items-center px-4 md:px-6 h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Ngaturin Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-extrabold text-lg tracking-tight text-foreground hidden sm:block">
              Ngaturin
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {isBlog ? (
              // Blog Navigation
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Beranda
                </Link>
                <div className="w-px h-4 bg-border/50"></div>
                {BLOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "text-sm font-bold transition-colors",
                      selectedCategory === cat && pathname === "/blog"
                        ? "text-[#9fe870]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            ) : (
              // Landing Navigation
              <>
                <Link
                  href="/#fitur"
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Fitur
                </Link>
                <Link
                  href="/#komparasi"
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Bagaimana Ini Bekerja
                </Link>
                <Link
                  href="/#harga"
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Harga
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-sm" />
                  Blog
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher />
            <Button
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:brightness-110 shadow-xl shadow-primary/20 transition-transform hover:-translate-y-0.5 rounded-xl px-4 sm:px-6 font-extrabold"
            >
              <Link href="/auth/sign-up">Daftar Gratis</Link>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
