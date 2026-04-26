"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  FileText,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/components/finance/balance-card";
import type { Transaction } from "@/components/finance/transaction-form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIcon } from "@/components/categories/category-icon";
import { useWallets } from "@/hooks/use-wallets";
import { useCategories } from "@/hooks/use-categories";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onRefresh: () => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onRefresh,
  selectedIds = [],
  onSelectionChange,
}: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const { wallets } = useWallets();
  const { categories } = useCategories();

  const getWalletName = (tx: Transaction) => {
    if (tx.wallets?.name) return tx.wallets.name;
    if (!tx.wallet_id) return "Tunai";
    const wallet = wallets.find((w) => w.id === tx.wallet_id);
    return wallet ? wallet.name : "Tunai";
  };

  const getCategoryIcon = (tx: Transaction) => {
    if (tx.category_icon) return tx.category_icon;
    const cat = categories.find((c) => c.name === tx.category);
    return cat ? cat.icon : "Package";
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      showToast("success", "Transaksi berhasil dihapus");
      onRefresh();
      setDeleteId(null);
    } catch {
      showToast("error", "Gagal menghapus transaksi");
    } finally {
      setIsDeleting(false);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  };

  const formatDateGroup = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Hari Ini";
    if (isYesterday(date)) return "Kemarin";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    sorted.forEach((tx) => {
      const groupKey = new Date(tx.date).toISOString().split("T")[0];
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(tx);
    });
    return groups;
  }, [transactions]);

  return (
    <div className="space-y-12">
      {Object.entries(groupedTransactions).map(([dateKey, txs]) => (
        <div key={dateKey} className="space-y-4">
          <div className="flex items-center justify-between px-4 border-b border-border/10 pb-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              {formatDateGroup(dateKey)}
            </h3>
            <span className="text-[11px] font-bold text-muted-foreground/40 italic">
              — Total: Rp{" "}
              {txs
                .reduce(
                  (sum, t) =>
                    sum + (t.type === "expense" ? Number(t.amount) : 0),
                  0,
                )
                .toLocaleString("id-ID")}
            </span>
          </div>

          <div className="space-y-3">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className={`group relative bg-white dark:bg-card border border-border/40 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${
                  expandedId === tx.id
                    ? "ring-2 ring-[#9fe870] shadow-2xl scale-[1.02]"
                    : "hover:shadow-lg hover:scale-[1.01]"
                }`}
              >
                {/* Selection Overlay */}
                {onSelectionChange && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-pointer z-10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const isSelected = selectedIds.includes(tx.id);
                      if (isSelected) {
                        onSelectionChange(
                          selectedIds.filter((id) => id !== tx.id),
                        );
                      } else {
                        onSelectionChange([...selectedIds, tx.id]);
                      }
                    }}
                  >
                    <div
                      className={`h-full w-full ${selectedIds.includes(tx.id) ? "bg-[#9fe870]" : "bg-transparent group-hover:bg-muted/30"}`}
                    />
                  </div>
                )}

                {/* Main Row */}
                <div
                  className={`flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-5 px-4 py-4 sm:px-8 sm:py-6 cursor-pointer select-none ${selectedIds.includes(tx.id) ? "bg-[#9fe870]/5" : ""}`}
                  onClick={() =>
                    setExpandedId(expandedId === tx.id ? null : tx.id)
                  }
                >
                  {/* Checkbox */}
                  {onSelectionChange && (
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedIds.includes(tx.id)
                          ? "bg-[#9fe870] border-[#9fe870] text-[#163300] scale-110"
                          : "border-border/40 hover:border-[#9fe870]"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const isSelected = selectedIds.includes(tx.id);
                        if (isSelected) {
                          onSelectionChange(
                            selectedIds.filter((id) => id !== tx.id),
                          );
                        } else {
                          onSelectionChange([...selectedIds, tx.id]);
                        }
                      }}
                    >
                      {selectedIds.includes(tx.id) && (
                        <div className="w-2.5 h-2.5 bg-[#163300] rounded-sm" />
                      )}
                    </div>
                  )}

                  <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-[1.5rem] bg-muted/30 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <CategoryIcon
                      iconName={getCategoryIcon(tx)}
                      className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/70"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-sm sm:text-lg tracking-tighter text-foreground leading-tight truncate sm:whitespace-normal sm:line-clamp-2">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="bg-muted/50 text-[8px] sm:text-[9px] font-medium uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border-none"
                      >
                        {tx.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-black text-sm sm:text-xl tracking-tighter ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>

                  <div
                    className={`ml-1 sm:ml-2 shrink-0 transition-transform duration-300 ${expandedId === tx.id ? "rotate-180" : ""}`}
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/30" />
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === tx.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-border/20 bg-muted/5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 py-6">
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Wallet className="w-3 h-3" /> Nama Dompet
                            </p>
                            <p className="text-sm font-medium tracking-tight">
                              {getWalletName(tx)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" /> Sektor
                            </p>
                            <p className="text-sm font-medium  tracking-tight">
                              {tx.category}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Clock className="w-3 h-3" /> Waktu Transaksi
                            </p>
                            <p className="text-sm font-medium tracking-tight">
                              {new Date(tx.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                              {" · "}
                              {new Date(tx.created_at).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <FileText className="w-3 h-3" /> Memo Lengkap
                            </p>
                            <p className="text-sm font-medium tracking-tight truncate">
                              {tx.description || "Tidak ada catatan"}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-6 border-t border-border/20">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-full h-12 font-bold text-[10px] uppercase tracking-widest sm:tracking-[0.2em] gap-2 transition-all hover:scale-105 active:scale-95 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(tx);
                            }}
                          >
                            <Pencil className="w-4 h-4" /> Ubah Data
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 rounded-full h-12 font-bold text-[10px] uppercase tracking-widest sm:tracking-[0.2em] gap-2 text-rose-500 hover:bg-rose-500 hover:text-white border-rose-200 hover:border-rose-500 transition-all hover:scale-105 active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(tx.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" /> Hapus Permanen
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(groupedTransactions).length === 0 && (
        <div className="py-32 text-center space-y-6">
          <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <TrendingDown className="w-10 h-10 text-muted-foreground/20" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black tracking-tighter">
              Hening di sini.
            </h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Belum ada aktivitas keuangan yang tercatat.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-8">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="text-center">
              <DialogTitle className="text-3xl font-black tracking-tighter">
                Konfirmasi Hapus
              </DialogTitle>
              <DialogDescription className="font-bold text-sm text-muted-foreground mt-2">
                Apakah Anda benar-benar ingin melenyapkan catatan transaksi ini?
                Tindakan ini tidak bisa dibatalkan.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Debt-linked transaction warning */}
          {(() => {
            const txToDelete = transactions.find((t) => t.id === deleteId);
            if (txToDelete?.debt_id) {
              const isHutang = txToDelete.category === "Hutang";
              return (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        Penghapusan Total Record{" "}
                        {isHutang ? "Hutang" : "Piutang"}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Menghapus transaksi sumber ini akan{" "}
                        <strong>
                          melenyapkan seluruh kartu{" "}
                          {isHutang ? "hutang" : "piutang"}
                        </strong>{" "}
                        dan <strong>semua riwayat pembayarannya</strong> secara
                        permanen. <br />
                        Tindakan ini diperlukan untuk menjaga akurasi saldo
                        dompet Anda.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <DialogFooter className="gap-3 mt-8 flex-col sm:flex-row">
            <Button
              variant="ghost"
              className="flex-1 rounded-full font-black text-[10px] uppercase tracking-widest h-14"
              onClick={() => setDeleteId(null)}
            >
              Batalkan
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-full font-black text-[10px] uppercase tracking-widest h-14 bg-rose-500 hover:bg-rose-600 transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-rose-500/20"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Memproses..." : "Ya, Hapus Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
