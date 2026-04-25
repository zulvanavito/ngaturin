"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle2, Circle, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password minimal 8 karakter";
    if (!/[A-Z]/.test(pass)) return "Password harus mengandung minimal 1 huruf besar";
    if (!/[a-z]/.test(pass)) return "Password harus mengandung minimal 1 huruf kecil";
    if (!/[0-9]/.test(pass)) return "Password harus mengandung minimal 1 angka";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password harus mengandung minimal 1 karakter spesial";
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError("Password tidak cocok");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/auth/verify-email");
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8 w-full max-w-sm mx-auto", className)} {...props}>
      <div className="flex flex-col items-center text-center space-y-3 mb-2">
        <div className="relative w-12 h-12 mb-2 lg:hidden">
          <Image src="/logo.png" alt="Ngaturin Logo" fill className="object-contain" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Buat Akun Baru</h2>
        <p className="text-muted-foreground font-medium text-sm px-4">
          Daftar gratis untuk mulai mengatur keuanganmu dengan lebih pintar.
        </p>
      </div>

      <form onSubmit={handleSignUp}>
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
            
            {/* Password Complexity Checklist - Only show if password has input */}
            {password.length > 0 && (
              <div className="mt-1 bg-muted/10 p-4 rounded-2xl border border-border/40">
                <ul className="text-xs font-semibold space-y-2">
                  <li className={cn("flex items-center gap-2", password.length >= 8 ? "text-emerald-500" : "text-muted-foreground/60")}>
                    {password.length >= 8 ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    Min. 8 karakter
                  </li>
                  <li className={cn("flex items-center gap-2", /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-emerald-500" : "text-muted-foreground/60")}>
                    {/[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    Kombinasi huruf besar, angka & simbol
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <div className="relative">
              <Input
                id="repeat-password"
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Ulangi Password"
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
          
          <Button type="submit" className="w-full h-14 mt-4 wise-button-pill text-lg shadow-xl shadow-primary/20 hover:brightness-110 font-extrabold" disabled={isLoading}>
            {isLoading ? (
              <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
            {isLoading ? "Memproses..." : "Daftar"}
          </Button>
        </div>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-extrabold tracking-widest">
          <span className="bg-card px-4 text-muted-foreground/60">
            atau
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-14 rounded-full font-bold text-base border-2 border-border/40 hover:bg-muted/30 transition-all hover:scale-105 active:scale-95 bg-card"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
        type="button"
      >
        {isGoogleLoading ? (
          <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Daftar dengan Google
      </Button>

      <div className="text-center text-sm font-semibold text-muted-foreground mt-2">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="text-foreground font-extrabold hover:text-primary transition-colors hover:underline underline-offset-4">
          Sign In
        </Link>
      </div>
    </div>
  );
}
