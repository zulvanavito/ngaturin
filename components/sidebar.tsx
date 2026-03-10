"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LayoutDashboard, Wallet, Tag, HandCoins, TrendingUp, User, LogOut, Menu, Bell } from "lucide-react";
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

const bottomLinks = [
  { name: "Profil", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-card border-r border-border/40 hidden md:flex flex-col py-6 px-4 shrink-0 overflow-y-auto custom-scrollbar">
      {/* Brand logo */}
      <Link href="/dashboard" className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-lg leading-none pt-0.5">
          N.
        </div>
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
                  ? "bg-rose-100/80 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold"
                  : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground font-medium"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "text-rose-500 dark:text-rose-400" : ""}`} />
              {link.name}
            </Link>
          );
        })}
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
        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm pt-0.5">
          B.
        </div>
        <span className="font-bold text-lg tracking-tight">Budggt.</span>
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
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-lg leading-none pt-0.5">
                B.
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Budggt.</span>
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
                      ? "bg-rose-100/80 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold"
                      : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground font-medium"
                  }`}
                >
                  <link.icon className={`w-5 h-5 ${isActive ? "text-rose-500 dark:text-rose-400" : ""}`} />
                  {link.name}
                </Link>
              );
            })}
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
