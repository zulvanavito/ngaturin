import type { FinancialHealthScore } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { StatusBadge } from "./status-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinancialHealthScoreProps {
  data: FinancialHealthScore;
}

function ScoreCircle({ score, status }: { score: number; status: FinancialHealthScore["status"] }) {
  const colorClass =
    status === "Sangat Sehat" ? "text-[#054d28]"
    : status === "Sehat" ? "text-[#054d28]"
    : status === "Waspada" ? "text-[#b45309]"
    : "text-destructive";

  const ringColor =
    status === "Sangat Sehat" ? "ring-[#9fe870]"
    : status === "Sehat" ? "ring-[#9fe870]"
    : status === "Waspada" ? "ring-[#ffd11a]"
    : "ring-destructive";

  return (
    <div className={cn(
      "w-20 h-20 rounded-full ring-4 flex flex-col items-center justify-center shrink-0",
      ringColor
    )}>
      <span className={cn("text-2xl font-black tabular-nums tracking-tight", colorClass)}>{score}</span>
      <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
    </div>
  );
}

const DIMENSION_MAX: Record<string, number> = {
  "Rasio Tabungan": 25,
  "Disiplin Anggaran": 25,
  "Arus Kas": 20,
  "Kesehatan Utang": 15,
  "Konsistensi Pengeluaran": 15,
};

export function FinancialHealthScoreCard({ data }: FinancialHealthScoreProps) {
  const dimensions = Object.values(data.dimensions);

  return (
    <ReportSectionCard
      title="Skor Kesehatan Finansial"
      titleRight={data.isEstimated ? <StatusBadge status="Estimasi" /> : undefined}
    >
      <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
        Skor dihitung dari 5 dimensi utama. Setiap dimensi memiliki bobot berbeda, misalnya 25/25 berarti aspek tersebut memperoleh 25 poin dari maksimal 25 poin.
      </p>

      {/* Score + status row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
        <ScoreCircle score={data.score} status={data.status} />
        <div>
          <StatusBadge status={data.status} className="mb-1" />
          <p className="text-sm text-muted-foreground max-w-xs">
            {data.score >= 85
              ? "Kondisi keuangan sangat baik. Pertahankan!"
              : data.score >= 70
              ? "Keuangan sehat. Ada ruang untuk perbaikan kecil."
              : data.score >= 50
              ? "Perlu perhatian. Beberapa aspek membutuhkan perbaikan."
              : "Keuangan dalam kondisi kritis. Tinjau pengeluaran segera."}
          </p>
          {data.isEstimated && (
            <p className="text-xs text-muted-foreground mt-1">
              Skor bersifat estimasi karena belum ada data anggaran.
            </p>
          )}
        </div>
      </div>

      {/* Dimension breakdown */}
      <TooltipProvider>
        <div className="space-y-4">
          {dimensions.map((dim) => {
            const max = DIMENSION_MAX[dim.label] ?? 25;
            const pct = Math.min((dim.score / max) * 100, 100);
            const progressColor =
              pct >= 80 ? "[&_[data-slot=progress-indicator]]:bg-[#9fe870]"
              : pct >= 50 ? "[&_[data-slot=progress-indicator]]:bg-[#ffd11a]"
              : "[&_[data-slot=progress-indicator]]:bg-destructive";

            const tooltipText = 
              dim.label === "Rasio Tabungan" ? "Mengukur persentase uang yang tersisa dari pemasukan setelah dikurangi pengeluaran." :
              dim.label === "Disiplin Anggaran" ? "Mengukur kesesuaian realisasi pengeluaran terhadap budget yang sudah dibuat." :
              dim.label === "Arus Kas" ? "Mengukur apakah pemasukan lebih besar daripada pengeluaran." :
              dim.label === "Kesehatan Utang" ? "Mengukur besarnya utang aktif, status jatuh tempo, dan kemampuan membayar relatif terhadap pemasukan." :
              dim.label === "Konsistensi Pengeluaran" ? "Mengukur kestabilan pengeluaran harian dan mendeteksi lonjakan pengeluaran tidak biasa." : "";

            return (
              <div key={dim.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground font-medium">{dim.label}</span>
                    {tooltipText && (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="w-64">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-black text-foreground">{dim.label}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground leading-relaxed">{tooltipText}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {dim.isEstimated && (
                      <StatusBadge status="Estimasi" className="ml-2" />
                    )}
                  </div>
                  <span className="text-muted-foreground tabular-nums text-xs font-medium">
                    {dim.score} / {max}
                  </span>
                </div>
                <Progress value={pct} className={cn("h-2", progressColor)} />
                <p className="text-[11px] text-muted-foreground">{dim.description}</p>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </ReportSectionCard>
  );
}
