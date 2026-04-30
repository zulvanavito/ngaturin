"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Loader2} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface DebtSettleConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt: Debt | null;
}


export function DebtSettleConfirmationModal({ open, onClose, onSuccess, debt }: DebtSettleConfirmationModalProps) {
  const { wallets } = useWallets(false);
  const [syncToWallet, setSyncToWallet] = useState(true);
  const [walletId, setWalletId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const remaining = debt ? Math.max(debt.amount - (debt.paid_amount || 0), 0) : 0;

  useEffect(() => {
    if (open) {
      setSyncToWallet(remaining > 0);
      setWalletId("");
      setError("");
    }
  }, [open, remaining]);

  if (!debt) return null;

  const handleSubmit = async () => {
    if (syncToWallet && !walletId) {
      setError("Pilih dompet untuk sinkronisasi sisa pembayaran.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Update debt to Settled and full amount
      const debtRes = await fetch(`/api/debts/${debt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...debt,
          is_settled: true,
          paid_amount: debt.amount,
        }),
      });
      if (!debtRes.ok) throw new Error("Gagal memperbarui catatan utang.");

      // 2. Create transaction for the REMAINING amount if requested
      if (syncToWallet && walletId && remaining > 0) {
        const isHutang = debt.type === "hutang";
        const txRes = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: `Pelunasan akhir ${isHutang ? "hutang ke" : "piutang dari"} ${debt.person_name}`,
            amount: remaining,
            category: isHutang ? "Hutang" : "Piutang",
            type: isHutang ? "expense" : "income",
            wallet_id: walletId,
            date: new Date().toISOString().split("T")[0],
            debt_id: debt.id,
          }),
        });
        if (!txRes.ok) {
          console.error("Failed to sync final payment to wallet.");
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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-border/40 p-6 sm:p-8">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            Tandai Selesai?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            {remaining > 0 ? (
              <>
                Catatan ini belum lunas sepenuhnya. Masih ada sisa <span className="font-bold text-foreground">{formatCurrency(remaining)}</span>.
              </>
            ) : (
              "Apakah Anda yakin ingin menandai catatan ini sebagai lunas?"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {remaining > 0 && (
            <div className="space-y-4 p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-600">Sisa Belum Terbayar</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Menandai lunas akan mengubah jumlah terbayar menjadi <span className="font-bold">{formatCurrency(debt.amount)}</span>.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-amber-500/10">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sync-final"
                    checked={syncToWallet}
                    onCheckedChange={(c) => setSyncToWallet(!!c)}
                    className="rounded-md"
                  />
                  <Label htmlFor="sync-final" className="text-sm font-semibold cursor-pointer">
                    Catat sisa {formatCurrency(remaining)} ke Dompet
                  </Label>
                </div>

                {syncToWallet && (
                  <div className="space-y-2 pl-7">
                    <Select value={walletId} onValueChange={setWalletId}>
                      <SelectTrigger className="h-11 rounded-2xl border-border/40 font-semibold bg-white dark:bg-background">
                        <SelectValue placeholder="Pilih dompet..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        {wallets.map(w => (
                          <SelectItem key={w.id} value={w.id} className="rounded-xl cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px]" style={{ backgroundColor: `${w.color}15`, color: w.color }}>
                                <CategoryIcon iconName={w.icon || "Wallet"} className="w-3" />
                              </div>
                              <span className="text-xs font-semibold">{w.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-expense/10 text-expense text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first">
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : "Ya, Tandai Lunas"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
