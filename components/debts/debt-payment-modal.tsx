"use client";

import { useState, useEffect } from "react";
import { HandCoins, AlertCircle, Loader2} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils/format";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/categories/category-icon";
import { type Debt } from "@/components/debts/debt-card";
import { useWallets } from "@/hooks/use-wallets";

interface DebtPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt: Debt | null;
}


export function DebtPaymentModal({ open, onClose, onSuccess, debt }: DebtPaymentModalProps) {
  const { wallets } = useWallets(false);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [syncToWallet, setSyncToWallet] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const remaining = debt ? Math.max(debt.amount - (debt.paid_amount || 0), 0) : 0;

  useEffect(() => {
    if (open && debt) {
      setAmount(String(remaining));
      setWalletId("");
      setSyncToWallet(true);
      setError("");
    }
  }, [open, debt, remaining]);

  if (!debt) return null;

  const isHutang = debt.type === "hutang";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (numAmount <= 0) { setError("Jumlah harus lebih dari 0."); return; }
    if (numAmount > remaining) { setError(`Melebihi sisa. Maksimal: ${formatCurrency(remaining)}`); return; }
    if (syncToWallet && !walletId) { setError("Pilih dompet untuk sinkronisasi."); return; }

    setIsLoading(true);
    setError("");

    try {
      const newPaidAmount = (debt.paid_amount || 0) + numAmount;
      const isNowSettled = newPaidAmount >= debt.amount;

      // 1. Update debt record
      const debtRes = await fetch(`/api/debts/${debt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...debt,
          paid_amount: newPaidAmount,
          is_settled: isNowSettled,
        }),
      });
      if (!debtRes.ok) throw new Error("Gagal memperbarui catatan utang.");

      // 2. Create wallet transaction if requested
      if (syncToWallet && walletId) {
        const txRes = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: `${isHutang ? "Bayar hutang" : "Terima piutang"}: ${debt.person_name}`,
            amount: numAmount,
            category: isHutang ? "Hutang" : "Piutang",
            type: isHutang ? "expense" : "income",
            wallet_id: walletId,
            date: new Date().toISOString().split("T")[0],
            debt_id: debt.id,
          }),
        });
        if (!txRes.ok) {
          console.error("Transaction sync failed, but debt was updated.");
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setError(""); } }}>
      <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm">
            <HandCoins className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            Catat Pembayaran
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            {isHutang
              ? `Bayar hutang ke ${debt.person_name}.`
              : `Terima pembayaran dari ${debt.person_name}.`}
          </DialogDescription>
        </DialogHeader>

        {/* Current status summary */}
        <div className={`p-4 rounded-2xl border ${isHutang ? "bg-expense/5 border-expense/10" : "bg-income/5 border-income/10"}`}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Total</span>
            <span className="font-bold tabular-nums">{formatCurrency(debt.amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground font-medium">Terbayar</span>
            <span className="font-bold tabular-nums">{formatCurrency(debt.paid_amount || 0)}</span>
          </div>
          <div className={`flex items-center justify-between text-sm mt-1 pt-2 border-t ${isHutang ? "border-expense/10" : "border-income/10"}`}>
            <span className="font-bold">Sisa</span>
            <span className={`font-black tabular-nums ${isHutang ? "text-expense" : "text-income"}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Jumlah Pembayaran (Rp)</Label>
            <Input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              type="number"
              min="1"
              max={remaining}
              required
              className="h-12 rounded-2xl border-border/40 font-semibold tabular-nums text-lg"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Bayar Penuh
              </button>
              <span className="text-muted-foreground/30">|</span>
              <button
                type="button"
                onClick={() => setAmount(String(Math.round(remaining / 2)))}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Separuh
              </button>
            </div>
          </div>

          {/* Wallet Sync Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="sync-wallet"
                checked={syncToWallet}
                onCheckedChange={(c) => setSyncToWallet(!!c)}
                className="rounded-md"
              />
              <Label htmlFor="sync-wallet" className="text-sm font-semibold cursor-pointer">
                Catat otomatis ke Dompet
              </Label>
            </div>

            {syncToWallet && (
              <div className="space-y-2 pl-7">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">
                  {isHutang ? "Potong dari dompet" : "Masuk ke dompet"}
                </Label>
                <Select value={walletId} onValueChange={setWalletId}>
                  <SelectTrigger className="h-12 rounded-2xl border-border/40 font-semibold">
                    <SelectValue placeholder="Pilih dompet..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40">
                    {wallets.map(w => (
                      <SelectItem key={w.id} value={w.id} className="rounded-xl cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${w.color}15`, color: w.color }}>
                            <CategoryIcon iconName={w.icon || "Wallet"} className="w-3.5 h-3.5" />
                          </div>
                          <span>{w.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground/50 ml-1">
                  {isHutang
                    ? "Saldo dompet akan berkurang (Expense)."
                    : "Saldo dompet akan bertambah (Income)."}
                </p>
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
              type="submit"
              disabled={isLoading || !amount}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : "Catat Pembayaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
