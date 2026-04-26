"use client";

import { useState, useEffect } from "react";
import { HandCoins, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/categories/category-icon";
import { type Debt } from "@/components/debts/debt-card";
import { useWallets } from "@/hooks/use-wallets";

interface DebtFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt?: Debt | null;
}

export function DebtFormModal({ open, onClose, onSuccess, debt }: DebtFormModalProps) {
  const { wallets } = useWallets(false);
  const [type, setType] = useState<"hutang" | "piutang">("hutang");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [syncToWallet, setSyncToWallet] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!debt;

  useEffect(() => {
    if (debt) {
      setType(debt.type);
      setPersonName(debt.person_name);
      setAmount(String(debt.amount));
      setDescription(debt.description || "");
      setDueDate(debt.due_date ? debt.due_date.split("T")[0] : "");
      setSyncToWallet(false);
      setWalletId("");
    } else {
      setType("hutang");
      setPersonName("");
      setAmount("");
      setDescription("");
      setDueDate("");
      setSyncToWallet(false);
      setWalletId("");
    }
    setError("");
  }, [debt, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !amount) return;
    if (!isEditing && syncToWallet && !walletId) {
      setError("Pilih dompet untuk sinkronisasi.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const url = debt ? `/api/debts/${debt.id}` : "/api/debts";
      const method = debt ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          person_name: personName.trim(),
          amount: Number(amount),
          description: description.trim() || null,
          due_date: dueDate || null,
          is_settled: debt?.is_settled ?? false,
          paid_amount: debt?.paid_amount ?? 0,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menyimpan");
      }

      // Wallet Sync: only on NEW records, not edits
      if (!isEditing && syncToWallet && walletId) {
        const isHutang = type === "hutang";
        const txRes = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: isHutang
              ? `Pinjam uang dari ${personName.trim()}`
              : `Pinjamkan uang ke ${personName.trim()}`,
            amount: Number(amount),
            category: isHutang ? "Hutang" : "Piutang",
            type: isHutang ? "income" : "expense",
            wallet_id: walletId,
            date: new Date().toISOString().split("T")[0],
          }),
        });
        if (!txRes.ok) {
          console.error("Wallet sync failed, but debt record was created.");
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
      <DialogContent className="sm:max-w-lg rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm">
            <HandCoins className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            {debt ? "Edit Catatan" : "Catatan Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            {debt ? "Perbarui informasi utang atau piutang ini." : "Catat hutang atau piutang baru Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Type Toggle */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Jenis</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("hutang")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                  type === "hutang"
                    ? "border-expense bg-expense/10 scale-[1.02] shadow-md"
                    : "border-border/30 hover:border-expense/40 hover:bg-muted/20"
                }`}
              >
                <TrendingDown className={`w-6 h-6 ${type === "hutang" ? "text-expense" : "text-muted-foreground"}`} />
                <div className="text-center">
                  <p className={`font-bold text-sm ${type === "hutang" ? "text-expense" : "text-foreground"}`}>Hutang</p>
                  <p className="text-[10px] text-muted-foreground">Saya yang berhutang</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType("piutang")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                  type === "piutang"
                    ? "border-income bg-income/10 scale-[1.02] shadow-md"
                    : "border-border/30 hover:border-income/40 hover:bg-muted/20"
                }`}
              >
                <TrendingUp className={`w-6 h-6 ${type === "piutang" ? "text-income" : "text-muted-foreground"}`} />
                <div className="text-center">
                  <p className={`font-bold text-sm ${type === "piutang" ? "text-income" : "text-foreground"}`}>Piutang</p>
                  <p className="text-[10px] text-muted-foreground">Orang lain berhutang</p>
                </div>
              </button>
            </div>
          </div>

          {/* Person name */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">
              {type === "hutang" ? "Nama Pemberi Hutang" : "Nama Peminjam"}
            </Label>
            <Input
              placeholder={type === "hutang" ? "Misal: Budi" : "Misal: Ani"}
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              required
              className="h-12 rounded-2xl border-border/40 font-semibold"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Jumlah (Rp)</Label>
              <Input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                type="number"
                min="1"
                placeholder="500000"
                required
                className="h-12 rounded-2xl border-border/40 font-semibold tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Jatuh Tempo</Label>
              <Input
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                type="date"
                className="h-12 rounded-2xl border-border/40 font-semibold"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Keterangan (Opsional)</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: untuk bayar kontrakan"
              className="h-12 rounded-2xl border-border/40 font-semibold"
            />
          </div>

          {/* Wallet Sync — only for NEW records */}
          {!isEditing && wallets.length > 0 && (
            <div className="space-y-3 p-4 rounded-2xl bg-muted/10 border border-border/20">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="sync-wallet-create"
                  checked={syncToWallet}
                  onCheckedChange={(c) => setSyncToWallet(!!c)}
                  className="rounded-md"
                />
                <Label htmlFor="sync-wallet-create" className="text-sm font-semibold cursor-pointer">
                  Sinkronisasi ke Dompet
                </Label>
              </div>

              {syncToWallet && (
                <div className="space-y-2 pl-7">
                  <Label className="text-xs font-black uppercase tracking-widest ml-1">
                    {type === "hutang" ? "Masuk ke dompet" : "Potong dari dompet"}
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
                  <p className="text-[10px] text-muted-foreground/60 ml-1">
                    {type === "hutang"
                      ? "💡 Anda meminjam uang, saldo dompet akan bertambah (Income)."
                      : "💡 Anda meminjamkan uang, saldo dompet akan berkurang (Expense)."}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-expense/10 text-expense text-xs font-bold">
              {error}
            </div>
          )}

          <DialogFooter className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first">
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !personName.trim() || !amount}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : debt ? "Simpan Perubahan" : "Tambah Catatan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
