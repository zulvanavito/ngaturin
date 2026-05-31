"use client";

import { useReportStore } from "@/stores/use-report-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { Category, Wallet, Transaction } from "@/types/finance";
import type { TransactionTypeFilter } from "@/lib/reports/report-types";
import { CategoryIcon } from "@/components/categories/category-icon";

interface ReportFiltersProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
}

function getAvailableMonths(transactions: Transaction[]): string[] {
  const monthSet = new Set<string>();
  const now = new Date();
  // Always include the last 12 months
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  for (const tx of transactions) {
    if (tx.date) monthSet.add(tx.date.substring(0, 7));
  }
  return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
}

function formatMonthLabel(month: string): string {
  try {
    const [year, m] = month.split("-");
    const date = new Date(Number(year), Number(m) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  } catch {
    return month;
  }
}

const TYPE_OPTIONS: { value: TransactionTypeFilter; label: string }[] = [
  { value: "all", label: "Semua Tipe" },
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
  { value: "transfer", label: "Transfer" },
];

export function ReportFilters({ transactions, categories, wallets }: ReportFiltersProps) {
  const {
    filters,
    setSelectedMonth,
    setSelectedCategory,
    setSelectedWallet,
    setSelectedType,
    resetFilters,
  } = useReportStore();

  const months = getAvailableMonths(transactions);

  const isFiltered =
    filters.selectedCategory !== "all" ||
    filters.selectedWallet !== "all" ||
    filters.selectedType !== "all";

  return (
    <div className="rounded-2xl lg:rounded-[2rem] bg-white dark:bg-card border border-border/50 shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Month */}
        <Select value={filters.selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[160px] rounded-full" id="filter-month">
            <SelectValue placeholder="Pilih bulan" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {formatMonthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select value={filters.selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[170px] rounded-full" id="filter-category">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                <div className="flex items-center gap-2">
                  {c.icon && <CategoryIcon iconName={c.icon} className="w-4 h-4 text-muted-foreground" />}
                  <span>{c.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Wallet */}
        <Select value={filters.selectedWallet} onValueChange={setSelectedWallet}>
          <SelectTrigger className="w-[160px] rounded-full" id="filter-wallet">
            <SelectValue placeholder="Semua Dompet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dompet</SelectItem>
            {wallets.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                <div className="flex items-center gap-2">
                  {w.icon && <CategoryIcon iconName={w.icon} className="w-4 h-4 text-muted-foreground" />}
                  <span>{w.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select value={filters.selectedType} onValueChange={(v) => setSelectedType(v as TransactionTypeFilter)}>
          <SelectTrigger className="w-[145px] rounded-full" id="filter-type">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {isFiltered && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="rounded-full gap-1.5"
            id="filter-reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
