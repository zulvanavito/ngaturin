"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LayoutDashboard, Wallet, Tag, HandCoins, TrendingUp, User, LogOut, Menu, Bell, Layers, Briefcase, FolderOpen, BookOpen, Archive, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mainLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Dompet", href: "/dashboard/wallets", icon: Wallet },
  { name: "Tagihan", href: "/dashboard/bills", icon: Bell },
  { name: "Kategori", href: "/dashboard/categories", icon: Tag },
  { name: "Utang/Piutang", href: "/dashboard/debts", icon: HandCoins },
  { name: "Investasi", href: "/dashboard/investments", icon: TrendingUp },
];

const paraLinks = [
  { name: "PARA Hub", href: "/dashboard/para", icon: Layers },
  { name: "Projects", href: "/dashboard/para/projects", icon: Briefcase },
  { name: "Areas", href: "/dashboard/para/areas", icon: FolderOpen },
  { name: "Resources", href: "/dashboard/para/resources", icon: BookOpen },
  { name: "Arsip", href: "/dashboard/para/archive", icon: Archive },
];

const bottomLinks = [
  { name: "Profil", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [paraOpen, setParaOpen] = useState(pathname.startsWith("/dashboard/para"));

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-card border-r border-border/40 hidden md:flex flex-col py-6 px-4 shrink-0 overflow-y-auto custom-scrollbar">
      <Link href="/dashboard" className="flex items-center gap-3 mb-8 px-2">
        <Image src="/logo.png" alt="Ngaturin Logo" width={32} height={32} className="rounded-xl object-contain" style={{ width: "auto", height: "auto" }} />
        <span className="font-bold text-xl tracking-tight text-foreground">Ngaturin</span>
      </Link>

      
      <nav className="flex-1 space-y-1">
        {mainLinks.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard" && link.href !== "/dashboard/transactions");

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-[1rem] transition-all duration-200 text-sm ${
                isActive
                  ? "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-semibold"
                  : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground font-medium"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
              {link.name}
            </Link>
          );
        })}

        {/* PARA Section */}
        <div className="pt-3">
          <button
            onClick={() => setParaOpen((v) => !v)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-[1rem] transition-all duration-200 text-sm font-semibold ${
              pathname.startsWith("/dashboard/para")
                ? "text-primary"
                : "text-muted-foreground/70 hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold">PARA</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${paraOpen ? "rotate-0" : "-rotate-90"}`} />
          </button>

          {paraOpen && (
            <div className="ml-2 mt-1 space-y-0.5 border-l border-border/40 pl-3">
              {paraLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== "/dashboard/para" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[0.75rem] transition-all duration-200 text-sm ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground font-medium"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      
      <div className="mt-8 space-y-1 pt-6">
        {bottomLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-[1rem] transition-all duration-200 text-sm font-medium text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground"
          >
            <link.icon className="w-5 h-5" />
            {link.name}
          </Link>
        ))}

        <ThemeSwitcher 
          showText={true} 
          variant="ghost"
          className="w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-[1rem] transition-all duration-200 text-sm font-medium text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground h-auto font-sans"
        />

      
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[1rem] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-sm font-medium mt-2"
        >
          <LogOut className="w-6 h-6 p-1 border border-rose-200 dark:border-rose-900 rounded-md" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white dark:bg-card border-b border-border/40 shrink-0 sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Ngaturin Logo" width={28} height={28} className="rounded-xl object-contain" style={{ width: "auto", height: "auto" }} />
        <span className="font-bold text-lg tracking-tight">Ngaturin</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-white dark:bg-card">
          <div className="p-4 border-b border-border/40">
            <Link href="/dashboard" className="flex items-center gap-3 px-2" onClick={() => setOpen(false)}>
              <Image src="/logo.png" alt="Ngaturin Logo" width={32} height={32} className="rounded-xl object-contain" style={{ width: "auto", height: "auto" }} />
              <span className="font-bold text-xl tracking-tight text-foreground">Ngaturin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {mainLinks.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard" && link.href !== "/dashboard/transactions");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                    isActive
                      ? "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-semibold"
                      : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground font-medium"
                  }`}
                >
                  <link.icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                  {link.name}
                </Link>
              );
            })}

            {/* PARA Section — Mobile */}
            <div className="pt-3">
              <p className="px-4 pb-1.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> PARA
              </p>
              {paraLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== "/dashboard/para" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground font-medium"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-border/40 space-y-2">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-medium text-muted-foreground">Tema</span>
              <ThemeSwitcher />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
