"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TransactionForm, type Transaction } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { AnalyticsSection } from "@/components/analytics-section";
import { BudgetSection } from "@/components/budget-section";
import { BudgetSnapshot } from "@/components/budget-snapshot";
import { BillReminderBanner } from "@/components/bill-reminder-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, BarChart3, History, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSummaryCard } from "@/components/dashboard-summary-card";
import { DashboardProgressCard } from "@/components/dashboard-progress-card";
import { DashboardCalendarCard } from "@/components/dashboard-calendar-card";
import { DashboardRecentTx } from "@/components/dashboard-recent-tx";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userName, setUserName] = useState("Pengguna");

  const fetchUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name.split(' ')[0]);
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }
  };

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
    fetchUser();
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
  
  const remainingBudget = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

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
        <div className="w-12 h-12 rounded-2xl bg-brand-naval/10 flex items-center justify-center animate-pulse">
           <span className="text-brand-naval font-bold text-xl pt-0.5">N.</span>
        </div>
        <p className="text-muted-foreground font-medium text-sm">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      <BillReminderBanner />

      {!showForm && !editingTransaction && (
         <div className="flex justify-start sm:justify-end mb-4">
           <Button
             onClick={() => { setShowForm(prev => !prev); setEditingTransaction(null); }}
             className="w-full sm:w-auto h-12 sm:h-10 rounded-xl sm:rounded-[1rem] bg-brand-naval hover:bg-blue-900 text-white shadow-md px-4 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
           >
             <Plus className="w-5 h-5 sm:w-4 sm:h-4 stroke-[3px]" />
             <span className="font-semibold">Tambah Transaksi Baru</span>
           </Button>
         </div>
      )}

      {(showForm || editingTransaction) && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 mb-6 bg-white dark:bg-card p-6 rounded-[2rem] border border-border/40 shadow-sm">
          <TransactionForm
            key={editingTransaction?.id || "new"}
            editingTransaction={editingTransaction}
            onCancel={() => { setEditingTransaction(null); setShowForm(false); }}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      <div className="tour-balance">
        <DashboardSummaryCard 
           remainingBudget={remainingBudget}
           totalIncome={totalIncome}
           totalExpense={totalExpense}
           userName={userName}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="tour-tabs w-full mt-8">
        <TabsList className="w-full mb-6 h-auto rounded-[1.5rem] bg-muted/30 border border-border/40 p-1.5 flex flex-wrap sm:grid sm:grid-cols-4 gap-2">
          <TabsTrigger value="overview" className="rounded-xl font-semibold flex items-center gap-2 shrink-0 sm:shrink px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="text-sm whitespace-nowrap">Ringkasan</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl font-semibold flex items-center gap-2 shrink-0 sm:shrink px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="text-sm whitespace-nowrap">Analitik</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="rounded-xl font-semibold flex items-center gap-2 shrink-0 sm:shrink px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
            <Target className="w-4 h-4 shrink-0" />
            <span className="text-sm whitespace-nowrap">Anggaran</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl font-semibold flex items-center gap-2 shrink-0 sm:shrink px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
            <History className="w-4 h-4 shrink-0" />
            <span className="text-sm whitespace-nowrap">Riwayat</span>
          </TabsTrigger>
        </TabsList>

      
        <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
           
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              
              <div className="tour-quick-stats grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-[1.5rem] bg-white dark:bg-card border border-border/40 p-4 sm:p-5 shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Total Transaksi</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{nonTransferTxs.length}</p>
                </div>
                <div className="rounded-[1.5rem] bg-income/10 border border-income/20 p-4 sm:p-5 shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Masuk</p>
                  <p className="text-xl sm:text-2xl font-bold text-income">
                    {nonTransferTxs.filter(t => t.type === "income").length}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-expense/10 border border-expense/20 p-4 sm:p-5 shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Keluar</p>
                  <p className="text-xl sm:text-2xl font-bold text-expense">
                    {nonTransferTxs.filter(t => t.type === "expense").length}
                  </p>
                </div>
              </div>

              <DashboardProgressCard transactions={transactions} />

              <DashboardCalendarCard transactions={transactions} />
              
            </div>

            {/* Right Column (Budget Snapshot + Recent Tx) */}
            <div className="lg:col-span-1 space-y-6 sm:space-y-8">
              <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-bold text-foreground">Sekilas Anggaran</h3>
                </div>
                <BudgetSnapshot
                  transactions={transactions}
                  onSeeAll={() => setActiveTab("budget")}
                />
              </div>

              <DashboardRecentTx transactions={transactions} />
            </div>
          </div>
        </TabsContent>

        {/* Analitik Tab */}
        <TabsContent value="analytics" className="mt-0 focus-visible:outline-none focus-visible:ring-0 bg-white dark:bg-card rounded-[2rem] border border-border/40 p-4 sm:p-6 shadow-sm">
          <AnalyticsSection transactions={transactions} />
        </TabsContent>

        {/* Anggaran Tab */}
        <TabsContent value="budget" className="mt-0 focus-visible:outline-none focus-visible:ring-0 bg-white dark:bg-card rounded-[2rem] border border-border/40 p-4 sm:p-6 shadow-sm">
          <BudgetSection transactions={transactions} />
        </TabsContent>

        {/* Riwayat Tab */}
        <TabsContent value="history" className="mt-0 focus-visible:outline-none focus-visible:ring-0 bg-white dark:bg-card rounded-[2rem] border border-border/40 p-4 sm:p-6 shadow-sm">
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
