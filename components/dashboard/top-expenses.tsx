"use client";

import { useMemo } from "react";
import { useFormatCurrency } from "@/hooks/use-format-currency";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  category: string;
}

interface CategorySpend {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface TopExpensesProps {
  initialTransactions: Transaction[];
}

export function TopExpenses({ initialTransactions }: TopExpensesProps) {
  const { formatCurrency } = useFormatCurrency();

  const topCategories: CategorySpend[] = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyExpenses = initialTransactions.filter(
      (t) => t.type === "expense" && t.date.startsWith(currentMonth)
    );

    const catMap = new Map<string, { total: number; count: number }>();
    monthlyExpenses.forEach((t) => {
      const existing = catMap.get(t.category) || { total: 0, count: 0 };
      existing.total += Number(t.amount);
      existing.count += 1;
      catMap.set(t.category, existing);
    });

    const totalExpense = monthlyExpenses.reduce((s, t) => s + Number(t.amount), 0);

    return Array.from(catMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpense > 0 ? Math.round((data.total / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [initialTransactions]);

  if (topCategories.length === 0) {
    return (
      <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6">
        <h3 className="text-base font-black tracking-tight text-foreground mb-4" style={{ fontFeatureSettings: '"calt"' }}>
          Pengeluaran Terbesar
        </h3>
        <p className="text-sm font-semibold text-muted-foreground text-center py-6" style={{ fontFeatureSettings: '"calt"' }}>
          Belum ada pengeluaran bulan ini.
        </p>
      </section>
    );
  }

  // Color palette for bars
  const barColors = ["bg-[#9fe870]", "bg-amber-400", "bg-blue-400", "bg-rose-400"];
  const textColors = [
    "text-[#163300]",
    "text-amber-700 dark:text-amber-300",
    "text-blue-700 dark:text-blue-300",
    "text-rose-700 dark:text-rose-300",
  ];

  return (
    <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
          Pengeluaran Terbesar
        </h3>
        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
          {new Date().toLocaleDateString("id-ID", { month: "long" })}
        </span>
      </div>

      <div className="space-y-4">
        {topCategories.map((cat, idx) => (
          <div key={cat.category} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full ${barColors[idx]} shrink-0`} />
                <span className="text-sm font-semibold text-foreground truncate" style={{ fontFeatureSettings: '"calt"' }}>
                  {cat.category}
                </span>
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest tabular-nums">
                  {cat.count}x
                </span>
              </div>
              <span className={`text-sm font-black shrink-0 ml-2 tabular-nums ${textColors[idx]}`} style={{ fontFeatureSettings: '"calt"' }}>
                {formatCurrency(cat.total)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/15 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${barColors[idx]}`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
