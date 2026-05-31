import type { BudgetPerformanceItem } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { ReportEmptyState } from "./report-empty-state";
import { StatusBadge } from "./status-badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercentage } from "@/lib/reports/formatters";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface BudgetPerformanceTableProps {
  data: BudgetPerformanceItem[];
}

const statusProgressColor: Record<BudgetPerformanceItem["status"], string> = {
  "Aman":        "[&_[data-slot=progress-indicator]]:bg-[#9fe870]",
  "Waspada":     "[&_[data-slot=progress-indicator]]:bg-[#ffd11a]",
  "Hampir Habis":"[&_[data-slot=progress-indicator]]:bg-[#ffc091]",
  "Over-budget": "[&_[data-slot=progress-indicator]]:bg-destructive",
};

export function BudgetPerformanceTable({ data }: BudgetPerformanceTableProps) {
  return (
    <ReportSectionCard title="Performa Anggaran">
      {data.length === 0 ? (
        <ReportEmptyState
          title="Belum ada anggaran untuk periode ini."
          description="Buat budget agar performa anggaran bisa dipantau."
          ctaLabel="Buat Budget"
          ctaHref="/dashboard/budgets"
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Kategori", "Alokasi", "Realisasi", "Sisa", "Progress", "% Terpakai", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs text-muted-foreground font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.map((row) => (
                  <tr key={row.category} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {row.category}
                        {row.timeRisk === "faster_than_expected" && (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
                        )}
                      </span>
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground">{formatCurrency(row.allocated)}</td>
                    <td className="py-3 pr-4 tabular-nums font-medium">{formatCurrency(row.realized)}</td>
                    <td className={cn("py-3 pr-4 tabular-nums font-medium", row.remaining < 0 ? "text-destructive" : "text-[#054d28]")}>
                      {row.remaining < 0 ? `−${formatCurrency(Math.abs(row.remaining))}` : formatCurrency(row.remaining)}
                    </td>
                    <td className="py-3 pr-4 w-32">
                      <Progress
                        value={Math.min(row.usedPercentage, 100)}
                        className={cn("h-2", statusProgressColor[row.status])}
                      />
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground text-xs">
                      {formatPercentage(row.usedPercentage)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {data.map((row) => (
              <div key={row.category} className="p-3 rounded-xl border border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                    {row.category}
                    {row.timeRisk === "faster_than_expected" && (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#b45309]" />
                    )}
                  </p>
                  <StatusBadge status={row.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {formatCurrency(row.realized)} / {formatCurrency(row.allocated)}
                </p>
                <Progress
                  value={Math.min(row.usedPercentage, 100)}
                  className={cn("h-2 mb-1.5", statusProgressColor[row.status])}
                />
                <p className={cn("text-xs font-medium", row.remaining < 0 ? "text-destructive" : "text-muted-foreground")}>
                  {row.remaining < 0
                    ? `Over-budget ${formatCurrency(Math.abs(row.remaining))}`
                    : `Sisa ${formatCurrency(row.remaining)} (${formatPercentage(row.usedPercentage)} terpakai)`
                  }
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </ReportSectionCard>
  );
}
