"use client";

import { useState } from "react";
import { useReportStore } from "@/stores/use-report-store";
import { useFinancialReport } from "@/hooks/use-financial-report";
import type { Transaction, Budget, Category, Wallet, Debt, RecurringBill, Investment, Goal } from "@/types/finance";

// Layout
import { ReportFilters } from "@/components/reports/report-filters";
// Section components
import { FinancialHealthScoreCard } from "@/components/reports/financial-health-score";
import { ReportSummaryCards } from "@/components/reports/report-summary-cards";
import { IncomeExpenseTrend } from "@/components/reports/income-expense-trend";
import { ExpenseBreakdownChart } from "@/components/reports/expense-breakdown-chart";
import { TopCategoriesCard } from "@/components/reports/top-categories-card";
import { DailyExpenseChart } from "@/components/reports/daily-expense-chart";
import { QuickSummaryCard } from "@/components/reports/quick-summary-card";
import { BudgetPerformanceTable } from "@/components/reports/budget-performance-table";
import { GoalsProgressCard } from "@/components/reports/goals-progress-card";
import { DebtSummaryCard } from "@/components/reports/debt-summary-card";
import { ReportExportCard } from "@/components/reports/report-export-card";
import { ReportExportModal } from "@/components/reports/report-export-modal";
import { AiInsightReport } from "@/components/reports/ai-insight-report";
import { ReportEmptyState } from "@/components/reports/report-empty-state";
import { AlertCircle, Download, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReportExportEntitlements } from "@/lib/reports/export-types";

export interface ReportsClientViewProps {
  initialData: {
    transactions: Transaction[];
    budgets: Budget[];
    categories: Category[];
    wallets: Wallet[];
    bills: RecurringBill[];
    debts: Debt[];
    goals: Goal[];
    investments: Investment[];
  };
  entitlements: ReportExportEntitlements;
}

export function ReportsClientView({ initialData, entitlements }: ReportsClientViewProps) {
  const { filters, trendInterval } = useReportStore();
  const [exportOpen, setExportOpen] = useState(false);

  const report = useFinancialReport({
    ...initialData,
    filters,
    trendInterval,
  });

  const hasTransactions = report.filteredTransactions.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* Hero Section */}
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 
              className="text-[55px] sm:text-[72px] font-black tracking-tighter leading-[0.85] text-foreground"
              style={{ fontFeatureSettings: '"calt"' }}
            >
              Laporan.
            </h1>
            <p 
              className="text-lg font-semibold text-muted-foreground max-w-md"
              style={{ fontFeatureSettings: '"calt"' }}
            >
              Analisis mendalam pola keuangan dan kebiasaan pengeluaran Anda.
            </p>
          </div>
          
          {hasTransactions && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="header-export-btn"
                onClick={() => setExportOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-[#9fe870] text-[#163300] text-base font-black hover:scale-105 active:scale-95 transition-transform shadow-2xl"
              >
                <Download className="w-5 h-5" />
                Ekspor Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filters */}
      <ReportFilters
        transactions={initialData.transactions}
        categories={initialData.categories}
        wallets={initialData.wallets}
      />

      {/* 3. Financial Health Score */}
      <FinancialHealthScoreCard data={report.financialHealthScore} />

      {/* 4. Summary Cards */}
      <ReportSummaryCards summary={report.summary} />

      {/* No transaction data state for charts */}
      {!hasTransactions ? (
        <div className="rounded-2xl lg:rounded-[2rem] bg-white dark:bg-card border border-border/50 shadow-sm p-8">
          <ReportEmptyState
            title="Belum ada transaksi untuk periode ini."
            description="Tambahkan transaksi agar tren dan rincian pengeluaran bisa dibuat."
            ctaLabel="Tambah Transaksi"
            ctaHref="/dashboard/transactions"
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>
      ) : (
        <>
          {/* 5. Income vs Expense Trend */}
          <IncomeExpenseTrend data={report.incomeExpenseTrend} />

          {/* 6. Expense Breakdown + Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseBreakdownChart data={report.expenseBreakdown} />
            <TopCategoriesCard data={report.topCategories} />
          </div>

          {/* 7. Daily Expense + Quick Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <DailyExpenseChart data={report.dailyExpenses} className="h-full" />
            </div>
            <QuickSummaryCard data={report.quickSummary} className="h-full" />
          </div>
        </>
      )}

      {/* 8. Budget Performance */}
      <BudgetPerformanceTable data={report.budgetPerformance} />

      {/* 9. Goals + Debt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalsProgressCard data={report.goalsProgress} />
        <DebtSummaryCard data={report.debtSummary} />
      </div>

      {/* Anomalies & Recommendations (inline, compact) */}
      {report.anomalies.length > 0 && (
        <div className="rounded-2xl lg:rounded-[2rem] bg-white dark:bg-card border border-border/50 shadow-sm p-4 sm:p-5 lg:p-6">
          <h2 
            className="text-base sm:text-lg font-black tracking-tight text-foreground mb-4"
            style={{ fontFeatureSettings: '"calt"' }}
          >
            Peringatan
          </h2>
          <div className="space-y-2">
            {report.anomalies.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 text-sm">
                <span className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", {
                  "bg-destructive": a.severity === "high",
                  "bg-[#ffd11a]": a.severity === "medium",
                  "bg-muted-foreground": a.severity === "low",
                })} />
                <div>
                  <p className="font-semibold text-foreground">{a.title}</p>
                  <p className="text-muted-foreground text-xs">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div className="rounded-2xl lg:rounded-[2rem] bg-[#e2f6d5] border border-[#9fe870]/40 shadow-sm p-4 sm:p-5 lg:p-6">
          <h2 
            className="text-base sm:text-lg font-black tracking-tight text-[#163300] mb-3"
            style={{ fontFeatureSettings: '"calt"' }}
          >
            Rekomendasi
          </h2>
          <ul className="space-y-1.5">
            {report.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-[#054d28] flex items-start gap-2">
                <span className="font-bold shrink-0">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 10. Export Card */}
      <ReportExportCard
        onOpenExport={() => setExportOpen(true)}
        hasData={hasTransactions}
        anomalyCount={report.anomalies.length}
      />

      {/* 11. AI Insight Report */}
      <AiInsightReport 
        report={report} 
        period={filters.selectedMonth} 
        isLocked={!entitlements.features["reports.ai_insight"]?.isEnabled} 
      />

      <ReportExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        period={filters.selectedMonth}
        report={report}
        transactions={initialData.transactions}
        entitlements={entitlements}
      />
    </div>
  );
}
