import { PricingClientView } from "./pricing-client-view";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

export const metadata = {
  title: "Pilih Paket | Ngaturin",
  description: "Investasi kecil untuk dampak finansial besar selamanya.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
        <nav className="w-full max-w-4xl border border-border/40 bg-background/80 dark:bg-background/60 backdrop-blur-3xl shadow-2xl shadow-black/5 dark:shadow-primary/5 rounded-full pointer-events-auto">
          <div className="flex justify-between items-center px-4 md:px-6 h-14 md:h-16">
            <Link href="/pricing" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Ngaturin Logo"
                width={30}
                height={30}
                className="object-contain"
              />
              <span className="font-extrabold text-lg tracking-tight text-foreground hidden sm:block">
                Ngaturin.
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#harga"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Harga
              </Link>
              <Link
                href="#komparasi"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="#faq"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeSwitcher />
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-[9999px] font-bold px-4 hover:bg-muted/50 transition-colors"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ke Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-32 pb-24 relative">
        {/* Background blobs for ethereal neon look */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] md:w-[1000px] md:h-[600px] bg-primary/20 dark:bg-primary/15 rounded-[100%] blur-[80px] md:blur-[120px]" />
        </div>
        
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="wise-display-hero mb-6">
            Investasi kecil.
            <br />
            <span className="text-primary">Dampak besar.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground">
            Pilih paket yang sesuai dengan kebutuhanmu. Lebih murah dari segelas
            kopi, untuk keuangan yang lebih rapi selamanya.
          </p>
        </div>

        <PricingClientView />

        {/* CTA Card for Help */}
        <div className="mt-32 max-w-3xl mx-auto">
          <div className="p-8 md:p-12 rounded-[40px] bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="flex-1 text-center md:text-left">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto md:mx-0 mb-6">
                <Headset className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-3">
                Butuh bantuan memilih?
              </h2>
              <p className="text-muted-foreground font-medium text-lg">
                Tim kami siap membantu kamu menemukan paket yang paling pas
                untuk kondisi finansialmu.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full md:w-auto h-14 px-8 text-lg font-extrabold wise-button-pill shadow-xl shadow-primary/20 hover:brightness-110"
              >
                <a href="mailto:ngaturinhidup@gmail.com">Tanya Sekarang</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            Punya pertanyaan sebelum berlangganan? <Link href="/contact" className="text-primary hover:underline font-bold">Hubungi Kami</Link>
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            Transaksi aman dan terenkripsi. Baca <Link href="/refund-policy" className="hover:underline">Kebijakan Pengembalian</Link> kami.
          </p>
        </div>
      </main>

      <footer className="border-t border-border/20 py-12 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex md:flex-row justify-center text-center items-center gap-12 mb-12">
            <div className="max-w-3xl">
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2.5 mb-6 group"
              >
                <Image
                  src="/logo.png"
                  alt="Ngaturin Logo"
                  width={40}
                  height={40}
                  className=" object-contain"
                />
                <span className="font-extrabold text-2xl tracking-tight text-foreground">
                  Ngaturin
                </span>
              </Link>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-8">
                Ngaturin memberikan dimensi baru pada kelola kehidupan Anda.
                Paduan utuh sistem produktivitas dan finansial terstruktur agar
                target Anda tak lagi sekadar angan.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-muted-foreground">
              © 2026 Ngaturin. Hak Cipta Dilindungi.
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-muted-foreground mr-2">
                Tampilan:
              </span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* Large Faded Text at Bottom */}
        <div className="w-full overflow-hidden flex justify-center mt-10 opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none">
          <h1 className="text-[150px] sm:text-[250px] md:text-[300px] font-black tracking-tighter leading-none m-0">
            NGATURIN.
          </h1>
        </div>
      </footer>
    </div>
  );
}
