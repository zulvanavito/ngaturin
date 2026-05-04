"use client";

import { useState, useCallback } from "react";
import Script from "next/script";
import { BillingDetails, type Subscription } from "./billing-details";
import { useToast } from "@/lib/toast-context";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snap: any;
  }
}

export function BillingClientWrapper({ 
  initialSubscription,
  clientKey
}: { 
  initialSubscription: Subscription | null,
  clientKey: string
}) {
  const [subscription] = useState(initialSubscription);
  const [loading, setLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleUpgrade = useCallback(async (planId: string, interval: string) => {
    if (!snapReady) {
      showToast("error", "Sistem pembayaran sedang dimuat, coba lagi dalam beberapa detik.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval }),
      });

      const data = await response.json();

      if (data.error) {
        showToast("error", data.error);
        setLoading(false);
        return;
      }

      // Hide loading right before opening Snap popup
      setLoading(false);

      window.snap.pay(data.token, {
        onSuccess: () => {
          showToast("success", "Pembayaran berhasil! 🎉");
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
  }, [snapReady, showToast, router]);

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
          ? "https://app.midtrans.com/snap/snap.js" 
          : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={clientKey}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Snap.js loaded successfully");
          setSnapReady(true);
        }}
        onError={() => {
          console.error("Failed to load Snap.js");
          showToast("error", "Gagal memuat sistem pembayaran.");
        }}
      />
      <BillingDetails 
        currentSubscription={subscription} 
        onUpgrade={handleUpgrade}
      />
      {loading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="wise-card p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-bold">Menyiapkan pembayaran...</p>
          </div>
        </div>
      )}
    </>
  );
}
