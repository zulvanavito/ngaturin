import type { ReportSummary, DailyExpensePoint, ReportProjection } from "./report-types";
import { safeDivide } from "./formatters";
import { getDaysInMonth, getElapsedDaysInMonth, isCurrentMonth, isFutureMonth } from "./date-utils";

export function calculateProjections(
  summary: ReportSummary,
  dailyExpenses: DailyExpensePoint[],
  selectedMonth: string
): ReportProjection {
  // Projection only relevant for current month
  if (!isCurrentMonth(selectedMonth)) {
    return {
      projectedExpense: summary.totalExpense,
      projectedSavings: summary.netCashflow,
      confidence: "none",
      isHistorical: !isFutureMonth(selectedMonth),
    };
  }

  const elapsedDays = getElapsedDaysInMonth(selectedMonth);
  const totalDays = getDaysInMonth(selectedMonth);

  if (elapsedDays === 0) {
    return {
      projectedExpense: 0,
      projectedSavings: 0,
      confidence: "none",
      isHistorical: false,
    };
  }

  const averageDailyExpense = safeDivide(summary.totalExpense, elapsedDays);
  const projectedExpense = averageDailyExpense * totalDays;
  const projectedSavings = summary.totalIncome - projectedExpense;

  let confidence: ReportProjection["confidence"];
  if (elapsedDays >= 20) confidence = "high";
  else if (elapsedDays >= 10) confidence = "medium";
  else confidence = "low";

  return {
    projectedExpense,
    projectedSavings,
    confidence,
    isHistorical: false,
  };
}
