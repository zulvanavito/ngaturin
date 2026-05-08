"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MailCheck, RotateCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/auth/confirm-email`,
      },
    });

    setIsResending(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Email konfirmasi telah dikirim ulang!" });
      setCountdown(60); // Tunggu 60 detik sebelum bisa kirim lagi
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <MailCheck className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Cek Email Anda
        </h2>
        <p className="text-muted-foreground font-medium text-sm px-4">
          Kami telah mengirimkan tautan konfirmasi ke {email ? <span className="text-foreground font-bold">{email}</span> : "alamat email Anda"}.
        </p>
      </div>

      <div className="bg-muted/30 p-6 rounded-[30px] border border-border/40 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed text-center">
          Silakan periksa kotak masuk (atau folder spam) dan klik tautan tersebut untuk mengaktifkan akun Ngaturin Anda.
        </p>
        
        {message && (
          <div className={cn(
            "p-4 rounded-2xl text-sm font-bold flex items-center gap-2 border",
            message.type === "success" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : null}
            {message.text}
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full font-bold text-sm border-2 border-border/40 hover:bg-muted/30 transition-all"
            onClick={handleResendEmail}
            disabled={isResending || countdown > 0 || !email}
          >
            {isResending ? (
              <RotateCw className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {countdown > 0 
              ? `Kirim ulang tersedia dalam ${countdown}s` 
              : "Belum menerima email? Kirim ulang"}
          </Button>
          {!email && (
            <p className="text-[10px] text-center mt-2 text-destructive font-bold">
              Email tidak ditemukan. Silakan mendaftar kembali.
            </p>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-sm font-extrabold text-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
        >
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
}
