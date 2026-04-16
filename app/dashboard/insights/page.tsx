"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Wallet as WalletIcon, 
  ArrowLeft, 
  PieChart as PieChartIcon,
  FileText,
  FileSpreadsheet,
  FileIcon,
  DownloadCloud,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useInsights } from "@/hooks/use-insights";
import { InsightsFilters } from "@/components/insights-filters";
import { InsightsHero } from "@/components/insights-hero";
import { InsightMetricCards } from "@/components/insight-metric-cards";
import { formatCurrency } from "@/components/balance-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import type { Transaction } from "@/components/transaction-form";

// Vibrant Premium Palette
const CHART_COLORS = [
  "#FF6B6B", // Coral
  "#4ECDC4", // Turquoise
  "#45B7D1", // Sky Blue
  "#96CEB4", // Sage
  "#FFEEAD", // Cream
  "#D4A5A5", // Rosy
  "#9B59B6", // Amethyst
  "#3498DB", // Blue
  "#E67E22", // Orange
  "#2ECC71"  // Emerald
];

type TrendInterval = "daily" | "weekly" | "monthly" | "yearly";

export default function InsightsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // States for filters
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWallet, setSelectedWallet] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [trendInterval, setTrendInterval] = useState<TrendInterval>("daily");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions?_t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { filteredTransactions, summary, globalSummary, aiNarrative, isAiLoading } = useInsights(
    transactions, 
    selectedMonth, 
    selectedCategory, 
    selectedWallet,
    selectedType
  );

  // Grouped data for Pie Chart
  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      // If a specific type is selected, we show that. 
      // If "all" is selected, we usually show expenses in a Pie chart unless user wants specifically something else.
      // Given the filter is now explicit, we just show whatever is in filteredTransactions.
      grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Grouped data for Trend Chart (supporting daily, monthly, yearly)
  const trendData = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    // We filter for expenses by default if "all" is selected for a better "Spending Trend" view
    const trendFilteredTxs = filteredTransactions.filter(t => {
      if (selectedType === "all") return t.type === "expense";
      return true; // If user specifically picked Income or Expense, show that.
    });

    trendFilteredTxs.forEach(t => {
      const dateToken = new Date(t.date);
      if (isNaN(dateToken.getTime())) return; // Safety check

      let key = "";
      if (trendInterval === "daily") {
        key = t.date;
      } else if (trendInterval === "weekly") {
        // Calculate the start of the week (Sunday)
        const d = new Date(t.date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const startOfWeek = new Date(d.setDate(diff));
        key = startOfWeek.toISOString().split('T')[0];
      } else if (trendInterval === "monthly") {
        key = `${dateToken.getFullYear()}-${String(dateToken.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = `${dateToken.getFullYear()}`;
      }
      
      grouped[key] = (grouped[key] || 0) + Number(t.amount || 0);
    });

    return Object.entries(grouped)
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredTransactions, trendInterval, selectedType]);

  // Premium Export Handlers
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
      link.setAttribute("download", `laporan_analitik_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating CSV:", err);
    }
  };

  const handleExportExcel = async () => {
    if (filteredTransactions.length === 0) return;
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Analitik");

      // Add Summary Header
      worksheet.mergeCells('A1:E1');
      worksheet.getCell('A1').value = "RINGKASAN SMART ANALYTICS";
      worksheet.getCell('A1').font = { bold: true, size: 14 };

      worksheet.getCell('A2').value = "Total Pemasukan";
      worksheet.getCell('B2').value = summary.totalIncome;
      worksheet.getCell('A3').value = "Total Pengeluaran";
      worksheet.getCell('B3').value = summary.totalExpense;
      worksheet.getCell('A4').value = "Sisa Saldo (Net)";
      worksheet.getCell('B4').value = summary.netCashflow;
      
      // Style summary numbers
      ['B2', 'B3', 'B4'].forEach(cell => worksheet.getCell(cell).numFmt = '#,##0');

      // Add Data Table
      worksheet.getRow(6).values = ["Tanggal", "Kategori", "Deskripsi", "Tipe", "Jumlah"];
      worksheet.getRow(6).font = { bold: true };
      worksheet.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FC00' } }; // Brand Primary

      const tableData = filteredTransactions.map(tx => [
        new Date(tx.date).toLocaleDateString('id-ID'),
        tx.category,
        tx.description,
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        Number(tx.amount)
      ]);

      worksheet.addRows(tableData);
      worksheet.columns.forEach(col => col.width = 20);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `laporan_analitik_${selectedMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating Excel:", err);
    }
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) return;
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(44, 47, 48);
      doc.text("Laporan Smart Analytics", 14, 25);
      
      doc.setFontSize(10);
      doc.text(`Periode: ${selectedMonth === 'all' ? 'Semua Waktu' : selectedMonth} | Tipe: ${selectedType === 'all' ? 'Semua' : selectedType}`, 14, 32);

      // Summary Box
      doc.setFillColor(245, 246, 247);
      doc.roundedRect(14, 40, 180, 25, 3, 3, "F");
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("TOTAL PEMASUKAN", 20, 48);
      doc.text("TOTAL PENGELUARAN", 80, 48);
      doc.text("SALDO BERSIH (NET)", 140, 48);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(summary.totalIncome), 20, 58);
      doc.text(formatCurrency(summary.totalExpense), 80, 58);
      doc.text(formatCurrency(summary.netCashflow), 140, 58);

      // Table
      const tableColumn = ["Tanggal", "Kategori", "Deskripsi", "Tipe", "Jumlah"];
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
        startY: 75,
        theme: 'grid',
        headStyles: { fillColor: [209, 252, 0], textColor: [44, 47, 48], fontStyle: 'bold' },
        styles: { fontSize: 9 }
      });

      doc.save(`laporan_analitik_${selectedMonth}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
           <span className="text-secondary font-bold text-xl pt-0.5">N.</span>
        </div>
        <p className="text-muted-foreground font-medium text-sm">Menganalisis data finansial...</p>
      </div>
    );
  }

  const efficiency = globalSummary.totalIncome > 0 
    ? Math.max(0, ((globalSummary.totalIncome - globalSummary.totalExpense) / globalSummary.totalIncome) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary fill-primary/20" /> Smart Analytics
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Visualisasi mendalam dan narasi bertenaga AI untuk keuangan Anda.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="rounded-xl hover:bg-muted/50 gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <InsightsFilters 
        transactions={transactions}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* Hero Section (AI Summary) */}
      <InsightsHero narrative={aiNarrative} isLoading={isAiLoading} />

      {/* Metrics Grid */}
      <InsightMetricCards summary={summary} globalSummary={globalSummary} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Expenses by Category */}
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-card border border-border/40 shadow-sm flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-secondary">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">
              {selectedType === "income" ? "Sumber Pemasukan" : selectedType === "expense" ? "Alokasi Pengeluaran" : "Distribusi Kategori"}
            </h3>
          </div>
          
          <div className="flex-1 min-h-0">
            {isMounted && pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Tidak ada data untuk ditampilkan pada filter ini.
              </div>
            )}
          </div>
        </div>

        {/* High-Contrast Net Cashflow Card */}
        <div className={`p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all duration-500 flex flex-col justify-between ${
          globalSummary.netCashflow >= 0 
            ? "bg-secondary text-secondary-foreground" 
            : globalSummary.netCashflow > -1000000 
              ? "bg-amber-500 text-white" 
              : "bg-red-600 text-white"
        }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <BarChart3 className="w-48 h-48" />
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <WalletIcon className="w-5 h-5" /> Status Keuangan Saat Ini
              </h3>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-2">
                  {formatCurrency(globalSummary.netCashflow)}
              </p>
              <p className="text-lg opacity-90 font-medium">
                  {globalSummary.netCashflow >= 0 
                    ? "Surplus bulan ini. Strategi Anda sudah tepat! ✅" 
                    : globalSummary.netCashflow > -1000000 
                      ? "Sedikit defisit. Yuk, perketat pengeluaran. ⚠️" 
                      : "Kritis! Pengeluaran melebihi batas amannya. 🚨"}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Kesehatan Tabungan</p>
                    <p className="text-xl font-bold">{globalSummary.savingsRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Efisiensi</p>
                    <p className="text-xl font-bold">{efficiency.toFixed(1)}%</p>
                </div>
            </div>
        </div>
      </div>

      {/* Trend Chart with Interval Toggle */}
      <div className="p-8 rounded-[2.5rem] bg-white dark:bg-card border border-border/40 shadow-sm min-h-[450px] flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-secondary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Tren Keuangan</h3>
            </div>
            
            <div className="flex bg-muted/30 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              {(["daily", "weekly", "monthly", "yearly"] as TrendInterval[]).map((interval) => (
                <button
                  key={interval}
                  onClick={() => setTrendInterval(interval)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    trendInterval === interval 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {interval === "daily" ? "Harian" : interval === "weekly" ? "Mingguan" : interval === "monthly" ? "Bulanan" : "Tahunan"}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-4">
              {isMounted && trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                          <XAxis 
                            dataKey="label" 
                            tickFormatter={(val) => {
                              try {
                                if (trendInterval === "daily") {
                                  return new Date(val).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' });
                                }
                                if (trendInterval === "weekly") {
                                  const date = new Date(val);
                                  return "Mgg " + date.toLocaleDateString("id-ID", { day: '2-digit', month: 'short' });
                                }
                                if (trendInterval === "monthly") {
                                  const [year, month] = val.split("-");
                                  const date = new Date(Number(year), Number(month) - 1);
                                  return date.toLocaleDateString("id-ID", { month: 'short', year: 'numeric' });
                                }
                              } catch(e) {}
                              return val;
                            }}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#888' }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#888' }}
                            tickFormatter={(val) => `Rp${(val/1000)}k`}
                          />
                          <Tooltip 
                            formatter={(val: any) => formatCurrency(Number(val || 0))}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#D1FC00" 
                            strokeWidth={4} 
                            dot={{ r: 4, fill: 'white', strokeWidth: 2, stroke: "#D1FC00" }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                      </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic">
                      Belum ada data tren yang mencukupi.
                  </div>
              )}
          </div>
      </div>

      {/* Premium Export Section */}
      <div className="p-8 rounded-[2.5rem] bg-secondary text-secondary-foreground shadow-sm border border-border/40 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <DownloadCloud className="w-32 h-32" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-md">
                <h3 className="text-2xl font-bold mb-2">Ekspor Laporan Cerdas</h3>
                <p className="text-secondary-foreground/70 text-sm">
                  Unduh ringkasan analisis keuangan Anda lengkap dengan tabel rincian transaksi berdasarkan filter yang aktif.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
                <Button 
                  onClick={handleExportPDF}
                  className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 border-white/10 text-white font-bold gap-2 flex-col sm:flex-row"
                >
                  <FileText className="w-5 h-5 text-red-300" />
                  PDF
                </Button>
                <Button 
                  onClick={handleExportExcel}
                  className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 border-white/10 text-white font-bold gap-2 flex-col sm:flex-row"
                >
                  <FileSpreadsheet className="w-5 h-5 text-green-300" />
                  Excel
                </Button>
                <Button 
                  onClick={handleExportCSV}
                  className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 border-white/10 text-white font-bold gap-2 flex-col sm:flex-row"
                >
                  <FileIcon className="w-5 h-5 text-blue-300" />
                  CSV
                </Button>
              </div>
          </div>
      </div>
    </div>
  );
}
