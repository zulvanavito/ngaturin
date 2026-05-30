import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Ketentuan Layanan — Ngaturin",
  description:
    "Ketentuan Layanan Ngaturin. Syarat dan ketentuan penggunaan aplikasi pengelola keuangan pribadi Ngaturin.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <LandingNavbar />

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="mb-16">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-[#9fe870] flex items-center justify-center text-[#163300] mb-8 shadow-sm">
            <FileText className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h1 className="text-5xl md:text-[80px] font-black tracking-tighter leading-[0.85] mb-6">
            Ketentuan Layanan
          </h1>
          <div className="inline-flex items-center rounded-full bg-muted/50 px-4 py-1.5 text-sm font-bold text-muted-foreground">
            Terakhir diperbarui: 1 Mei 2026
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 md:p-14 border border-border/20 shadow-sm relative overflow-hidden">
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-lg prose-p:font-medium prose-p:leading-[1.6] prose-p:text-muted-foreground prose-li:text-lg prose-li:font-medium prose-li:text-muted-foreground prose-a:text-[#9fe870] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
            <section>
              <h2>1. Penerimaan Ketentuan</h2>
              <p>
                Dengan mengakses atau menggunakan <strong>Ngaturin</strong>, Anda
                menyetujui dan terikat oleh Ketentuan Layanan ini. Jika Anda tidak
                menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan
                kami. Kami berhak mengubah ketentuan ini sewaktu-waktu, dan
                perubahan akan berlaku setelah dipublikasikan di halaman ini.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2>2. Deskripsi Layanan</h2>
              <p>
                Ngaturin adalah aplikasi pengelola keuangan pribadi berbasis web
                yang menyediakan fitur-fitur berikut:
              </p>
              <ul>
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
              <h2>3. Pendaftaran Akun</h2>
              <ul>
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
              <h2>4. Penggunaan yang Diizinkan</h2>
              <p>
                Anda setuju untuk menggunakan Ngaturin hanya untuk tujuan yang sah
                dan sesuai dengan ketentuan ini. Anda{" "}
                <strong>tidak diperbolehkan</strong>:
              </p>
              <ul>
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
              <h2>5. Data Pengguna</h2>
              <ul>
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
                  <Link href="/privacy-policy">
                    Kebijakan Privasi
                  </Link>{" "}
                  kami.
                </li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2>6. Ketersediaan Layanan</h2>
              <ul>
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
              <h2>7. Hak Kekayaan Intelektual</h2>
              <p>
                Seluruh konten, desain, logo, kode sumber, dan materi lainnya di
                Ngaturin dilindungi oleh hak cipta dan hak kekayaan intelektual
                yang berlaku. Anda tidak diizinkan untuk mereproduksi,
                mendistribusikan, atau membuat karya turunan tanpa persetujuan
                tertulis dari kami.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2>8. Batasan Tanggung Jawab</h2>
              <ul>
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
              <h2>9. Penghentian Akun</h2>
              <p>
                Kami berhak menangguhkan atau menghentikan akun Anda jika:
              </p>
              <ul>
                <li>Anda melanggar Ketentuan Layanan ini.</li>
                <li>Terdeteksi aktivitas mencurigakan atau penyalahgunaan.</li>
                <li>Diperlukan untuk mematuhi kewajiban hukum.</li>
              </ul>
              <p>
                Anda juga dapat menghapus akun Anda kapan saja. Setelah
                penghapusan, data Anda akan dihapus secara permanen dari sistem
                kami.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2>10. Hukum yang Berlaku</h2>
              <p>
                Ketentuan Layanan ini diatur dan ditafsirkan sesuai dengan hukum
                Republik Indonesia. Segala perselisihan yang timbul akan
                diselesaikan melalui musyawarah mufakat, dan jika tidak tercapai,
                akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2>11. Kontak</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini,
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
