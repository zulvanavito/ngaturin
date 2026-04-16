"use client";

import { Sparkles, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";

interface InsightsHeroProps {
  narrative: string;
  isLoading: boolean;
}

export function InsightsHero({ narrative, isLoading }: InsightsHeroProps) {
  return (
    <Card className="relative overflow-hidden group rounded-[2.5rem] border-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5 p-8 shadow-[0_20px_50px_rgba(44,47,48,0.06)] mb-8">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse transition-all duration-3000" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -ml-10 -mb-10" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_8px_20px_rgba(209,252,0,0.3)] shrink-0 transform group-hover:scale-110 transition-transform">
          <Sparkles className="w-7 h-7 text-secondary fill-secondary/20" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-secondary font-bold text-xl tracking-tight">Smart Summary</h2>
            {isLoading && <RefreshCcw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          </div>
          
          <div className={`text-lg md:text-xl font-medium text-foreground/90 leading-relaxed font-sans ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all duration-500`}>
            {narrative.split("**").map((part, i) => 
               i % 2 === 1 ? <span key={i} className="text-secondary font-bold underline decoration-primary underline-offset-4 decoration-2">{part}</span> : part
            )}
          </div>
        </div>
      </div>

      {/* Tonal Layering Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
    </Card>
  );
}
