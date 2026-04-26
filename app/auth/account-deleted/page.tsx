import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSlideshow } from "@/components/auth/auth-slideshow";

export default function AccountDeletedPage() {
  return (
    <div className="flex min-h-svh w-full bg-background selection:bg-primary selection:text-primary-foreground">
      
      {/* Left Panel: Illustration (Full Height) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 dark:bg-[#0e0f0c] p-12 flex-col items-center justify-between relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full flex justify-start z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Ngaturin Logo"
              width={35}
              height={35}
              className="object-contain drop-shadow transition-transform group-hover:scale-105"
            />
            <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">
              Ngaturin.
            </span>
          </Link>
        </div>

        <AuthSlideshow />

        <div className="w-full flex justify-center z-10">
          <p className="text-sm text-white/40 font-semibold">
            © 2026 Ngaturin. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      {/* Right Panel: Content (Full Height) */}
      <div className="w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-background relative">
        <div className="flex flex-col items-center text-center space-y-8 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Akun Berhasil Dihapus
            </h1>
            <p className="text-muted-foreground font-medium text-lg px-4 leading-relaxed">
              Sayang sekali Anda harus pergi. Seluruh data dan informasi akun Anda telah dihapus secara permanen dari sistem kami.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full pt-4">
            <Button asChild className="w-full h-14 rounded-full font-extrabold text-lg gradient-primary text-white shadow-xl shadow-primary/20 hover:brightness-110">
              <Link href="/">
                Kembali ke Beranda
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <div className="text-sm font-semibold text-muted-foreground">
              Ingin kembali bergabung?{" "}
              <Link href="/auth/sign-up" className="text-foreground font-extrabold hover:text-primary transition-colors hover:underline underline-offset-4">
                Buat Akun Baru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
