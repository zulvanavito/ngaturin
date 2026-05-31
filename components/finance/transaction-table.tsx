"use client";

import { useState, useMemo } from "react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Pencil, Trash2, TrendingUp, TrendingDown, 
  MoreHorizontal, Download, ChevronLeft, ChevronRight,
  Trash
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/lib/toast-context";
import type { Transaction } from "@/types/finance";
import { TransactionForm } from "./transaction-form";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-utils";

interface TransactionTableProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export function TransactionTable({ transactions, onRefresh }: TransactionTableProps) {
  const { formatCurrency } = useFormatCurrency();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination Logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return transactions.slice(start, start + itemsPerPage);
  }, [transactions, currentPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      showToast("success", "Transaksi berhasil dihapus");
      onRefresh();
      setIsDeleteDialogOpen(false);
    } catch {
      showToast("error", "Gagal menghapus transaksi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      showToast("success", `${selectedIds.length} transaksi berhasil dihapus`);
      setSelectedIds([]);
      onRefresh();
      setIsBulkDeleteDialogOpen(false);
    } catch {
      showToast("error", "Gagal menghapus transaksi massal");
    } finally {
      setIsDeleting(false);
    }
  };

  
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Top Actions & Export */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
              <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {selectedIds.length} terpilih
              </span>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 rounded-full gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                onClick={() => setIsBulkDeleteDialogOpen(true)}
              >
                <Trash className="w-3 h-3" /> Hapus Terpilih
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs font-bold">
                <Download className="w-3.5 h-3.5" /> Ekspor
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => exportToCSV(transactions, "ngaturin-transaksi")} className="text-xs cursor-pointer">Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(transactions, "ngaturin-transaksi")} className="text-xs cursor-pointer">Export Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(transactions, "ngaturin-transaksi")} className="text-xs cursor-pointer">Export PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/40 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="w-12 px-5">
                <Checkbox 
                  checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                  onCheckedChange={(v) => handleSelectAll(!!v)}
                />
              </TableHead>
              <TableHead className="px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deskripsi</TableHead>
              <TableHead className="px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori</TableHead>
              <TableHead className="px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipe</TableHead>
              <TableHead className="px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tanggal</TableHead>
              <TableHead className="px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Nominal</TableHead>
              <TableHead className="w-12 px-5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {paginatedTransactions.map((tx) => (
              <TableRow key={tx.id} className="group hover:bg-muted/30 transition-colors border-b border-border/30">
                <TableCell className="px-5">
                  <Checkbox 
                    checked={selectedIds.includes(tx.id)}
                    onCheckedChange={(v) => handleSelectRow(tx.id, !!v)}
                  />
                </TableCell>
                <TableCell className="px-5">
                  <p className="font-bold text-sm text-foreground">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px]">ID: {String(tx.id).slice(0, 8)}...</p>
                </TableCell>
                <TableCell className="px-5">
                  <Badge variant="accent" className="rounded-full font-bold text-[10px] px-2.5 py-0.5 border-none">
                    {tx.category}
                  </Badge>
                </TableCell>
                <TableCell className="px-5">
                  {tx.type === "income" ? (
                    <Badge variant="success" className="rounded-full gap-1.5 px-2.5 py-0.5 border-none uppercase text-[9px]">
                      <TrendingUp className="w-3 h-3" /> Masuk
                    </Badge>
                  ) : (
                    <Badge variant="danger" className="rounded-full gap-1.5 px-2.5 py-0.5 border-none uppercase text-[9px]">
                      <TrendingDown className="w-3 h-3" /> Keluar
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-5 text-xs font-bold text-muted-foreground">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="px-5 text-right">
                  <span className={`font-black text-sm ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </TableCell>
                <TableCell className="px-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => setEditingTransaction(tx)} className="text-xs cursor-pointer gap-2">
                        <Pencil className="w-3 h-3" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { setDeleteId(tx.id); setIsDeleteDialogOpen(true); }} 
                        className="text-xs cursor-pointer gap-2 text-rose-500 focus:text-rose-500"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {paginatedTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="p-12 text-center text-muted-foreground">
                  Belum ada transaksi yang sesuai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-5 bg-muted/10 border-t border-border/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-wider gap-1 hover:scale-[1.05] transition-transform"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3 h-3" /> Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-wider gap-1 hover:scale-[1.05] transition-transform"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2rem] border-none">
          <DialogTitle className="sr-only">Edit Transaksi</DialogTitle>
          <DialogDescription className="sr-only">
            Formulir untuk memperbarui detail transaksi yang sudah ada.
          </DialogDescription>
          {editingTransaction && (
            <TransactionForm 
              editingTransaction={editingTransaction} 
              onSuccess={() => { onRefresh(); setEditingTransaction(null); }}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Hapus Transaksi?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus permanen dari riwayat Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full font-bold" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" className="rounded-full font-bold" onClick={handleDeleteSingle} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-destructive">Hapus {selectedIds.length} Transaksi?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus semua transaksi terpilih secara permanen. Anda yakin ingin melanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full font-bold" onClick={() => setIsBulkDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" className="rounded-full font-bold" onClick={handleDeleteBulk} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}