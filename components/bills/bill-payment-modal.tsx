"use client";

import { useState, useEffect } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/categories/category-icon";
import { type RecurringBill } from "@/components/bills/bill-card";
import { useWallets } from "@/hooks/use-wallets";

interface BillPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bill: RecurringBill | null;
}


export function BillPaymentModal({ open, onClose, onSuccess, bill }: BillPaymentModalProps) {
  const { formatCurrency } = useFormatCurrency();
  const { wallets } = useWallets();
  const [walletId, setWalletId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setWalletId("");
      setError("");
    }
  }, [open]);

  if (!bill) return null;

  const handleSubmit = async () => {
    if (!walletId) {
      setError("Pilih dompet untuk mencatat pembayaran.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `Bayar tagihan: ${bill.name}${bill.plan_name ? ` (${bill.plan_name})` : ""}`,
          amount: bill.amount,
          category: bill.category || "Tagihan",
          type: "expense",
          wallet_id: walletId,
          date: new Date().toISOString().split("T")[0],
          bill_id: bill.id,
        }),
      });

      if (!res.ok) throw new Error("Gagal mencatat pembayaran.");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            Bayar Tagihan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            Catat pembayaran <span className="font-bold text-foreground">{bill.name}</span> ke dompet Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Bill summary */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tagihan</span>
              <span className="font-bold">{bill.name}</span>
            </div>
            {bill.plan_name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-bold">{bill.plan_name}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-primary/10">
              <span className="font-bold">Nominal</span>
              <span className="font-black tabular-nums text-foreground">{formatCurrency(bill.amount)}</span>
            </div>
          </div>

          {/* Wallet selector */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Potong dari Dompet</Label>
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
            <p className="text-[10px] text-muted-foreground/60 ml-1">
              💡 Saldo dompet akan berkurang sebesar {formatCurrency(bill.amount)}.
            </p>
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
              disabled={isLoading || !walletId}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : "Bayar & Catat"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
