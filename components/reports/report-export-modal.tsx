"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toneClasses } from "./status-badge";
import { Loader2, FileText, Table, FileSpreadsheet, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

import type { 
  ExportFormat, 
  ExportDatasetKey, 
  TransactionExportField, 
  ReportExportEntitlements, 
  ExportReportInput 
} from "@/lib/reports/export-types";
import type { FinancialReportResult } from "@/lib/reports/report-types";
import type { Transaction } from "@/types/finance";
import { generateCSV, generateExcel, generatePDF, getFieldLabel } from "@/lib/reports/report-export";

interface ReportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: string;
  report: FinancialReportResult;
  transactions: Transaction[];
  entitlements: ReportExportEntitlements;
}

const ALL_DATASETS: { key: ExportDatasetKey; label: string }[] = [
  { key: "summary", label: "Ringkasan Laporan" },
  { key: "financial_score", label: "Skor Finansial" },
  { key: "transactions", label: "Transaksi" },
  { key: "budget_performance", label: "Performa Anggaran" },
  { key: "goals", label: "Goals" },
  { key: "debts", label: "Utang & Piutang" },
  { key: "top_categories", label: "Top Kategori" },
  { key: "ai_insight", label: "Insight AI" },
  { key: "investment_snapshot", label: "Investment Snapshot" },
  { key: "advanced_trends", label: "Advanced Trends" }
];

const ALL_FIELDS: TransactionExportField[] = [
  "date", "description", "category", "type", "amount", "wallet", "bill", "debt"
];

