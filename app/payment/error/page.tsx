import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pembayaran Gagal — Ngaturin",
  description: "Terjadi kesalahan saat memproses pembayaran Anda. Silakan hubungi dukungan jika masalah berlanjut.",
};

export default function PaymentErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500">
            <XCircle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Waduh, <span className="text-red-600 dark:text-red-500">Gagal.</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
          Terjadi kesalahan saat memproses pembayaran Anda. Jangan khawatir, saldo Anda tidak akan terpotong jika transaksi gagal.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full h-14 rounded-full text-lg font-black gap-2 shadow-lg bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Link href="/contact">
              <Mail className="w-5 h-5 mr-2" /> Hubungi Dukungan
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="w-full h-14 rounded-full text-lg font-bold hover:bg-muted/50 transition-all">
            <Link href="/dashboard/profile?tab=subscription">
              <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Langganan
            </Link>
          </Button>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-muted/10 border border-border/20">
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Tips: Pastikan limit kartu Anda mencukupi atau coba gunakan metode pembayaran lain seperti QRIS untuk proses yang lebih stabil.
          </p>
        </div>
      </div>
    </main>
  );
}
