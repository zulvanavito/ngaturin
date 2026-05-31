import { useState, useMemo, useEffect } from "react";
import type { Transaction, Investment, Debt, RecurringBill } from "@/types/finance";

export interface InsightSummary {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number;
  topCategory: string;
  topCategoryAmount: number;
  averageDailySpend: number;
}

export function useInsights(
  transactions: Transaction[], 
  selectedMonth: string, 
  selectedCategory: string = "all", 
  selectedWallet: string = "all",
  selectedType: string = "all"
) {
  
  // 1. Global Transactions (Ignore category & type filter for health metrics)
  const globalFilteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      const date = new Date(tx.date);
      const txMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthMatch = selectedMonth === "all" || txMonth === selectedMonth;
      const walletMatch = selectedWallet === "all" || tx.wallet_id === selectedWallet;
      return monthMatch && walletMatch;
    });
  }, [transactions, selectedMonth, selectedWallet]);

  // 2. Deep Filtered Transactions (Include category & type filter)
  const filteredTxs = useMemo(() => {
    return globalFilteredTxs.filter((tx) => {
      const categoryMatch = selectedCategory === "all" || tx.category === selectedCategory;
      const typeMatch = selectedType === "all" || tx.type === selectedType;
      return categoryMatch && typeMatch;
    });
  }, [globalFilteredTxs, selectedCategory, selectedType]);

  const calculateSummary = (txs: Transaction[]): InsightSummary => {
    const income = txs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const expense = txs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const net = income - expense;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    const uniqueDays = new Set(txs.map(t => t.date)).size;
    const avgDaily = uniqueDays > 0 ? expense / uniqueDays : 0;

    const categoryTotals = txs
      .filter(t => t.type === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0);
        return acc;
      }, {});

    let topCat = "Belum ada";
    let topAmt = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topAmt) {
        topAmt = amt;
        topCat = cat;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      netCashflow: net,
      savingsRate: Math.max(0, savingsRate),
      topCategory: topCat,
      topCategoryAmount: topAmt,
      averageDailySpend: avgDaily,
    };
  };

  const globalSummary = useMemo(() => calculateSummary(globalFilteredTxs), [globalFilteredTxs]);
  const summary = useMemo(() => calculateSummary(filteredTxs), [filteredTxs]);

  // 3. Holistic Data States (Real-time, independent of filters)
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [isHolisticLoading, setIsHolisticLoading] = useState(false);

  const fetchHolisticData = async () => {
    setIsHolisticLoading(true);
    try {
      const [invRes, debtRes, billRes] = await Promise.all([
        fetch("/api/investments"),
        fetch("/api/debts"),
        fetch("/api/recurring-bills")
      ]);
      if (invRes.ok) setInvestments(await invRes.json());
      if (debtRes.ok) setDebts(await debtRes.json());
      if (billRes.ok) setBills(await billRes.json());
    } catch (err) {
      console.error("Failed to fetch holistic data:", err);
    } finally {
      setIsHolisticLoading(false);
    }
  };

  useEffect(() => {
    fetchHolisticData();
  }, []); // Only fetch once on mount/transactions change

  // AI Narrative Fetching
  const [aiNarrative, setAiNarrative] = useState<string>("Menganalisis data...");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAiInsight = async () => {
    if (transactions.length === 0) {
        setAiNarrative("Mulai catat transaksimu untuk mendapatkan analisis cerdas di sini.");
        return;
    }
    
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/insights/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactions: filteredTxs, 
          summary, 
          globalSummary,
          investments,
          debts,
          bills
        }),
      });
      const data = await res.json();
      setAiNarrative(data.narrative);
    } catch (err) {
      setAiNarrative("Gagal memuat analisis cerdas.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsight();
  }, [selectedMonth, transactions.length, selectedCategory, selectedWallet, selectedType, investments.length, debts.length, bills.length]);

  return {
    filteredTransactions: filteredTxs,
    summary,
    globalSummary,
    aiNarrative,
    isAiLoading,
    investments,
    debts,
    bills,
    isHolisticLoading,
    refreshHolistic: fetchHolisticData
  };
}
