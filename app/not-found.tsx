"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Decorative Ethereal Elements */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="glass relative z-10 flex w-full max-w-lg flex-col items-center rounded-lg p-12 text-center shadow-ambient">
        {/* Animated Icon/Graphic Container */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm ring-1 ring-primary/30">
          <HelpCircle className="h-12 w-12 text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-25" />
        </div>

        <h1 className="text-display-lg mb-2 text-primary">404</h1>
        <h2 className="text-headline-md mb-4 text-foreground">Halaman Hilang</h2>
        <p className="text-body-md mb-10 text-muted-foreground max-w-[320px]">
          Sepertinya anggaran untuk halaman ini sedang diproses. Silakan kembali ke jalan yang benar.
        </p>

        <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full px-8 py-6 h-auto shadow-glow group">
            <Link href="/" className="flex items-center gap-2">
              <MoveLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Kembali Ke Beranda
            </Link>
          </Button>
        </div>
      </div>

      <p className="mt-8 text-label-sm text-muted-foreground/50 uppercase tracking-widest">
        Ngaturin &bull; Ethereal Analyst System
      </p>
    </div>
  );
}
