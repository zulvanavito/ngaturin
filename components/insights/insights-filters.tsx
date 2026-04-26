"use client";

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Tag, Wallet } from "lucide-react";
import type { Transaction } from "@/components/finance/transaction-form";
import { useWallets } from "@/hooks/use-wallets";

interface InsightsFiltersProps {
  transactions: Transaction[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedWallet: string;
  setSelectedWallet: (w: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
}

export function InsightsFilters({
  transactions,
  selectedMonth,
  setSelectedMonth,
  selectedCategory,
  setSelectedCategory,
  selectedWallet,
  setSelectedWallet,
  selectedType,
  setSelectedType,
}: InsightsFiltersProps) {
  
  const { wallets } = useWallets();

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach(tx => cats.add(tx.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const formatMonthLabel = (value: string) => {
    if (value === "all") return "Semua Waktu";
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Month Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
          <Calendar className="w-3 h-3" /> Periode
        </label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="h-12 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-xl border-border/40 shadow-sm focus:ring-primary/20 hover:bg-white/60 dark:hover:bg-card/60 transition-colors">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/40 backdrop-blur-3xl">
            <SelectItem value="all">Semua Waktu</SelectItem>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>
                {formatMonthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
          <Tag className="w-3 h-3" /> Kategori
        </label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-12 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-xl border-border/40 shadow-sm focus:ring-primary/20 hover:bg-white/60 dark:hover:bg-card/60 transition-colors">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/40 backdrop-blur-3xl">
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Wallet Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
          <Wallet className="w-3 h-3" /> Dompet
        </label>
        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
          <SelectTrigger className="h-12 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-xl border-border/40 shadow-sm focus:ring-primary/20 hover:bg-white/60 dark:hover:bg-card/60 transition-colors">
            <SelectValue placeholder="Semua Dompet" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/40 backdrop-blur-3xl">
            <SelectItem value="all">Semua Dompet</SelectItem>
            {wallets.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.icon} {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" /> Tipe Transaksi
        </label>
        <Select value={selectedType} onValueChange={setSelectedType} >
          <SelectTrigger className="h-12 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-xl border-border/40 shadow-sm focus:ring-primary/20 hover:bg-white/60 dark:hover:bg-card/60 transition-colors">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/40 backdrop-blur-3xl">
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="income">📈 Pemasukan</SelectItem>
            <SelectItem value="expense">📉 Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
