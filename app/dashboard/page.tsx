"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TransactionForm, type Transaction } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { AnalyticsSection } from "@/components/analytics-section";
import { BudgetSection } from "@/components/budget-section";
import { BudgetSnapshot } from "@/components/budget-snapshot";
import { BalanceCard } from "@/components/balance-card";
import { BillReminderBanner } from "@/components/bill-reminder-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, BarChart3, History, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
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

  const totalIncome = useMemo(() =>
    transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const totalExpense = useMemo(() =>
    transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  // Non-transfer transactions for stats (exclude transfers from income/expense counts)
  const nonTransferTxs = useMemo(() => transactions.filter(t => t.type !== "transfer"), [transactions]);

  const handleSuccess = () => {
    setEditingTransaction(null);
    setShowForm(false);
    fetchTransactions();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    setActiveTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Pantau, analisa, dan kelola keuanganmu
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(prev => !prev); setEditingTransaction(null); }}
          className="gradient-primary text-white gap-2 h-10"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Transaksi</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      {/* Bill Reminder Banner */}
      <BillReminderBanner />

      {/* Balance Summary Cards */}
      <BalanceCard totalIncome={totalIncome} totalExpense={totalExpense} />

      {/* Inline Add / Edit Form */}
      {(showForm || editingTransaction) && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <TransactionForm
            key={editingTransaction?.id || "new"}
            editingTransaction={editingTransaction}
            onCancel={() => { setEditingTransaction(null); setShowForm(false); }}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 h-12 rounded-2xl bg-muted/50 border border-border/30 p-1">
          <TabsTrigger value="overview" className="rounded-xl text-sm font-medium flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Ringkasan</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analitik</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="rounded-xl text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Anggaran</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl text-sm font-medium flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Riwayat</span>
          </TabsTrigger>
        </TabsList>

        {/* Ringkasan Tab */}
        <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Stats + Recent transactions */}
            <div className="lg:col-span-2 space-y-4">
              {/* At-a-glance stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-card/60 border border-border/40 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Transaksi Total</p>
                  <p className="text-2xl font-bold">{nonTransferTxs.length}</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Pemasukan</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {nonTransferTxs.filter(t => t.type === "income").length} transaksi
                  </p>
                </div>
                <div className="rounded-2xl bg-rose-500/5 border border-rose-500/15 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Pengeluaran</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {nonTransferTxs.filter(t => t.type === "expense").length} transaksi
                  </p>
                </div>
              </div>

              {/* 5 most recent transactions preview */}
              <div className="rounded-2xl bg-card/60 border border-border/40 overflow-hidden">
                <div className="p-5 border-b border-border/30 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Transaksi Terbaru</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">5 transaksi terakhir</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setActiveTab("history")}>
                    Lihat Semua →
                  </Button>
                </div>
                <div className="divide-y divide-border/30">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Belum ada transaksi. Mulai tambahkan di atas!
                    </div>
                  ) : (
                    transactions.slice(0, 5).map((tx) => {
                      const icons: Record<string, string> = { Makanan: "🍔", Transport: "🚗", Belanja: "🛍️", Tagihan: "📄", Gaji: "💰", Lainnya: "📦", Transfer: "⇄" };
                      const isTransfer = tx.type === "transfer";
                      return (
                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                          <span className="text-xl">{icons[tx.category] || "📦"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{tx.category} · {new Date(tx.date).toLocaleDateString("id-ID", {day:"numeric", month:"short"})}</p>
                          </div>
                          <span className={`text-sm font-semibold ${
                            isTransfer ? "text-blue-500" :
                            tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}>
                            {isTransfer ? "⇄" : tx.type === "income" ? "+" : "-"}{new Intl.NumberFormat("id-ID", {style:"currency", currency:"IDR", minimumFractionDigits:0}).format(tx.amount)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right: Budget Snapshot */}
            <div className="lg:col-span-1">
              <BudgetSnapshot
                transactions={transactions}
                onSeeAll={() => setActiveTab("budget")}
              />
            </div>
          </div>
        </TabsContent>

        {/* Analitik Tab */}
        <TabsContent value="analytics" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <AnalyticsSection transactions={transactions} />
        </TabsContent>

        {/* Anggaran Tab */}
        <TabsContent value="budget" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <BudgetSection transactions={transactions} />
        </TabsContent>

        {/* Riwayat Tab */}
        <TabsContent value="history" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
