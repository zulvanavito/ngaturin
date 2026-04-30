import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pembayaran Tertunda — Ngaturin",
  description: "Pembayaran Anda belum selesai. Anda dapat mencobanya kembali kapan saja.",
};

export default function PaymentUnfinishPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-[2rem] bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Belum <span className="text-yellow-600 dark:text-yellow-500">Selesai.</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
          Sepertinya Anda menghentikan proses pembayaran atau pembayaran masih menunggu penyelesaian dari pihak bank.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full h-14 rounded-full text-lg font-black gap-2 shadow-lg bg-[#0e0f0c] text-white hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Link href="/dashboard/profile?tab=subscription">
              <RefreshCw className="w-5 h-5 mr-2" /> Coba Bayar Lagi
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="w-full h-14 rounded-full text-lg font-bold hover:bg-muted/50 transition-all">
            <Link href="/">
              <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
            </Link>
          </Button>
        </div>

        <p className="mt-12 text-xs text-muted-foreground font-medium">
          Jika Anda sudah merasa membayar namun status belum berubah, silakan <Link href="/contact" className="text-primary hover:underline">hubungi tim kami</Link>
        </p>
      </div>
    </main>
  );
}
