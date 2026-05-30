import type { Metadata } from "next";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Ngaturin",
  description:
    "Kebijakan Privasi Ngaturin. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <LandingNavbar />

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="mb-16">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-[#9fe870] flex items-center justify-center text-[#163300] mb-8 shadow-sm">
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h1 className="text-5xl md:text-[80px] font-black tracking-tighter leading-[0.85] mb-6">
            Kebijakan Privasi
          </h1>
          <div className="inline-flex items-center rounded-full bg-muted/50 px-4 py-1.5 text-sm font-bold text-muted-foreground">
            Terakhir diperbarui: 1 Mei 2026
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 md:p-14 border border-border/20 shadow-sm relative overflow-hidden">
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-lg prose-p:font-medium prose-p:leading-[1.6] prose-p:text-muted-foreground prose-li:text-lg prose-li:font-medium prose-li:text-muted-foreground prose-a:text-[#9fe870] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
            <section>
              <h2>1. Pendahuluan</h2>
              <p>
                Selamat datang di <strong>Ngaturin</strong>. Kami menghargai
                privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.
                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan,
                menggunakan, menyimpan, dan melindungi informasi Anda saat
                menggunakan layanan kami.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2>2. Informasi yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan informasi berikut saat Anda menggunakan Ngaturin:
              </p>

              <h3>a. Informasi Akun</h3>
              <ul>
                <li>Alamat email</li>
                <li>Nama (opsional)</li>
                <li>Kata sandi (disimpan dalam bentuk terenkripsi)</li>
              </ul>

              <h3>b. Data Keuangan</h3>
              <ul>
                <li>Catatan transaksi (pemasukan dan pengeluaran)</li>
                <li>Nama dan saldo dompet/rekening</li>
                <li>Kategori transaksi</li>
                <li>Anggaran dan target keuangan</li>
                <li>Data utang dan piutang</li>
                <li>Data portofolio investasi</li>
              </ul>

              <h3>c. Data Teknis</h3>
              <ul>
                <li>Alamat IP</li>
                <li>Jenis browser dan perangkat</li>
                <li>Data analitik penggunaan (melalui Vercel Speed Insights)</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2>3. Penggunaan Informasi</h2>
              <p>Kami menggunakan informasi Anda untuk:</p>
              <ul>
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
              <h2>4. Penyimpanan dan Keamanan Data</h2>
              <ul>
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
              <h2>5. Berbagi Data dengan Pihak Ketiga</h2>
              <p>
                Kami <strong>tidak menjual</strong> data pribadi Anda. Kami hanya
                berbagi data dengan pihak ketiga dalam situasi berikut:
              </p>
              <ul>
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
              <h2>6. Hak-Hak Anda</h2>
              <p>Anda memiliki hak untuk:</p>
              <ul>
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
              <h2>7. Cookie dan Teknologi Pelacakan</h2>
              <p>
                Ngaturin menggunakan cookie yang diperlukan untuk otentikasi dan
                sesi pengguna. Kami juga menggunakan{" "}
                <strong>Vercel Speed Insights</strong> untuk mengumpulkan data
                analitik anonim guna meningkatkan performa layanan. Kami tidak
                menggunakan cookie pelacakan pihak ketiga untuk tujuan periklanan.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2>8. Perubahan Kebijakan</h2>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
                Perubahan signifikan akan diberitahukan melalui email atau
                pemberitahuan di dalam aplikasi. Penggunaan berkelanjutan setelah
                perubahan berarti Anda menerima kebijakan yang diperbarui.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2>9. Kontak</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini,
                silakan hubungi kami melalui email di{" "}
                <a href="mailto:ngaturinhidup@gmail.com">
                  ngaturinhidup@gmail.com
                </a>
                .
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
