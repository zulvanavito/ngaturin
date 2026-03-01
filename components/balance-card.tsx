"use client";

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

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
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Balance - Prominent */}
      <div className="sm:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 p-6 text-white shadow-xl shadow-black/10 group">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:bg-emerald-500/20 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl translate-y-12 -translate-x-12" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium tracking-widest text-zinc-400 uppercase">Total Saldo</span>
            </div>
            <p className="text-3xl lg:text-4xl font-bold tracking-tight text-white">{formatCurrency(balance)}</p>
            <p className={`text-xs mt-2 font-medium ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {balance >= 0 ? "💚 Keuangan sehat" : "⚠️ Pengeluaran melebihi pemasukan"}
            </p>
          </div>
          {totalIncome > 0 && (
            <div className="text-right shrink-0 ml-4">
              <PiggyBank className="w-5 h-5 text-zinc-400 mb-1 ml-auto" />
              <p className="text-xs text-zinc-400">Tabungan</p>
              <p className={`text-2xl font-bold ${savingsRate >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{savingsRate}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Income */}
      <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-emerald-500/10 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pemasukan</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      {/* Expense */}
      <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-5 shadow-sm hover:shadow-md hover:border-rose-500/30 transition-all group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-rose-500/10 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pengeluaran</span>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
}
