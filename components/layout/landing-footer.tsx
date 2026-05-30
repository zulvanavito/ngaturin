import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/20 py-12 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <Image
                src="/logo.png"
                alt="Ngaturin Logo"
                width={35}
                height={35}
                className="object-contain "
              />
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                Ngaturin.
              </span>
            </Link>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              Ngaturin memberikan dimensi baru pada kelola kehidupan Anda.
              Paduan utuh sistem produktivitas dan finansial terstruktur agar
              target Anda tak lagi sekadar angan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:flex gap-10 md:gap-24 w-full md:w-auto">
            <div className="flex flex-col gap-4">
              <h5 className="font-extrabold text-foreground mb-2">Platform</h5>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/sign-up"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Daftar
              </Link>
              <Link
                href="/#fitur"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="/#harga"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Harga
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-extrabold text-foreground mb-2">Legal</h5>
              <Link
                href="/privacy-policy"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Privasi
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Ketentuan Layanan
              </Link>
              <Link
                href="/refund-policy"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Kebijakan Pengembalian
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-extrabold text-foreground mb-2">Dukungan</h5>
              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Kontak Kami
              </Link>
              <a
                href="mailto:ngaturinhidup@gmail.com"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Bantuan
              </a>
            </div>
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

      {/* Large Faded Text at Bottom like Neopay reference */}
      <div className="w-full overflow-hidden flex justify-center mt-10 opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none">
        <h1 className="text-[150px] sm:text-[250px] md:text-[300px] font-black tracking-tighter leading-none m-0">
          NGATURIN
        </h1>
      </div>
    </footer>
  );
}
