"use client";

import { TrendingUp, TrendingDown, Target, Zap, Waves } from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import type { InsightSummary } from "@/hooks/use-insights";

interface InsightMetricCardsProps {
  summary: InsightSummary;
  globalSummary: InsightSummary;
}

export function InsightMetricCards({ summary, globalSummary }: InsightMetricCardsProps) {
  const { formatCurrency } = useFormatCurrency();
  const metrics = [
    {
      title: "Saving Rate",
      value: `${globalSummary.savingsRate.toFixed(1)}%`,
      desc: "Total tabungan bulan ini",
      icon: Target,
      color: "bg-primary",
      iconColor: "text-secondary",
    },
    {
      title: "Rata-rata Harian",
      value: formatCurrency(summary.averageDailySpend),
      desc: "Pengeluaran rata-rata per hari",
      icon: Zap,
      color: "bg-emerald-500",
      iconColor: "text-white",
    },
    {
        title: "Kategori Terboros",
        value: summary.topCategory,
        desc: `Sebesar ${formatCurrency(summary.topCategoryAmount)}`,
        icon: Waves,
        color: "bg-rose-500",
        iconColor: "text-white",
      },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((m, i) => (
        <div 
          key={i} 
          className="group p-6 rounded-[2rem] bg-white dark:bg-card border-none shadow-[0_15px_40px_rgba(44,47,48,0.03)] hover:shadow-[0_25px_50px_rgba(44,47,48,0.06)] transition-all duration-500"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
              <m.icon className={`w-6 h-6 ${m.iconColor}`} />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{m.title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{m.value}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{m.desc}</p>
          
          {/* Subtle micro-animation bar */}
          <div className="w-full h-1 bg-muted/30 rounded-full mt-4 overflow-hidden">
            <div 
                className={`h-full ${m.color} opacity-30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000`} 
                style={{ width: '100%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
