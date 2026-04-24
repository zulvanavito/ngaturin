"use client";

import { useState } from "react";
import { PricingToggle } from "@/components/pricing-toggle";
import { PricingCard, PricingTier } from "@/components/pricing-card";
import { PricingLifetimeCard } from "@/components/pricing-lifetime-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      { text: "Laporan Ringkasan Bulanan" }
    ]
  },
  {
    id: "plus",
    name: "Plus",
    description: "Kebebasan tanpa batas untuk keuanganmu.",
    monthlyPrice: 15000,
    yearlyPrice: 144000, // Rp 12.000 / mo
    buttonText: "Upgrade ke Plus",
    buttonHref: "/dashboard/billing",
    features: [
      { text: "Semua fitur di paket Free" },
      { text: "Unlimited Dompet & Goals" },
      { text: "Bebas Custom Kategori & Ikon" },
      { text: "Export Data ke PDF & Excel" },
      { text: "Riwayat Transaksi Selamanya" }
    ]
  },
  {
    id: "pro",
    name: "Pro",
    description: "Asisten cerdas untuk keuangan yang optimal.",
    monthlyPrice: 29000,
    yearlyPrice: 278400, // Rp 23.200 / mo
    buttonText: "Dapatkan Akses Pro",
    buttonHref: "/dashboard/billing",
    isPopular: true,
    features: [
      { text: "Semua fitur di paket Plus" },
      { text: "Financial Health Score (0-100)", isAi: true },
      { text: "AI Financial Advisor", isAi: true },
      { text: "AI Receipt Scanner (OCR)", isAi: true },
      { text: "AI Report Analyzer", isAi: true },
      { text: "50 AI Credits setiap bulan" }
    ]
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
      { text: "Priority support" }
    ]
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  const mainTiers = pricingTiers.filter(tier => tier.id !== "lifetime");
  const lifetimeTier = pricingTiers.find(tier => tier.id === "lifetime");

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground pb-24">
      {/* Navigation */}
      <nav className="p-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tighter">
          Ngaturin.
        </Link>
        <Link href="/dashboard" className="text-sm font-semibold flex items-center gap-2 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="wise-display-hero mb-6">
            Investasi kecil.<br />
            <span className="text-primary">Dampak besar.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground">
            Pilih paket yang sesuai dengan kebutuhanmu. Lebih murah dari segelas kopi, untuk keuangan yang lebih rapi selamanya.
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
        {lifetimeTier && (
           <PricingLifetimeCard tier={lifetimeTier} />
        )}

        {/* FAQ Teaser or Extra Info */}
        <div className="mt-24 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Butuh bantuan memilih?</h2>
          <p className="text-muted-foreground font-medium mb-8">
            Jika kamu baru mulai mencatat, paket Free sudah lebih dari cukup. Upgrade kapan saja saat kebutuhanmu bertambah.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            Punya pertanyaan? <a href="mailto:support@ngaturin.com" className="text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:text-primary transition-colors">Hubungi kami</a>
          </div>
        </div>
      </main>
    </div>
  );
}
