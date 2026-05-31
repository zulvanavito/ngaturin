import type { QuickSummary } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { formatCurrency } from "@/lib/reports/formatters";
import { CalendarX, Flame, CreditCard, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface QuickSummaryCardProps {
  data: QuickSummary;
  className?: string;
}

interface MiniMetricProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function MiniMetric({ label, value, subValue, icon, iconBg }: MiniMetricProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-card border border-border/50 shadow-sm transition-colors">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p 
          className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-0.5"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          {label}
        </p>
        <p 
          className="text-lg sm:text-xl font-black tracking-tight text-foreground tabular-nums truncate"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          {value}
        </p>
        {subValue && <p className="text-xs font-semibold text-muted-foreground mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

function formatHighestDay(dateStr: string | null): string {
  if (!dateStr) return "Tidak tersedia";
  try {
    return format(parseISO(dateStr), "d MMMM", { locale: id });
  } catch {
    return dateStr;
  }
}

export function QuickSummaryCard({ data, className }: QuickSummaryCardProps) {
  return (
    <ReportSectionCard title="Ringkasan Cepat" className={className} contentClassName="flex flex-col justify-between">
      <div className="flex flex-col gap-3 h-full justify-between">
        <MiniMetric
          label="Rata-rata/hari"
          value={formatCurrency(data.averageDailyExpense)}
          icon={<TrendingDown className="w-5 h-5 text-[#054d28]" />}
          iconBg="bg-[#e2f6d5]"
        />
        <MiniMetric
          label="Hari terboros"
          value={formatHighestDay(data.highestExpenseDay)}
          icon={<Flame className="w-5 h-5 text-rose-600" />}
          iconBg="bg-rose-500/10"
        />
        <MiniMetric
          label="Total transaksi"
          value={`${data.totalTransactions} trx`}
          icon={<CreditCard className="w-5 h-5 text-[#054d28]" />}
          iconBg="bg-[#e2f6d5]"
        />
        <MiniMetric
          label="Tanpa pengeluaran"
          value={`${data.noSpendDays} hari`}
          icon={<CalendarX className="w-5 h-5 text-emerald-700" />}
          iconBg="bg-emerald-500/10"
        />
      </div>
    </ReportSectionCard>
  );
}
