"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function ConfirmEmailContent() {
  useEffect(() => {
    // Update the timestamp to enforce the monthly limit (relevant for email updates)
    fetch("/api/user/profile/update-email-timestamp", { method: "POST" })
      .catch(err => console.error("Failed to update email timestamp:", err));
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Email Aktif
        </h2>
        <p className="text-muted-foreground font-medium text-sm px-4">
          Akun Anda telah berhasil terverifikasi.
        </p>
      </div>

      <div className="bg-muted/30 p-6 rounded-[30px] border border-border/40 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed text-center">
          Sekarang Anda bisa menikmati akses penuh ke seluruh fitur Ngaturin. Selamat datang kembali di perjalanan finansial Anda!
        </p>
      </div>

      <div className="pt-2">
        <Button 
          asChild
          className="w-full h-14 wise-button-pill text-lg shadow-xl shadow-primary/20 hover:brightness-110 font-extrabold"
        >
          <Link href="/dashboard">
            Masuk ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
