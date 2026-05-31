import { useMemo } from "react";
import type { Transaction, Budget, Category, Wallet, Debt, RecurringBill, Investment, Goal } from "@/types/finance";
import type { ReportFilters, TrendInterval, FinancialReportResult } from "@/lib/reports/report-types";
import {
  filterTransactions,
  filterTransactionsWithoutMonth,
  calculateSummary,
  calculateIncomeExpenseTrend,
  calculateExpenseBreakdown,
  calculateTopCategories,
  calculateDailyExpenses,
  calculateQuickSummary,
  calculateBudgetPerformance,
  calculateGoalsProgress,
  calculateDebtSummary,
} from "@/lib/reports/calculations";
import { calculateFinancialHealthScore } from "@/lib/reports/financial-health-score";
import { detectAnomalies } from "@/lib/reports/anomaly-rules";
import { calculateProjections } from "@/lib/reports/projections";
import { generateRuleBasedRecommendations } from "@/lib/reports/recommendations";
import { getPreviousMonth } from "@/lib/reports/date-utils";

export interface UseFinancialReportInput {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  wallets: Wallet[];
  bills: RecurringBill[];
  debts: Debt[];
  goals: Goal[];
  investments: Investment[];
  filters: ReportFilters;
  trendInterval: TrendInterval;
}

export function useFinancialReport(input: UseFinancialReportInput): FinancialReportResult {
  const {
    transactions,
    budgets,
    categories,
    debts,
    goals,
    filters,
    trendInterval,
  } = input;

  return useMemo(() => {
    // 1. Filter transactions for current period
    const filteredTransactions = filterTransactions(transactions, filters);
    const currentExpenses = filteredTransactions.filter((tx) => tx.type === "expense");

    // 2. Previous period for trend comparison
    const previousFilters = { ...filters, selectedMonth: getPreviousMonth(filters.selectedMonth) };
    const previousTransactions = filterTransactions(transactions, previousFilters);
    const previousExpenses = previousTransactions.filter((tx) => tx.type === "expense");

    // 3. Non-month-filtered transactions for multi-month/yearly trend charts
    const typeFilteredTransactions = filterTransactionsWithoutMonth(transactions, filters);

    // 4. Core calculations
    const summary = calculateSummary(filteredTransactions);
    const incomeExpenseTrend = calculateIncomeExpenseTrend(
      filteredTransactions,
      typeFilteredTransactions,
      filters.selectedMonth,
      trendInterval
    );
    const expenseBreakdown = calculateExpenseBreakdown(currentExpenses, categories);
    const topCategories = calculateTopCategories(currentExpenses, previousExpenses);
    const dailyExpenses = calculateDailyExpenses(currentExpenses, filters.selectedMonth);
    const quickSummary = calculateQuickSummary(filteredTransactions, dailyExpenses, filters.selectedMonth);

    // 5. Extended calculations
    const budgetPerformance = calculateBudgetPerformance(budgets, currentExpenses, filters.selectedMonth);
    const goalsProgress = calculateGoalsProgress(goals);
    const debtSummary = calculateDebtSummary(debts);

    // 6. Projections & anomalies
    const projection = calculateProjections(summary, dailyExpenses, filters.selectedMonth);
    const anomalies = detectAnomalies({
      summary,
      budgetPerformance,
      dailyExpenses,
      goalsProgress,
      debtSummary,
      projection,
    });
    const recommendations = generateRuleBasedRecommendations({
      anomalies,
      budgetPerformance,
      projection,
      goalsProgress,
      debtSummary,
    });

    // 7. Financial health score
    const financialHealthScore = calculateFinancialHealthScore({
      summary,
      budgetPerformance,
      debtSummary,
      dailyExpenses,
      selectedMonth: filters.selectedMonth,
    });

    return {
      filteredTransactions,
      summary,
      financialHealthScore,
      incomeExpenseTrend,
      expenseBreakdown,
      topCategories,
      dailyExpenses,
      quickSummary,
      budgetPerformance,
      goalsProgress,
      debtSummary,
      anomalies,
      projection,
      recommendations,
    };
  }, [
    transactions,
    budgets,
    categories,
    debts,
    goals,
    filters.selectedMonth,
    filters.selectedCategory,
    filters.selectedWallet,
    filters.selectedType,
    trendInterval,
  ]);
}
