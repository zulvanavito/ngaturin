"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface BalanceCardProps {
  totalIncome: number;
  totalExpense: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export { formatCurrency };

export function BalanceCard({ totalIncome, totalExpense }: BalanceCardProps) {
  const balance = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Balance */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-800 p-6 text-white shadow-xl shadow-emerald-500/10 col-span-1 md:col-span-1 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-emerald-500/20 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl translate-y-12 -translate-x-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-medium tracking-wider text-zinc-300">TOTAL SALDO</span>
          </div>
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-white/95 drop-shadow-sm">{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Income */}
      <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-6 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-emerald-500/10 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Pemasukan</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </div>

      {/* Expense */}
      <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-6 shadow-sm hover:shadow-md hover:border-rose-500/20 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-rose-500/10 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Pengeluaran</span>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpense)}
          </p>
        </div>
      </div>
    </div>
  );
}
