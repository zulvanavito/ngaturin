"use client";

import { Zap } from "lucide-react";

interface DashboardSummaryCardProps {
  remainingBudget: number;
  totalIncome: number;
  totalExpense: number;
  userName?: string;
}

export function DashboardSummaryCard({
  remainingBudget,
  totalIncome,
  totalExpense,
  userName = "Pengguna",
}: DashboardSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <span className="text-muted-foreground">O</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Halo, {userName} <span className="inline-block translate-y-[2px]">👋</span>
          </p>
        </div>
        
        {/* Active Period */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border border-border/50 rounded-full shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div className="flex flex-col text-xs">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold leading-none tracking-wider">Active Period</span>
            <span className="font-semibold leading-tight">01 Feb - 28 Feb</span>
          </div>
        </div>
      </div>

      {/* Dark Summary Card -> Ethereal Glass Card */}
      <div className="relative rounded-[2rem] bg-card text-card-foreground overflow-hidden shadow-ambient border border-border/40">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
          
          {/* Left Side: Balance Focus */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-primary-foreground dark:text-primary text-xs font-semibold tracking-wider uppercase">
              <Zap className="w-4 h-4 fill-current" />
              Sekilas Hari Ini
            </div>
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                {formatCurrency(remainingBudget)}
              </span>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                <span className="text-amber-300 text-lg">💰</span> budget harian yang tersisa
              </div>
            </div>
          </div>

          {/* Right Side: Income vs Expense Minimalist View */}
          <div className="flex gap-8 md:gap-12 md:mr-8 md:self-center">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pemasukan</span>
              <p className="text-xl font-semibold text-income">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pengeluaran</span>
              <p className="text-xl font-semibold text-expense">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>

        {/* Footer Alert */}
        <div className="bg-muted/30 px-6 sm:px-8 py-4 text-sm text-muted-foreground border-t border-border/40 relative z-10">
          Superrr! Belum ada pengeluaran hari ini.
        </div>
      </div>
    </div>
  );
}
