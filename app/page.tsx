"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  ArrowRight,
  TrendingUp,
  Target,
  Bell,
  Wallet,
  LayoutDashboard,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  PieChart,
  Smartphone,
  RefreshCw,
  HandCoins,
  ChevronRight,
} from "lucide-react";

const featuresData = [
  {
    icon: Bell,
    title: "Tagihan Berulang",
    description: "Pengingat otomatis untuk subscription dan cicilan agar tak pernah telat.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard & Analitik",
    description: "Ringkasan saldo, tren pengeluaran, dan wawasan keuangan yang interaktif.",
  },
  {
    icon: Shield,
    title: "Keamanan Terjamin",
    description: "Data keuangan tersimpan secara aman dengan kontrol akses akun privat.",
  },
  {
    icon: RefreshCw,
    title: "Sinkronisasi Cloud",
    description: "Akses data keuangan Anda secara real-time dari berbagai perangkat modern.",
  },
];

const DashboardMockup = () => (
  <div className="relative mx-auto mt-12 w-full max-w-5xl rounded-[2rem] border border-border/20 bg-background/60 backdrop-blur-2xl shadow-[0_30px_100px_rgba(209,252,0,0.15)] dark:shadow-[0_30px_100px_rgba(209,252,0,0.05)] overflow-hidden">
    {/* App Titlebar */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-border/10 bg-muted/10">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full text-[10px] font-semibold text-muted-foreground border border-border/20">
        <Lock className="w-3 h-3" />
        app.ngaturin.com
      </div>
      <div className="w-16" />
    </div>

    {/* App Content */}
    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
      {/* Sidebar Mock */}
      <div className="hidden border-r border-border/20 md:flex flex-col gap-6 w-48 shrink-0 pr-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
             <div className="w-4 h-4 bg-primary rounded-sm" />
          </div>
          <div className="w-20 h-4 bg-foreground/20 rounded-md" />
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 rounded-xl text-primary font-medium text-xs">
             <LayoutDashboard className="w-4 h-4" />
             Dashboard
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 opacity-50">
              <div className="w-4 h-4 rounded-md bg-foreground/20" />
              <div className="h-3 w-16 rounded-md bg-foreground/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Area Mock */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div>
              <div className="h-4 w-32 bg-foreground/30 rounded mb-2" />
              <div className="h-8 w-48 bg-foreground/10 rounded" />
           </div>
           <div className="h-10 w-32 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="h-3 w-16 bg-primary/60 rounded" />
           </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-[1.5rem] bg-card border border-border/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mt-8 -mr-8" />
            <div className="h-3 w-16 bg-muted-foreground/30 rounded mb-4" />
            <div className="h-7 w-32 bg-foreground/80 rounded mb-2" />
            <div className="h-3 w-20 bg-green-500/50 rounded" />
          </div>
          <div className="p-5 rounded-[1.5rem] bg-card border border-border/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl -mt-8 -mr-8" />
            <div className="h-3 w-16 bg-muted-foreground/30 rounded mb-4" />
            <div className="h-7 w-32 bg-foreground/80 rounded mb-2" />
            <div className="h-3 w-20 bg-red-500/50 rounded" />
          </div>
          <div className="hidden lg:block p-5 rounded-[1.5rem] bg-card border border-border/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-3/10 rounded-full blur-2xl -mt-8 -mr-8" />
            <div className="h-3 w-16 bg-muted-foreground/30 rounded mb-4" />
            <div className="h-7 w-32 bg-foreground/80 rounded mb-2" />
            <div className="h-3 w-20 bg-primary/50 rounded" />
          </div>
        </div>

        {/* Chart Mock */}
        <div className="p-6 rounded-[1.5rem] bg-card border border-border/20 shadow-sm flex-1 min-h-[200px] flex items-end justify-between gap-1.5 md:gap-3">
          {[40, 60, 30, 80, 50, 90, 70, 45, 65, 85, 55, 75].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-primary/30 relative group transition-all duration-300 hover:bg-primary/60"
              style={{ height: `${h}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Idr {h}k
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Lock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MobileMockup = () => (
  <div className="relative w-[280px] h-[580px] rounded-[3rem] border-[6px] border-foreground/5 dark:border-border/30 bg-background shadow-[0_30px_100px_rgba(44,47,48,0.15)] dark:shadow-[0_30px_100px_rgba(209,252,0,0.05)] overflow-hidden shrink-0 mx-auto">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/5 dark:bg-border/30 rounded-b-2xl" />
    <div className="p-5 pt-10 flex flex-col h-full gap-5">
      <div className="flex items-center justify-between">
         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
           <Zap className="w-4 h-4 text-primary" />
         </div>
         <div className="flex gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
           <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
           <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
         </div>
      </div>
      <div>
         <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Aset</div>
         <div className="text-3xl font-extrabold text-foreground">Rp 12.5M</div>
      </div>

      <div className="flex gap-2">
         <div className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-center text-xs font-bold shadow-sm">
            <ArrowRight className="w-3 h-3 inline mr-1 -rotate-45" /> Kirim
         </div>
         <div className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-center text-xs font-bold shadow-sm">
            <ArrowRight className="w-3 h-3 inline rotate-45" /> Terima
         </div>
      </div>

      <div className="flex-1 bg-muted/30 rounded-2xl p-4 border border-border/30 flex flex-col gap-4 overflow-hidden relative">
         <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
         <div className="text-xs font-bold text-foreground">Transaksi Terakhir</div>
         {[1, 2, 3, 4].map((i) => (
           <div key={i} className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex flex-shrink-0 items-center justify-center">
               <span className="text-[10px]">🍔</span>
             </div>
             <div className="flex-1">
               <div className="h-2 w-16 bg-foreground/70 rounded mb-1" />
               <div className="h-1.5 w-10 bg-muted-foreground/30 rounded" />
             </div>
             <div className="h-2 w-12 bg-red-400/50 rounded" />
           </div>
         ))}
      </div>
      
      {/* Bottom Nav Mock */}
      <div className="flex justify-around items-center pt-2 border-t border-border/30">
        <div className="w-5 h-5 rounded bg-primary" />
        <div className="w-5 h-5 rounded bg-foreground/20" />
        <div className="w-5 h-5 rounded bg-foreground/20" />
        <div className="w-5 h-5 rounded bg-foreground/20" />
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background font-sans">
      {/* ── Floating Navbar ────────────────────────────────────────────── */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
        <nav className="w-full max-w-4xl border border-border/40 bg-background/80 dark:bg-background/60 backdrop-blur-3xl shadow-2xl shadow-black/5 dark:shadow-primary/5 rounded-full pointer-events-auto">
          <div className="flex justify-between items-center px-4 md:px-6 h-14 md:h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Ngaturin Logo"
                width={28}
                height={28}
                className="rounded-lg object-contain drop-shadow transition-transform group-hover:scale-105"
              />
              <span className="font-extrabold text-lg tracking-tight text-foreground hidden sm:block">
                Ngaturin
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#fitur" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Fitur</Link>
              <Link href="#komparasi" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Bagaimana Ini Bekerja</Link>
              <Link href="/blog" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(209,252,0,0.8)]" /> 
                Blog
              </Link>
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

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-32">
        {/* Background blobs for ethereal neon look */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] md:w-[1000px] md:h-[600px] bg-primary/20 dark:bg-primary/15 rounded-[100%] blur-[80px] md:blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-background border border-border/40 text-foreground text-sm font-bold shadow-sm mb-8">
            <Zap className="w-4 h-4 text-primary fill-primary" />
            Sistem Produktivitas & Keuangan Terpadu.
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Kelola Hidup & Uang
            <br />
            <span className="text-secondary dark:text-primary">Dalam Satu Tampilan.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Lebih dari sekadar memantau saldo. Lacak kebiasaan, rapikan hidup dengan metode PARA, dan kendalikan total aset Anda melalui satu <i>platform</i> cerdas nan gratis.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 rounded-2xl px-12 text-lg font-extrabold shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/30"
            >
              <Link href="/auth/sign-up">
                Mulai Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <div className="text-sm text-muted-foreground font-semibold flex items-center gap-2 mt-4 sm:mt-0 sm:ml-4">
               <CheckCircle2 className="w-4 h-4 text-green-500" />
               Tanpa Kartu Kredit
            </div>
          </div>
        </div>

        {/* Big Dashboard Mockup Container */}
        <div className="px-6 mt-16 md:mt-24">
          <DashboardMockup />
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-border/10 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
             <h3 className="text-2xl font-bold text-foreground">Statistik Pengguna Ngaturin: Membangun Kebiasaan Positif.</h3>
             <p className="text-muted-foreground mt-2 font-medium">Lacak kebiasaan holistik, raih target hidup, dan nikmati manajemen otomatis.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-8 rounded-[2rem] bg-background border border-border/30 shadow-sm glass">
              <div className="text-5xl font-extrabold text-foreground mb-2">100%</div>
              <p className="text-sm font-semibold text-muted-foreground">Biaya Langganan Rp 0,-</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-background border border-border/30 shadow-sm glass">
              <div className="text-5xl font-extrabold text-foreground mb-2">7+</div>
              <p className="text-sm font-semibold text-muted-foreground">Alat Utilitas Terpadu</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-background border border-border/30 shadow-sm glass">
              <div className="text-5xl font-extrabold text-foreground mb-2">24/7</div>
              <p className="text-sm font-semibold text-muted-foreground">Akses Aset Real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Alternating Features ────────────────────────────────────────── */}
      <section id="komparasi" className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-32">
          
          {/* Feature 1: PARA Method & Habit Tracker */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <p className="text-secondary font-bold tracking-widest uppercase text-sm mb-4">Produktivitas Holistik</p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                Tata Ulang Hidup dengan Metode PARA & Habit Tracker.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-medium">
                Kendalikan arus keuangan sekaligus informasi Anda menggunakan kerangka <strong>PARA (Projects, Areas, Resources, Archives)</strong>. Padukan pengorganisasian rapi ini dengan <strong>Habit Tracker</strong> bawaan untuk melacak kebiasaan harian (seperti mencatat transaksi atau menabung) dan ciptakan kualitas hidup yang terus membaik setiap hari.
              </p>
              <Button asChild variant="outline" className="rounded-2xl h-14 px-8 font-bold border-border/40 hover:bg-muted/50">
                <Link href="/auth/sign-up">Pelajari Lebih Lanjut <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="flex-1 relative w-full flex justify-center lg:justify-end">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] -z-10" />
              <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-2xl glass w-full max-w-md relative">
                 <div className="text-sm font-bold text-muted-foreground mb-4">Metode Pengelompokan (PARA)</div>
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-4 bg-background border border-border/30 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">P</div>
                          <div>
                             <div className="font-bold text-sm">Projects</div>
                             <div className="text-xs text-muted-foreground">Aktif</div>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background border border-border/30 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">A</div>
                          <div>
                             <div className="font-bold text-sm">Areas</div>
                             <div className="text-xs text-muted-foreground">Tanggung Jawab</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Habit Tracker Mockup Extension */}
                 <div className="mt-6 pt-6 border-t border-border/30">
                    <div className="text-sm font-bold text-muted-foreground mb-4">Habit Tracker Hari Ini</div>
                    <div className="flex flex-col gap-3">
                       <div className="bg-background border border-border/30 px-4 py-3 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-primary" />
                             <span className="text-sm font-bold opacity-90">Catat Pengeluaran Harian</span>
                          </div>
                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-md font-bold">🔥 5 Hari</span>
                       </div>
                       <div className="bg-background border border-border/30 px-4 py-3 rounded-2xl flex items-center gap-3 opacity-60">
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40" />
                          <span className="text-sm font-bold">Sisihkan Uang Investasi</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Total Aset */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <p className="text-secondary font-bold tracking-widest uppercase text-sm mb-4">Pemantauan Ringkas</p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                Sederhanakan Tampilan Aset untuk Keputusan Cepat.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-medium">
                Tingkatkan rutinitas harian dengan pemantauan ringkas atas seluruh dana Anda. Dari Kas, Piutang, hingga Investasi, semua terlihat jelas untuk optimasi yang efektif.
              </p>
              <Button asChild className="bg-primary text-primary-foreground rounded-2xl h-14 px-8 font-bold hover:brightness-110">
                <Link href="/auth/sign-up">Mulai Sekarang <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="flex-1 relative w-full flex justify-center lg:justify-start">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] -z-10" />
              <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-2xl glass w-full max-w-md">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <div className="text-sm font-bold text-muted-foreground mb-1">Total Aset Anda</div>
                       <div className="text-3xl font-extrabold text-foreground">Rp 45.200.000</div>
                    </div>
                    <div className="px-3 py-1 bg-primary/20 text-primary rounded-xl text-xs font-bold flex items-center gap-1">
                       <TrendingUp className="w-3 h-3" /> +12%
                    </div>
                 </div>
                 
                 <div className="h-4 w-full bg-muted rounded-full flex overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '60%' }} />
                    <div className="h-full bg-secondary" style={{ width: '25%' }} />
                    <div className="h-full bg-chart-1" style={{ width: '15%' }} />
                 </div>
                 <div className="flex justify-between mt-3 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"/> Kas</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-secondary"/> Piutang</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-chart-1"/> Investasi</span>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Center Mobile Feature Layout ──────────────────────────────────── */}
      <section id="fitur" className="py-24 bg-muted/5 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative">
           
           <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8">
              {/* Left Column Text Cards */}
              <div className="flex-1 flex flex-col gap-8 w-full order-2 lg:order-1 lg:items-end text-center lg:text-right">
                 <div className="flex flex-col lg:items-end gap-3 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto lg:mx-0">
                       <PieChart className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-extrabold text-foreground">Analisis Bisnis & Tren</h4>
                    <p className="text-muted-foreground text-sm font-medium">Buka berbagai potensi dan temukan peluang pertumbuhan dengan wawasan mendalam atas arus kas Anda.</p>
                 </div>
                 <div className="flex flex-col lg:items-end gap-3 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto lg:mx-0">
                       <Target className="w-6 h-6 text-secondary" />
                    </div>
                    <h4 className="text-xl font-extrabold text-foreground">Anggaran Otomatis</h4>
                    <p className="text-muted-foreground text-sm font-medium">Batasi pengeluaran berlebih dan capai kepastian finansial, mengatur dana menjadi sangat presisi dan memuaskan.</p>
                 </div>
              </div>

              {/* Center Mockup */}
              <div className="order-1 lg:order-2 z-10 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-background border border-border/50 rounded-[3.5rem] mix-blend-overlay blur-md" />
                 <MobileMockup />
              </div>

              {/* Right Column Text Cards */}
              <div className="flex-1 flex flex-col gap-8 w-full order-3 text-center lg:text-left">
                 <div className="flex flex-col lg:items-start gap-3 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-chart-2/20 flex items-center justify-center mx-auto lg:mx-0">
                       <HandCoins className="w-6 h-6 text-chart-2" />
                    </div>
                    <h4 className="text-xl font-extrabold text-foreground">Utang & Piutang</h4>
                    <p className="text-muted-foreground text-sm font-medium">Berikan ruang untuk memastikan siapa yang berutang, memudahkan monitor pelunasan pada satu tampilan rapi.</p>
                 </div>
                 <div className="flex flex-col lg:items-start gap-3 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-chart-3/20 flex items-center justify-center mx-auto lg:mx-0">
                       <Wallet className="w-6 h-6 text-chart-3" />
                    </div>
                    <h4 className="text-xl font-extrabold text-foreground">Manajemen Saldo Multi-Dompet</h4>
                    <p className="text-muted-foreground text-sm font-medium">Pisahkan uang makan, tabungan pribadi, hingga dana darurat ke masing-masing kantong (dompet) yang berbeda.</p>
                 </div>
              </div>
           </div>

        </div>
      </section>

      {/* ── Feature Grid ────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
              Jelajahi Fitur Teratas Ngaturin.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg font-medium">
              Eksplorasi panel pintar kami untuk pencatatan lebih cepat dan transaksi tanpa repot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuresData.map((f, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-[2rem] bg-card border border-border/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <f.icon className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-extrabold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed relative z-10">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="pb-24 pt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[3rem] bg-primary p-12 md:p-20 shadow-[0_40px_100px_rgba(209,252,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Visual background decorations inside the banner */}
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/2 w-80 h-80 rounded-full bg-secondary/30 blur-3xl mix-blend-multiply" />
            
            <div className="relative z-10 flex-1 max-w-lg text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-6 leading-[1.1]">
                Dapatkan Ngaturin. Tata Ulang Hidup Anda Sekarang.
              </h2>
              <p className="text-primary-foreground/80 md:text-lg mb-10 font-medium">
                Sederhanakan rutinitas harian dan raih kebebasan waktu serta finansial bersama Ngaturin. Manfaatkan sistem yang memberdayakan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                 <Button
                   asChild
                   size="lg"
                   variant="secondary"
                   className="h-16 px-10 text-lg font-extrabold rounded-2xl shadow-xl transition-all hover:-translate-y-1"
                 >
                   <Link href="/auth/sign-up">
                     Daftar Sekarang
                   </Link>
                 </Button>
                 <Button
                   asChild
                   size="lg"
                   variant="outline"
                   className="h-16 px-10 text-lg font-extrabold rounded-2xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent transition-all hover:-translate-y-1"
                 >
                   <Link href="/auth/login">
                     Masuk
                   </Link>
                 </Button>
              </div>
            </div>

            {/* Incomplete Banner Mockup (decorative) */}
            <div className="hidden lg:block relative z-10 w-[350px] shrink-0">
               <div className="w-full h-[400px] mb-[-120px] bg-background rounded-[2.5rem] border-[6px] border-white/20 shadow-2xl overflow-hidden p-6 rotate-2 transform-gpu">
                  <div className="flex justify-between items-center mb-6">
                     <div className="w-10 h-10 bg-muted rounded-full" />
                     <div className="h-4 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="h-8 w-3/4 bg-foreground/10 rounded-lg mb-2" />
                  <div className="h-12 w-1/2 bg-foreground/90 rounded-xl mb-8" />
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="h-16 bg-primary/20 rounded-2xl" />
                     <div className="h-16 bg-secondary/20 rounded-2xl" />
                  </div>
                  <div className="space-y-3">
                     <div className="h-12 bg-muted/50 rounded-xl" />
                     <div className="h-12 bg-muted/50 rounded-xl" />
                  </div>
               </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/20 py-12 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
             <div className="max-w-xs">
                <Link href="/" className="flex items-center gap-2.5 mb-6 group">
                  <Image
                    src="/logo.png"
                    alt="Ngaturin Logo"
                    width={28}
                    height={28}
                    className="rounded-lg object-contain drop-shadow transition-transform group-hover:scale-105"
                  />
                  <span className="font-extrabold text-xl tracking-tight text-foreground">
                    Ngaturin
                  </span>
                </Link>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  Ngaturin memberikan dimensi baru pada kelola kehidupan Anda. Paduan utuh sistem produktivitas dan finansial terstruktur agar target Anda tak lagi sekadar angan.
                </p>
             </div>
             
             <div className="flex gap-16 md:gap-24">
                <div className="flex flex-col gap-4">
                   <h5 className="font-extrabold text-foreground mb-2">Platform</h5>
                   <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Masuk</Link>
                   <Link href="/auth/sign-up" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Daftar</Link>
                   <Link href="#fitur" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Fitur</Link>
                </div>
                <div className="flex flex-col gap-4">
                   <h5 className="font-extrabold text-foreground mb-2">Legal</h5>
                   <Link href="/privacy-policy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privasi</Link>
                   <Link href="/terms-of-service" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Ketentuan Layanan</Link>
                </div>
             </div>
          </div>
          
          <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-muted-foreground">© 2026 Ngaturin. Hak Cipta Dilindungi.</span>
            <div className="flex items-center gap-4">
               <span className="text-sm font-semibold text-muted-foreground mr-2">Tampilan:</span>
               <ThemeSwitcher />
            </div>
          </div>
        </div>
        
        {/* Large Faded Text at Bottom like Neopay reference */}
        <div className="w-full overflow-hidden flex justify-center mt-10 opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none">
           <h1 className="text-[150px] sm:text-[250px] md:text-[300px] font-black tracking-tighter leading-none m-0">NGATURIN</h1>
        </div>
      </footer>
    </main>
  );
}
