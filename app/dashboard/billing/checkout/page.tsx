"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { ArrowLeft, CreditCard, Wallet, QrCode } from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "gopay",
    name: "GoPay",
    category: "e-wallet",
    icon: Wallet,
    type: "gopay",
  },
  {
    id: "qris",
    name: "QRIS / Dompet Digital Lain",
    category: "e-wallet",
    icon: QrCode,
    type: "qris",
    description: "OVO, Dana, ShopeePay, LinkAja, dll.",
  },
  {
    id: "bca_va",
    name: "BCA Virtual Account",
    category: "bank_transfer",
    icon: CreditCard,
    type: "bank_transfer",
    bank: "bca",
  },
  {
    id: "mandiri_va",
    name: "Mandiri Virtual Account",
    category: "bank_transfer",
    icon: CreditCard,
    type: "bank_transfer",
    bank: "mandiri",
  },
  {
    id: "bni_va",
    name: "BNI Virtual Account",
    category: "bank_transfer",
    icon: CreditCard,
    type: "bank_transfer",
    bank: "bni",
  },
  {
    id: "bri_va",
    name: "BRI Virtual Account",
    category: "bank_transfer",
    icon: CreditCard,
    type: "bank_transfer",
    bank: "bri",
  },
];

const PRICING = {
  plus: {
    monthly: 15000,
    yearly: 144000,
  },
  pro: {
    monthly: 29000,
    yearly: 278400,
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { formatCurrency } = useFormatCurrency();
  
  const planId = searchParams.get("planId") as "plus" | "pro";
  const interval = searchParams.get("interval") as "monthly" | "yearly";

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!planId || !interval || !PRICING[planId]) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-black mb-4">Paket tidak valid</h2>
        <Button onClick={() => router.back()} className="wise-button-pill">Kembali</Button>
      </div>
    );
  }

  const price = PRICING[planId][interval];

  const handleCheckout = async () => {
    if (!selectedMethod) {
      showToast("error", "Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    const methodConfig = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    if (!methodConfig) return;

    try {
      setLoading(true);
      const response = await fetch("/api/billing/checkout-core", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval,
          payment_type: methodConfig.type,
          bank: methodConfig.bank,
        }),
      });

      const data = await response.json();

      if (data.error) {
        showToast("error", data.error);
        setLoading(false);
        return;
      }

      // Redirect to instruction page
      router.push(`/payment/instruction/${data.orderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("error", "Terjadi kesalahan sistem.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left Col: Payment Methods */}
        <div className="md:col-span-3 space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Pilih Pembayaran.</h1>
            <p className="text-muted-foreground font-medium">Transaksi aman terenkripsi.</p>
          </div>

          <div className="space-y-6">
            {/* E-Wallet Section */}
            <div className="space-y-3">
              <h3 className="font-black text-lg">E-Wallet & QRIS</h3>
              <div className="grid gap-3">
                {PAYMENT_METHODS.filter(m => m.category === "e-wallet").map(method => (
                  <label 
                    key={method.id}
                    className={`relative flex cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      selectedMethod === method.id 
                        ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(159,232,112,1)]" 
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment_method" 
                      className="sr-only" 
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                    />
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-base leading-none mb-1">{method.name}</h4>
                        {method.description && (
                          <p className="text-sm text-muted-foreground font-medium">{method.description}</p>
                        )}
                        {method.id === "gopay" && (
                          <p className="text-xs text-primary font-bold mt-1">Buka Otomatis Aplikasi Gojek (Mobile)</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Virtual Account Section */}
            <div className="space-y-3">
              <h3 className="font-black text-lg">Virtual Account (Verifikasi Otomatis)</h3>
              <div className="grid gap-3">
                {PAYMENT_METHODS.filter(m => m.category === "bank_transfer").map(method => (
                  <label 
                    key={method.id}
                    className={`relative flex cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      selectedMethod === method.id 
                        ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(159,232,112,1)]" 
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment_method" 
                      className="sr-only" 
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                    />
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <method.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-base">{method.name}</h4>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className="md:col-span-2">
          <div className="sticky top-24 rounded-[2rem] border border-border/40 dark:border-border/10 bg-white dark:bg-card p-6 shadow-sm">
            <h3 className="font-black text-xl mb-4">Ringkasan Pesanan</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start pb-4 border-b border-border/30">
                <div>
                  <p className="font-bold">Paket Ngaturin {planId.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground font-medium">Tagihan {interval === 'monthly' ? '1 Bulan' : '1 Tahun'}</p>
                </div>
                <p className="font-black">{formatCurrency(price)}</p>
              </div>
              
              <div className="flex justify-between items-center text-lg">
                <p className="font-bold">Total Pembayaran</p>
                <p className="font-black text-primary">{formatCurrency(price)}</p>
              </div>
            </div>

            <Button 
              onClick={handleCheckout}
              disabled={loading || !selectedMethod}
              className="wise-button-pill w-full h-14 font-black text-lg bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                "Bayar Sekarang"
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground font-medium mt-4">
              Pembayaran 1x, tidak diperpanjang otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
