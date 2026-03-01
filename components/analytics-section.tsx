"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Parser } from "json2csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadCloud, PieChart as PieChartIcon, FileText, FileSpreadsheet, FileIcon } from "lucide-react";
import type { Transaction } from "@/components/transaction-form";
import { formatCurrency } from "@/components/balance-card";

interface AnalyticsSectionProps {
  transactions: Transaction[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#64748b"];

export function AnalyticsSection({ transactions }: AnalyticsSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Generate available months for filter from existing transactions, sorted descending
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      // Format: YYYY-MM
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Filter transactions based on selected month
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "all") return transactions;
    
    return transactions.filter((tx) => {
      const date = new Date(tx.date);
      const txMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return txMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // Aggregate expenses by category for the chart
  const expenseData = useMemo(() => {
    const expenses = filteredTransactions.filter(tx => tx.type === "expense");
    const grouped = expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort largest to smallest
  }, [filteredTransactions]);

  // Handle CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    try {
      const fields = ["date", "category", "description", "type", "amount"];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(filteredTransactions.map(tx => ({
        ...tx,
        date: new Date(tx.date).toLocaleDateString('id-ID'),
        type: tx.type === "income" ? "Pemasukan" : "Pengeluaran"
      })));

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `laporan_pengatur_keuangan_${selectedMonth === 'all' ? 'semua' : selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating CSV:", err);
    }
  };

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) return;
    
    try {
      const data = filteredTransactions.map(tx => ({
        Tanggal: new Date(tx.date).toLocaleDateString('id-ID'),
        Kategori: tx.category,
        Deskripsi: tx.description,
        Tipe: tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        Jumlah: tx.amount
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      
      const fileName = `laporan_pengatur_keuangan_${selectedMonth === 'all' ? 'semua' : selectedMonth}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Error generating Excel:", err);
    }
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) return;
    
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text(`Laporan Transaksi Ngaturin - ${formatMonthLabel(selectedMonth)}`, 14, 22);
      
      const tableColumn = ["Tanggal", "Kategori", "Deskripsi", "Tipe", "Jumlah (Rp)"];
      const tableRows = filteredTransactions.map(tx => [
        new Date(tx.date).toLocaleDateString('id-ID'),
        tx.category,
        tx.description,
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        formatCurrency(tx.amount).replace('Rp', '').trim()
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129] } // emerald-500
      });

      doc.save(`laporan_pengatur_keuangan_${selectedMonth === 'all' ? 'semua' : selectedMonth}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const formatMonthLabel = (value: string) => {
    if (value === "all") return "Semua Waktu";
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Chart Section */}
      <div className="md:col-span-2 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-6 shadow-sm flex flex-col h-full min-h-[400px]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold">Pengeluaran per Kategori</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center -ml-4">
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(24, 24, 27, 0.9)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm font-medium ml-1 text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
              <PieChartIcon className="w-8 h-8 opacity-20" />
              <p>Tidak ada pengeluaran di periode ini</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Export Section */}
      <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-medium mb-4 text-sm tracking-wide text-muted-foreground uppercase">Filter Data</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bulan Laporan</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>{formatMonthLabel(month)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Total Transaksi</p>
              <p className="text-2xl font-bold">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button 
            onClick={handleExportPDF} 
            disabled={filteredTransactions.length === 0}
            className="w-full h-11 bg-red-500 hover:bg-red-600 hover:text-white text-white border-0"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Unduh Laporan PDF
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleExportExcel} 
              disabled={filteredTransactions.length === 0}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 hover:text-white text-white border-0"
              variant="outline"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button 
              onClick={handleExportCSV} 
              disabled={filteredTransactions.length === 0}
              className="w-full h-11"
              variant="outline"
            >
              <FileIcon className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
