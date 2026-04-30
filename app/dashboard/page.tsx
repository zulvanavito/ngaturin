"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TransactionForm, type Transaction } from "@/components/finance/transaction-form";
import { BudgetSnapshot } from "@/components/budgets/budget-snapshot";
import { useRouter } from "next/navigation";
import { BillReminderBanner } from "@/components/bills/bill-reminder-banner";
import { 
  Plus, TrendingUp, TrendingDown, Landmark, HandCoins, 
  ArrowRight, Loader2, Search, Bell, Settings, 
  Wallet, Send, History, MoreHorizontal, 
  Zap, CreditCard, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCalendarCard } from "@/components/dashboard/dashboard-calendar-card";
import { DashboardRecentTx } from "@/components/dashboard/dashboard-recent-tx";
import { GoalsSnapshot } from "@/components/goals/goals-snapshot";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

interface Debt {
  id: string;
  type: "owe" | "owed";
  amount: number;
  is_settled: boolean;
}

interface Investment {
  id: string;
  name: string;
  current_value: number;
  total_invested: number;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  icon: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [userName, setUserName] = useState("Pengguna");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name);
    } else if (user?.email) {
      setUserName(user.email.split("@")[0]);
      setUserEmail(user.email);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);

  const fetchDebts = useCallback(async () => {
    try {
      const res = await fetch("/api/debts");
      if (!res.ok) return;
      const data = await res.json();
      setDebts(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }, []);

  const fetchInvestments = useCallback(async () => {
    try {
      const res = await fetch("/api/investments");
      if (!res.ok) return;
      const data = await res.json();
      setInvestments(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }, []);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await fetch("/api/wallets");
      if (!res.ok) return;
      const data = await res.json();
      setWallets(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUser(),
        fetchTransactions(),
        fetchDebts(),
        fetchInvestments(),
        fetchWallets(),
      ]);
      setIsLoading(false);
    };
    loadAll();
  }, [fetchUser, fetchTransactions, fetchDebts, fetchInvestments, fetchWallets]);

  // --- Calculations ---
  // Hoist date values into useMemo — avoids recreation every render (server-hoist-static-io)
  const { currentMonth, currentYear } = useMemo(() => {
    const today = new Date();
    return { currentMonth: today.getMonth(), currentYear: today.getFullYear() };
  }, []);

  const monthlyTransactions = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type !== "transfer";
    }), [transactions, currentMonth, currentYear]);

  const totalIncome = useMemo(() =>
    monthlyTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0),
    [monthlyTransactions]);

  const totalExpense = useMemo(() =>
    monthlyTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0),
    [monthlyTransactions]);

  // Remove over-memoization for simple primitives (rerender-simple-expression-in-memo)
  const activeDebts = useMemo(() => debts.filter(d => !d.is_settled), [debts]);
  const totalOwed = activeDebts.filter(d => d.type === "owe").reduce((s, d) => s + Number(d.amount), 0);
  const totalReceivable = activeDebts.filter(d => d.type === "owed").reduce((s, d) => s + Number(d.amount), 0);
  const netDebt = totalReceivable - totalOwed;

  const totalInvestmentValue = investments.reduce((s, i) => s + Number(i.current_value), 0);
  const totalWalletBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const totalWealth = totalWalletBalance + totalInvestmentValue + netDebt;

  
  // --- Chart Data: Last 7 Days ---
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      
      const dayIncome = transactions
        .filter(t => t.date === dateStr && t.type === "income")
        .reduce((s, t) => s + Number(t.amount), 0);
      const dayExpense = transactions
        .filter(t => t.date === dateStr && t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0);
        
      days.push({ name: dayName, Income: dayIncome, Expense: dayExpense, Savings: Math.max(0, dayIncome - dayExpense) });
    }
    return days;
  }, [transactions]);

  // --- Health Gauge Logic ---
  const healthValue = useMemo(() => {
    if (totalIncome === 0) return 0;
    const ratio = (totalIncome - totalExpense) / totalIncome;
    return Math.min(Math.max(Math.round(ratio * 100), 0), 100);
  }, [totalIncome, totalExpense]);

  const handleSuccess = () => {
    setEditingTransaction(null);
    setShowForm(false);
    fetchTransactions();
    fetchWallets();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-sm">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* 1. TOP HEADER (Search, Notifications, Profile) */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="w-full h-11 pl-10 pr-4 bg-white dark:bg-card border border-border/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-card border border-border/40"><Bell className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-card border border-border/40"><Settings className="w-4 h-4" /></Button>
          <div className="flex items-center gap-3 pl-2 border-l border-border/40 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">{userName}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{userEmail || "Personal Account"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#9fe870] flex items-center justify-center font-bold text-[#163300]">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN GRID LAYOUT (12 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT & CENTER CONTENT (8 COLUMNS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TOP ROW: Balance Chart & Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Balance Chart Card (2/3) */}
            <div className="md:col-span-2 bg-white dark:bg-card rounded-[2rem] border border-border/40 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Balance</p>
                  <h2 className="text-3xl font-black tracking-tight" style={{ fontFeatureSettings: '"calt"' }}>
                    {formatCurrency(totalWealth)}
                  </h2>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full text-[10px] font-bold">
                  <span>7d</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#888' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="Savings" fill="#9fe870" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Income" fill="#e2f6d5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expense" fill="#0e0f0c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                {["Savings", "Income", "Expense"].map((key, i) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#9fe870]' : i === 1 ? 'bg-[#e2f6d5]' : 'bg-[#0e0f0c]'}`} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Summary Stats (1/3) */}
            <div className="space-y-4">
              {[
                { label: "Total Income", amount: totalIncome, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Total Expenses", amount: totalExpense, color: "text-rose-500", bg: "bg-rose-500/10" },
                { label: "Saved Balance", amount: totalIncome - totalExpense, color: "text-primary", bg: "bg-primary/10" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-card rounded-3xl border border-border/40 p-5 shadow-sm flex flex-col justify-between h-[100px]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-xl font-black">{formatCurrency(stat.amount)}</h3>
                    {i < 2 && <span className={`text-[10px] font-bold ${stat.color} ${stat.bg} px-2 py-0.5 rounded-full`}>+5.1%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE ROW: Spending Limit & Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Monthly spending limit</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Settings className="w-3 h-3" /></Button>
              </div>
              <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-[#9fe870] rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min((totalExpense / (totalIncome || 1)) * 100, 100)}%` }} 
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>{formatCurrency(totalExpense)}</span>
                <span>{formatCurrency(totalIncome)}</span>
              </div>
            </div>

            <div className="bg-[#0e0f0c] text-white rounded-[2rem] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                <Zap className="w-20 h-20 fill-[#9fe870] text-[#9fe870]" />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-sm mb-1 text-[#9fe870]">Optimize your budget</h3>
                <p className="text-[10px] text-white/50 mb-4 max-w-[200px]">Start preparing for the 2025 tax season by saving 10-15% for deductions.</p>
                <Link href="/dashboard/insights" className="text-[10px] font-bold flex items-center gap-1 hover:text-[#9fe870] transition-colors">
                  Read more <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Cost Analysis, Health, Goals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cost Analysis */}
            <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-5">
              <h3 className="font-bold text-sm mb-4">Cost analysis</h3>
              <h2 className="text-2xl font-black mb-4">{formatCurrency(totalExpense)}</h2>
              <div className="space-y-3">
                <BudgetSnapshot transactions={transactions} onSeeAll={() => router.push("/dashboard/budgets")} />
              </div>
            </div>

            {/* Financial Health */}
            <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-5 flex flex-col items-center">
              <h3 className="font-bold text-sm self-start mb-6">Financial health</h3>
              <div className="relative w-full aspect-square max-w-[180px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ value: healthValue }, { value: 100 - healthValue }]}
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      startAngle={180}
                      endAngle={0}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill="#9fe870" />
                      <Cell fill="rgba(0,0,0,0.05)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pt-8">
                  <span className="text-3xl font-black">{healthValue}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Stability</span>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2">Based on your savings ratio over the past 30 days.</p>
            </div>

            {/* Goal Tracker */}
            <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Goal tracker</h3>
                <Link href="/dashboard/goals" className="text-[10px] font-bold text-primary">+ Add goals</Link>
              </div>
              <GoalsSnapshot />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (4 COLUMNS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Credit Card Widget */}
          <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4">My card</h3>
            
            {/* Visual Card */}
            <div className="relative w-full aspect-[1.6/1] bg-gradient-to-br from-[#9fe870] to-[#cdffad] rounded-2xl p-5 text-[#163300] overflow-hidden group mb-6 shadow-lg shadow-[#9fe870]/20 transition-transform hover:scale-[1.02]">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-120 transition-transform">
                <Landmark className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start mb-auto h-full flex-col">
                <div className="flex justify-between w-full items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Ngaturin Platinum</span>
                  <CreditCard className="w-5 h-5 opacity-60" />
                </div>
                <div className="space-y-4 w-full">
                  <p className="text-lg font-black tracking-[0.2em]">•••• •••• •••• {wallets[0]?.id.slice(-4) || "8824"}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-bold uppercase opacity-60">Card Holder</p>
                      <p className="text-xs font-bold truncate max-w-[150px]">{userName}</p>
                    </div>
                    <div className="w-8 h-5 bg-white/20 rounded-md backdrop-blur-md border border-white/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[
                { icon: TrendingDown, label: "Keluar", onClick: () => { setFormType("expense"); setShowForm(true); setEditingTransaction(null); } },
                { icon: TrendingUp, label: "Masuk", onClick: () => { setFormType("income"); setShowForm(true); setEditingTransaction(null); } },
                { icon: Wallet, label: "Dompet", onClick: () => router.push("/dashboard/wallets") },
                { icon: Zap, label: "Tagihan", onClick: () => router.push("/dashboard/bills") }
              ].map((act, i) => (
                <button key={i} onClick={act.onClick} className="flex flex-col items-center gap-2 group">
                  <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center transition-all group-hover:bg-[#9fe870] group-hover:text-[#163300]">
                    <act.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{act.label}</span>
                </button>
              ))}
              <button onClick={() => router.push("/dashboard/transactions")} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center transition-all group-hover:bg-[#9fe870]">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Lainnya</span>
              </button>
            </div>

            {/* Quick Transaction List (integrated inside card widget as history) */}
            <div className="flex items-center justify-between mb-4 pt-4 border-t border-border/30">
              <h3 className="font-bold text-sm">Recent Activity</h3>
              <Link href="/dashboard/transactions" className="text-[10px] font-bold text-muted-foreground hover:text-primary">7d</Link>
            </div>
            <DashboardRecentTx transactions={transactions} />
            <Link 
              href="/dashboard/transactions" 
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors border-t border-border/20"
            >
              See all history <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Add Transaction Button (Pill style) */}
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full h-14 rounded-2xl bg-[#9fe870] text-[#163300] hover:bg-[#cdffad] font-bold text-base shadow-xl shadow-[#9fe870]/10 transition-all hover:scale-[1.02] active:scale-95 gap-3"
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
            Add Transaction
          </Button>

          {/* Inline Form */}
          {showForm && (
            <div className="animate-in zoom-in-95 duration-200">
              <TransactionForm 
                defaultType={formType} 
                editingTransaction={editingTransaction}
                onSuccess={handleSuccess} 
                onCancel={() => setShowForm(false)} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
