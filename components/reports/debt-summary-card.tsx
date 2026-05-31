import type { DebtSummary } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { ReportEmptyState } from "./report-empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/reports/formatters";
import { ShieldCheck, AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneClasses, StatusBadge } from "./status-badge";

interface DebtSummaryCardProps {
  data: DebtSummary;
}

interface DebtMetricRowProps {
  label: string;
  value: string;
  valueColor?: string;
  icon: React.ReactNode;
}

function DebtMetricRow({ label, value, valueColor, icon }: DebtMetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className={cn("text-sm font-bold tabular-nums", valueColor ?? "text-foreground")}>{value}</span>
    </div>
  );
}

export function DebtSummaryCard({ data }: DebtSummaryCardProps) {
  const isEmpty = data.activeDebtTotal === 0 && data.activeReceivableTotal === 0;

  const netPositive = data.netPosition >= 0;

  return (
    <ReportSectionCard
      title="Ringkasan Utang & Piutang"
      titleRight={
        data.overdueCount > 0 ? (
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider", toneClasses.rose)}>
            <AlertTriangle className="w-3 h-3" />
            {data.overdueCount} jatuh tempo
          </span>
        ) : isEmpty ? (
          <StatusBadge status="Aman" />
        ) : null
      }
    >
      {isEmpty ? (
        <ReportEmptyState
          title="Tidak ada utang aktif — kondisi kewajiban aman."
          icon={<ShieldCheck className="w-5 h-5 text-[#054d28]" />}
        />
      ) : (
        <div>
          <DebtMetricRow
            label="Total utang aktif"
            value={formatCurrency(data.activeDebtTotal)}
            valueColor={data.activeDebtTotal > 0 ? "text-destructive" : "text-muted-foreground"}
            icon={<ArrowDown className="w-4 h-4 text-destructive" />}
          />
          <DebtMetricRow
            label="Total piutang aktif"
            value={formatCurrency(data.activeReceivableTotal)}
            valueColor={data.activeReceivableTotal > 0 ? "text-[#054d28]" : "text-muted-foreground"}
            icon={<ArrowUp className="w-4 h-4 text-[#054d28]" />}
          />
          <DebtMetricRow
            label="Posisi bersih"
            value={(netPositive ? "+" : "−") + formatCurrency(Math.abs(data.netPosition))}
            valueColor={netPositive ? "text-[#054d28]" : "text-destructive"}
            icon={<Minus className="w-4 h-4 text-muted-foreground" />}
          />
          {data.nearestDueDebt && (
            <div className="mt-3 p-3 rounded-xl bg-[#ffd11a]/15 border border-[#ffd11a]/30 text-xs text-[#b45309] font-medium flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Tenggat terdekat: <span className="font-bold">{data.nearestDueDebt}</span>
            </div>
          )}
          {data.overdueCount > 0 && (
            <div className="mt-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {data.overdueCount} utang/piutang sudah melewati jatuh tempo.
            </div>
          )}
        </div>
      )}
    </ReportSectionCard>
  );
}
