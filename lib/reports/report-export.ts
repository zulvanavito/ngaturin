import type { ExportReportInput, TransactionExportField } from "./export-types";
import { formatCurrency, formatPercentage } from "./formatters";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

// Feature tracking
export async function trackExportUsage(format: string, datasets: string[], fieldCount: number, period: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("feature_usage_events").insert({
      user_id: user.id,
      feature_key: `reports.export.${format}`,
      metadata: {
        period,
        format,
        datasets,
        transactionFieldCount: fieldCount,
      }
    });
  } catch (error) {
    console.error("Failed to track export usage", error);
  }
}

// Generate CSV
export async function generateCSV(input: ExportReportInput) {
  const { transactions, selectedTransactionFields, period } = input;
  
  if (!transactions || transactions.length === 0) {
    throw new Error("Tidak ada data transaksi untuk diekspor.");
  }

  const headers = selectedTransactionFields.map(getFieldLabel);
  
  const rows = transactions.map(tx => {
    return selectedTransactionFields.map(field => {
      let val = "";
      switch (field) {
        case "date": val = tx.date; break;
        case "description": val = tx.description || ""; break;
        case "category": val = tx.category; break;
        case "type": val = tx.type; break;
        case "amount": val = tx.amount.toString(); break;
        case "wallet": val = tx.wallets?.name || ""; break;
        case "bill": val = tx.bill_id ? "Ya" : ""; break;
        case "debt": val = tx.debt_id ? "Ya" : ""; break;
      }
      // Escape quotes and wrap in quotes
      return `"${val.replace(/"/g, '""')}"`;
    }).join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  downloadBlob(blob, `transaksi-ngaturin-${period}.csv`);
  await trackExportUsage("csv", input.selectedDatasets, selectedTransactionFields.length, period);
}

// Generate Excel
export async function generateExcel(input: ExportReportInput) {
  const ExcelJS = (await import("exceljs")).default || await import("exceljs");
  const workbook = new (ExcelJS as any).Workbook();
  const { report, transactions, selectedDatasets, selectedTransactionFields, period } = input;

  workbook.creator = "Ngaturin";
  workbook.created = new Date();

  // 1. Ringkasan
  if (selectedDatasets.includes("summary")) {
    const sheet = workbook.addWorksheet("Ringkasan");
    sheet.columns = [{ header: "Metrik", key: "metric", width: 25 }, { header: "Nilai", key: "value", width: 20 }];
    sheet.addRow({ metric: "Total Pemasukan", value: report.summary.totalIncome });
    sheet.addRow({ metric: "Total Pengeluaran", value: report.summary.totalExpense });
    sheet.addRow({ metric: "Arus Kas Bersih", value: report.summary.netCashflow });
    sheet.addRow({ metric: "Rasio Tabungan", value: `${report.summary.savingsRate.toFixed(2)}%` });
  }

  // 2. Transaksi
  if (selectedDatasets.includes("transactions") && selectedTransactionFields.length > 0) {
    const sheet = workbook.addWorksheet("Transaksi");
    sheet.columns = selectedTransactionFields.map(f => ({
      header: getFieldLabel(f),
      key: f,
      width: f === "description" ? 30 : 15
    }));

    transactions.forEach(tx => {
      const row: any = {};
      selectedTransactionFields.forEach(field => {
        switch (field) {
          case "date": row[field] = tx.date; break;
          case "description": row[field] = tx.description; break;
          case "category": row[field] = tx.category; break;
          case "type": row[field] = tx.type; break;
          case "amount": row[field] = tx.amount; break;
          case "wallet": row[field] = tx.wallets?.name || ""; break;
          case "bill": row[field] = tx.bill_id ? "Ya" : ""; break;
          case "debt": row[field] = tx.debt_id ? "Ya" : ""; break;
        }
      });
      sheet.addRow(row);
    });
  }

  // 3. Budget Performance
  if (selectedDatasets.includes("budget_performance")) {
    const sheet = workbook.addWorksheet("Performa Anggaran");
    sheet.columns = [
      { header: "Kategori", key: "cat", width: 20 },
      { header: "Alokasi", key: "alloc", width: 15 },
      { header: "Realisasi", key: "real", width: 15 },
      { header: "Sisa", key: "rem", width: 15 },
      { header: "Status", key: "stat", width: 15 }
    ];
    report.budgetPerformance.forEach(b => {
      sheet.addRow({ cat: b.category, alloc: b.allocated, real: b.realized, rem: b.remaining, stat: b.status });
    });
  }

  // 4. Goals
  if (selectedDatasets.includes("goals")) {
    const sheet = workbook.addWorksheet("Goals");
    sheet.columns = [
      { header: "Tujuan", key: "title", width: 25 },
      { header: "Terkumpul", key: "curr", width: 15 },
      { header: "Target", key: "target", width: 15 },
      { header: "Progress (%)", key: "prog", width: 15 },
      { header: "Status", key: "stat", width: 15 }
    ];
    report.goalsProgress.forEach(g => {
      sheet.addRow({ title: g.title, curr: g.currentAmount, target: g.targetAmount, prog: g.percentage.toFixed(2), stat: g.isCompleted ? "Tercapai" : "Belum Tercapai" });
    });
  }

  // 5. Debts
  if (selectedDatasets.includes("debts")) {
    const sheet = workbook.addWorksheet("Utang Piutang");
    sheet.columns = [
      { header: "Metrik", key: "metric", width: 25 },
      { header: "Nilai", key: "value", width: 20 }
    ];
    sheet.addRow({ metric: "Total Utang Aktif", value: report.debtSummary.activeDebtTotal });
    sheet.addRow({ metric: "Total Piutang Aktif", value: report.debtSummary.activeReceivableTotal });
    sheet.addRow({ metric: "Posisi Bersih", value: report.debtSummary.netPosition });
    sheet.addRow({ metric: "Jatuh Tempo", value: report.debtSummary.overdueCount });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(blob, `laporan-ngaturin-${period}.xlsx`);
  await trackExportUsage("excel", input.selectedDatasets, selectedTransactionFields.length, period);
}

// Generate PDF
export async function generatePDF(input: ExportReportInput) {
  const jsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;
  
  const { report, selectedDatasets, period } = input;
  const doc = new jsPDF();
  
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.text(`Laporan Keuangan Ngaturin`, 14, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.text(`Periode: ${period}`, 14, yPos);
  yPos += 15;

  // Summary
  if (selectedDatasets.includes("summary")) {
    doc.setFontSize(14);
    doc.text("Ringkasan Utama", 14, yPos);
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Total Pemasukan", formatCurrency(report.summary.totalIncome)],
        ["Total Pengeluaran", formatCurrency(report.summary.totalExpense)],
        ["Arus Kas Bersih", formatCurrency(report.summary.netCashflow)],
        ["Rasio Tabungan", formatPercentage(report.summary.savingsRate)],
      ],
      theme: "striped",
      headStyles: { fillColor: [159, 232, 112], textColor: [22, 51, 0] }
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Financial Score
  if (selectedDatasets.includes("financial_score")) {
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.text("Skor Kesehatan Finansial", 14, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    doc.text(`Skor: ${report.financialHealthScore.score}/100 (${report.financialHealthScore.status})`, 14, yPos);
    yPos += 10;
  }

  // Top Categories
  if (selectedDatasets.includes("top_categories")) {
    if (yPos > 200) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.text("Kategori Pengeluaran Teratas", 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Kategori", "Jumlah", "Porsi"]],
      body: report.topCategories.map(c => [
        c.category,
        formatCurrency(c.amount),
        formatPercentage(c.percentage)
      ]),
      theme: "striped",
      headStyles: { fillColor: [159, 232, 112], textColor: [22, 51, 0] }
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Budget Performance
  if (selectedDatasets.includes("budget_performance")) {
    if (yPos > 200) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.text("Performa Anggaran", 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Kategori", "Alokasi", "Realisasi", "Sisa", "Status"]],
      body: report.budgetPerformance.map(b => [
        b.category,
        formatCurrency(b.allocated),
        formatCurrency(b.realized),
        formatCurrency(b.remaining),
        b.status
      ]),
      theme: "striped",
      headStyles: { fillColor: [159, 232, 112], textColor: [22, 51, 0] }
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  doc.save(`laporan-ngaturin-${period}.pdf`);
  await trackExportUsage("pdf", input.selectedDatasets, input.selectedTransactionFields.length, period);
}

// Helpers
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getFieldLabel(field: TransactionExportField): string {
  switch (field) {
    case "date": return "Tanggal";
    case "description": return "Deskripsi";
    case "category": return "Kategori";
    case "type": return "Tipe";
    case "amount": return "Jumlah";
    case "wallet": return "Dompet";
    case "bill": return "Tagihan";
    case "debt": return "Utang/Piutang";
    default: return field;
  }
}
