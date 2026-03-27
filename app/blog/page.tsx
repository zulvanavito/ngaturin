"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

export default function BlogUnderConstruction() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full text-center p-10 rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-border/30 shadow-[0_40px_100px_rgba(209,252,0,0.15)] dark:shadow-none">
        
        {/* Glow behind the icon box */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/30 rounded-full blur-[40px] pointer-events-none" />

        <div className="w-24 h-24 mx-auto bg-primary/10 text-primary border border-primary/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner shadow-primary/20 relative">
          <Construction className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
          Halaman Sedang <br/> <span className="text-primary">Dirakit.</span>
        </h1>
        <p className="text-muted-foreground font-medium mb-10 leading-relaxed text-sm md:text-base">
          Area Blog untuk menuangkan gagasan soal produktivitas, Metode PARA, dan wawasan kelas berat finansial sedang dipahat. Ditunggu, ya!
        </p>

        <Button asChild size="lg" className="w-full bg-primary hover:brightness-110 text-primary-foreground font-extrabold h-14 rounded-2xl shadow-xl shadow-primary/20 transition-transform hover:-translate-y-1 hover:shadow-primary/40 flex items-center justify-center gap-2">
          <Link href="/">
            <ArrowLeft className="w-5 h-5" /> Kembali Ke Beranda
          </Link>
        </Button>
      </div>
    </main>
  );
}
