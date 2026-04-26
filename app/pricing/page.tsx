"use client";

import { useState, useEffect } from "react";
import { PricingToggle } from "@/components/pricing/pricing-toggle";
import { PricingCard, PricingTier } from "@/components/pricing/pricing-card";
import { PricingLifetimeCard } from "@/components/pricing/pricing-lifetime-card";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Minus,
  ChevronDown,
  Headset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Skeleton } from "@/components/ui/skeleton";

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Untuk kamu yang baru mulai mencatat.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    buttonText: "Mulai Gratis",
    buttonHref: "/dashboard",
    features: [
      { text: "Maksimal 2 Dompet (Wallet)" },
      { text: "Maksimal 1 Target Keuangan" },
      { text: "Pencatatan Transaksi Dasar" },
      { text: "Riwayat Transaksi 3 Bulan" },
      { text: "Laporan Ringkasan Bulanan" },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    description: "Kebebasan tanpa batas untuk keuanganmu.",
    monthlyPrice: 15000,
    yearlyPrice: 144000,
    buttonText: "Upgrade ke Plus",
    buttonHref: "/dashboard/billing",
    features: [
      { text: "Semua fitur di paket Free" },
      { text: "Unlimited Dompet & Goals" },
      { text: "Bebas Custom Kategori & Ikon" },
      { text: "Export Data ke PDF & Excel" },
      { text: "Riwayat Transaksi Selamanya" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Asisten cerdas untuk keuangan yang optimal.",
    monthlyPrice: 29000,
    yearlyPrice: 278400,
    buttonText: "Dapatkan Akses Pro",
    buttonHref: "/dashboard/billing",
    isPopular: true,
    features: [
      { text: "Semua fitur di paket Plus" },
      { text: "Financial Health Score (0-100)", isAi: true },
      { text: "AI Financial Advisor", isAi: true },
      { text: "AI Receipt Scanner (OCR)", isAi: true },
      { text: "AI Report Analyzer", isAi: true },
      { text: "50 AI Credits setiap bulan" },
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "Investasi sekali, nikmati selamanya.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    buttonText: "Join Waitlist",
    buttonHref: "#",
    isComingSoon: true,
    features: [
      { text: "Bayar sekali di awal" },
      { text: "Akses selamanya ke semua fitur Pro" },
      { text: "Fitur eksklusif masa depan" },
      { text: "Early adopter badge" },
      { text: "Priority support" },
    ],
  },
];

const comparisonFeatures = [
  {
    name: "Maksimal Dompet (Wallet)",
    free: "2 Dompet",
    plus: "Unlimited",
    pro: "Unlimited",
  },
  {
    name: "Target Keuangan (Goals)",
    free: "1 Target",
    plus: "Unlimited",
    pro: "Unlimited",
  },
  {
    name: "Riwayat Transaksi",
    free: "3 Bulan",
    plus: "Selamanya",
    pro: "Selamanya",
  },
  { name: "Custom Kategori & Ikon", free: false, plus: true, pro: true },
  { name: "Export Data (PDF/Excel)", free: false, plus: true, pro: true },
  { name: "Financial Health Score", free: false, plus: false, pro: true },
  { name: "AI Financial Advisor", free: false, plus: false, pro: true },
  { name: "AI Receipt Scanner", free: false, plus: false, pro: true },
  {
    name: "Prioritas Bantuan (Support)",
    free: false,
    plus: "Standar",
    pro: "Prioritas Tinggi",
  },
];

const pricingFaqs = [
  {
    question: "Apakah saya bisa upgrade atau downgrade paket kapan saja?",
    answer:
      "Tentu. Kamu bisa mengubah paket berlanggananmu kapan pun melalui menu penagihan di dashboard. Perubahan harga akan dihitung secara prorata.",
  },
  {
    question: "Apakah ada biaya tersembunyi?",
    answer:
      "Sama sekali tidak. Harga yang kamu lihat adalah harga yang kamu bayar. Tidak ada biaya tambahan untuk penggunaan normal.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami mendukung berbagai metode pembayaran termasuk transfer bank (Virtual Account), e-wallet (GoPay, OVO, Dana), dan kartu kredit.",
  },
  {
    question: "Apa itu AI Report Analyzer pada paket Pro?",
    answer:
      "AI Report Analyzer adalah fitur cerdas yang menganalisis pola pengeluaranmu dan memberikan rekomendasi otomatis tentang cara menghemat uang dan mencapai tujuan finansialmu lebih cepat.",
  },
];

const PricingFAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="mt-32 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
          Semua Yang Perlu Anda Ketahui Tentang Produk.
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {pricingFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`p-6 rounded-[1.5rem] bg-card border transition-all duration-300 ${isOpen ? "border-primary/50 shadow-ring" : "border-border/20 shadow-sm hover:border-primary/30"}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between gap-4 text-left focus:outline-none"
              >
                <span className="text-lg font-extrabold text-foreground">
                  {faq.question}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 bg-primary text-primary-foreground" : "text-primary"}`}
                >
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading agar seragam dengan halaman dashboard lainnya
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const mainTiers = pricingTiers.filter((tier) => tier.id !== "lifetime");
  const lifetimeTier = pricingTiers.find((tier) => tier.id === "lifetime");

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
        <nav className="w-full max-w-4xl border border-border/40 bg-background/80 dark:bg-background/60 backdrop-blur-3xl shadow-2xl shadow-black/5 dark:shadow-primary/5 rounded-full pointer-events-auto">
          <div className="flex justify-between items-center px-4 md:px-6 h-14 md:h-16">
            <Link href="/pricing" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Ngaturin Logo"
                width={30}
                height={30}
                className="object-contain"
              />
              <span className="font-extrabold text-lg tracking-tight text-foreground hidden sm:block">
                Ngaturin.
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#harga"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Harga
              </Link>
              <Link
                href="#komparasi"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="#faq"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeSwitcher />
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-[9999px] font-bold px-4 hover:bg-muted/50 transition-colors"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ke Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {loading ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-32 pb-24 relative">
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] md:w-[1000px] md:h-[600px] bg-primary/20 dark:bg-primary/15 rounded-[100%] blur-[80px] md:blur-[120px]" />
          </div>
          
          {/* Header Skeleton */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-4 flex flex-col items-center">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-16 w-1/2 rounded-2xl" />
            <Skeleton className="h-6 w-2/3 mt-6" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          {/* Toggle Skeleton */}
          <div className="flex justify-center mb-12">
             <Skeleton className="h-14 w-72 rounded-full" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[550px] w-full rounded-[40px]" />
            ))}
          </div>

          {/* Lifetime Skeleton */}
          <Skeleton className="h-[120px] w-full rounded-[40px] mt-8 mb-16" />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-32 pb-24 relative">
          {/* Background blobs for ethereal neon look */}
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] md:w-[1000px] md:h-[600px] bg-primary/20 dark:bg-primary/15 rounded-[100%] blur-[80px] md:blur-[120px]" />
          </div>
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">

          <h1 className="wise-display-hero mb-6">
            Investasi kecil.
            <br />
            <span className="text-primary">Dampak besar.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground">
            Pilih paket yang sesuai dengan kebutuhanmu. Lebih murah dari segelas
            kopi, untuk keuangan yang lebih rapi selamanya.
          </p>
        </div>

        {/* Toggle */}
        <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {mainTiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} isYearly={isYearly} />
          ))}
        </div>

        {/* Lifetime Horizontal Card */}
        {lifetimeTier && <PricingLifetimeCard tier={lifetimeTier} />}

        {/* Comparison Table */}
        <div id="komparasi" className="mt-32 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
              Bandingkan Paket.
            </h2>
            <p className="text-muted-foreground text-lg font-medium">
              Lihat lebih detail apa saja yang kamu dapatkan di setiap paket.
            </p>
          </div>

          {/* Mobile scroll indicator */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-4 text-xs font-bold text-muted-foreground animate-pulse">
            Geser ke samping untuk melihat detail
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="overflow-x-auto rounded-[20px] md:rounded-[40px] border border-black/12 bg-card shadow-[0_0_0_1px_rgba(14,15,12,0.12)] p-1 md:p-2">
            <table className="w-full text-left border-collapse min-w-[500px] md:min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 md:p-6 text-sm md:text-base text-muted-foreground font-bold border-b border-border/10 w-[40%] md:w-1/3 sticky left-0 bg-card z-10 shadow-[1px_0_0_0_rgba(14,15,12,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                    Fitur Utama
                  </th>
                  <th className="p-4 md:p-6 text-sm md:text-base font-extrabold text-foreground border-b border-border/10 text-center w-[20%]">
                    Free
                  </th>
                  <th className="p-4 md:p-6 text-sm md:text-base font-extrabold text-primary border-b border-border/10 text-center w-[20%]">
                    Plus
                  </th>
                  <th className="p-4 md:p-6 text-sm md:text-base font-extrabold text-foreground border-b border-border/10 text-center w-[20%]">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className="hover:bg-muted/5 transition-colors"
                  >
                    <td className="p-4 md:p-5 text-xs md:text-base border-b border-border/5 font-semibold text-foreground sticky left-0 bg-card z-10 shadow-[1px_0_0_0_rgba(14,15,12,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                      {feature.name}
                    </td>
                    <td className="p-4 md:p-5 text-xs md:text-base border-b border-border/5 text-center">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium text-muted-foreground">
                          {feature.free}
                        </span>
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-xs md:text-base border-b border-border/5 text-center">
                      {typeof feature.plus === "boolean" ? (
                        feature.plus ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="font-bold text-primary/80">
                          {feature.plus}
                        </span>
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-xs md:text-base border-b border-border/5 text-center">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="font-bold text-foreground">
                          {feature.pro}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <PricingFAQSection />

        {/* CTA Card for Help */}
        <div className="mt-32 max-w-3xl mx-auto">
          <div className="p-8 md:p-12 rounded-[40px] bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="flex-1 text-center md:text-left">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto md:mx-0 mb-6">
                <Headset className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-3">
                Butuh bantuan memilih?
              </h2>
              <p className="text-muted-foreground font-medium text-lg">
                Tim kami siap membantu kamu menemukan paket yang paling pas
                untuk kondisi finansialmu.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full md:w-auto h-14 px-8 text-lg font-extrabold wise-button-pill shadow-xl shadow-primary/20 hover:brightness-110"
              >
                <a href="mailto:ngaturinhidup@gmail.com">Tanya Sekarang</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    )}
      

      <footer className="border-t border-border/20 py-12 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex md:flex-row justify-center text-center items-center gap-12 mb-12">
            <div className="max-w-3xl">
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2.5 mb-6 group"
              >
                <Image
                  src="/logo.png"
                  alt="Ngaturin Logo"
                  width={40}
                  height={40}
                  className=" object-contain"
                />
                <span className="font-extrabold text-2xl tracking-tight text-foreground">
                  Ngaturin
                </span>
              </Link>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-8">
                Ngaturin memberikan dimensi baru pada kelola kehidupan Anda.
                Paduan utuh sistem produktivitas dan finansial terstruktur agar
                target Anda tak lagi sekadar angan.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-muted-foreground">
              © 2026 Ngaturin. Hak Cipta Dilindungi.
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-muted-foreground mr-2">
                Tampilan:
              </span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* Large Faded Text at Bottom */}
        <div className="w-full overflow-hidden flex justify-center mt-10 opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none">
          <h1 className="text-[150px] sm:text-[250px] md:text-[300px] font-black tracking-tighter leading-none m-0">
            NGATURIN.
          </h1>
        </div>
      </footer>
    </div>
  );
}
