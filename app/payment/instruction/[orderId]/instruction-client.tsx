"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Copy, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/lib/toast-context";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function InstructionClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);

  const checkStatusManual = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`/api/billing/check-status?orderId=${initialData.midtrans_order_id}`);
      if (!res.ok) throw new Error("Gagal mengambil status dari server");
      const { status } = await res.json();
        
      if (status) {
        if (status === "settlement") {
          showToast("success", "Pembayaran berhasil diterima!");
          router.push("/payment/finish");
        } else if (status === "expire" || status === "cancel" || status === "deny") {
          showToast("error", "Pembayaran kedaluwarsa atau dibatalkan.");
          router.push("/payment/error");
        } else {
          showToast("info", "Pembayaran belum diterima. Silakan cek kembali nanti.");
        }
      }
    } catch {
      showToast("error", "Gagal mengecek status.");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Listen to changes on this specific subscription
    const channel = supabase
      .channel(`subscription_${initialData.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "subscriptions",
          filter: `id=eq.${initialData.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === "settlement" || newStatus === "capture") {
            showToast("success", "Pembayaran berhasil diterima!");
            router.push("/payment/finish");
          } else if (newStatus === "expire" || newStatus === "cancel" || newStatus === "deny") {
            showToast("error", "Pembayaran kedaluwarsa atau dibatalkan.");
            router.push("/payment/error");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialData.id, router, showToast]);

  // Timer countdown
  useEffect(() => {
    // Default Midtrans expiry is usually 24 hours, but we should rely on transaction_time + 24h or expiry_time if present in payment_details.
    // For simplicity, we just set a 24h timer from created_at
    const createdTime = new Date(initialData.created_at).getTime();
    const expiryTime = createdTime + (24 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [initialData.created_at]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Berhasil disalin!");
  };

  const renderPaymentDetails = () => {
    const details = initialData.payment_details;
    if (!details) return <p>Memuat detail pembayaran...</p>;

    // 1. E-Wallet (GoPay/QRIS)
    if (initialData.payment_type === "gopay" || initialData.payment_type === "qris") {
      const actions = details.actions || [];
      const qrAction = actions.find((a: any) => a.name === "generate-qr-code");
      const deeplinkAction = actions.find((a: any) => a.name === "deeplink-redirect");

      return (
        <div className="flex flex-col items-center space-y-6">
          {qrAction && (
            <div className="p-4 bg-white rounded-2xl border border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrAction.url} alt="QR Code Pembayaran" className="w-64 h-64 object-contain" />
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground font-medium max-w-sm">
            Scan QR Code di atas menggunakan aplikasi e-wallet Anda (GoPay, OVO, Dana, dll).
          </p>
          {deeplinkAction && (
            <a 
              href={deeplinkAction.url} 
              className="wise-button-pill w-full max-w-sm bg-primary text-primary-foreground font-bold h-14 flex items-center justify-center mt-4"
            >
              Buka Aplikasi GoPay
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          )}
        </div>
      );
    }

    // 2. Virtual Account (Mandiri has bill_key and biller_code)
    if (details.bill_key && details.biller_code) {
      return (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Company Code</p>
            <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/40 rounded-2xl">
              <span className="font-black text-base sm:text-lg tracking-widest break-all">{details.biller_code}</span>
              <button onClick={() => handleCopy(details.biller_code)} className="text-primary hover:text-primary/80 transition-colors">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Virtual Account Number</p>
            <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/40 rounded-2xl">
              <span className="font-black text-base sm:text-lg tracking-widest break-all">{details.bill_key}</span>
              <button onClick={() => handleCopy(details.bill_key)} className="text-primary hover:text-primary/80 transition-colors">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. Virtual Account (BCA, BNI, BRI)
    if (details.va_numbers && details.va_numbers.length > 0) {
      const va = details.va_numbers[0];
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-medium mb-1">Virtual Account Number</p>
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/40 rounded-2xl">
            <span className="font-black text-base sm:text-lg tracking-widest break-all">{va.va_number}</span>
            <button onClick={() => handleCopy(va.va_number)} className="text-primary hover:text-primary/80 transition-colors">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return <p className="text-muted-foreground">Menunggu detail pembayaran...</p>;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 dark:border-border/10 p-8 shadow-2xl relative overflow-hidden">
          {/* Animated Background Pulse */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-black text-2xl">Selesaikan Pembayaran</h1>
              <div className="flex items-center gap-2 text-warning bg-warning/10 px-3 py-1.5 rounded-full font-bold text-sm">
                <Clock className="w-4 h-4" />
                {timeLeft || "--:--:--"}
              </div>
            </div>

            <div className="mb-8 text-center pb-8 border-b border-border/40">
              <p className="text-muted-foreground font-medium mb-2">Total Tagihan</p>
              <h2 className="text-4xl font-black tracking-tight text-primary">
                Rp {initialData.amount.toLocaleString('id-ID')}
              </h2>
              <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-wider">
                Order ID: {initialData.midtrans_order_id}
              </p>
            </div>

            <div className="mb-8">
              {renderPaymentDetails()}
            </div>

            <div className="bg-muted/20 p-4 rounded-2xl flex items-start gap-3">
              <div className="mt-0.5"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
              <p className="text-sm font-medium text-muted-foreground">
                Halaman ini akan otomatis diperbarui ketika pembayaran Anda berhasil dikonfirmasi. Jangan tutup halaman ini.
              </p>
            </div>

            <div className="mt-6">
              <button 
                onClick={checkStatusManual}
                disabled={isChecking}
                className="w-full py-4 rounded-full border-2 border-border/60 font-bold text-sm text-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
              >
                {isChecking ? "Mengecek..." : "Cek Status Manual"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
