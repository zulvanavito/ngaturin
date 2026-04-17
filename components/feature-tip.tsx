"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import Link from "next/link";

interface FeatureTipProps {
  id: string;
  title: string;
  message?: string;
}

export function FeatureTip({ id, title, message }: FeatureTipProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(`tip_dismissed_${id}`) === "true";
    setDismissed(isDismissed);
    setMounted(true);
  }, [id]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`tip_dismissed_${id}`, "true");
  };

  if (!mounted || dismissed) return null;

  return (
    <div className="rounded-[1.25rem] border border-primary/20 bg-primary/5 dark:bg-primary/10 flex flex-col md:flex-row md:items-center justify-between p-4 px-5 shadow-sm gap-4 transition-all animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
          {message && <p className="text-xs text-muted-foreground mt-0.5">{message}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
        <Link href="/dashboard/guide" className="text-xs font-bold bg-primary text-secondary drop-shadow-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
          Buka Panduan
        </Link>
        <button onClick={handleDismiss} className="p-1.5 text-muted-foreground hover:bg-foreground/5 rounded-full transition-colors" title="Tutup">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
