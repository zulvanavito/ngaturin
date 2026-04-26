"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { KeyRound, CheckCircle2, RotateCw, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsSessionValid(true);
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (session) setIsSessionValid(true);
          }
        );

        const timeout = setTimeout(() => {
          if (isSessionValid === null) setIsSessionValid(false);
        }, 3000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      }
    };

    checkSession();
  }, [isSessionValid]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
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
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Password Berhasil Diubah!
          </h2>
          <p className="text-muted-foreground font-medium text-sm px-4">
            Akun Anda kini sudah aman. Silakan gunakan password baru Anda untuk masuk.
          </p>
        </div>
        <Button asChild className="w-full h-14 rounded-full font-extrabold text-lg gradient-primary text-white shadow-xl shadow-primary/20 hover:brightness-110">
          <Link href="/dashboard">Lanjut ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (isSessionValid === false) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Tautan Tidak Valid
          </h2>
          <p className="text-muted-foreground font-medium text-sm px-4">
            Tautan reset password ini mungkin sudah kedaluwarsa atau tidak valid.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full h-14 rounded-full font-bold text-base border-2 border-border/40 hover:bg-muted/30">
          <Link href="/auth/forgot-password">Minta Tautan Baru</Link>
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
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Password Baru</h2>
        <p className="text-muted-foreground font-medium text-sm px-4">
          Silakan masukkan password baru yang kuat untuk akun Anda.
        </p>
      </div>

      <form onSubmit={handleUpdatePassword}>
        <div className="flex flex-col gap-5">
          <div className="grid gap-2">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password Baru"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-transparent font-semibold pl-6 pr-20 text-base focus-visible:ring-primary focus-visible:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 pointer-events-none" />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="relative">
              <Input
                id="repeat-password"
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Ulangi Password Baru"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-transparent font-semibold pl-6 pr-20 text-base focus-visible:ring-primary focus-visible:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showRepeatPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 pointer-events-none" />
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-bold p-4 rounded-xl border border-destructive/20 mt-2">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full h-14 mt-4 wise-button-pill text-lg shadow-xl shadow-primary/20 hover:brightness-110 font-extrabold" disabled={isLoading || isSessionValid === null}>
            {isLoading || isSessionValid === null ? (
              <RotateCw className="w-5 h-5 mr-3 animate-spin" />
            ) : null}
            {isSessionValid === null ? "Memeriksa Sesi..." : isLoading ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
