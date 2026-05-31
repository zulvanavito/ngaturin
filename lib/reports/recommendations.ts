import type {
  ReportAnomaly,
  BudgetPerformanceItem,
  ReportProjection,
  GoalProgressItem,
  DebtSummary,
} from "./report-types";
import { formatCurrency } from "./formatters";

interface RecommendationInput {
  anomalies: ReportAnomaly[];
  budgetPerformance: BudgetPerformanceItem[];
  projection: ReportProjection;
  goalsProgress: GoalProgressItem[];
  debtSummary: DebtSummary;
}

export function generateRuleBasedRecommendations(input: RecommendationInput): string[] {
  const recommendations: string[] = [];

  // From anomalies
  for (const anomaly of input.anomalies) {
    if (anomaly.type === "budget" && anomaly.severity === "high") {
      const budget = input.budgetPerformance.find(
        (b) => anomaly.title.includes(b.category) && b.status === "Over-budget"
      );
      if (budget) {
        const overAmount = budget.realized - budget.allocated;
        recommendations.push(
          `Kurangi pengeluaran kategori ${budget.category}. Sudah melebihi anggaran sebesar ${formatCurrency(overAmount)}.`
        );
      }
    }

    if (anomaly.type === "savings" && anomaly.severity === "high") {
      recommendations.push("Pertimbangkan untuk mengurangi pengeluaran non-esensial agar rasio tabungan meningkat.");
    }

    if (anomaly.type === "debt" && anomaly.severity === "high") {
      recommendations.push("Segera selesaikan utang/piutang yang sudah melewati jatuh tempo.");
    }
  }

  // From projection
  if (!input.projection.isHistorical && input.projection.confidence !== "none") {
    if (input.projection.projectedSavings < 0) {
      recommendations.push(
        `Proyeksi akhir bulan menunjukkan defisit ${formatCurrency(Math.abs(input.projection.projectedSavings))}. Pertimbangkan untuk mengurangi pengeluaran.`
      );
    }
  }

  // From goals
  const behindGoals = input.goalsProgress.filter((g) => !g.isCompleted && g.percentage < 30 && g.deadline);
  if (behindGoals.length > 0) {
    recommendations.push(
      `${behindGoals.length} goal masih di bawah 30% progress. Pertimbangkan alokasi dana lebih untuk goal ini.`
    );
  }

  // From debt
  if (input.debtSummary.activeDebtTotal > 0 && input.debtSummary.nearestDueDebt) {
    recommendations.push(`Prioritaskan pembayaran utang terdekat: ${input.debtSummary.nearestDueDebt}.`);
  }

  // Fallback if no issues
  if (recommendations.length === 0) {
    recommendations.push("Kondisi keuangan bulan ini terlihat baik. Pertahankan kebiasaan ini!");
  }

  return recommendations;
}
