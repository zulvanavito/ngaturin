"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  ArrowRight,
  LayoutDashboard,
  Wallet,
  Bell,
  Tag,
  HandCoins,
  TrendingUp,
  Target,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard & Analitik",
    description:
      "Ringkasan saldo real-time, grafik pengeluaran, dan insight keuangan harian dalam satu tampilan.",
    color: "text-[#6B93D6]",
    bg: "bg-[#6B93D6]/15",
    border: "border-[#6B93D6]/30",
  },
  {
    icon: Wallet,
    title: "Multi-Dompet",
    description:
      "Kelola berbagai rekening, dompet tunai, atau e-wallet dalam satu tempat yang terorganisir.",
    color: "text-[#BAAFE0]",
    bg: "bg-[#BAAFE0]/20",
    border: "border-[#BAAFE0]/35",
  },
  {
    icon: Bell,
    title: "Tagihan Berulang",
    description:
      "Atur pengingat otomatis untuk tagihan bulanan agar tidak pernah terlewat lagi.",
    color: "text-[#F5C89A]",
    bg: "bg-[#F5C89A]/20",
    border: "border-[#F5C89A]/35",
  },
  {
    icon: Target,
    title: "Anggaran Cerdas",
    description:
      "Tetapkan batas pengeluaran per kategori dan pantau progres anggaran secara visual.",
    color: "text-[#85DABB]",
    bg: "bg-[#85DABB]/20",
    border: "border-[#85DABB]/35",
  },
  {
    icon: HandCoins,
    title: "Utang & Piutang",
    description:
      "Catat pinjaman dan hutang dengan mudah, lengkap dengan status pelunasan.",
    color: "text-[#F4B8C0]",
    bg: "bg-[#F4B8C0]/20",
    border: "border-[#F4B8C0]/35",
  },
  {
    icon: TrendingUp,
    title: "Portofolio Investasi",
    description:
      "Lacak nilai investasi saham, reksa dana, atau aset lainnya dan pantau pertumbuhannya.",
    color: "text-[#93C9E0]",
    bg: "bg-[#93C9E0]/20",
    border: "border-[#93C9E0]/35",
  },
];

const steps = [
  {
    number: "01",
    title: "Daftar Gratis",
    description:
      "Buat akun dalam hitungan detik. Tidak perlu kartu kredit, selamanya gratis.",
  },
  {
    number: "02",
    title: "Catat Transaksi",
    description:
      "Tambahkan pemasukan dan pengeluaran dengan mudah, lalu kategorikan sesuai kebutuhan.",
  },
  {
    number: "03",
    title: "Analisis & Kontrol",
    description:
      "Lihat laporan visual, atur anggaran, dan buat keputusan keuangan yang lebih baik.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="w-full border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm leading-none">
                N.
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight">Ngaturin</span>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <ThemeSwitcher />
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Masuk</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="gradient-primary text-white hover:opacity-90 shadow-sm"
            >
              <Link href="/auth/sign-up">Daftar Gratis</Link>
            </Button>
          </div>

          <div className="sm:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Masuk</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-brand-naval/10 dark:bg-brand-naval/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-brand-lavender/15 dark:bg-brand-lavender/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-mint/10 dark:bg-brand-mint/5 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-naval/10 dark:bg-brand-naval/20 text-brand-naval dark:text-blue-300 text-sm font-semibold mb-8 border border-brand-naval/20 dark:border-blue-400/20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Gratis untuk penggunaan pribadi
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Atur Keuanganmu
            </span>
            <br />
            <span className="gradient-primary bg-clip-text text-transparent">
              Lebih Cerdas
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Dari mencatat transaksi harian, mengelola dompet, hingga memantau
            investasi — semua dalam satu aplikasi yang simpel dan menyenangkan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="gradient-primary text-white hover:opacity-95 h-14 px-10 text-base font-semibold shadow-lg shadow-brand-naval/25 transition-all hover:-translate-y-0.5"
            >
              <Link href="/auth/sign-up">
                Mulai Sekarang — Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-10 text-base border-border/70 hover:bg-muted/50 transition-all hover:-translate-y-0.5"
            >
              <Link href="/auth/login">Sudah Punya Akun</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {[
              { icon: CheckCircle2, label: "Tidak perlu kartu kredit" },
              { icon: Shield, label: "Data terenkripsi" },
              { icon: Users, label: "Gratis selamanya" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-teal-500" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "7+", label: "Fitur Lengkap" },
              { value: "100%", label: "Gratis" },
              { value: "Real-time", label: "Update Saldo" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-brand-naval to-brand-lavender bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-lavender mb-3">
              Fitur Lengkap
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
              Ngaturin hadir dengan fitur-fitur komprehensif untuk membantu kamu
              mengelola keuangan dari A sampai Z.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group relative p-6 rounded-2xl bg-card border ${f.border} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}
                >
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/20 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-lavender mb-3">
              Cara Kerja
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Mulai dalam 3 Langkah
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
              Tidak perlu konfigurasi rumit. Daftar, catat, dan analisis — itu
              saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-9 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-brand-naval/30 via-brand-lavender/40 to-brand-naval/30" />

            {steps.map((step, idx) => (
              <div key={step.number} className="flex flex-col items-center text-center relative">
                {/* Number circle */}
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-5 shadow-md shadow-brand-naval/20 z-10">
                  <span className="text-white font-extrabold text-xl">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16 text-center shadow-2xl shadow-brand-naval/30">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4">
                Ayo Mulai
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
                Kendalikan Keuanganmu
                <br />
                Mulai Hari Ini
              </h2>
              <p className="text-white/75 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Bergabunglah dan nikmati semua fitur Ngaturin tanpa biaya
                selamanya.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-brand-naval hover:bg-white/90 h-14 px-12 text-base font-bold shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Link href="/auth/sign-up">
                  Daftar Gratis Sekarang
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs leading-none">
                N.
              </span>
            </div>
            <span className="font-semibold text-foreground">Ngaturin</span>
            <span className="text-border">·</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <ThemeSwitcher />
        </div>
      </footer>
    </main>
  );
}
