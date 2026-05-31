"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ExpenseBreakdownItem } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { ReportEmptyState } from "./report-empty-state";
import { formatCurrency, formatPercentage } from "@/lib/reports/formatters";

const COLORS = [
  "#9fe870","#ffc091","#38c8ff","#ffd11a","#d03238",
  "#868685","#163300","#054d28","#cdffad","#e2f6d5",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: d } = payload[0];
  return (
    <div className="rounded-2xl bg-white border border-border/50 shadow-xl p-3 text-xs font-semibold">
      <p className="font-black text-foreground mb-1">{name}</p>
      <p className="text-muted-foreground">{formatCurrency(value)}</p>
      <p className="text-muted-foreground">{formatPercentage(d.percentage)}</p>
    </div>
  );
};

interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdownItem[];
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.amount > 0);

  return (
    <ReportSectionCard title="Rincian Pengeluaran">
      {!hasData ? (
        <ReportEmptyState
          title="Belum ada pengeluaran untuk periode ini"
          description="Grafik rincian pengeluaran akan tampil setelah ada transaksi expense."
        />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={110}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-foreground font-medium">{value}</span>}
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ReportSectionCard>
  );
}
