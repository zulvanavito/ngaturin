"use client";

import { LoadingState } from "@/components/layout/loading-state";
import { usePathname } from "next/navigation";

export default function DashboardLoading() {
  const pathname = usePathname();

  const getLoadingMessage = () => {
    if (pathname.includes("/profile")) return "Menyiapkan pengaturan profil...";
    if (pathname.includes("/wallets")) return "Membuka daftar dompet...";
    if (pathname.includes("/transactions")) return "Memuat riwayat transaksi...";
    if (pathname.includes("/budgets")) return "Menganalisis anggaran...";
    if (pathname.includes("/bills")) return "Mengecek jadwal tagihan...";
    if (pathname.includes("/debts")) return "Memuat catatan utang...";
    if (pathname.includes("/goals")) return "Meninjau target keuangan...";
    if (pathname.includes("/investments")) return "Memantau portofolio investasi...";
    if (pathname.includes("/insights")) return "Menyusun analisis cerdas...";
    if (pathname.includes("/rewards")) return "Memuat daftar pencapaian...";
    
    return "Mempersiapkan dashboard...";
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full h-[60vh] rounded-3xl mt-4">
      <LoadingState message={getLoadingMessage()} />
    </div>
  );
}
