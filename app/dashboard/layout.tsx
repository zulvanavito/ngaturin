import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Tag, Wallet, Bell, HandCoins, TrendingUp } from "lucide-react";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { DashboardTour } from "@/components/dashboard-tour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-16">
          {/* Logo — icon + text on desktop, icon only on mobile */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="hidden sm:inline font-bold text-lg">Ngaturin</span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Mobile: 3-dot menu button */}
            <MobileMenuButton />

            {/* Desktop: nav links + ThemeSwitcher + AuthButton */}
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard/wallets"
                className="tour-wallets flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
              >
                <Wallet className="w-4 h-4" />
                <span>Dompet</span>
              </Link>
              <Link
                href="/dashboard/bills"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
              >
                <Bell className="w-4 h-4" />
                <span>Tagihan</span>
              </Link>
              <Link
                href="/dashboard/categories"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
              >
                <Tag className="w-4 h-4" />
                <span>Kategori</span>
              </Link>
              <Link
                href="/dashboard/debts"
                className="tour-debts flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
              >
                <HandCoins className="w-4 h-4" />
                <span>Utang/Piutang</span>
              </Link>
              <Link
                href="/dashboard/investments"
                className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors px-3 py-1.5 rounded-lg"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Investasi</span>
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full">
        <DashboardTour />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground">
          &copy; 2026 Ngaturin — Atur keuanganmu lebih mudah.
        </div>
      </footer>
    </div>
  );
}

