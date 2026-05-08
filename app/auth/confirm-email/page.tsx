import { ConfirmEmailContent } from "@/components/auth/confirm-email-content";
import { AuthSlideshow } from "@/components/auth/auth-slideshow";
import Link from "next/link";
import Image from "next/image";

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-svh w-full bg-[#fcfcf9] selection:bg-[#9fe870] selection:text-[#163300]">
      
      {/* Left Panel: Illustration (Full Height) */}
      <div className="hidden lg:flex w-1/2 bg-[#0e0f0c] p-12 flex-col items-center justify-between relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9fe870]/10 rounded-full blur-[120px] pointer-events-none" />

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
        <ConfirmEmailContent />
      </div>
    </div>
  );
}
