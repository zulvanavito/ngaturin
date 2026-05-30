import type { Metadata } from "next";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian & Pembatalan — Ngaturin",
  description:
    "Kebijakan pengembalian dana dan pembatalan layanan Ngaturin.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <LandingNavbar />

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="mb-16">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-[#9fe870] flex items-center justify-center text-[#163300] mb-8 shadow-sm">
            <RefreshCcw className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h1 className="text-5xl md:text-[80px] font-black tracking-tighter leading-[0.85] mb-6">
            Kebijakan Pengembalian
          </h1>
          <div className="inline-flex items-center rounded-full bg-muted/50 px-4 py-1.5 text-sm font-bold text-muted-foreground">
            Terakhir diperbarui: 1 Mei 2026
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 md:p-14 border border-border/20 shadow-sm relative overflow-hidden">
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-lg prose-p:font-medium prose-p:leading-[1.6] prose-p:text-muted-foreground prose-li:text-lg prose-li:font-medium prose-li:text-muted-foreground prose-a:text-[#9fe870] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
            <section>
              <h2>1. Produk Digital</h2>
              <p>
                Ngaturin menyediakan layanan berbasis langganan perangkat lunak (SaaS). Mengingat sifat produk digital yang dapat langsung diakses setelah aktivasi, kami secara umum <strong>tidak memberikan pengembalian dana (refund)</strong> untuk pembayaran yang telah berhasil dilakukan.
              </p>
            </section>

            <section>
              <h2>2. Uji Coba & Paket Gratis</h2>
              <p>
                Kami menyediakan paket &quot;Free&quot; yang memungkinkan pengguna untuk mencoba fitur-fitur dasar kami sebelum memutuskan untuk beralih ke paket berbayar (Plus atau Pro). Kami sangat menyarankan pengguna untuk menggunakan paket Free terlebih dahulu untuk memastikan layanan kami sesuai dengan kebutuhan Anda.
              </p>
            </section>

            <section>
              <h2>3. Pembatalan Langganan</h2>
              <p>
                Anda dapat membatalkan langganan Anda kapan saja melalui halaman Profil di dalam aplikasi. Setelah pembatalan:
              </p>
              <ul>
                <li>Akses fitur premium Anda akan tetap aktif hingga akhir periode penagihan yang sedang berjalan.</li>
                <li>Tidak akan ada tagihan otomatis untuk periode berikutnya.</li>
                <li>Kami tidak memberikan pengembalian dana prorata untuk sisa waktu dalam periode penagihan yang sudah dibayar.</li>
              </ul>
            </section>

            <section>
              <h2>4. Pengecualian Khusus</h2>
              <p>
                Pengembalian dana hanya dapat dipertimbangkan dalam situasi luar biasa berikut:
              </p>
              <ul>
                <li>Terjadi kesalahan teknis ganda (double payment) pada sistem pembayaran kami.</li>
                <li>Layanan tidak dapat diakses secara total selama lebih dari 7 hari berturut-turut karena kesalahan pada infrastruktur kami.</li>
              </ul>
            </section>

            <section>
              <h2>5. Hubungi Kami</h2>
              <p>
                Jika Anda mengalami masalah pembayaran atau merasa memenuhi kriteria pengecualian di atas, silakan hubungi tim dukungan kami di <a href="mailto:ngaturinhidup@gmail.com">ngaturinhidup@gmail.com</a> dengan menyertakan bukti pembayaran dan detail akun Anda.
              </p>
            </section>
          </article>
        </div>
      </div>

      {/* Footer */}
      <LandingFooter />
    </main>
  );
}