export function ReportExportModal({
  open,
  onOpenChange,
  period,
  report,
  transactions,
  entitlements
}: ReportExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [selectedDatasets, setSelectedDatasets] = useState<ExportDatasetKey[]>(["transactions"]);
  const [selectedFields, setSelectedFields] = useState<TransactionExportField[]>([
    "date", "description", "category", "type", "amount", "wallet"
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset/adjust selections when format changes
  useEffect(() => {
    setError(null);
    if (format === "csv") {
      setSelectedDatasets(["transactions"]);
    } else {
      setSelectedDatasets(["summary", "transactions", "budget_performance"]);
    }
  }, [format]);

  const handleDatasetToggle = (key: ExportDatasetKey, checked: boolean) => {
    if (format === "csv") return; // CSV strictly locks dataset to transactions
    setSelectedDatasets(prev => 
      checked ? [...prev, key] : prev.filter(k => k !== key)
    );
  };

  const handleFieldToggle = (key: TransactionExportField, checked: boolean) => {
    setSelectedFields(prev => 
      checked ? [...prev, key] : prev.filter(k => k !== key)
    );
  };

  const isDatasetLocked = (key: ExportDatasetKey) => {
    if (key === "debts") return !entitlements.features["reports.debt_export"]?.isEnabled;
    if (key === "ai_insight") return !entitlements.features["reports.ai_insight"]?.isEnabled;
    if (key === "investment_snapshot") return !entitlements.features["reports.investment_snapshot"]?.isEnabled;
    if (key === "advanced_trends") return !entitlements.features["reports.advanced_trends"]?.isEnabled;
    return false;
  };

  const handleExport = async () => {
    setError(null);
    if (selectedDatasets.length === 0) {
      setError("Pilih minimal satu data untuk diekspor.");
      return;
    }
    if (selectedDatasets.includes("transactions") && selectedFields.length === 0) {
      setError("Pilih minimal satu field transaksi.");
      return;
    }
    if (format !== "csv" && !entitlements.features[`reports.export.${format}`]?.isEnabled) {
      setError(`Fitur export ${format.toUpperCase()} tersedia di paket Plus atau Pro.`);
      return;
    }

    setIsExporting(true);
    try {
      const input: ExportReportInput = {
        period,
        format,
        selectedDatasets,
        selectedTransactionFields: selectedFields,
        report,
        transactions,
        entitlements
      };

      if (format === "csv") await generateCSV(input);
      if (format === "excel") await generateExcel(input);
      if (format === "pdf") await generatePDF(input);

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Export gagal. Periksa data laporan dan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl lg:rounded-[2rem] p-6 outline-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Ekspor Data</DialogTitle>
          <DialogDescription>
            Konfigurasi format dan data laporan sebelum mengunduh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Format Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Format File</Label>
            <div className="flex gap-2">
              {[
                { id: "pdf", label: "PDF", icon: FileText, locked: !entitlements.features["reports.export.pdf"]?.isEnabled },
                { id: "excel", label: "Excel", icon: FileSpreadsheet, locked: !entitlements.features["reports.export.excel"]?.isEnabled },
                { id: "csv", label: "CSV", icon: Table, locked: false }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as ExportFormat)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border/50 transition-all text-sm font-medium",
                    format === f.id ? "bg-[#e2f6d5] border-[#9fe870]/50 text-[#163300]" : "bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  <f.icon className="w-5 h-5" />
                  <span className="flex items-center gap-1">
                    {f.label}
                    {f.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </span>
                </button>
              ))}
            </div>
            {format !== "csv" && !entitlements.features[`reports.export.${format}`]?.isEnabled && (
              <p className="text-xs text-[#b45309] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Format {format.toUpperCase()} hanya tersedia untuk pengguna Plus / Pro.
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Rentang Tanggal</Label>
            <p className="text-sm text-foreground p-3 rounded-xl bg-muted/40 border border-border/50">
              {period} (Mengikuti filter laporan)
            </p>
          </div>

          {/* Dataset Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Data yang Diekspor</Label>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
              {ALL_DATASETS.map(dataset => {
                // CSV only shows transactions
                if (format === "csv" && dataset.key !== "transactions") return null;
                // Don't show specific datasets for PDF that don't make sense if they aren't implemented in the PDF generator yet (like detailed transactions if they are too long), but we'll follow the spec.
                
                const locked = isDatasetLocked(dataset.key);
                const checked = selectedDatasets.includes(dataset.key);

                return (
                  <div key={dataset.key} className="space-y-3">
                    <div className={cn("flex items-center justify-between p-3 rounded-xl border", checked ? "border-[#9fe870]/50 bg-[#e2f6d5]/30" : "border-border/50 bg-card")}>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id={`dataset-${dataset.key}`}
                          checked={checked}
                          disabled={locked || (format === "csv" && dataset.key === "transactions")}
                          onCheckedChange={(c) => handleDatasetToggle(dataset.key, c as boolean)}
                          className="data-[state=checked]:bg-[#054d28] data-[state=checked]:text-[#9fe870]"
                        />
                        <Label 
                          htmlFor={`dataset-${dataset.key}`}
                          className={cn("text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", locked && "text-muted-foreground")}
                        >
                          {dataset.label}
                        </Label>
                      </div>
                      
                      {locked && (
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider gap-1 shrink-0", toneClasses.emerald)}>
                          <Lock className="w-3 h-3" /> Pro
                        </span>
                      )}
                      {dataset.key === "transactions" && checked && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {selectedFields.length}/{ALL_FIELDS.length}
                        </span>
                      )}
                    </div>

                    {/* Transaction Field Selector */}
                    {dataset.key === "transactions" && checked && (
                      <div className="ml-7 grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                        {ALL_FIELDS.map(field => (
                          <div key={field} className="flex items-center space-x-2">
                            <Checkbox
                              id={`field-${field}`}
                              checked={selectedFields.includes(field)}
                              onCheckedChange={(c) => handleFieldToggle(field, c as boolean)}
                              className="w-4 h-4 rounded data-[state=checked]:bg-[#054d28] data-[state=checked]:text-[#9fe870]"
                            />
                            <Label htmlFor={`field-${field}`} className="text-xs cursor-pointer">
                              {getFieldLabel(field)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting || (format !== "csv" && !entitlements.features[`reports.export.${format}`]?.isEnabled)}
            className="w-full rounded-full bg-[#9fe870] text-[#163300] hover:scale-[1.02] active:scale-95 transition-transform font-bold"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Membuat file...
              </>
            ) : (
              "Unduh Laporan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
