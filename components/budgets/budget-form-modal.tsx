"use client";

import { useState, useEffect } from "react";
import { PieChart, Info } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Budget } from "./budget-card";

interface BudgetFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budget?: Budget | null;
}

export function BudgetFormModal({ open, onClose, onSuccess, budget }: BudgetFormModalProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoriesList, setCategoriesList] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => setCategoriesList(Array.isArray(d) ? d : []))
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setAmount(budget.amount);
    } else {
      setCategory("");
      setAmount(0);
    }
    setError("");
  }, [budget, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) {
      setError("Kategori dan limit wajib diisi.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const currentMonth = format(new Date(), "yyyy-MM");
      const url = budget ? `/api/budgets/${budget.id}` : "/api/budgets";
      const method = budget ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: amount,
          month: currentMonth
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan anggaran");
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
      <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm"
            style={{ backgroundColor: `var(--primary-color, rgba(159, 232, 112, 0.15))`, color: "var(--primary-color, #9fe870)" }}
          >
            <PieChart className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            {budget ? "Edit Limit Anggaran" : "Buat Anggaran Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            Tetapkan batas pengeluaran untuk kategori tertentu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Kategori Pengeluaran</Label>
              {categoriesList.length > 0 ? (
                <Select value={category} onValueChange={setCategory} disabled={!!budget}>
                  <SelectTrigger className="h-14 rounded-2xl border-border/40 px-4 w-full font-semibold">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40">
                    {categoriesList.map((c) => (
                      <SelectItem key={c.id} value={c.name} className="rounded-xl cursor-pointer">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-14 rounded-2xl border border-dashed border-border/60 flex items-center justify-between px-4 bg-muted/20">
                  <span className="text-sm font-semibold text-muted-foreground mr-2 truncate">Belum ada Kategori</span>
                  <a href="/dashboard/categories" className="text-xs font-bold text-primary shrink-0 hover:underline">Tambah →</a>
                </div>
              )}
              {budget && <p className="text-[10px] text-muted-foreground ml-2">Kategori tidak dapat diubah pada anggaran yang sudah dibuat. Buat anggaran baru jika perlu.</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Limit Bulanan</Label>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                required
                className="h-14 text-xl font-bold"
              />
            </div>
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
              disabled={isLoading || !category || !amount}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? "Menyimpan..." : budget ? "Simpan Perubahan" : "Buat Anggaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
