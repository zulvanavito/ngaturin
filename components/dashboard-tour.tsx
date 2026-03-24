"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS } from "react-joyride";
import type { EventData as CallBackProps, Step } from "react-joyride";
import { useTheme } from "next-themes";

const TOUR_STEPS: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Selamat Datang di Ngaturin! 🎉</h3>
        <p className="text-sm">Mari kita mulai tur singkat untuk melihat fitur-fitur utama agar Anda bisa mengatur keuangan dengan lebih mudah.</p>
      </div>
    ),
    placement: "center",
  },
  {
    target: ".tour-balance",
    content: "Di sini Anda bisa melihat total saldo berjalan, serta ringkasan pemasukan dan pengeluaran bulan ini.",
    placement: "bottom",
  },
  {
    target: ".tour-add-tx",
    content: "Klik tombol ini untuk mencatat setiap transaksi baru, baik itu pemasukan, dan pengeluaran.",
    placement: "bottom",
  },
  {
    target: ".tour-tabs",
    content: "Navigasi dengan cepat antara Ringkasan, Analitik lengkap, target Anggaran, dan Riwayat transaksi Anda.",
    placement: "bottom",
  },
  {
    target: ".tour-quick-stats",
    content: "Pantau sekilas jumlah transaksi dan perbandingan masuk/keluar Anda.",
    placement: "top",
  },
  {
    target: ".tour-wallets",
    content: "Kelola berbagai dompet Anda (Tunai, Rekening, E-Money) di menu ini.",
    placement: "bottom",
  },
  {
    target: ".tour-debts",
    content: "Catat dan pantau siapa yang berhutang atau kepada siapa Anda berhutang agar tidak lupa.",
    placement: "bottom",
  }
];

export function DashboardTour() {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Cek apakah user sudah pernah menyelesaikan tour dari database
    const checkTourStatus = async () => {
      try {
        const res = await fetch("/api/user/tour");
        if (res.ok) {
          const data = await res.json();
          if (!data.tour_completed) {
            // Berikan sedikit delay agar semua elemen ter-render sempurna
            setTimeout(() => setRun(true), 1500);
          }
        }
      } catch (err) {
        console.error("Failed to check tour status:", err);
      }
    };
    
    checkTourStatus();
  }, []);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    // Jika user selesai (Finish) atau Skip tour, tandai di database
    if (finishedStatuses.includes(status)) {
      setRun(false);
      try {
        await fetch("/api/user/tour", { method: "POST" });
      } catch (err) {
        console.error("Failed to save tour status:", err);
      }
    }
  };

  const isDark = theme === "dark";

  // Only render on client to avoid SSR hydration mismatch
  if (!mounted) return null;

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: "#6366F1",
        textColor: isDark ? "#f3f4f6" : "#1f2937",
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        arrowColor: isDark ? "#1f2937" : "#ffffff",
        overlayColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.4)",
        zIndex: 10000,
        showProgress: true,
        buttons: ["back", "primary", "skip"],
      }}
      styles={{
        tooltip: {
          borderRadius: "16px",
          padding: "20px",
        },
        buttonPrimary: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: 600,
        },
        buttonBack: {
          marginRight: "8px",
          color: isDark ? "#9ca3af" : "#6b7280",
        },
        buttonSkip: {
          color: isDark ? "#9ca3af" : "#6b7280",
          fontSize: "14px",
        },
      }}
      locale={{
        back: "Kembali",
        close: "Tutup",
        last: "Selesai",
        next: "Lanjut",
        skip: "Lewati Tur",
      }}
    />
  );
}
