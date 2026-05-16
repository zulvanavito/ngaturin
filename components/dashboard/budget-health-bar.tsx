"use client";

import { useMemo, useState } from "react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { Info } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  category: string;
}

interface BudgetHealthBarProps {
  initialMonthlyIncome: number;
  initialExpenses: Transaction[];
}

// Default classification — users could customize this in settings later
const NEEDS_CATEGORIES = [
  "makanan", "makan", "groceries", "belanja bahan", "transportasi", "transport",
  "bensin", "listrik", "air", "internet", "pulsa", "sewa", "kos", "kontrakan",
  "asuransi", "obat", "kesehatan", "rumah sakit", "laundry",
];

const SAVINGS_CATEGORIES = [
  "tabungan", "investasi", "deposito", "reksadana", "saham", "emas", "saving",
  "dana darurat", "goals",
];

function classifyCategory(category: string): "needs" | "wants" | "savings" {
  const cat = category.toLowerCase().trim();
  if (NEEDS_CATEGORIES.some((n) => cat.includes(n))) return "needs";
  if (SAVINGS_CATEGORIES.some((s) => cat.includes(s))) return "savings";
  return "wants";
}

export function BudgetHealthBar({
  initialMonthlyIncome,
  initialExpenses,
}: BudgetHealthBarProps) {
  const { formatCurrency } = useFormatCurrency();
  const [showTip, setShowTip] = useState(false);

  const { needs, wants, savings, total } = useMemo(() => {
    let needs = 0, wants = 0, savings = 0;
    initialExpenses.forEach((t) => {
      const amount = Number(t.amount);
      const type = classifyCategory(t.category);
      if (type === "needs") needs += amount;
      else if (type === "savings") savings += amount;
      else wants += amount;
    });
    return { needs, wants, savings, total: needs + wants + savings };
  }, [initialExpenses]);

  const base = initialMonthlyIncome > 0 ? initialMonthlyIncome : total > 0 ? total : 1;
  const needsPct = Math.round((needs / base) * 100);
  const wantsPct = Math.round((wants / base) * 100);
  const savingsPct = Math.round((savings / base) * 100);

  const bars = [
    {
      label: "Kebutuhan",
      sublabel: "Target 50%",
      value: needs,
      pct: needsPct,
      target: 50,
      color: "bg-emerald-500",
      trackColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Keinginan",
      sublabel: "Target 30%",
      value: wants,
      pct: wantsPct,
      target: 30,
      color: "bg-amber-500",
      trackColor: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Tabungan",
      sublabel: "Target 20%",
      value: savings,
      pct: savingsPct,
      target: 20,
      color: "bg-blue-500",
      trackColor: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
            Progres Pengeluaran
          </h3>
          <button
            className="relative"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onClick={() => setShowTip(!showTip)}
          >
            <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary transition-colors" />
            {showTip && (
              <div className="absolute left-0 top-6 z-50 w-64 p-4 bg-card border border-border/20 rounded-[1.5rem] shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
                <p className="text-xs font-black text-foreground mb-1" style={{ fontFeatureSettings: '"calt"' }}>Aturan 50/30/20</p>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
                  Idealnya: 50% pemasukan untuk Kebutuhan, 30% untuk Keinginan, dan 20% untuk Tabungan/Investasi.
                  Kategori diklasifikasikan secara otomatis.
                </p>
              </div>
            )}
          </button>
        </div>
        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
          {new Date().toLocaleDateString("id-ID", { month: "long" })}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {bars.map((bar) => {
          const isOver = bar.pct > bar.target;
          return (
            <div key={bar.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                    {bar.label}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{bar.sublabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black tabular-nums ${isOver ? "text-red-500" : bar.textColor}`} style={{ fontFeatureSettings: '"calt"' }}>
                    {bar.pct}%
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums" style={{ fontFeatureSettings: '"calt"' }}>
                    {formatCurrency(bar.value)}
                  </span>
                </div>
              </div>
              <div className={`h-2.5 w-full rounded-full overflow-hidden ${bar.trackColor}`}>
                <div className="relative h-full">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isOver ? "bg-red-500" : bar.color}`}
                    style={{ width: `${Math.min(bar.pct, 100)}%` }}
                  />
                  {/* Target marker */}
                  <div
                    className="absolute top-0 h-full w-px bg-foreground/20"
                    style={{ left: `${bar.target}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
