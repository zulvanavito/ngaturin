"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
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
import { DownloadCloud, PieChart as PieChartIcon, FileText, FileSpreadsheet, FileIcon, TrendingUp, Wallet as WalletIcon, UploadCloud, HardDrive, RefreshCw } from "lucide-react";
import type { Transaction } from "@/components/transaction-form";
import { formatCurrency } from "@/components/balance-card";
import { useWallets } from "@/hooks/use-wallets";

interface AnalyticsSectionProps {
  transactions: Transaction[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))", "hsl(var(--chart-7))"];

export function AnalyticsSection({ transactions }: AnalyticsSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [trendInterval, setTrendInterval] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [backupLoading, setBackupLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const { wallets } = useWallets();
  const totalWalletBalance = useMemo(() => wallets.reduce((acc, w) => acc + (w.balance || 0), 0), [wallets]);

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

  const handleExportExcel = async () => {
    if (filteredTransactions.length === 0) return;
    
    try {
      const data = filteredTransactions.map(tx => ({
        Tanggal: new Date(tx.date).toLocaleDateString('id-ID'),
        Kategori: tx.category,
        Deskripsi: tx.description,
        Tipe: tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        Jumlah: tx.amount
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Transaksi");
      
      worksheet.columns = [
        { header: "Tanggal", key: "Tanggal", width: 15 },
        { header: "Kategori", key: "Kategori", width: 20 },
        { header: "Deskripsi", key: "Deskripsi", width: 30 },
        { header: "Tipe", key: "Tipe", width: 15 },
        { header: "Jumlah", key: "Jumlah", width: 15 },
      ];

      worksheet.addRows(data);
      
      // Style the header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F1E32' } // naval blue
      };
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `laporan_pengatur_keuangan_${selectedMonth === 'all' ? 'semua' : selectedMonth}.xlsx`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
        headStyles: { fillColor: [15, 30, 50] } // naval blue
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

  const trendData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    
    const grouped = expenses.reduce((acc, tx) => {
      const d = new Date(tx.date);
      let key = "";
      if (trendInterval === "daily") {
        key = tx.date;
      } else if (trendInterval === "weekly") {
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
      } else if (trendInterval === "monthly") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = String(d.getFullYear());
      }
      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([date, amount]) => ({ date, amount }));
  }, [transactions, trendInterval]);

  const formatTrendTick = (tickItem: any) => {
    if (!tickItem || typeof tickItem !== 'string') return "";
    if (trendInterval === "daily") {
      const d = new Date(tickItem);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }
    if (trendInterval === "weekly") {
      const [year, week] = tickItem.split("-W");
      return `Mg ${week} ${year}`;
    }
    if (trendInterval === "monthly") {
      const [year, month] = tickItem.split("-");
      const d = new Date(Number(year), Number(month) - 1);
      return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    }
    return tickItem;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Chart Section */}
      <div className="md:col-span-2 border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] p-6 flex flex-col h-full min-h-[400px]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-expense/10 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-expense" />
          </div>
          <h2 className="text-lg font-semibold">Pengeluaran per Kategori</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center -ml-4 min-w-0">
          {expenseData.filter(d => d.value > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <PieChart>
                <Pie
                  data={expenseData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (percent === undefined || midAngle === undefined) return null;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    return percent > 0.05 ? (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold font-sans drop-shadow-md">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {expenseData.filter(d => d.value > 0).map((entry, index) => {
                    // Match original color index based on the full array, or just use sequence
                    const originalIndex = expenseData.findIndex(e => e.name === entry.name);
                    return <Cell key={`cell-${index}`} fill={COLORS[originalIndex % COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(24, 24, 27, 0.9)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={48} 
                  iconType="circle"
                  formatter={(value, entry: any) => {
                    const total = expenseData.reduce((sum, item) => sum + item.value, 0);
                    const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
                    return (
                      <span className="text-sm font-medium ml-1 text-foreground inline-flex items-center gap-1">
                        {value} <span className="text-xs text-muted-foreground">({percent}%)</span>
                      </span>
                    );
                  }}
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
      <div className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-medium mb-4 text-sm tracking-wide text-muted-foreground uppercase">Filter Data</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bulan Laporan</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent position="popper">
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
            className="w-full h-11 bg-primary hover:brightness-110 text-primary-foreground border-0 rounded-xl shadow-md"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Unduh Laporan PDF
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleExportExcel} 
              disabled={filteredTransactions.length === 0}
              className="w-full h-11 bg-secondary hover:brightness-110 text-secondary-foreground border-0 rounded-xl shadow-md"
              variant="outline"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button 
              onClick={handleExportCSV} 
              disabled={filteredTransactions.length === 0}
              className="w-full h-11 rounded-xl"
              variant="outline"
            >
              <FileIcon className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] p-6 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-expense/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-expense" />
              </div>
              <h2 className="text-lg font-semibold">Tren Pengeluaran</h2>
            </div>
            <Select value={trendInterval} onValueChange={(v: any) => setTrendInterval(v)}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 -ml-6 mt-2">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatTrendTick} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(value) => value === 0 ? "0" : `Rp${(value/1000).toLocaleString('id-ID')}k`} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value)), "Pengeluaran"]}
                    labelFormatter={formatTrendTick}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(24, 24, 27, 0.9)' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6B93D6" 
                    strokeWidth={3} 
                    dot={{ fill: '#6B93D6', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-2 min-h-[300px]">
                <TrendingUp className="w-8 h-8 opacity-20" />
                <p>Belum ada data tren pengeluaran</p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Analytics */}
        <div className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] p-6 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-income/10 flex items-center justify-center">
              <WalletIcon className="w-4 h-4 text-income" />
            </div>
            <h2 className="text-lg font-semibold">Analitik Dompet</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {wallets.length > 0 ? (
              wallets.map(w => (
                <div key={w.id} className="p-4 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <span className="text-xl">{w.icon || "💳"}</span>
                      {w.name}
                    </span>
                    <span className="font-semibold">{formatCurrency(w.balance || 0)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" 
                      style={{ width: `${totalWalletBalance > 0 ? Math.max(0, Math.min(100, ((w.balance || 0) / totalWalletBalance) * 100)) : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {totalWalletBalance > 0 ? (((w.balance || 0) / totalWalletBalance) * 100).toFixed(1) : 0}% dari total
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-2 min-h-[300px]">
                <WalletIcon className="w-8 h-8 opacity-20" />
                <p>Belum ada dompet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Backup &amp; Pemulihan Data</h2>
            <p className="text-xs text-muted-foreground">Ekspor semua data ke JSON atau impor dari backup sebelumnya.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
            <h3 className="text-sm font-medium mb-1">📦 Ekspor Backup</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Unduh semua transaksi, anggaran, dompet, tagihan, dan utang/piutang dalam satu file JSON.
            </p>
            <Button
              className="w-full h-11 gap-2 bg-primary hover:brightness-110 text-primary-foreground border-0 rounded-xl shadow-md"
              disabled={backupLoading}
              onClick={async () => {
                setBackupLoading(true);
                try {
                  const res = await fetch("/api/backup");
                  const data = await res.json();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ngaturin_backup_${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } finally { setBackupLoading(false); }
              }}
            >
              {backupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
              {backupLoading ? "Menyiapkan..." : "Unduh Backup JSON"}
            </Button>
          </div>

          {/* Import JSON */}
          <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
            <h3 className="text-sm font-medium mb-1">🔄 Impor Transaksi</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Import transaksi dari file backup JSON. Data lain (anggaran, dompet, dll) tidak akan diubah.
            </p>
            {importResult && (
              <p className="text-xs text-income mb-2">{importResult}</p>
            )}
            <label className="w-full cursor-pointer">
              <div className={`w-full h-11 rounded-xl border border-input bg-secondary hover:brightness-110 text-secondary-foreground shadow-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                importLoading ? "opacity-50 pointer-events-none" : ""
              }`}>
                {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {importLoading ? "Mengimpor..." : "Pilih File Backup"}
              </div>
              <input
                type="file"
                accept=".json"
                className="hidden"
                disabled={importLoading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImportLoading(true);
                  setImportResult(null);
                  try {
                    const text = await file.text();
                    const json = JSON.parse(text);
                    const res = await fetch("/api/backup", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ transactions: json.transactions || [] }),
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error);
                    setImportResult(`✅ ${result.imported} transaksi berhasil diimpor!`);
                  } catch (err: any) {
                    setImportResult(`❌ Gagal: ${err.message}`);
                  } finally {
                    setImportLoading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
