"use client";

import { useState } from "react";
import { Search, FilterX, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { CategoryIcon } from "@/components/categories/category-icon";

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}

export function TransactionFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  onReset,
}: TransactionFiltersProps) {
  const { categories } = useCategories();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const isFilterActive = typeFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-3">
        {/* Search Bar - Billboard Style */}
        <div className="relative group flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Cari catatan transaksi..."
            className="pl-14 h-16 rounded-[2rem] bg-white dark:bg-card border border-border/40 shadow-sm text-lg font-medium placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Mobile Filter Button */}
        <Dialog open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="md:hidden h-16 w-16 rounded-[2rem] bg-white dark:bg-card border border-border/40 shadow-sm relative shrink-0"
            >
              <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
              {isFilterActive && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-card" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Atur Filter
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tipe Transaksi</label>
                <Select value={typeFilter} onValueChange={onTypeChange}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-card border border-border/40 font-bold px-4">
                    <SelectValue placeholder="Semua Tipe" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="all" className="font-medium py-3">Semua Tipe</SelectItem>
                    <SelectItem value="income" className="font-medium py-3 text-emerald-500">Pemasukan</SelectItem>
                    <SelectItem value="expense" className="font-medium py-3 text-rose-500">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Kategori</label>
                <Select value={categoryFilter} onValueChange={onCategoryChange}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-card border border-border/40 font-bold px-4">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px]">
                    <SelectItem value="all" className="font-medium py-3">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name} className="font-medium py-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconName={cat.icon} className="w-4 h-4 opacity-60" />
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => { onReset(); setIsMobileFilterOpen(false); }} 
                  className="flex-1 rounded-2xl h-14 font-bold"
                >
                  Reset
                </Button>
                <Button 
                  onClick={() => setIsMobileFilterOpen(false)} 
                  className="flex-1 rounded-2xl h-14 font-black bg-primary text-primary-foreground"
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Horizontal Filter Pills */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {/* Type Filter Pill */}
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="shrink-0 h-10 w-fit min-w-[140px] whitespace-nowrap rounded-full bg-white dark:bg-card border border-border/40 font-bold text-[10px] uppercase tracking-widest gap-2 px-6 focus:ring-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-muted-foreground shrink-0">Tipe:</span>
              <SelectValue placeholder="Semua" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem
              value="all"
              className="text-[10px] font-medium uppercase tracking-widest"
            >
              Semua Tipe
            </SelectItem>
            <SelectItem
              value="income"
              className="text-[10px] font-medium uppercase tracking-widest text-emerald-500"
            >
              Pemasukan
            </SelectItem>
            <SelectItem
              value="expense"
              className="text-[10px] font-medium uppercase tracking-widest text-rose-500"
            >
              Pengeluaran
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter Pill */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="shrink-0 h-10 w-fit min-w-[160px] whitespace-nowrap rounded-full bg-white dark:bg-card border border-border/40 font-bold text-[10px] uppercase tracking-widest gap-2 px-6">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-muted-foreground shrink-0">Kategori:</span>
              <SelectValue placeholder="Semua" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px]">
            <SelectItem
              value="all"
              className="text-[10px] font-medium uppercase tracking-widest"
            >
              Semua Kategori
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem
                key={cat.id}
                value={cat.name}
                className="text-[10px] font-medium uppercase tracking-widest"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon
                    iconName={cat.icon}
                    className="w-3.5 h-3.5 opacity-60"
                  />
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Wallet Filter Pill (Placeholder for next phase) */}
        <Button
          variant="outline"
          className="h-10 rounded-full bg-white dark:bg-card border border-border/40 font-bold text-[10px] uppercase tracking-widest gap-2 px-6 opacity-50 cursor-not-allowed shrink-0"
        >
          <span className="text-muted-foreground">Dompet:</span> Semua{" "}
          <ChevronDown className="w-3 h-3" />
        </Button>

        {/* Reset Button */}
        {isFilterActive && (
          <Button
            variant="ghost"
            className="h-10 rounded-full hover:bg-rose-500/10 hover:text-rose-500 shrink-0 font-bold text-[10px] uppercase tracking-widest gap-2 px-4"
            onClick={onReset}
          >
            <FilterX className="w-3.5 h-3.5" /> Bersihkan
          </Button>
        )}
      </div>
    </div>
  );
}
