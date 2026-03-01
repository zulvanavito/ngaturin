"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, TrendingUp, TrendingDown, Search } from "lucide-react";
import { formatCurrency } from "@/components/balance-card";
import type { Transaction } from "@/components/transaction-form";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICONS: Record<string, string> = {
  Makanan: "🍔",
  Transport: "🚗",
  Belanja: "🛍️",
  Tagihan: "📄",
  Gaji: "💰",
  Lainnya: "📦",
};

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: () => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const itemsPerPage = 8;

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus transaksi");
      setDeleteId(null);
      onDelete();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  // Unique categories from transactions
  const categories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => cats.add(t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filter + Search logic
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = searchQuery === "" || tx.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === "all" || tx.category === filterCategory;
      const matchType = filterType === "all" || tx.type === filterType;
      return matchSearch && matchCat && matchType;
    });
  }, [transactions, searchQuery, filterCategory, filterType]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (fn: () => void) => {
    fn();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} dari {transactions.length} transaksi
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari deskripsi..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
            className="pl-9 h-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={(v) => handleFilterChange(() => setFilterCategory(v))}>
          <SelectTrigger className="h-10 w-full sm:w-40">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{CATEGORY_ICONS[cat] || "📦"} {cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => handleFilterChange(() => setFilterType(v))}>
          <SelectTrigger className="h-10 w-full sm:w-36">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Search className="w-10 h-10 opacity-20" />
            <div>
              <p className="font-medium">Tidak ada transaksi ditemukan</p>
              <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {paginatedTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-lg shrink-0">
                  {CATEGORY_ICONS[tx.category] || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-normal">{tx.category}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {tx.type === "income" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span className={`font-semibold text-sm ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(tx)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(tx.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Halaman {currentPage} dari {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              ← Sebelumnya
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Selanjutnya →
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Transaksi</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
