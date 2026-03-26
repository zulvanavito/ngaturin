"use client";

import { Info, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ParaGuidanceBannerProps {
  title: string;
  description: string;
  tips?: string[];
  variant?: "info" | "tip";
  dismissKey?: string; // localStorage key untuk simpan state minimize
}

export function ParaGuidanceBanner({
  title,
  description,
  tips,
  variant = "info",
  dismissKey,
}: ParaGuidanceBannerProps) {
  const storageKey = dismissKey ? `para_banner_minimized_${dismissKey}` : null;

  const [minimized, setMinimized] = useState(() => {
    if (!storageKey) return false;
    try { return localStorage.getItem(storageKey) === "1"; } catch { return false; }
  });

  const toggle = () => {
    const next = !minimized;
    setMinimized(next);
    if (storageKey) {
      try { localStorage.setItem(storageKey, next ? "1" : "0"); } catch { /* ignore */ }
    }
  };

  const isInfo = variant === "info";

  const accentColor = isInfo
    ? "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30"
    : "bg-amber-50/60 border-amber-300/40 dark:bg-amber-500/10 dark:border-amber-500/30";

  const iconBg = isInfo ? "bg-primary/15" : "bg-amber-400/20";
  const titleColor = isInfo ? "text-primary" : "text-amber-700 dark:text-amber-300";
  const arrowColor = isInfo ? "text-primary/70" : "text-amber-600/70 dark:text-amber-400/70";

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${accentColor}`}>
      {/* Header row — always visible, click to toggle */}
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Icon */}
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {isInfo
            ? <Info className="w-3.5 h-3.5 text-primary" />
            : <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          }
        </div>

        {/* Title */}
        <p className={`flex-1 font-bold text-sm ${titleColor}`}>{title}</p>

        {/* Chevron */}
        <div className="shrink-0 text-muted-foreground/50">
          {minimized
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronUp className="w-4 h-4" />
          }
        </div>
      </button>

      {/* Expandable content */}
      {!minimized && (
        <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          {tips && tips.length > 0 && (
            <ul className="space-y-1 mt-1">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className={`font-bold shrink-0 mt-0.5 ${arrowColor}`}>→</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
