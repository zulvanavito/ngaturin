"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, BarChart3, TrendingUp, Wallet as WalletIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useInsights } from "@/hooks/use-insights";
import { InsightsFilters } from "@/components/insights-filters";
import { InsightsHero } from "@/components/insights-hero";
import { InsightMetricCards } from "@/components/insight-metric-cards";
import { formatCurrency } from "@/components/balance-card";
import Link from "next/link";
import type { Transaction } from "@/components/transaction-form";

export default function InsightsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for filters
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWallet, setSelectedWallet] = useState<string>("all");

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions?_t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { summary, globalSummary, aiNarrative, isAiLoading } = useInsights(transactions, selectedMonth, selectedCategory, selectedWallet);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
           <span className="text-secondary font-bold text-xl pt-0.5">N.</span>
        </div>
        <p className="text-muted-foreground font-medium text-sm">Menganalisis data finansial...</p>
      </div>
    );
  }

  const efficiency = globalSummary.totalIncome > 0 
    ? Math.max(0, ((globalSummary.totalIncome - globalSummary.totalExpense) / globalSummary.totalIncome) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary fill-primary/20" /> Smart Insights
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Pahami kebiasaan belanjamu dengan bantuan analisis cerdas.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="rounded-xl hover:bg-muted/50 gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <InsightsFilters 
        transactions={transactions}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
      />

      {/* Hero Section (AI Summary) */}
      <InsightsHero narrative={aiNarrative} isLoading={isAiLoading} />

      {/* Metrics Grid */}
      <InsightMetricCards summary={summary} globalSummary={globalSummary} />

      {/* Cashflow Comparison / Visual Depth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-card border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-secondary">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Income vs Expenses (Bulanan)</h3>
            </div>
            
            <div className="space-y-6">
                <div>
                   <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Total Pemasukan</span>
                        <span className="text-xl font-bold text-income">{formatCurrency(globalSummary.totalIncome)}</span>
                   </div>
                   <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-income rounded-full transition-all duration-1000" style={{ width: globalSummary.totalIncome > 0 ? '100%' : '0' }} />
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Total Pengeluaran</span>
                        <span className="text-xl font-bold text-expense">{formatCurrency(globalSummary.totalExpense)}</span>
                   </div>
                   <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-expense rounded-full transition-all duration-1000" 
                            style={{ 
                                width: globalSummary.totalIncome > 0 
                                    ? `${Math.min(100, (globalSummary.totalExpense / globalSummary.totalIncome) * 100)}%` 
                                    : globalSummary.totalExpense > 0 ? '100%' : '0' 
                            }} 
                        />
                   </div>
                   {globalSummary.totalIncome > 0 && (
                       <p className="text-[10px] text-muted-foreground mt-2 text-right font-bold uppercase tracking-widest">
                            {((globalSummary.totalExpense / globalSummary.totalIncome) * 100).toFixed(1)}% dari pendapatan
                       </p>
                   )}
                </div>
            </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-secondary text-secondary-foreground shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <BarChart3 className="w-32 h-32" />
            </div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-primary" /> Net Cashflow (Total)
            </h3>
            <p className="text-4xl font-bold tracking-tight mb-2">
                {formatCurrency(globalSummary.netCashflow)}
            </p>
            <p className="text-secondary-foreground/70 text-sm font-medium">
                {globalSummary.netCashflow >= 0 ? "Surplus bulan ini. Bagus!" : "Defisit bulan ini. Periksa pengeluaranmu."}
            </p>

            <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                        <p className="text-[10px] uppercase font-bold opacity-60">Status Keuangan</p>
                        <p className="font-bold">{globalSummary.savingsRate > 20 ? "Sangat Sehat" : globalSummary.savingsRate > 0 ? "Waspada" : "Kritis"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                        <p className="text-[10px] uppercase font-bold opacity-60">Effisiensi</p>
                        <p className="font-bold">{efficiency.toFixed(0)}%</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
