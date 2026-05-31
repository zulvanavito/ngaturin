import type {
  ReportSummary,
  BudgetPerformanceItem,
  DebtSummary,
  DailyExpensePoint,
  FinancialHealthScore,
  DimensionScore,
} from "./report-types";
import { safeDivide } from "./formatters";
import { getElapsedDaysInMonth } from "./date-utils";

interface HealthScoreInput {
  summary: ReportSummary;
  budgetPerformance: BudgetPerformanceItem[];
  debtSummary: DebtSummary;
  dailyExpenses: DailyExpensePoint[];
  selectedMonth: string;
}

function getStatus(score: number): FinancialHealthScore["status"] {
  if (score >= 85) return "Sangat Sehat";
  if (score >= 70) return "Sehat";
  if (score >= 50) return "Waspada";
  return "Kritis";
}

// ─── Dimension: Savings Ratio (max 25) ───────────────────

function scoreSavings(savingsRate: number): DimensionScore {
  let score: number;
  let description: string;

  if (savingsRate >= 20) {
    score = 25;
    description = "Rasio tabungan sangat baik (≥20%).";
  } else if (savingsRate >= 10) {
    score = 20;
    description = "Rasio tabungan baik (≥10%).";
  } else if (savingsRate >= 5) {
    score = 15;
    description = "Rasio tabungan cukup (≥5%).";
  } else if (savingsRate >= 0) {
    score = 10;
    description = "Rasio tabungan rendah.";
  } else {
    score = 0;
    description = "Pengeluaran melebihi pemasukan.";
  }

  return { score, label: "Rasio Tabungan", description };
}

// ─── Dimension: Budget Discipline (max 25) ───────────────

function scoreBudget(budgetPerformance: BudgetPerformanceItem[]): DimensionScore {
  if (budgetPerformance.length === 0) {
    return {
      score: 15,
      label: "Disiplin Anggaran",
      description: "Belum ada anggaran yang diatur.",
      isEstimated: true,
    };
  }

  const overBudgetCount = budgetPerformance.filter((b) => b.status === "Over-budget").length;
  const warningCount = budgetPerformance.filter((b) => b.status === "Waspada" || b.status === "Hampir Habis").length;
  const total = budgetPerformance.length;

  let score: number;
  let description: string;

  if (overBudgetCount === 0 && warningCount === 0) {
    score = 25;
    description = "Semua anggaran dalam batas aman.";
  } else if (overBudgetCount === 0) {
    score = 20;
    description = `${warningCount} dari ${total} anggaran mendekati batas.`;
  } else if (overBudgetCount < total) {
    score = 10;
    description = `${overBudgetCount} dari ${total} anggaran terlampaui.`;
  } else {
    score = 0;
    description = "Semua anggaran terlampaui.";
  }

  return { score, label: "Disiplin Anggaran", description, isEstimated: false };
}

// ─── Dimension: Cashflow (max 20) ────────────────────────

function scoreCashflow(netCashflow: number): DimensionScore {
  let score: number;
  let description: string;

  if (netCashflow > 0) {
    score = 20;
    description = "Arus kas positif.";
  } else if (netCashflow === 0) {
    score = 10;
    description = "Arus kas impas.";
  } else {
    score = 0;
    description = "Arus kas negatif.";
  }

  return { score, label: "Arus Kas", description };
}

// ─── Dimension: Debt Health (max 15) ─────────────────────

function scoreDebt(debtSummary: DebtSummary, totalIncome: number): DimensionScore {
  let score: number;
  let description: string;

  if (debtSummary.activeDebtTotal === 0) {
    score = 15;
    description = "Tidak ada utang aktif.";
  } else if (debtSummary.overdueCount === 0) {
    const debtRatio = safeDivide(debtSummary.activeDebtTotal, totalIncome);
    if (debtRatio > 0.5) {
      score = 5;
      description = "Rasio utang terhadap pemasukan tinggi.";
    } else {
      score = 12;
      description = "Utang aktif terkendali, tidak ada yang jatuh tempo.";
    }
  } else {
    score = 3;
    description = `${debtSummary.overdueCount} utang/piutang melewati jatuh tempo.`;
  }

  return { score, label: "Kesehatan Utang", description };
}

// ─── Dimension: Spending Consistency (max 15) ────────────

function scoreConsistency(dailyExpenses: DailyExpensePoint[], selectedMonth: string): DimensionScore {
  const elapsed = getElapsedDaysInMonth(selectedMonth);
  const relevant = dailyExpenses.slice(0, elapsed).filter((d) => d.amount > 0);

  if (relevant.length < 7) {
    return {
      score: 10,
      label: "Konsistensi Pengeluaran",
      description: "Data belum cukup untuk menilai konsistensi (< 7 hari).",
      isEstimated: true,
    };
  }

  const mean = safeDivide(
    relevant.reduce((s, d) => s + d.amount, 0),
    relevant.length
  );
  const variance = safeDivide(
    relevant.reduce((s, d) => s + Math.pow(d.amount - mean, 2), 0),
    relevant.length
  );
  const stdDev = Math.sqrt(variance);
  const cv = safeDivide(stdDev, mean); // coefficient of variation

  let score: number;
  let description: string;

  if (cv < 0.5) {
    score = 15;
    description = "Pengeluaran harian cukup konsisten.";
  } else if (cv < 1) {
    score = 10;
    description = "Pengeluaran harian cukup bervariasi.";
  } else {
    score = 5;
    description = "Pengeluaran harian sangat fluktuatif.";
  }

  return { score, label: "Konsistensi Pengeluaran", description };
}

// ─── Main ────────────────────────────────────────────────

export function calculateFinancialHealthScore(input: HealthScoreInput): FinancialHealthScore {
  const savings = scoreSavings(input.summary.savingsRate);
  const budget = scoreBudget(input.budgetPerformance);
  const cashflow = scoreCashflow(input.summary.netCashflow);
  const debt = scoreDebt(input.debtSummary, input.summary.totalIncome);
  const consistency = scoreConsistency(input.dailyExpenses, input.selectedMonth);

  const isEstimated = budget.isEstimated || consistency.isEstimated || false;

  const totalScore = Math.min(
    Math.max(savings.score + budget.score + cashflow.score + debt.score + consistency.score, 0),
    100
  );

  return {
    score: totalScore,
    status: getStatus(totalScore),
    isEstimated,
    dimensions: { savings, budget, cashflow, debt, consistency },
  };
}
