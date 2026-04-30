import type { Metadata } from "next";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian & Pembatalan — Ngaturin",
  description:
    "Kebijakan pengembalian dana dan pembatalan layanan Ngaturin.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="w-full border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm leading-none">
                N.
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight">Ngaturin</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="mb-12">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Kebijakan Pengembalian & Pembatalan
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Terakhir diperbarui: 1 Mei 2026
          </p>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-foreground/90 leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Produk Digital</h2>
            <p className="text-[15px]">
              Ngaturin menyediakan layanan berbasis langganan perangkat lunak (SaaS). Mengingat sifat produk digital yang dapat langsung diakses setelah aktivasi, kami secara umum **tidak memberikan pengembalian dana (refund)** untuk pembayaran yang telah berhasil dilakukan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Uji Coba & Paket Gratis</h2>
            <p className="text-[15px]">
              Kami menyediakan paket "Free" yang memungkinkan pengguna untuk mencoba fitur-fitur dasar kami sebelum memutuskan untuk beralih ke paket berbayar (Plus atau Pro). Kami sangat menyarankan pengguna untuk menggunakan paket Free terlebih dahulu untuk memastikan layanan kami sesuai dengan kebutuhan Anda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Pembatalan Langganan</h2>
            <p className="text-[15px]">
              Anda dapat membatalkan langganan Anda kapan saja melalui halaman Profil di dalam aplikasi. Setelah pembatalan:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-[15px]">
              <li>Akses fitur premium Anda akan tetap aktif hingga akhir periode penagihan yang sedang berjalan.</li>
              <li>Tidak akan ada tagihan otomatis untuk periode berikutnya.</li>
              <li>Kami tidak memberikan pengembalian dana prorata untuk sisa waktu dalam periode penagihan yang sudah dibayar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Pengecualian Khusus</h2>
            <p className="text-[15px]">
              Pengembalian dana hanya dapat dipertimbangkan dalam situasi luar biasa berikut:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-[15px]">
              <li>Terjadi kesalahan teknis ganda (double payment) pada sistem pembayaran kami.</li>
              <li>Layanan tidak dapat diakses secara total selama lebih dari 7 hari berturut-turut karena kesalahan pada infrastruktur kami.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Hubungi Kami</h2>
            <p className="text-[15px]">
              Jika Anda mengalami masalah pembayaran atau merasa memenuhi kriteria pengecualian di atas, silakan hubungi tim dukungan kami di <a href="mailto:ngaturinhidup@gmail.com" className="text-primary hover:underline">ngaturinhidup@gmail.com</a> dengan menyertakan bukti pembayaran dan detail akun Anda.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-foreground">Ngaturin</span>
            <span className="text-border">·</span>
            <span>© 2026. Hak Cipta Dilindungi.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
