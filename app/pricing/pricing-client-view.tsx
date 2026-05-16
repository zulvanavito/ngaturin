"use client";

import { useState } from "react";
import { PricingToggle } from "@/components/pricing/pricing-toggle";
import { PricingCard, PricingTier } from "@/components/pricing/pricing-card";
import { PricingLifetimeCard } from "@/components/pricing/pricing-lifetime-card";
import { ChevronDown, CheckCircle2, Minus } from "lucide-react";

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

export function PricingClientView() {
  const [isYearly, setIsYearly] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const mainTiers = pricingTiers.filter((tier) => tier.id !== "lifetime");
  const lifetimeTier = pricingTiers.find((tier) => tier.id === "lifetime");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
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
                <tr key={index} className="hover:bg-muted/5 transition-colors">
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
    </>
  );
}
