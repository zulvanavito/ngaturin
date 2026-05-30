import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Hubungi Kami — Ngaturin",
  description:
    "Hubungi tim dukungan Ngaturin untuk pertanyaan, bantuan teknis, atau kerjasama bisnis.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <LandingNavbar />

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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Hubungi <span className="text-primary">Kami.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl">
            Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda mengelola hidup lebih baik.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="p-6 rounded-[2rem] border border-border/40 bg-white dark:bg-card shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email Dukungan</h3>
                <p className="text-muted-foreground text-sm mb-3">Respon dalam 24 jam kerja.</p>
                <a href="mailto:ngaturinhidup@gmail.com" className="text-primary font-bold hover:underline">
                  ngaturinhidup@gmail.com
                </a>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] border border-border/40 bg-white dark:bg-card shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">WhatsApp / Telepon</h3>
                <p className="text-muted-foreground text-sm mb-3">Tersedia Senin-Jumat, 09:00 - 17:00 WITA.</p>
                <a href="https://wa.me/628972310506" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-500 font-bold hover:underline">
                  +62 897-2310-506
                </a>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] border border-border/40 bg-white dark:bg-card shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-500 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Lokasi Bisnis</h3>
                <p className="text-muted-foreground text-sm mb-1">Singaraja, Bali,</p>
                <p className="text-muted-foreground text-sm">Indonesia</p>
              </div>
            </div>
          </div>

          {/* Simple Info Box */}
          <div className="bg-[#0e0f0c] text-white rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                <MessageSquare className="w-32 h-32" />
             </div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 text-[#9fe870]">Butuh Bantuan Cepat?</h3>
                <p className="text-white/70 font-medium leading-relaxed mb-8">
                  Kami selalu mendengarkan masukan dari pengguna untuk mengembangkan Ngaturin menjadi lebih baik. Jangan ragu untuk mengirimkan saran fitur atau melaporkan bug.
                </p>
             </div>
             <div className="relative z-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9fe870] mb-2">Jam Operasional</p>
                <p className="text-sm font-bold">Senin - Jumat: 09:00 - 17:00 WITA</p>
                <p className="text-sm text-white/50">Sabtu - Minggu: Libur</p>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LandingFooter />
    </main>
  );
}
