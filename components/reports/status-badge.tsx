import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { BudgetPerformanceItem } from "@/lib/reports/report-types";

type StatusType = BudgetPerformanceItem["status"] | "Sangat Sehat" | "Sehat" | "Waspada" | "Kritis" | "Estimasi" | "Terkendali" | "Perlu Perhatian" | "Beban Tinggi";

export type Tone = "green" | "emerald" | "rose" | "orange" | "neutral";

export const toneClasses = {
  green: "bg-lime-50 text-lime-700 border border-lime-100",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  rose: "bg-rose-50 text-rose-700 border border-rose-100",
  orange: "bg-orange-50 text-orange-700 border border-orange-100",
  neutral: "bg-white text-muted-foreground border border-border/60",
};

const statusConfig: Record<string, { tone: Tone; label: string }> = {
  "Aman":          { tone: "green",    label: "Aman" },
  "Sangat Sehat":  { tone: "emerald",  label: "Sangat Sehat" },
  "Sehat":         { tone: "green",    label: "Sehat" },
  "Waspada":       { tone: "orange",   label: "Waspada" },
  "Hampir Habis":  { tone: "orange",   label: "Hampir Habis" },
  "Over-budget":   { tone: "rose",     label: "Over-budget" },
  "Kritis":        { tone: "rose",     label: "Kritis" },
  "Estimasi":      { tone: "neutral",  label: "Estimasi" },
  "Terkendali":    { tone: "green",    label: "Terkendali" },
  "Perlu Perhatian": { tone: "orange", label: "Perlu Perhatian" },
  "Beban Tinggi":  { tone: "rose",     label: "Beban Tinggi" },
  "Tercapai":        { tone: "emerald",  label: "Tercapai" },
  "On Track":        { tone: "green",    label: "On Track" },
  "Berisiko":        { tone: "orange",   label: "Berisiko" },
  "Terlambat":       { tone: "rose",     label: "Terlambat" },
  "Dalam Rencana":   { tone: "neutral",  label: "Dalam Rencana" },
  "Tidak ada deadline": { tone: "neutral", label: "Tanpa Deadline" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { tone: "neutral" as const, label: status };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider", toneClasses[config.tone], className)}>
      {config.label}
    </span>
  );
}
