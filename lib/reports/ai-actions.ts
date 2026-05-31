"use server";

import type { FinancialReportResult, GeneratedInsight } from "./report-types";
import { formatCurrency } from "./formatters";

/**
 * Server Action for generating AI insights.
 * For MVP, this generates rule-based natural language insights as a fallback mechanism.
 * In the future, this will connect to an LLM (like OpenAI/Anthropic) using the structured metrics as context.
 */
export async function generateAiInsight(
  report: FinancialReportResult,
  period: string
): Promise<GeneratedInsight> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Build natural language summary
  let summary = `Pada periode ${period}, total pengeluaran Anda mencapai ${formatCurrency(report.summary.totalExpense)} dari pemasukan sebesar ${formatCurrency(report.summary.totalIncome)}. `;
  if (report.summary.savingsRate > 20) {
    summary += "Anda berhasil menyisihkan dana dengan sangat baik bulan ini.";
  } else if (report.summary.savingsRate > 0) {
    summary += "Arus kas Anda positif, namun rasio tabungan masih bisa ditingkatkan.";
  } else {
    summary += "Anda mencatatkan arus kas negatif, yang berarti pengeluaran lebih besar dari pemasukan.";
  }

  // Build comparison or general observation
  let comparison = "Tidak ada perbandingan dengan bulan sebelumnya.";
  if (report.topCategories.length > 0) {
    const top = report.topCategories[0];
    if (top.trend === "up") {
      comparison = `Pengeluaran Anda untuk ${top.category} meningkat tajam, pastikan kategori ini sesuai dengan prioritas Anda.`;
    } else if (top.trend === "down") {
      comparison = `Kabar baik! Anda berhasil menekan pengeluaran untuk ${top.category} dibandingkan bulan sebelumnya.`;
    } else {
      comparison = `Pengeluaran terbesar Anda adalah ${top.category}, yang memakan porsi dominan dari anggaran.`;
    }
  }

  // Anomalies to natural language
  const aiAnomalies = report.anomalies.map(a => a.description);
  
  // Projection
  let projection = "";
  if (!report.projection.isHistorical && report.projection.confidence !== "none") {
    if (report.projection.projectedSavings < 0) {
      projection = `Berdasarkan pola pengeluaran saat ini, Anda berisiko defisit sebesar ${formatCurrency(Math.abs(report.projection.projectedSavings))} di akhir bulan.`;
    } else {
      projection = `Jika Anda mempertahankan pola saat ini, Anda diproyeksikan akan memiliki sisa dana sebesar ${formatCurrency(report.projection.projectedSavings)} di akhir bulan.`;
    }
  } else {
    projection = "Proyeksi tidak tersedia untuk bulan historis atau data belum cukup.";
  }

  // Recommendations
  const recommendations = [...report.recommendations];
  if (recommendations.length === 0) {
    recommendations.push("Pertahankan pola keuangan sehat Anda dan terus pantau pengeluaran harian.");
  }

  return {
    summary,
    comparison,
    topCategoriesInsight: report.topCategories.map(c => c.category).join(", "),
    anomalies: aiAnomalies,
    projection,
    recommendations,
    generatedAt: new Date().toISOString()
  };
}
