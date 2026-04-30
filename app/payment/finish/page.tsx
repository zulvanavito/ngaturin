import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pembayaran Berhasil — Ngaturin",
  description: "Terima kasih atas pembayaran Anda. Akun premium Anda telah diaktifkan.",
};

export default function PaymentFinishPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Pembayaran <span className="text-primary">Berhasil!</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
          Terima kasih! Kami telah menerima pembayaran Anda. Akun Anda sekarang telah ditingkatkan ke paket premium.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full h-14 rounded-full text-lg font-black gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Link href="/dashboard/profile?tab=subscription">
              Cek Status Langganan <ChevronRight className="w-5 h-5" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full h-14 rounded-full text-lg font-bold border-border/40 hover:bg-muted/50 transition-all">
            <Link href="/dashboard">
              <LayoutDashboard className="w-5 h-5 mr-2" /> Ke Dashboard
            </Link>
          </Button>
        </div>

        <p className="mt-12 text-xs text-muted-foreground font-medium">
          Mengalami kendala? <Link href="/contact" className="text-primary hover:underline">Hubungi bantuan</Link>
        </p>
      </div>
    </main>
  );
}
