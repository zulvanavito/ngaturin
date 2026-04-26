"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { KeyRound, Mail, MailCheck, RotateCw } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
          <MailCheck className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Cek Email Anda
          </h2>
          <p className="text-muted-foreground font-medium text-sm px-4">
            Kami telah mengirimkan tautan reset password ke <span className="text-foreground font-bold">{email}</span>.
          </p>
        </div>
        <div className="bg-muted/30 p-6 rounded-[30px] border border-border/40 w-full">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Silakan periksa kotak masuk atau folder spam Anda dan klik tautan tersebut untuk mengatur ulang password Anda.
          </p>
        </div>
        <Button asChild className="w-full h-14 rounded-full font-extrabold text-lg gradient-primary text-white shadow-xl shadow-primary/20 hover:brightness-110">
          <Link href="/auth/login">Kembali ke Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8 w-full max-w-sm mx-auto", className)} {...props}>
      <div className="flex flex-col items-center text-center space-y-3 mb-2">
        <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-2 lg:hidden">
           <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Lupa Password?</h2>
        <p className="text-muted-foreground font-medium text-sm px-4">
          Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password.
        </p>
      </div>

      <form onSubmit={handleForgotPassword}>
        <div className="flex flex-col gap-5">
          <div className="grid gap-2">
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Alamat Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-transparent font-semibold pl-6 pr-12 text-base focus-visible:ring-primary focus-visible:border-primary transition-colors"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 pointer-events-none" />
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-bold p-4 rounded-xl border border-destructive/20 mt-2">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full h-14 mt-4 wise-button-pill text-lg shadow-xl shadow-primary/20 hover:brightness-110 font-extrabold" disabled={isLoading}>
            {isLoading ? (
              <RotateCw className="w-5 h-5 mr-3 animate-spin" />
            ) : null}
            {isLoading ? "Mengirim..." : "Kirim Tautan Reset"}
          </Button>
        </div>
      </form>

      <div className="text-center text-sm font-semibold text-muted-foreground mt-2">
        Sudah ingat password Anda?{" "}
        <Link
          href="/auth/login"
          className="text-foreground font-extrabold hover:text-primary transition-colors hover:underline underline-offset-4"
        >
          Masuk
        </Link>
      </div>
    </div>
  );
}
