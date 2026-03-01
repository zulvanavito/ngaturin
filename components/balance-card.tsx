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
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-white shadow-lg shadow-emerald-500/20 col-span-1 md:col-span-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white/80">Total Saldo</span>
          </div>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Income */}
      <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
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

      {/* Expense */}
      <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
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
  );
}
