"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, ChevronLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TransactionList } from "@/components/finance/transaction-list";
import { TransactionFilters } from "@/components/finance/transaction-filters";
import { TransactionForm, type Transaction } from "@/components/finance/transaction-form";
import { BulkTransactionForm } from "@/components/finance/bulk-transaction-form";
import { TransactionRowSkeleton } from "@/components/layout/skeletons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Trash2, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  MoreHorizontal,
  X,
  CheckSquare,
  ScanLine,
  CopyPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-utils";
import { useToast } from "@/lib/toast-context";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAddForm, setShowBulkAddForm] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { showToast } = useToast();

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions?_t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Hapus ${selectedIds.length} transaksi terpilih?`)) return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Gagal menghapus massal");
      
      showToast("success", `${selectedIds.length} transaksi berhasil dihapus`);
      setSelectedIds([]);
      fetchTransactions();
    } catch {
      showToast("error", "Gagal menghapus transaksi terpilih");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
      const matchWallet =
        walletFilter === "all" ||
        (walletFilter === "_none" ? !t.wallet_id : t.wallet_id === walletFilter);
      return matchSearch && matchType && matchCategory && matchWallet;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, walletFilter]);

  // Stats for the current view
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // Paginated Data
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, categoryFilter, walletFilter]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
        <div className="space-y-6">
          <div className="w-40 h-4 bg-muted animate-pulse rounded"></div>
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="space-y-2">
              <div className="w-64 h-16 bg-muted animate-pulse rounded"></div>
              <div className="w-96 h-6 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="w-48 h-14 bg-muted animate-pulse rounded-full"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted animate-pulse rounded-[2rem]"></div>
          <div className="h-32 bg-muted animate-pulse rounded-[2rem]"></div>
          <div className="h-32 bg-muted animate-pulse rounded-[2rem]"></div>
        </div>
        <div className="h-24 bg-muted animate-pulse rounded-2xl w-full"></div>
        <div className="space-y-4">
          <TransactionRowSkeleton />
          <TransactionRowSkeleton />
          <TransactionRowSkeleton />
          <TransactionRowSkeleton />
          <TransactionRowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      
      {/* Hero Section */}
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-[55px] sm:text-[72px] font-black tracking-tighter leading-[0.85] text-foreground">
              Catatan Transaksi.
            </h1>
            <p className="text-lg font-bold text-muted-foreground max-w-md">
              Pantau setiap arus kas keluar dan masuk dengan detail. Kelola keuangan Anda lebih bijak.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row w-full lg:w-auto items-stretch lg:items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    className="h-14 px-6 rounded-full border-border/40 font-bold text-xs uppercase tracking-widest gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <MoreHorizontal className="w-4 h-4" /> 
                    <span>Aksi Lainnya</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-border/40 min-w-[200px]">
                  <DropdownMenuItem className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                    <ScanLine className="w-4 h-4" /> Scan Struk
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBulkAddForm(true)} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                    <CopyPlus className="w-4 h-4" /> Tambah Banyak
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    className="h-14 px-6 rounded-full border-border/40 font-bold text-xs uppercase tracking-widest gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4" /> 
                    <span>Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-border/40 min-w-[200px]">
                  <DropdownMenuItem onClick={() => exportToCSV(filteredTransactions, "ngaturin-transaksi")} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                    <FileCode className="w-4 h-4" /> Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel(filteredTransactions, "ngaturin-transaksi")} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4" /> Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF(filteredTransactions, "ngaturin-transaksi")} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                    <FileText className="w-4 h-4" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              onClick={() => setShowAddForm(true)}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg h-16 px-10 shadow-2xl transition-all hover:scale-105 active:scale-95 group w-full lg:w-auto"
            >
              <Plus className="w-6 h-6 mr-3 stroke-[3px]" /> Transaksi Baru
            </Button>
          </div>


        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Pemasukan Filtered", value: stats.income, color: "text-emerald-500", bg: "bg-emerald-500/5" },
          { label: "Pengeluaran Filtered", value: stats.expense, color: "text-rose-500", bg: "bg-rose-500/5" },
          { label: "Net Balance", value: stats.balance, color: "text-primary", bg: "bg-primary/5" }
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border border-border/40 ${stat.bg} backdrop-blur-sm`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color}`}>{formatCurrency(stat.value)}</h3>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="w-full">
        <TransactionFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          walletFilter={walletFilter}
          onWalletChange={setWalletFilter}
          onReset={() => {
            setSearchQuery("");
            setTypeFilter("all");
            setCategoryFilter("all");
            setWalletFilter("all");
          }}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <TransactionList 
          transactions={paginatedTransactions} 
            onRefresh={fetchTransactions}
            onEdit={(tx) => setEditingTransaction(tx)}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-6 bg-muted/10 rounded-[2.5rem] border border-border/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="rounded-full border-border/40 hover:scale-105 active:scale-95"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="rounded-full border-border/40 hover:scale-105 active:scale-95"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

      {/* Add/Edit Transaction Dialog */}
      <Dialog 
        open={showAddForm || !!editingTransaction} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingTransaction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogTitle className="sr-only">Tambah/Edit Transaksi</DialogTitle>
          {(showAddForm || !!editingTransaction) && (
            <TransactionForm 
              editingTransaction={editingTransaction || undefined}
              onSuccess={() => { 
                fetchTransactions(); 
                setShowAddForm(false); 
                setEditingTransaction(null);
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingTransaction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Add Transaction Dialog */}
      <Dialog 
        open={showBulkAddForm} 
        onOpenChange={(open) => {
          if (!open) setShowBulkAddForm(false);
        }}
      >
        <DialogContent className="sm:max-w-4xl rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[85vh] overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Input Transaksi Massal</DialogTitle>
          {showBulkAddForm && (
            <BulkTransactionForm
              onSuccess={() => {
                fetchTransactions();
                setShowBulkAddForm(false);
              }}
              onCancel={() => setShowBulkAddForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Selection Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="fixed bottom-6 left-4 right-4 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 z-50 flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 lg:px-6 lg:py-4 bg-[#163300] text-white rounded-[2rem] shadow-2xl"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#9fe870]/20 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#9fe870]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-black text-white">{selectedIds.length} Transaksi</p>
                <p className="text-[10px] uppercase tracking-widest text-white/60">Terpilih</p>
              </div>
              <div className="sm:hidden font-black text-white px-1 sm:px-2 text-base">
                {selectedIds.length}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedIds.length === filteredTransactions.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(filteredTransactions.map(t => t.id));
                  }
                }}
                className="h-8 sm:h-10 px-2 sm:px-4 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest text-white hover:bg-white/10 hover:text-white"
              >
                <span className="hidden sm:inline">{selectedIds.length === filteredTransactions.length ? "Batal Pilih" : "Pilih Semua"}</span>
                <span className="sm:hidden">{selectedIds.length === filteredTransactions.length ? "Batal" : "Semua"}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full text-white hover:bg-white/10 hover:text-white shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-border/40">
                  <DropdownMenuItem onClick={() => exportToCSV(filteredTransactions.filter(t => selectedIds.includes(t.id)), "ngaturin-transaksi-terpilih")} className="rounded-xl font-bold gap-2 cursor-pointer">
                    <FileCode className="w-4 h-4" /> Export CSV Terpilih
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel(filteredTransactions.filter(t => selectedIds.includes(t.id)), "ngaturin-transaksi-terpilih")} className="rounded-xl font-bold gap-2 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4" /> Export Excel Terpilih
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF(filteredTransactions.filter(t => selectedIds.includes(t.id)), "ngaturin-transaksi-terpilih")} className="rounded-xl font-bold gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" /> Export PDF Terpilih
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="h-8 sm:h-10 px-3 sm:px-4 rounded-full bg-rose-500 text-white hover:bg-rose-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest gap-1 sm:gap-2 border-none shrink-0"
              >
                {isBulkDeleting ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block" />
                    Hapus
                  </>
                )}
              </Button>

              <div className="w-px h-6 bg-white/20 mx-0.5 sm:mx-1 hidden sm:block"></div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedIds([])}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full text-white/60 hover:bg-white/10 hover:text-white shrink-0 hidden sm:flex"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Utility FABs */}
      <AnimatePresence>
        {selectedIds.length === 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-4 md:hidden flex flex-col gap-3 z-40"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-white dark:bg-card text-foreground border border-border/40 hover:bg-muted">
                  <Download className="w-6 h-6 text-foreground/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="left" className="rounded-2xl p-2 border-border/40 min-w-[200px] mb-2">
                <DropdownMenuItem onClick={() => exportToCSV(filteredTransactions, "ngaturin-transaksi")} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                  <FileCode className="w-4 h-4" /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(filteredTransactions, "ngaturin-transaksi")} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" /> Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(filteredTransactions, "ngaturin-transaksi")} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                  <FileText className="w-4 h-4" /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-white dark:bg-card text-foreground border border-border/40 hover:bg-muted">
                  <MoreHorizontal className="w-6 h-6 text-foreground/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="left" className="rounded-2xl p-2 border-border/40 min-w-[200px] mb-2">
                <DropdownMenuItem className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                  <ScanLine className="w-4 h-4" /> Scan Struk
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBulkAddForm(true)} className="rounded-xl font-bold gap-2 p-3 cursor-pointer">
                  <CopyPlus className="w-4 h-4" /> Tambah Banyak
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
