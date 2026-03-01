"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/components/balance-card";
import type { Transaction } from "@/components/transaction-form";

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

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/transactions/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus transaksi");
      }

      setDeleteId(null);
      onDelete();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-12 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="font-semibold text-lg mb-1">Belum ada transaksi</h3>
        <p className="text-muted-foreground text-sm">
          Mulai catat pemasukan dan pengeluaranmu di form di atas.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 pb-3">
          <h2 className="text-lg font-semibold">Transaksi Terbaru</h2>
          <p className="text-sm text-muted-foreground">{transactions.length} transaksi</p>
        </div>

        <div className="divide-y divide-border/50">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
            >
              {/* Category Icon */}
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                {CATEGORY_ICONS[tx.category] || "📦"}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{tx.category}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-1 shrink-0">
                {tx.type === "income" ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span
                  className={`font-semibold text-sm ${
                    tx.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(tx)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(tx.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Transaksi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
