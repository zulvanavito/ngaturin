"use client";

import { useState } from "react";
import { Info, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Goal } from "./goal-card";

interface GoalDepositModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: Goal | null;
}

export function GoalDepositModal({ open, onClose, onSuccess, goal }: GoalDepositModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !amount || amount <= 0) {
      setError("Masukkan jumlah nominal yang valid.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const newAmount = Number(goal.current_amount) + amount;
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_amount: newAmount }),
      });

      if (!res.ok) throw new Error("Gagal menambah dana");

      setAmount(0);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
          >
            <Wallet className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Tambah Dana
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Masukkan jumlah uang yang ingin Anda simpan untuk target <strong>{goal.title}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2 text-center">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Nominal Simpanan</Label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              autoFocus
              className="h-14 text-xl font-bold text-center"
            />
            <p className="text-[11px] text-muted-foreground text-center pt-1 font-medium">
              Saldo saat ini: <span className="font-bold text-foreground">Rp {goal.current_amount.toLocaleString("id-ID")}</span> / 
              Rp {goal.target_amount.toLocaleString("id-ID")}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-expense/10 text-expense text-xs font-bold">
              <Info className="w-4 h-4" /> {error}
            </div>
          )}

          <DialogFooter className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-2xl h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !amount || amount <= 0}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? "Memproses..." : "Konfirmasi Simpanan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
