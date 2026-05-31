"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyExpensePoint } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { ReportEmptyState } from "./report-empty-state";
import { formatCurrency } from "@/lib/reports/formatters";
import { safeDivide } from "@/lib/reports/formatters";

interface DailyExpenseChartProps {
  data: DailyExpensePoint[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isHighest = payload[0]?.payload?.isHighest;
  return (
    <div className="rounded-2xl bg-white border border-border/50 shadow-xl p-3 text-xs font-semibold">
      <p className="font-black text-foreground mb-1">{label}</p>
      <p className={isHighest ? "text-destructive" : "text-muted-foreground"}>
        {formatCurrency(payload[0].value)}
        {isHighest && " 🔴 Hari terboros"}
      </p>
    </div>
  );
};

export function DailyExpenseChart({ data, className }: DailyExpenseChartProps) {
  const hasData = data.some((d) => d.amount > 0);
  const totalAmount = data.reduce((s, d) => s + d.amount, 0);
  const daysWithExpense = data.filter((d) => d.amount > 0).length;
  const average = safeDivide(totalAmount, daysWithExpense || 1);

  // Show every 5th label to avoid clutter
  const chartData = data.map((d) => ({
    ...d,
    shortDate: d.date.substring(8), // day number only
  }));

  return (
    <ReportSectionCard title="Pengeluaran Harian" className={className} contentClassName="flex flex-col flex-1 min-h-[280px]">
      {!hasData ? (
        <ReportEmptyState
          title="Belum ada pengeluaran harian"
          description="Chart harian akan muncul setelah ada transaksi expense bulan ini."
        />
      ) : (
        <div className="flex-1 w-full h-full min-h-[280px] relative mt-2">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 10, fill: "#868685" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: "#868685" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={average}
                stroke="#868685"
                strokeDasharray="4 2"
                strokeWidth={1.5}
                label={{ value: "Rata-rata", fill: "#868685", fontSize: 10, position: "insideTopRight" }}
              />
              <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={16}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.isHighest ? "#d03238" : "#9fe870"}
                  />
                ))}
              </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ReportSectionCard>
  );
}
