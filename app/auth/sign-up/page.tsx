import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthSlideshow } from "@/components/auth/auth-slideshow";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full bg-background selection:bg-primary selection:text-primary-foreground">
      
      {/* Left Panel: Illustration (Full Height) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 dark:bg-[#0e0f0c] p-12 flex-col items-center justify-between relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full flex justify-start z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-extrabold text-[#163300] text-xl">
              N
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Ngaturin.
            </span>
          </Link>
        </div>

        <AuthSlideshow />

        <div className="w-full flex justify-center z-10">
          <p className="text-sm text-white/40 font-semibold">© 2026 Ngaturin. Hak Cipta Dilindungi.</p>
        </div>
      </div>

      {/* Right Panel: Form (Full Height) */}
      <div className="w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-background relative">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-all hover:-translate-x-1 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <SignUpForm />
      </div>
    </div>
  );
}
