import type { Metadata } from "next";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Ketentuan Layanan — Ngaturin",
  description:
    "Ketentuan Layanan Ngaturin. Syarat dan ketentuan penggunaan aplikasi pengelola keuangan pribadi Ngaturin.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="w-full border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm leading-none">
                N.
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight">Ngaturin</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Ketentuan Layanan
          </h1>
          <p className="text-muted-foreground text-sm">
            Terakhir diperbarui: 24 Maret 2026
          </p>
        </div>

        {/* Body */}
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-foreground/90 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              1. Penerimaan Ketentuan
            </h2>
            <p className="text-[15px]">
              Dengan mengakses atau menggunakan <strong>Ngaturin</strong>, Anda
              menyetujui dan terikat oleh Ketentuan Layanan ini. Jika Anda tidak
              menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan
              kami. Kami berhak mengubah ketentuan ini sewaktu-waktu, dan
              perubahan akan berlaku setelah dipublikasikan di halaman ini.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              2. Deskripsi Layanan
            </h2>
            <p className="text-[15px]">
              Ngaturin adalah aplikasi pengelola keuangan pribadi berbasis web
              yang menyediakan fitur-fitur berikut:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px] mt-3">
              <li>Pencatatan transaksi pemasukan dan pengeluaran</li>
              <li>Pengelolaan multi-dompet dan rekening</li>
              <li>Dashboard analitik keuangan</li>
              <li>Pengaturan anggaran per kategori</li>
              <li>Pencatatan utang dan piutang</li>
              <li>Pemantauan portofolio investasi</li>
              <li>Pengingat tagihan berulang</li>
              <li>Ekspor data ke format CSV, Excel, dan PDF</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              3. Pendaftaran Akun
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                Anda harus memberikan informasi yang akurat dan lengkap saat
                membuat akun.
              </li>
              <li>
                Anda bertanggung jawab penuh atas keamanan akun dan kata sandi
                Anda.
              </li>
              <li>
                Anda harus segera memberi tahu kami jika terjadi penggunaan yang
                tidak sah atas akun Anda.
              </li>
              <li>
                Satu orang hanya diperbolehkan memiliki satu akun aktif.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              4. Penggunaan yang Diizinkan
            </h2>
            <p className="text-[15px] mb-3">
              Anda setuju untuk menggunakan Ngaturin hanya untuk tujuan yang sah
              dan sesuai dengan ketentuan ini. Anda{" "}
              <strong>tidak diperbolehkan</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                Menggunakan layanan untuk tujuan ilegal atau yang melanggar
                hukum.
              </li>
              <li>
                Mencoba mengakses, meretas, atau mengganggu sistem, server, atau
                jaringan kami.
              </li>
              <li>
                Mengunggah konten berbahaya, virus, atau kode jahat lainnya.
              </li>
              <li>
                Menggunakan bot, scraper, atau alat otomatis untuk mengakses
                layanan tanpa izin.
              </li>
              <li>
                Menyalin, memodifikasi, atau mendistribusikan konten layanan
                tanpa persetujuan tertulis.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              5. Data Pengguna
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                Anda memiliki hak penuh atas data keuangan yang Anda masukkan ke
                dalam Ngaturin.
              </li>
              <li>
                Anda dapat mengekspor atau menghapus data Anda kapan saja.
              </li>
              <li>
                Kami tidak bertanggung jawab atas keakuratan data yang Anda
                masukkan.
              </li>
              <li>
                Pengumpulan dan penggunaan data diatur oleh{" "}
                <Link
                  href="/privacy-policy"
                  className="text-primary hover:underline font-medium"
                >
                  Kebijakan Privasi
                </Link>{" "}
                kami.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              6. Ketersediaan Layanan
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                Kami berupaya menjaga layanan tetap tersedia 24/7, namun tidak
                menjamin uptime 100%.
              </li>
              <li>
                Layanan dapat mengalami gangguan sementara untuk pemeliharaan,
                pembaruan, atau penyebab di luar kendali kami.
              </li>
              <li>
                Kami berhak memodifikasi, menangguhkan, atau menghentikan layanan
                (atau bagiannya) kapan saja dengan atau tanpa pemberitahuan.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              7. Hak Kekayaan Intelektual
            </h2>
            <p className="text-[15px]">
              Seluruh konten, desain, logo, kode sumber, dan materi lainnya di
              Ngaturin dilindungi oleh hak cipta dan hak kekayaan intelektual
              yang berlaku. Anda tidak diizinkan untuk mereproduksi,
              mendistribusikan, atau membuat karya turunan tanpa persetujuan
              tertulis dari kami.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              8. Batasan Tanggung Jawab
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                Ngaturin disediakan &ldquo;sebagaimana adanya&rdquo; (as is)
                tanpa jaminan apapun, baik tersurat maupun tersirat.
              </li>
              <li>
                Kami <strong>tidak bertanggung jawab</strong> atas kerugian
                finansial yang timbul dari keputusan yang Anda buat berdasarkan
                data atau fitur di Ngaturin.
              </li>
              <li>
                Kami tidak bertanggung jawab atas kehilangan data akibat
                kesalahan pengguna, serangan pihak ketiga, atau force majeure.
              </li>
              <li>
                Ngaturin bukan merupakan penasehat keuangan profesional dan
                tidak boleh dijadikan satu-satunya dasar untuk keputusan
                keuangan.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              9. Penghentian Akun
            </h2>
            <p className="text-[15px]">
              Kami berhak menangguhkan atau menghentikan akun Anda jika:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px] mt-3">
              <li>Anda melanggar Ketentuan Layanan ini.</li>
              <li>Terdeteksi aktivitas mencurigakan atau penyalahgunaan.</li>
              <li>Diperlukan untuk mematuhi kewajiban hukum.</li>
            </ul>
            <p className="text-[15px] mt-3">
              Anda juga dapat menghapus akun Anda kapan saja. Setelah
              penghapusan, data Anda akan dihapus secara permanen dari sistem
              kami.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              10. Hukum yang Berlaku
            </h2>
            <p className="text-[15px]">
              Ketentuan Layanan ini diatur dan ditafsirkan sesuai dengan hukum
              Republik Indonesia. Segala perselisihan yang timbul akan
              diselesaikan melalui musyawarah mufakat, dan jika tidak tercapai,
              akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              11. Kontak
            </h2>
            <p className="text-[15px]">
              Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini,
              silakan hubungi kami melalui email di{" "}
              <a
                href="mailto:support@ngaturin.com"
                className="text-primary hover:underline font-medium"
              >
                support@ngaturin.com
              </a>
              .
            </p>
          </section>
        </article>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs leading-none">
                N.
              </span>
            </div>
            <span className="font-semibold text-foreground">Ngaturin</span>
            <span className="text-border">·</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="hover:text-foreground transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <span className="text-border">·</span>
            <Link
              href="/terms-of-service"
              className="hover:text-foreground transition-colors font-medium text-foreground"
            >
              Ketentuan Layanan
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
