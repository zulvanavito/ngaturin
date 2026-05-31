"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Wallet as WalletIcon, 
  ArrowLeft, 
  PieChart as PieChartIcon,
  FileText,
  FileSpreadsheet,
  FileIcon,
  DownloadCloud,
  HandCoins,
  Briefcase,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInsights } from "@/hooks/use-insights";
import { InsightsFilters } from "@/components/insights/insights-filters";
import { InsightsHero } from "@/components/insights/insights-hero";
import { InsightMetricCards } from "@/components/insights/insight-metric-cards";
import { formatCurrency } from "@/components/finance/balance-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import type { Transaction } from "@/types/finance";

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

interface InsightsClientViewProps {
  initialTransactions: Transaction[];
}

export function InsightsClientView({ initialTransactions: transactions }: InsightsClientViewProps) {
  const [chartsReady, setChartsReady] = useState(false);
  
  // States for filters
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWallet, setSelectedWallet] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("insights");
  const [trendInterval, setTrendInterval] = useState<TrendInterval>("daily");

  useEffect(() => {
    // Technical tick to ensure DOM is settled before Recharts calculation
    const timer = setTimeout(() => setChartsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { 
    filteredTransactions, summary, globalSummary, aiNarrative, isAiLoading,
    investments, debts, bills
  } = useInsights(
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
      grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Grouped data for Trend Chart
  const trendData = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    const trendFilteredTxs = filteredTransactions.filter(t => {
      if (selectedType === "all") return t.type === "expense";
      return true;
    });

    trendFilteredTxs.forEach(t => {
      const dateToken = new Date(t.date);
      if (isNaN(dateToken.getTime())) return;

      let key = "";
      if (trendInterval === "daily") {
        key = t.date;
      } else if (trendInterval === "weekly") {
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

      worksheet.mergeCells('A1:E1');
      worksheet.getCell('A1').value = "RINGKASAN SMART ANALYTICS";
      worksheet.getCell('A1').font = { bold: true, size: 14 };

      worksheet.getCell('A2').value = "Total Pemasukan";
      worksheet.getCell('B2').value = summary.totalIncome;
      worksheet.getCell('A3').value = "Total Pengeluaran";
      worksheet.getCell('B3').value = summary.totalExpense;
      worksheet.getCell('A4').value = "Sisa Saldo (Net)";
      worksheet.getCell('B4').value = summary.netCashflow;
      
      ['B2', 'B3', 'B4'].forEach(cell => worksheet.getCell(cell).numFmt = '#,##0');

      worksheet.getCell('A6').value = "STATUS ASET & KEWAJIBAN (REAL-TIME)";
      worksheet.getCell('A6').font = { bold: true };
      
      worksheet.getCell('A7').value = "Total Investasi";
      worksheet.getCell('B7').value = investments.reduce((sum, i) => sum + Number(i.current_value), 0);
      worksheet.getCell('A8').value = "Total Utang Aktif";
      worksheet.getCell('B8').value = debts.filter(d => !d.is_settled && d.type === 'hutang').reduce((sum, d) => sum + d.amount, 0);
      worksheet.getCell('A9').value = "Total Piutang Aktif";
      worksheet.getCell('B9').value = debts.filter(d => !d.is_settled && d.type === 'piutang').reduce((sum, d) => sum + d.amount, 0);
      worksheet.getCell('A10').value = "Total Tagihan Rutin";
      worksheet.getCell('B10').value = bills.filter(b => b.is_active).reduce((sum, b) => sum + b.amount, 0);
      
      ['B7', 'B8', 'B9', 'B10'].forEach(cell => worksheet.getCell(cell).numFmt = '#,##0');

      worksheet.getRow(12).values = ["Tanggal", "Kategori", "Deskripsi", "Tipe", "Jumlah"];
      worksheet.getRow(12).font = { bold: true };
      worksheet.getRow(12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9FE870' } };

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
      
      doc.setFontSize(22);
      doc.setTextColor(44, 47, 48);
      doc.text("Laporan Smart Analytics", 14, 25);
      
      doc.setFontSize(10);
      doc.text(`Periode: ${selectedMonth === 'all' ? 'Semua Waktu' : selectedMonth} | Tipe: ${selectedType === 'all' ? 'Semua' : selectedType}`, 14, 32);

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

      doc.setFontSize(12);
      doc.setTextColor(44, 47, 48);
      doc.text("Status Aset & Kewajiban (Real-time)", 14, 80);
      
      doc.setFillColor(230, 240, 255); 
      doc.roundedRect(14, 85, 85, 20, 2, 2, "F");
      doc.setFontSize(8);
      doc.text("TOTAL INVESTASI", 18, 92);
      doc.setFontSize(11);
      doc.text(formatCurrency(investments.reduce((sum, i) => sum + Number(i.current_value), 0)), 18, 100);

      doc.setFillColor(255, 240, 240); 
      doc.roundedRect(105, 85, 85, 20, 2, 2, "F");
      doc.setFontSize(8);
      doc.text("TOTAL UTANG AKTIF", 109, 92);
      doc.setFontSize(11);
      doc.text(formatCurrency(debts.filter(d => !d.is_settled && d.type === 'hutang').reduce((sum, d) => sum + d.amount, 0)), 109, 100);

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
        startY: 115,
        theme: 'grid',
        headStyles: { fillColor: [209, 252, 0], textColor: [44, 47, 48], fontStyle: 'bold' },
        styles: { fontSize: 9 }
      });

      doc.save(`laporan_analitik_${selectedMonth}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <div className="flex items-center justify-center">
            <TabsList className="bg-white/70 backdrop-blur-2xl border-none p-1 rounded-[2.5rem] h-16 shadow-[0_20px_50px_rgba(44,47,48,0.05)] flex items-center w-full max-w-xl">
                <TabsTrigger 
                    value="insights" 
                    className="flex-1 rounded-[2rem] h-full data-[state=active]:bg-primary data-[state=active]:text-secondary data-[state=active]:shadow-lg transition-all duration-300 font-bold text-base flex items-center justify-center gap-3"
                >
                    <Sparkles className="w-5 h-5" />
                    Smart Insights
                </TabsTrigger>
                <TabsTrigger 
                    value="assets" 
                    className="flex-1 rounded-[2rem] h-full data-[state=active]:bg-primary data-[state=active]:text-secondary data-[state=active]:shadow-lg transition-all duration-300 font-bold text-base flex items-center justify-center gap-3"
                >
                    <Briefcase className="w-5 h-5" />
                    Aset & Kewajiban
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="insights" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none mt-0">
          <InsightsHero narrative={aiNarrative} isLoading={isAiLoading} />
          <InsightMetricCards summary={summary} globalSummary={globalSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-card border-none shadow-[0_20px_50px_rgba(44,47,48,0.04)] flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-secondary">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">
              {selectedType === "income" ? "Sumber Pemasukan" : selectedType === "expense" ? "Alokasi Pengeluaran" : "Distribusi Kategori"}
            </h3>
          </div>
          
          <div className="flex-1 min-h-0">
            {chartsReady && pieData.length > 0 && activeTab === 'insights' ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                    formatter={(value: number | string) => formatCurrency(Number(value))}
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

      <div className="p-8 rounded-[2.5rem] bg-white dark:bg-card border-none shadow-[0_20px_50px_rgba(44,47,48,0.04)] min-h-[450px] flex flex-col">
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
              {chartsReady && trendData.length > 0 && activeTab === 'insights' ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                              } catch {
                                // ignore
                              }
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
                            formatter={(val: number | string) => formatCurrency(Number(val || 0))}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#9fe870" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: 'white', strokeWidth: 2, stroke: "#9fe870" }}
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
      </TabsContent>

        <TabsContent value="assets" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-card border-none shadow-[0_25px_60px_rgba(44,47,48,0.05)] flex flex-col min-h-[400px] relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Portofolio Investasi</h3>
                </div>
                <Link href="/dashboard/investments">
                  <Button variant="ghost" size="sm" className="rounded-xl text-primary font-bold hover:bg-primary/5">Kelola</Button>
                </Link>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-bold">Total Nilai Aset</p>
                  <p className="text-4xl font-extrabold text-foreground">
                    {formatCurrency(investments.reduce((sum, i) => sum + Number(i.current_value || 0), 0))}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <UIBadge variant="secondary" className="bg-success/10 text-success border-success/20 font-bold px-3 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {((investments.reduce((sum, i) => sum + (Number(i.current_value) - Number(i.total_invested)), 0) / Math.max(1, investments.reduce((sum, i) => sum + Number(i.total_invested), 0))) * 100).toFixed(2)}%
                    </UIBadge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/40">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold mb-1">Total Modal</p>
                    <p className="text-sm font-bold">{formatCurrency(investments.reduce((sum, i) => sum + Number(i.total_invested || 0), 0))}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold mb-1">Total Keuntungan</p>
                    <p className="text-sm font-bold text-success">
                      +{formatCurrency(investments.reduce((sum, i) => sum + (Number(i.current_value) - Number(i.total_invested)), 0))}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 pt-4">
                  <p className="text-xs text-muted-foreground mb-4 font-bold uppercase tracking-widest">Alokasi Aset</p>
                  <div className="h-40 min-h-0">
                    {chartsReady && activeTab === 'assets' && (
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={Object.entries(investments.reduce((acc, i) => {
                            acc[i.type] = (acc[i.type] || 0) + Number(i.current_value);
                            return acc;
                          }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}
                          cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value"
                        >
                          {investments.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number | string | undefined) => formatCurrency(Number(v ?? 0))} />
                      </PieChart>
                    </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-card border-none shadow-[0_25px_60px_rgba(44,47,48,0.05)] flex flex-col min-h-[400px] relative overflow-hidden group">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <HandCoins className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Utang & Piutang</h3>
                </div>
                <Link href="/dashboard/debts">
                  <Button variant="ghost" size="sm" className="rounded-xl text-primary font-bold hover:bg-primary/5">Kelola</Button>
                </Link>
              </div>

              <div className="space-y-10">
                <div className="relative p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 group overflow-hidden">
                   <TrendingDown className="absolute -right-6 -bottom-6 w-32 h-32 text-red-500 opacity-5 group-hover:scale-110 transition-transform" />
                   <p className="text-xs text-red-600 font-extrabold uppercase tracking-widest mb-1">Total Utang Aktif</p>
                   <p className="text-3xl font-black text-red-500">
                    {formatCurrency(debts.filter(d => !d.is_settled && d.type === "hutang").reduce((sum, d) => sum + Number(d.amount), 0))}
                   </p>
                   <p className="text-[10px] text-muted-foreground mt-2 font-medium">Dari {debts.filter(d => !d.is_settled && d.type === "hutang").length} catatan yang belum lunas</p>
                </div>

                <div className="relative p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 group overflow-hidden">
                   <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500 opacity-5 group-hover:scale-110 transition-transform" />
                   <p className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest mb-1">Total Piutang Aktif</p>
                   <p className="text-3xl font-black text-emerald-500">
                    {formatCurrency(debts.filter(d => !d.is_settled && d.type === "piutang").reduce((sum, d) => sum + Number(d.amount), 0))}
                   </p>
                   <p className="text-[10px] text-muted-foreground mt-2 font-medium">Dari {debts.filter(d => !d.is_settled && d.type === "piutang").length} orang berhutang ke kamu</p>
                </div>

                <div className="flex items-center justify-between px-4 pt-4 border-t border-border/40">
                  <span className="text-sm font-bold text-muted-foreground">Posisi Bersih</span>
                  <span className={`text-lg font-black ${
                      debts.reduce((sum, d) => sum + (d.type === 'piutang' ? d.amount : -d.amount), 0) >= 0 ? "text-primary" : "text-expense"
                  }`}>
                    {formatCurrency(debts.reduce((sum, d) => !d.is_settled ? (d.type === 'piutang' ? d.amount : -d.amount) : 0, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Bills Section */}
          <div className="p-8 rounded-[2.5rem] bg-secondary text-secondary-foreground shadow-[0_30px_70px_rgba(81,98,0,0.15)] border-none overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Bell className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Bell className="w-6 h-6" /> Tagihan Rutin
                  </h3>
                  <p className="text-secondary-foreground/70 text-sm mt-1">Total komitmen bulanan: **{formatCurrency(bills.filter(b => b.is_active).reduce((sum, b) => sum + b.amount, 0))}**</p>
                </div>
                <Link href="/dashboard/bills">
                  <Button className="rounded-xl bg-white/10 hover:bg-white/20 border-white/10 text-white font-bold h-12 px-6">Lengkap</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {bills.filter(b => b.is_active).sort((a,b) => a.due_day - b.due_day).slice(0, 4).map(bill => (
                  <div key={bill.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between h-32 hover:bg-white/10 transition-all cursor-default group/card">
                    <div>
                      <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-1">Tgl {bill.due_day}</p>
                      <p className="font-bold text-sm truncate">{bill.name}</p>
                    </div>
                    <p className="text-lg font-black group-hover/card:scale-105 transition-transform origin-left">{formatCurrency(bill.amount)}</p>
                  </div>
                ))}
                {bills.filter(b => b.is_active).length === 0 && (
                   <div className="col-span-full py-10 text-center opacity-40 italic text-sm">Belum ada tagihan rutin yang aktif.</div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
