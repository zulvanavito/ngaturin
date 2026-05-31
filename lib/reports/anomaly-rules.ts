import type {
  ReportSummary,
  BudgetPerformanceItem,
  DailyExpensePoint,
  GoalProgressItem,
  DebtSummary,
  ReportProjection,
  ReportAnomaly,
} from "./report-types";
import { safeDivide } from "./formatters";
import { getElapsedDaysInMonth } from "./date-utils";

interface AnomalyInput {
  summary: ReportSummary;
  budgetPerformance: BudgetPerformanceItem[];
  dailyExpenses: DailyExpensePoint[];
  goalsProgress: GoalProgressItem[];
  debtSummary: DebtSummary;
  projection: ReportProjection;
}

let idCounter = 0;
function nextId(): string {
  idCounter++;
  return `anomaly-${idCounter}`;
}

export function detectAnomalies(input: AnomalyInput): ReportAnomaly[] {
  idCounter = 0;
  const anomalies: ReportAnomaly[] = [];

  // 1. Over-budget categories
  for (const budget of input.budgetPerformance) {
    if (budget.status === "Over-budget") {
      anomalies.push({
        id: nextId(),
        title: `Over-budget: ${budget.category}`,
        description: `Pengeluaran ${budget.category} sudah mencapai ${budget.usedPercentage.toFixed(0)}% dari anggaran.`,
        severity: "high",
        type: "budget",
      });
    }
  }

  // 2. Budget faster than expected
  for (const budget of input.budgetPerformance) {
    if (budget.timeRisk === "faster_than_expected" && budget.status !== "Over-budget") {
      anomalies.push({
        id: nextId(),
        title: `Penggunaan terlalu cepat: ${budget.category}`,
        description: `Anggaran ${budget.category} digunakan lebih cepat dari waktu yang berjalan.`,
        severity: "medium",
        type: "budget",
      });
    }
  }

  // 3. Daily expense spike
  const expenseAmounts = input.dailyExpenses.filter((d) => d.amount > 0).map((d) => d.amount);
  if (expenseAmounts.length >= 3) {
    const mean = safeDivide(expenseAmounts.reduce((s, a) => s + a, 0), expenseAmounts.length);
    const highest = input.dailyExpenses.find((d) => d.isHighest);
    if (highest && highest.amount > mean * 3 && mean > 0) {
      anomalies.push({
        id: nextId(),
        title: "Lonjakan pengeluaran harian",
        description: `Pengeluaran tertinggi pada ${highest.date} mencapai ${(highest.amount / mean).toFixed(1)}x rata-rata harian.`,
        severity: "medium",
        type: "spending",
      });
    }
  }

  // 4. Low savings rate
  if (input.summary.totalIncome > 0 && input.summary.savingsRate < 5) {
    anomalies.push({
      id: nextId(),
      title: "Rasio tabungan rendah",
      description: `Rasio tabungan hanya ${input.summary.savingsRate.toFixed(1)}%. Disarankan minimal 10%.`,
      severity: input.summary.savingsRate < 0 ? "high" : "medium",
      type: "savings",
    });
  }

  // 5. Debt overdue
  if (input.debtSummary.overdueCount > 0) {
    anomalies.push({
      id: nextId(),
      title: "Utang/piutang jatuh tempo",
      description: `${input.debtSummary.overdueCount} utang/piutang sudah melewati tenggat.`,
      severity: "high",
      type: "debt",
    });
  }

  // 6. Goal behind schedule
  for (const goal of input.goalsProgress) {
    if (goal.isCompleted || !goal.deadline) continue;
    const created = new Date(goal.deadline);
    const now = new Date();
    if (isNaN(created.getTime())) continue;
    // Simple check: if percentage is less than half and deadline is less than 3 months away
    const daysUntilDeadline = Math.ceil((created.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline > 0 && daysUntilDeadline < 90 && goal.percentage < 50) {
      anomalies.push({
        id: nextId(),
        title: `Goal tertinggal: ${goal.title}`,
        description: `Progress ${goal.percentage.toFixed(0)}% dengan sisa waktu ${daysUntilDeadline} hari.`,
        severity: "medium",
        type: "goal",
      });
    }
  }

  // Sort by severity (high first)
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return anomalies;
}
