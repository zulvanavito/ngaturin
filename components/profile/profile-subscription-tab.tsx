"use client";

import { useState, useCallback } from "react";
import Script from "next/script";
import { useToast } from "@/lib/toast-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  CheckCircle2,
  ArrowRight,
  Zap,
  Sparkles,
  Clock,
  Check,
  Minus,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

declare global {
  interface Window {
    snap: any;
  }
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  amount: number;
  interval: string;
  current_period_end: string | null;
  midtrans_order_id: string;
  payment_type: string | null;
}

const plans = [
  {
    id: "plus",
    name: "Plus",
    icon: Zap,
    monthlyPrice: 15000,
    yearlyPrice: 144000,
    tagline: "Pencatatan tanpa batas untuk kontrol maksimal.",
    features: [
      "Unlimited Dompet & Goals",
      "Custom Kategori & Ikon",
      "Export Data ke PDF & Excel",
      "Riwayat Transaksi Selamanya",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    monthlyPrice: 29000,
    yearlyPrice: 278400,
    tagline: "Asisten AI cerdas untuk masa depan finansialmu.",
    highlight: true,
    features: [
      "Semua fitur di paket Plus",
      "Financial Health Score (0-100)",
      "AI Financial Advisor",
      "AI Receipt Scanner (OCR)",
      "AI Report Analyzer",
      "50 AI Credits / bulan",
    ],
  },
];

export function ProfileSubscriptionTab({
  currentSubscription,
  clientKey,
}: {
  currentSubscription: Subscription | null;
  clientKey: string;
}) {
  const [loading, setLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const router = useRouter();
  const { showToast } = useToast();

  const isPremium =
    currentSubscription?.status === "settlement" &&
    currentSubscription.current_period_end &&
    new Date(currentSubscription.current_period_end) > new Date();

  const activePlan = isPremium ? currentSubscription?.plan_id : "free";

  const handleUpgrade = useCallback(
    async (planId: string) => {
      if (!snapReady) {
        showToast("error", "Sistem pembayaran sedang dimuat, coba lagi.");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, interval: billingInterval }),
        });

        const data = await response.json();

        if (data.error) {
          showToast("error", data.error);
          setLoading(false);
          return;
        }

        setLoading(false);

        window.snap.pay(data.token, {
          onSuccess: () => {
            showToast("success", "Pembayaran berhasil!");
            router.refresh();
          },
          onPending: () => {
            showToast("info", "Menunggu pembayaran...");
            router.refresh();
          },
          onError: () => {
            showToast("error", "Pembayaran gagal.");
          },
          onClose: () => {
            showToast("info", "Popup pembayaran ditutup.");
          },
        });
      } catch (error) {
        console.error("Upgrade error:", error);
        showToast("error", "Terjadi kesalahan sistem.");
        setLoading(false);
      }
    },
    [snapReady, billingInterval, showToast, router]
  );

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={clientKey}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
        onError={() => showToast("error", "Gagal memuat sistem pembayaran.")}
      />

      <div className="space-y-8">
        {/* Current Status Banner */}
        <div className="relative overflow-hidden rounded-[2rem] border border-border/40 dark:border-primary/10 bg-white dark:bg-[#0e0f0c] p-8 md:p-10 shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-[0.06] dark:opacity-[0.1] pointer-events-none text-primary">
            <Crown className="w-40 h-40 rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Badge
                className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  isPremium
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {isPremium ? `Paket ${activePlan === "pro" ? "Pro" : "Plus"}` : "Paket Free"}
              </Badge>
              {isPremium && (
                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Aktif
                </span>
              )}
            </div>

            <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3">
              {isPremium ? "Nikmati Akses Penuh." : "Tingkatkan Pengalamanmu."}
            </h3>

            <p className="text-muted-foreground font-medium text-base md:text-lg max-w-xl mb-2">
              {isPremium ? (
                <>
                  Terima kasih telah berlangganan. Akses Anda berlaku hingga{" "}
                  <strong>
                    {format(
                      new Date(currentSubscription!.current_period_end!),
                      "d MMMM yyyy",
                      { locale: id }
                    )}
                  </strong>
                  .
                </>
              ) : (
                "Anda menggunakan paket Free. Upgrade untuk membuka fitur premium tanpa batas."
              )}
            </p>

            {isPremium && currentSubscription?.payment_type && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                <Clock className="w-4 h-4" />
                <span>
                  Dibayar via <strong className="capitalize">{currentSubscription.payment_type}</strong>
                  {" · "}
                  {currentSubscription.interval === "yearly" ? "Tahunan" : "Bulanan"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Billing Interval Toggle */}
        {!isPremium && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/30">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  billingInterval === "monthly"
                    ? "bg-white dark:bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  billingInterval === "yearly"
                    ? "bg-white dark:bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tahunan
                <span className="text-xs bg-primary/20 dark:bg-primary/30 text-primary px-2 py-0.5 rounded-full font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isActive = activePlan === plan.id && isPremium;
            const price =
              billingInterval === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;
            const PlanIcon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`relative rounded-[2rem] border p-8 flex flex-col transition-all duration-300 bg-white dark:bg-card ${
                  plan.highlight
                    ? "border-primary/50 dark:border-primary/30 shadow-[0_0_40px_-10px_rgba(159,232,112,0.1)] dark:shadow-[0_0_50px_-15px_rgba(159,232,112,0.15)]"
                    : "border-border/40 dark:border-border/10"
                } ${isActive ? "ring-2 ring-primary" : ""}`}
              >
                {plan.highlight && !isActive && (
                  <div className="absolute -top-3 left-8">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      Paling Populer
                    </Badge>
                  </div>
                )}

                {isActive && (
                  <div className="absolute -top-3 left-8">
                    <Badge className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Paket Aktif
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.highlight
                        ? "bg-primary/20 dark:bg-primary/20"
                        : "bg-muted/50 dark:bg-muted/10"
                    }`}
                  >
                    <PlanIcon
                      className={`w-5 h-5 ${
                        plan.highlight ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <h4 className="text-xl font-black">Paket {plan.name}</h4>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-black">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-muted-foreground font-bold ml-1">
                    / {billingInterval === "monthly" ? "bulan" : "tahun"}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm font-medium mb-6">
                  {plan.tagline}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isActive || loading}
                  className={`wise-button-pill w-full font-bold h-12 text-base ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-foreground text-background"
                  }`}
                >
                  {isActive ? (
                    "Paket Aktif Anda"
                  ) : (
                    <>
                      Pilih {plan.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <section className="mt-16">
          <h4 className="text-2xl font-black mb-6">Bandingkan Fitur.</h4>
          <div className="overflow-x-auto rounded-[2rem] border border-border/40 dark:border-border/10 bg-white dark:bg-card">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-muted/30 dark:bg-muted/10">
                   <th className="p-5 text-sm font-black text-muted-foreground">Fitur</th>
                   <th className="p-5 text-sm font-black text-center">Free</th>
                   <th className="p-5 text-sm font-black text-center text-primary">Plus</th>
                   <th className="p-5 text-sm font-black text-center">Pro</th>
                 </tr>
               </thead>
               <tbody className="text-sm font-bold">
                 {[
                   { name: "Dompet (Wallet)", free: "2", plus: "Unlimited", pro: "Unlimited" },
                   { name: "Target (Goals)", free: "1", plus: "Unlimited", pro: "Unlimited" },
                   { name: "Custom Kategori", free: false, plus: true, pro: true },
                   { name: "Export (PDF/Excel)", free: false, plus: true, pro: true },
                   { name: "Financial Health Score", free: false, plus: false, pro: "AI" },
                   { name: "AI Advisor", free: false, plus: false, pro: true },
                 ].map((row, idx) => (
                   <tr key={idx} className="border-t border-border/20 dark:border-border/10">
                     <td className="p-5">{row.name}</td>
                     <td className="p-5 text-center text-muted-foreground">{typeof row.free === "boolean" ? (row.free ? <Check className="w-4 h-4 mx-auto text-primary" /> : <Minus className="w-4 h-4 mx-auto opacity-20" />) : row.free}</td>
                     <td className="p-5 text-center text-primary">{typeof row.plus === "boolean" ? (row.plus ? <Check className="w-4 h-4 mx-auto text-primary" /> : <Minus className="w-4 h-4 mx-auto opacity-20" />) : row.plus}</td>
                     <td className="p-5 text-center">{typeof row.pro === "boolean" ? (row.pro ? <Check className="w-4 h-4 mx-auto text-primary" /> : <Minus className="w-4 h-4 mx-auto opacity-20" />) : row.pro}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h4 className="text-2xl font-black mb-6">Pertanyaan Populer.</h4>
          <div className="grid gap-4">
            {[
              { q: "Apakah saya bisa ganti paket?", a: "Tentu. Kamu bisa ganti dari Plus ke Pro kapan saja. Sisa hari akan dikreditkan secara otomatis." },
              { q: "Bagaimana cara berhenti langganan?", a: "Langganan kami bersifat pra-bayar. Jika masa aktif habis dan kamu tidak membayar lagi, paket akan otomatis kembali ke Free." }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-[1.5rem] bg-muted/20 border border-border/20">
                <h5 className="font-black mb-2">{faq.q}</h5>
                <p className="text-sm text-muted-foreground font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="rounded-[2rem] border border-border/40 bg-white dark:bg-card p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-lg">Menyiapkan pembayaran...</p>
          </div>
        </div>
      )}
    </>
  );
}
