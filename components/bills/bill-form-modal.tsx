"use client";

import { useState, useEffect } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { type RecurringBill } from "@/components/bills/bill-card";
import { useCategories } from "@/hooks/use-categories";
import { CategoryIcon } from "@/components/categories/category-icon";

interface BillFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bill?: RecurringBill | null;
}

export function BillFormModal({ open, onClose, onSuccess, bill }: BillFormModalProps) {
  const { expenseCategories } = useCategories();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [planName, setPlanName] = useState("");
  const [isAutopay, setIsAutopay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setAmount(bill.amount);
      setCategory(bill.category || "");
      setDueDay(String(bill.due_day));
      setBillingCycle(bill.billing_cycle || "monthly");
      setPlanName(bill.plan_name || "");
      setIsAutopay(bill.is_autopay ?? false);
    } else {
      setName("");
      setAmount(0);
      setCategory("");
      setDueDay("1");
      setBillingCycle("monthly");
      setPlanName("");
      setIsAutopay(false);
    }
    setError("");
  }, [bill, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    setIsLoading(true);
    setError("");

    try {
      const url = bill ? `/api/recurring-bills/${bill.id}` : "/api/recurring-bills";
      const method = bill ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          amount: amount,
          category: category || null,
          due_day: Number(dueDay),
          is_active: bill?.is_active ?? true,
          billing_cycle: billingCycle,
          plan_name: planName.trim() || null,
          is_autopay: isAutopay,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menyimpan");
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
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            {bill ? "Edit Tagihan" : "Tagihan Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            {bill ? "Perbarui rincian tagihan rutin Anda." : "Buat catatan tagihan rutin baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Nama Tagihan</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Misal: Netflix, Listrik PLN"
              required
              className="h-12 rounded-2xl border-border/40 font-semibold"
            />
          </div>

          {/* Amount & Due Day */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Nominal</Label>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Jatuh Tempo (Tgl)</Label>
              <Input
                value={dueDay}
                onChange={e => setDueDay(e.target.value)}
                type="number"
                min="1"
                max="31"
                required
                className="h-12 rounded-2xl border-border/40 font-semibold tabular-nums"
              />
            </div>
          </div>

          {/* Billing Cycle & Plan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Siklus</Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger className="h-12 rounded-2xl border-border/40 font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  <SelectItem value="monthly" className="rounded-xl cursor-pointer">Bulanan</SelectItem>
                  <SelectItem value="yearly" className="rounded-xl cursor-pointer">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Plan (Opsional)</Label>
              <Input
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                placeholder="Premium, Family"
                className="h-12 rounded-2xl border-border/40 font-semibold"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Kategori (Opsional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-2xl border-border/40 font-semibold">
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40">
                {expenseCategories.map(c => (
                  <SelectItem key={c.id} value={c.name} className="rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                        <CategoryIcon iconName={c.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-sm">{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Autopay toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/20">
            <div>
              <p className="text-sm font-bold">Auto-pay</p>
              <p className="text-[10px] text-muted-foreground">Tagihan ini terpotong otomatis oleh bank.</p>
            </div>
            <Switch checked={isAutopay} onCheckedChange={setIsAutopay} />
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
              disabled={isLoading || !name.trim() || !amount}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : bill ? "Simpan Perubahan" : "Tambah Tagihan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
