import type { Transaction } from "@/types/finance";

export type TransactionTypeFilter = "all" | "income" | "expense" | "transfer";
export type TrendInterval = "daily" | "weekly" | "monthly" | "yearly";
export type ReportViewMode = "overview" | "budget" | "goals" | "ai";

export interface ReportFilters {
  selectedMonth: string; // YYYY-MM
  selectedCategory: string; // id or "all"
  selectedWallet: string; // id or "all"
  selectedType: TransactionTypeFilter;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number;
}

export interface DimensionScore {
  score: number;
  label: string;
  description: string;
  isEstimated?: boolean;
}

export interface FinancialHealthScore {
  score: number;
  status: "Sangat Sehat" | "Sehat" | "Waspada" | "Kritis";
  isEstimated: boolean;
  dimensions: {
    savings: DimensionScore;
    budget: DimensionScore;
    cashflow: DimensionScore;
    debt: DimensionScore;
    consistency: DimensionScore;
  };
}

export interface IncomeExpenseTrendPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  icon?: string;
  color?: string;
}

export interface TopCategoryItem {
  category: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable" | "no_comparison";
  trendPercentage?: number;
}

export interface DailyExpensePoint {
  date: string;
  amount: number;
  isHighest: boolean;
}

export interface QuickSummary {
  averageDailyExpense: number;
  highestExpenseDay: string | null;
  totalTransactions: number;
  noSpendDays: number;
}

export interface BudgetPerformanceItem {
  category: string;
  allocated: number;
  realized: number;
  remaining: number;
  usedPercentage: number;
  status: "Aman" | "Waspada" | "Hampir Habis" | "Over-budget";
  timeRisk: "normal" | "faster_than_expected";
}

export interface GoalProgressItem {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
  deadline?: string | null;
  isCompleted: boolean;
}

export interface DebtSummary {
  activeDebtTotal: number;
  activeReceivableTotal: number;
  netPosition: number;
  overdueCount: number;
  nearestDueDebt?: string | null;
}

export interface ReportAnomaly {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  type: "budget" | "spending" | "savings" | "debt" | "goal";
}

export interface ReportProjection {
  projectedExpense: number;
  projectedSavings: number;
  confidence: "high" | "medium" | "low" | "none";
  isHistorical: boolean;
}

export interface GeneratedInsight {
  summary: string;
  comparison?: string;
  topCategoriesInsight?: string;
  anomalies: string[];
  projection?: string;
  recommendations: string[];
  generatedAt: string;
}

export interface FinancialReportResult {
  filteredTransactions: Transaction[];
  summary: ReportSummary;
  financialHealthScore: FinancialHealthScore;
  incomeExpenseTrend: IncomeExpenseTrendPoint[];
  expenseBreakdown: ExpenseBreakdownItem[];
  topCategories: TopCategoryItem[];
  dailyExpenses: DailyExpensePoint[];
  quickSummary: QuickSummary;
  budgetPerformance: BudgetPerformanceItem[];
  goalsProgress: GoalProgressItem[];
  debtSummary: DebtSummary;
  anomalies: ReportAnomaly[];
  projection: ReportProjection;
  recommendations: string[];
}
