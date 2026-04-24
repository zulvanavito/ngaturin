"use client";

import { useState, useEffect, useMemo } from "react";
import { Undo2, Loader2, AlertCircle, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { type Debt } from "@/components/debt-card";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  wallet_id: string | null;
}

interface DebtUnsettleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt: Debt | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

type PaidAmountAction = "keep" | "reset" | "subtract";

export function DebtUnsettleModal({ open, onClose, onSuccess, debt }: DebtUnsettleModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [paidAction, setPaidAction] = useState<PaidAmountAction>("reset");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  // Fetch and filter related transactions
  useEffect(() => {
    if (!open || !debt) return;

    setSelectedTxIds(new Set());
    setPaidAction("reset");
    setError("");

    const fetchRelated = async () => {
      setIsFetching(true);
      try {
        const categoryMatch = debt.type === "hutang" ? "Hutang" : "Piutang";
        const paymentTypeMatch = debt.type === "hutang" ? "expense" : "income";
        
        const params = new URLSearchParams({
          category: categoryMatch,
          type: paymentTypeMatch,
          keyword: debt.person_name
        });

        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) throw new Error();
        const related: Transaction[] = await res.json();

        setTransactions(related);
      } catch {
        setTransactions([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchRelated();
  }, [open, debt]);

  const toggleTx = (id: string) => {
    setSelectedTxIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTotal = useMemo(() => {
    return transactions
      .filter(tx => selectedTxIds.has(tx.id))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, selectedTxIds]);

  const previewPaidAmount = useMemo(() => {
    if (!debt) return 0;
    const current = debt.paid_amount || 0;
    if (paidAction === "reset") return 0;
    if (paidAction === "subtract") return Math.max(current - selectedTotal, 0);
    return current; // keep
  }, [debt, paidAction, selectedTotal]);

  if (!debt) return null;

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Delete selected transactions
      for (const txId of selectedTxIds) {
        const res = await fetch(`/api/transactions/${txId}`, { method: "DELETE" });
        if (!res.ok) console.error(`Failed to delete transaction ${txId}`);
      }

      // 2. Update debt: unsettle + adjust paid_amount
      const res = await fetch(`/api/debts/${debt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...debt,
          is_settled: false,
          paid_amount: previewPaidAmount,
        }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui catatan utang.");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm">
            <Undo2 className="w-6 h-6 text-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            Batal Lunas
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            Catatan <span className="font-bold text-foreground">{debt.person_name}</span> akan kembali aktif.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Current state summary */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Catatan</span>
              <span className="font-bold tabular-nums">{formatCurrency(debt.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Terbayar Saat Ini</span>
              <span className="font-bold tabular-nums">{formatCurrency(debt.paid_amount || 0)}</span>
            </div>
          </div>

          {/* Related transactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <Label className="text-xs font-black uppercase tracking-widest">
                Riwayat Pelunasan di Dompet
              </Label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-popover text-[10px] text-popover-foreground rounded-lg shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Hanya menampilkan transaksi pembayaran (pelunasan). Transaksi awal saat utang dibuat tetap aman.
                </div>
              </div>
            </div>

            {isFetching ? (
              <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Mencari data pelunasan...
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/20 text-center">
                <Info className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Tidak ditemukan riwayat pelunasan di dompet.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {transactions.map(tx => (
                  <label
                    key={tx.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTxIds.has(tx.id)
                        ? "bg-expense/5 border-expense/20"
                        : "bg-white dark:bg-card border-border/20 hover:bg-muted/10"
                    }`}
                  >
                    <Checkbox
                      checked={selectedTxIds.has(tx.id)}
                      onCheckedChange={() => toggleTx(tx.id)}
                      className="rounded-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · {tx.type === "income" ? "Income" : "Expense"}
                      </p>
                    </div>
                    <span className="text-xs font-bold tabular-nums shrink-0">{formatCurrency(tx.amount)}</span>
                    {selectedTxIds.has(tx.id) && (
                      <Trash2 className="w-3.5 h-3.5 text-expense shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {selectedTxIds.size > 0 && (
              <p className="text-[10px] font-bold text-expense ml-1">
                {selectedTxIds.size} transaksi akan dihapus (total: {formatCurrency(selectedTotal)})
              </p>
            )}
          </div>

          {/* Paid amount options */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">
              Jumlah Terbayar
            </Label>
            <div className="space-y-2">
              {([
                { value: "reset" as PaidAmountAction, label: "Reset ke Rp 0", desc: "Mulai dari awal, seolah belum pernah dibayar." },
                ...(selectedTxIds.size > 0 ? [{ value: "subtract" as PaidAmountAction, label: `Kurangi ${formatCurrency(selectedTotal)}`, desc: `Terbayar menjadi ${formatCurrency(Math.max((debt.paid_amount || 0) - selectedTotal, 0))}.` }] : []),
                { value: "keep" as PaidAmountAction, label: `Biarkan (${formatCurrency(debt.paid_amount || 0)})`, desc: "Hanya ubah status, jumlah terbayar tidak berubah." },
              ]).map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    paidAction === opt.value
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "border-border/20 hover:bg-muted/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="paid-action"
                    value={opt.value}
                    checked={paidAction === opt.value}
                    onChange={() => setPaidAction(opt.value)}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-bold">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-2xl bg-muted/10 border border-border/20 space-y-1 text-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Preview Setelah Batal Lunas</p>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-bold text-amber-500">Belum Lunas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Terbayar</span>
              <span className="font-bold tabular-nums">{formatCurrency(previewPaidAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sisa</span>
              <span className="font-black tabular-nums text-foreground">{formatCurrency(Math.max(debt.amount - previewPaidAmount, 0))}</span>
            </div>
            {selectedTxIds.size > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-border/20">
                <span className="text-muted-foreground">Transaksi Dihapus</span>
                <span className="font-bold text-expense">{selectedTxIds.size} transaksi</span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-expense/10 text-expense text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <DialogFooter className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first">
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-2xl h-12 px-8 font-black bg-amber-500 text-white hover:bg-amber-600 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : "Konfirmasi Batal Lunas"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
