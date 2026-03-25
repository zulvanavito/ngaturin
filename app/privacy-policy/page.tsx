import type { Metadata } from "next";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Ngaturin",
  description:
    "Kebijakan Privasi Ngaturin. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default function PrivacyPolicyPage() {
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
            Kebijakan Privasi
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
              1. Pendahuluan
            </h2>
            <p className="text-[15px]">
              Selamat datang di <strong>Ngaturin</strong>. Kami menghargai
              privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.
              Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan,
              menggunakan, menyimpan, dan melindungi informasi Anda saat
              menggunakan layanan kami.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              2. Informasi yang Kami Kumpulkan
            </h2>
            <p className="text-[15px] mb-4">
              Kami mengumpulkan informasi berikut saat Anda menggunakan Ngaturin:
            </p>

            <h3 className="text-base font-semibold text-foreground mb-2">
              a. Informasi Akun
            </h3>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px] mb-4">
              <li>Alamat email</li>
              <li>Nama (opsional)</li>
              <li>Kata sandi (disimpan dalam bentuk terenkripsi)</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mb-2">
              b. Data Keuangan
            </h3>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px] mb-4">
              <li>Catatan transaksi (pemasukan dan pengeluaran)</li>
              <li>Nama dan saldo dompet/rekening</li>
              <li>Kategori transaksi</li>
              <li>Anggaran dan target keuangan</li>
              <li>Data utang dan piutang</li>
              <li>Data portofolio investasi</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mb-2">
              c. Data Teknis
            </h3>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>Alamat IP</li>
              <li>Jenis browser dan perangkat</li>
              <li>Data analitik penggunaan (melalui Vercel Speed Insights)</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              3. Penggunaan Informasi
            </h2>
            <p className="text-[15px] mb-3">
              Kami menggunakan informasi Anda untuk:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>Menyediakan dan memelihara layanan Ngaturin</li>
              <li>Mengautentikasi identitas Anda dan mengamankan akun</li>
              <li>Menampilkan data keuangan pribadi Anda di dashboard</li>
              <li>Mengirimkan pengingat tagihan berulang</li>
              <li>Meningkatkan dan mengoptimasi performa layanan</li>
              <li>Mengirimkan pemberitahuan terkait layanan jika diperlukan</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              4. Penyimpanan dan Keamanan Data
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                Data Anda disimpan di server yang aman menggunakan{" "}
                <strong>Supabase</strong> dengan enkripsi saat transit (TLS) dan
                saat diam (at rest).
              </li>
              <li>
                Kata sandi dienkripsi menggunakan algoritma hashing yang aman
                dan tidak pernah disimpan dalam bentuk teks biasa.
              </li>
              <li>
                Kami menerapkan kontrol akses ketat sehingga hanya Anda yang
                dapat mengakses data keuangan Anda.
              </li>
              <li>
                Kami secara berkala meninjau praktik keamanan kami untuk
                memastikan perlindungan yang optimal.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              5. Berbagi Data dengan Pihak Ketiga
            </h2>
            <p className="text-[15px] mb-3">
              Kami <strong>tidak menjual</strong> data pribadi Anda. Kami hanya
              berbagi data dengan pihak ketiga dalam situasi berikut:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                <strong>Penyedia layanan infrastruktur:</strong> Supabase
                (database dan autentikasi), Vercel (hosting dan analitik).
              </li>
              <li>
                <strong>Kewajiban hukum:</strong> Jika diwajibkan oleh hukum,
                peraturan, atau proses hukum yang berlaku.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              6. Hak-Hak Anda
            </h2>
            <p className="text-[15px] mb-3">Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-[15px]">
              <li>
                <strong>Mengakses</strong> data pribadi yang kami simpan tentang
                Anda.
              </li>
              <li>
                <strong>Memperbarui</strong> informasi akun dan data keuangan
                Anda kapan saja.
              </li>
              <li>
                <strong>Menghapus</strong> akun Anda beserta seluruh data yang
                terkait.
              </li>
              <li>
                <strong>Mengekspor</strong> data keuangan Anda dalam format CSV,
                Excel, atau PDF.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              7. Cookie dan Teknologi Pelacakan
            </h2>
            <p className="text-[15px]">
              Ngaturin menggunakan cookie yang diperlukan untuk otentikasi dan
              sesi pengguna. Kami juga menggunakan{" "}
              <strong>Vercel Speed Insights</strong> untuk mengumpulkan data
              analitik anonim guna meningkatkan performa layanan. Kami tidak
              menggunakan cookie pelacakan pihak ketiga untuk tujuan periklanan.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              8. Perubahan Kebijakan
            </h2>
            <p className="text-[15px]">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
              Perubahan signifikan akan diberitahukan melalui email atau
              pemberitahuan di dalam aplikasi. Penggunaan berkelanjutan setelah
              perubahan berarti Anda menerima kebijakan yang diperbarui.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">
              9. Kontak
            </h2>
            <p className="text-[15px]">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini,
              silakan hubungi kami melalui email di{" "}
              <a
                href="mailto:shawnanggara@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                shawnanggara@gmail.com
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
              className="hover:text-foreground transition-colors font-medium text-foreground"
            >
              Kebijakan Privasi
            </Link>
            <span className="text-border">·</span>
            <Link
              href="/terms-of-service"
              className="hover:text-foreground transition-colors"
            >
              Ketentuan Layanan
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
