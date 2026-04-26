"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      
      // First try to get the existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsSessionValid(true);
      } else {
        // If no immediate session, wait a bit for Supabase client to parse the URL hash
        // The URL from email looks like /auth/update-password#access_token=...&refresh_token=...
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (session) {
              setIsSessionValid(true);
            }
          }
        );

        // Set a timeout to show error if session isn't established after a few seconds
        const timeout = setTimeout(() => {
          if (isSessionValid === null) {
             setIsSessionValid(false);
          }
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

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
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
      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm text-center py-6">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Password Berhasil Diubah!
          </CardTitle>
          <CardDescription className="text-base">
            Akun Anda kini sudah aman
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Password Anda berhasil diperbarui. Silakan gunakan password baru pada sesi masuk berikutnya.
          </p>
          <Button asChild className="w-full gradient-primary text-white font-medium hover:opacity-90 h-11">
            <Link href="/dashboard">Lanjut ke Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isSessionValid === false) {
    return (
      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm text-center py-6">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
            Tautan Tidak Valid
          </CardTitle>
          <CardDescription className="text-base text-red-500">
            Sesi otentikasi tidak ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tautan reset password ini mungkin sudah kedaluwarsa atau tidak valid. Silakan lakukan permintaan reset password kembali.
          </p>
          <Button asChild className="w-full h-11" variant="outline">
            <Link href="/auth/forgot-password">Coba Mintal Ulang Tautan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Buat Password Baru</CardTitle>
          <CardDescription>
            Silakan ketikkan password baru Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Ulangi Password Baru</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="Ketik ulang password baru"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-11 gradient-primary text-white font-medium hover:opacity-90 transition-opacity" disabled={isLoading || isSessionValid === null}>
                {isLoading || isSessionValid === null ? (
                  <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                {isSessionValid === null ? "Memeriksa Sesi..." : isLoading ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
