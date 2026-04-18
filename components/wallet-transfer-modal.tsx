"use client";

import { useState } from "react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/category-icon";
import { type WalletData } from "@/components/wallet-card";

interface WalletTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallets: WalletData[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export function WalletTransferModal({ open, onClose, onSuccess, wallets }: WalletTransferModalProps) {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fromWallet = wallets.find(w => w.id === fromId);
  const toWallet = wallets.find(w => w.id === toId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || !amount) return;

    const numAmount = Number(amount.replace(/\D/g, ""));
    if (numAmount <= 0) { setError("Jumlah harus lebih dari 0."); return; }

    if (fromWallet && fromWallet.balance < numAmount) {
      setError(`Saldo tidak mencukupi. Saldo saat ini: ${formatCurrency(fromWallet.balance)}`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/wallets/${fromId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toWalletId: toId,
          amount: numAmount,
          description: description || "Transfer Antar Dompet",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }

      onSuccess();
      onClose();
      setFromId(""); setToId(""); setAmount(""); setDescription("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal melakukan transfer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setError(""); } }}>
      <DialogContent className="sm:max-w-lg rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm">
            <ArrowRight className="w-6 h-6 text-blue-500" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            Transfer Antar Dompet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            Pindahkan saldo dari satu dompet ke dompet lain secara instan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Visual Flow */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* From */}
            <div className="flex-1 w-full space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Dari</Label>
              <Select value={fromId} onValueChange={(v) => { setFromId(v); if (v === toId) setToId(""); }}>
                <SelectTrigger className="h-14 rounded-2xl border-border/40 font-semibold">
                  <SelectValue placeholder="Pilih dompet asal..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  {wallets.filter(w => w.id !== toId).map(w => (
                    <SelectItem key={w.id} value={w.id} className="rounded-xl cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${w.color}15`, color: w.color }}>
                          <CategoryIcon iconName={w.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span>{w.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromWallet && (
                <p className="text-xs text-muted-foreground ml-1">Saldo: <span className="font-bold text-foreground">{formatCurrency(fromWallet.balance)}</span></p>
              )}
            </div>

            {/* Arrow Indicator */}
            <div className="w-10 h-10 rounded-full bg-muted/30 border border-border/30 flex items-center justify-center shrink-0 mt-4 sm:mt-6">
              <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90 sm:rotate-0" />
            </div>

            {/* To */}
            <div className="flex-1 w-full space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Ke</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger className="h-14 rounded-2xl border-border/40 font-semibold">
                  <SelectValue placeholder="Pilih dompet tujuan..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  {wallets.filter(w => w.id !== fromId).map(w => (
                    <SelectItem key={w.id} value={w.id} className="rounded-xl cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${w.color}15`, color: w.color }}>
                          <CategoryIcon iconName={w.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span>{w.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {toWallet && (
                <p className="text-xs text-muted-foreground ml-1">Saldo: <span className="font-bold text-foreground">{formatCurrency(toWallet.balance)}</span></p>
              )}
            </div>
          </div>

          {/* Amount & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Jumlah (Rp)</Label>
              <Input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100000"
                type="number"
                min="1"
                required
                className="h-12 rounded-2xl border-border/40 font-semibold tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Keterangan</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Transfer ke tabungan"
                className="h-12 rounded-2xl border-border/40 font-semibold"
              />
            </div>
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
              disabled={isLoading || !fromId || !toId || !amount}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : "Transfer Sekarang"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
