"use client";

import { useState, useEffect } from "react";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface FeatureTipProps {
  id: string;
  title: string;
  tips: string[];
}

export function FeatureTip({ id, title, tips }: FeatureTipProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Read persisted collapsed state after mount (client-only)
  useEffect(() => {
    const stored = localStorage.getItem(`tip_open_${id}`);
    if (stored !== null) setOpen(stored === "true");
    setMounted(true);
  }, [id]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(`tip_open_${id}`, String(next));
  };

  // Render a skeleton bar during SSR / before hydration to avoid layout shift
  if (!mounted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 h-11 animate-pulse" />
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden transition-all">
      {/* Header row — always visible, acts as toggle */}
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="flex-1 text-sm font-semibold text-primary">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-primary/60 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-primary/60 shrink-0" />
        }
      </button>

      {/* Collapsible tips body */}
      {open && (
        <ul className="px-4 pb-3 space-y-1.5 border-t border-primary/10">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed pt-1 first:pt-2">
              <span className="text-primary/60 shrink-0 mt-px">•</span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
