import type { FinancialReportResult } from "./report-types";
import type { Transaction } from "@/types/finance";

export type ExportFormat = "pdf" | "excel" | "csv";

export type ExportDatasetKey =
  | "summary"
  | "financial_score"
  | "transactions"
  | "top_categories"
  | "budget_performance"
  | "goals"
  | "debts"
  | "categories"
  | "ai_insight"
  | "investment_snapshot"
  | "advanced_trends";

export type TransactionExportField =
  | "date"
  | "description"
  | "category"
  | "type"
  | "amount"
  | "wallet"
  | "bill"
  | "debt";

export interface ReportExportEntitlements {
  activePlan: "free" | "plus" | "pro";
  features: Record<string, {
    isEnabled: boolean;
    limitValue: number | null;
    metadata?: Record<string, unknown>;
  }>;
}

export interface ExportReportInput {
  period: string;
  format: ExportFormat;
  selectedDatasets: ExportDatasetKey[];
  selectedTransactionFields: TransactionExportField[];
  report: FinancialReportResult;
  transactions: Transaction[];
  generatedInsight?: any | null; // Replace any with GeneratedInsight when available
  entitlements: ReportExportEntitlements;
}
