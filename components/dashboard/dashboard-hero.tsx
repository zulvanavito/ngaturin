"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { Info, Wallet, TrendingUp, HandCoins, ChevronRight, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface WalletData {
  id: string;
  name: string;
  balance: number;
  icon: string;
}

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

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
}

export function DashboardHero() {
  const { formatCurrency } = useFormatCurrency();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [userName, setUserName] = useState("Pengguna");
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }

      const [walletsRes, debtsRes, investmentsRes, txRes] = await Promise.all([
        fetch("/api/wallets"),
        fetch("/api/debts"),
        fetch("/api/investments"),
        fetch(`/api/transactions?_t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const [walletsData, debtsData, investmentsData, txData] = await Promise.all([
        walletsRes.ok ? walletsRes.json() : [],
        debtsRes.ok ? debtsRes.json() : [],
        investmentsRes.ok ? investmentsRes.json() : [],
        txRes.ok ? txRes.json() : [],
      ]);

      setWallets(Array.isArray(walletsData) ? walletsData : []);
      setDebts(Array.isArray(debtsData) ? debtsData : []);
      setInvestments(Array.isArray(investmentsData) ? investmentsData : []);

      // Calculate monthly income & expense for daily budget
      const currentMonth = new Date().toISOString().substring(0, 7);
      const monthlyTx: Transaction[] = Array.isArray(txData) ? txData.filter((t: Transaction) => t.date.startsWith(currentMonth)) : [];
      setMonthlyIncome(monthlyTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0));
      setMonthlyExpense(monthlyTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalWalletBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const totalInvestmentValue = investments.reduce((s, i) => s + Number(i.current_value), 0);

  const activeDebts = debts.filter(d => !d.is_settled);
  const totalOwed = activeDebts
    .filter(d => d.type === "owe")
    .reduce((s, d) => s + Number(d.amount), 0);
  const totalReceivable = activeDebts
    .filter(d => d.type === "owed")
    .reduce((s, d) => s + Number(d.amount), 0);
  const netDebt = totalReceivable - totalOwed;

  const totalWealth = totalWalletBalance + totalInvestmentValue + netDebt;

  // Daily budget calculation
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - today.getDate() + 1;
  const monthlyRemaining = monthlyIncome - monthlyExpense;
  const dailyBudget = monthlyIncome > 0 ? Math.max(Math.round(monthlyRemaining / remainingDays), 0) : 0;

  // Greeting based on time
  const hour = today.getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-5 w-56" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  const breakdownItems = [
    {
      label: "Dompet",
      value: totalWalletBalance,
      icon: Wallet,
      href: "/dashboard/wallets",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Investasi",
      value: totalInvestmentValue,
      icon: TrendingUp,
      href: "/dashboard/investments",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Hutang/Piutang",
      value: netDebt,
      icon: HandCoins,
      href: "/dashboard/debts",
      color: netDebt >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      bg: netDebt >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground" style={{ fontFeatureSettings: '"calt"' }}>
          {greeting}, {userName} 👋
        </p>
      </div>

      {/* Net Worth Hero */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
            Total Kekayaan
          </h2>
          <button
            className="relative group"
            onClick={() => setShowTooltip(!showTooltip)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Lihat rumus perhitungan"
          >
            <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors" />
            {showTooltip && (
              <div className="absolute left-0 top-6 z-50 w-72 p-4 bg-card border border-border/20 rounded-[1.5rem] shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
                <p className="text-xs font-black text-foreground mb-1" style={{ fontFeatureSettings: '"calt"' }}>Bagaimana angka ini dihitung?</p>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
                  Total Kas (Dompet) + Total Nilai Investasi + Piutang (uang di orang lain) − Hutang (uang yang harus dikembalikan)
                </p>
              </div>
            )}
          </button>
        </div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-[0.85]"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          {formatCurrency(totalWealth)}
        </h1>

        {/* Daily Remaining Budget */}
        {monthlyIncome > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <CalendarDays className="w-4 h-4 text-[#9fe870]" />
            <p className="text-sm font-semibold" style={{ fontFeatureSettings: '"calt"' }}>
              <span className={`font-black ${dailyBudget > 0 ? "text-[#9fe870]" : "text-red-500"}`}>
                {formatCurrency(dailyBudget)}
              </span>
              <span className="text-muted-foreground ml-1.5">budget harian tersisa</span>
            </p>
            <span className="text-[10px] font-black text-muted-foreground/50 ml-auto uppercase tracking-widest">
              {remainingDays} hari lagi
            </span>
          </div>
        )}
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {breakdownItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-center gap-3 p-4 bg-white dark:bg-card rounded-[1.5rem] border border-border/10 hover:border-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
                {item.label}
              </p>
              <p className="text-sm font-black text-foreground tabular-nums truncate" style={{ fontFeatureSettings: '"calt"' }}>
                {formatCurrency(item.value)}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
