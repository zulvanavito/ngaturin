"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { IncomeExpenseTrendPoint, TrendInterval } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { ReportEmptyState } from "./report-empty-state";
import { useReportStore } from "@/stores/use-report-store";
import { formatCurrency } from "@/lib/reports/formatters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IncomeExpenseTrendProps {
  data: IncomeExpenseTrendPoint[];
}

const INTERVALS: { value: TrendInterval; label: string }[] = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl bg-white border border-border/50 shadow-xl p-3 text-xs font-semibold">
      <p className="font-black text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export function IncomeExpenseTrend({ data }: IncomeExpenseTrendProps) {
  const { trendInterval, setTrendInterval } = useReportStore();

  const intervalSelector = (
    <div className="flex gap-1">
      {INTERVALS.map((iv) => (
        <button
          key={iv.value}
          onClick={() => setTrendInterval(iv.value)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
            trendInterval === iv.value
              ? "bg-[#9fe870] text-[#163300]"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {iv.label}
        </button>
      ))}
    </div>
  );

  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <ReportSectionCard title="Tren Pemasukan vs Pengeluaran" titleRight={intervalSelector}>
      {!hasData ? (
        <ReportEmptyState
          title="Belum ada data tren untuk periode ini"
          description="Tambahkan transaksi agar grafik tren bisa ditampilkan."
        />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#868685" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "#868685" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) =>
                value === "income" ? "Pemasukan"
                : value === "expense" ? "Pengeluaran"
                : "Net"
              }
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="income" name="income" fill="#9fe870" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expense" name="expense" fill="#ffc091" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Line
              dataKey="net"
              name="net"
              stroke="#0e0f0c"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ReportSectionCard>
  );
}
