import { formatCurrency, formatPercentage } from "@/lib/reports/formatters";
import type { ReportSummary } from "@/lib/reports/report-types";
import { TrendingDown, PiggyBank, Percent, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportSummaryCardsProps {
  summary: ReportSummary;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  helper?: string;
}

function MetricCard({ label, value, icon, iconBg, valueColor, helper }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-card border border-border/50 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
        {icon}
      </div>
      <div>
        <p 
          className="text-xs sm:text-sm font-black tracking-tight text-foreground"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          {label}
        </p>
        <p 
          className={cn("text-xl sm:text-2xl font-black tabular-nums tracking-tight mt-0.5", valueColor ?? "text-foreground")}
          style={{ fontFeatureSettings: '"calt"' }}
        >
          {value}
        </p>
        {helper && <p className="text-xs font-semibold text-muted-foreground mt-0.5">{helper}</p>}
      </div>
    </div>
  );
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const { totalIncome, totalExpense, netCashflow, savingsRate } = summary;
  const isNegative = netCashflow < 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Yang Ditabung"
        value={formatCurrency(netCashflow)}
        valueColor={isNegative ? "text-destructive" : "text-[#054d28]"}
        icon={isNegative
          ? <TrendingDown className="w-5 h-5 text-destructive" />
          : <PiggyBank className="w-5 h-5 text-[#054d28]" />
        }
        iconBg={isNegative ? "bg-destructive/10" : "bg-[#e2f6d5]"}
        helper={isNegative ? "Pengeluaran melebihi pemasukan" : undefined}
      />
      <MetricCard
        label="Rasio Menabung"
        value={formatPercentage(savingsRate)}
        valueColor={savingsRate >= 10 ? "text-[#054d28]" : savingsRate >= 0 ? "text-foreground" : "text-destructive"}
        icon={<Percent className="w-5 h-5 text-[#054d28]" />}
        iconBg="bg-[#e2f6d5]"
        helper={savingsRate < 10 && savingsRate >= 0 ? "Disarankan minimal 10%" : undefined}
      />
      <MetricCard
        label="Pemasukan"
        value={formatCurrency(totalIncome)}
        valueColor="text-[#054d28]"
        icon={<ArrowUpCircle className="w-5 h-5 text-[#054d28]" />}
        iconBg="bg-[#e2f6d5]"
      />
      <MetricCard
        label="Pengeluaran"
        value={formatCurrency(totalExpense)}
        valueColor="text-destructive"
        icon={<ArrowDownCircle className="w-5 h-5 text-destructive" />}
        iconBg="bg-destructive/10"
      />
    </div>
  );
}
