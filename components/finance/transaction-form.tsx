"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Settings2, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { CategoryIcon } from "@/components/categories/category-icon";

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  category_icon?: string;
  type: "income" | "expense" | "transfer";
  date: string;
  wallet_id?: string;
  wallets?: { name: string } | null;
  debt_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface TransactionFormProps {
  editingTransaction?: Transaction | null;
  defaultType?: "income" | "expense";
  onCancel?: () => void;
  onSuccess: () => void;
}

export function TransactionForm({ editingTransaction, defaultType, onCancel, onSuccess }: TransactionFormProps) {
  const isEditing = !!editingTransaction;
  const { showToast } = useToast();

  // Dynamic categories from database
  const { categories: allCategories, loading: catLoading } = useCategories();
  const { wallets } = useWallets();

  const [description, setDescription] = useState(editingTransaction?.description || "");
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || "");
  const [category, setCategory] = useState(editingTransaction?.category || "");
  const [walletId, setWalletId] = useState(editingTransaction?.wallet_id || "_none");
  const initialType = (editingTransaction?.type === "transfer" ? "expense" : editingTransaction?.type) ?? defaultType ?? "expense";
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter categories based on the selected transaction type
  const filteredCategories = allCategories.filter((c) => c.type === type || c.type === "all");

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    // If the current category is no longer valid for the new type, reset it
    const stillValid = allCategories.some((c) => c.name === category && (c.type === newType || c.type === "all"));
    if (!stillValid) setCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError("Pilih kategori transaksi terlebih dahulu");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const sanitizedWalletId = (walletId && walletId !== "_none") ? walletId : null;
      const payload = { description, amount: Number(amount), category, type, date, wallet_id: sanitizedWalletId };
      const url = isEditing ? `/api/transactions/${editingTransaction.id}` : "/api/transactions";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Terjadi kesalahan");
      }

      if (!isEditing) {
        setDescription("");
        setAmount("");
        setCategory("");
        setWalletId("_none");
        setType("expense");
        setDate(new Date().toISOString().split("T")[0]);
      }
      showToast("success", isEditing ? `Transaksi berhasil diperbarui!` : `${type === "income" ? "Pemasukan" : "Pengeluaran"} berhasil ditambahkan!`);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
      showToast("error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col pt-2 sm:pt-0">
      <div className="mb-6 px-1">
        <h2 className="text-2xl font-black tracking-tight">
          {isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
        </h2>
        <p className="text-muted-foreground font-medium mt-1">
          Catat detail transaksi keuangan Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
        {/* Type Toggle */}
        <div className="space-y-3">
          <Label className="text-xs font-black uppercase tracking-widest ml-1">Jenis</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex flex-col items-center justify-center py-5 px-2 rounded-[24px] border-2 transition-all ${
                type === "expense"
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-500"
                  : "border-border/60 hover:border-border text-muted-foreground bg-transparent"
              }`}
            >
              <TrendingDown className={`w-6 h-6 mb-2 ${type === "expense" ? "text-rose-500" : "text-foreground"}`} />
              <span className={`font-bold text-[15px] ${type === "expense" ? "text-rose-500" : "text-foreground"}`}>Pengeluaran</span>
              <span className="text-[11px] mt-1 text-muted-foreground font-medium">Uang keluar</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex flex-col items-center justify-center py-5 px-2 rounded-[24px] border-2 transition-all ${
                type === "income"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                  : "border-border/60 hover:border-border text-muted-foreground bg-transparent"
              }`}
            >
              <TrendingUp className={`w-6 h-6 mb-2 ${type === "income" ? "text-emerald-500" : "text-foreground"}`} />
              <span className={`font-bold text-[15px] ${type === "income" ? "text-emerald-500" : "text-foreground"}`}>Pemasukan</span>
              <span className="text-[11px] mt-1 text-muted-foreground font-medium">Uang masuk</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest ml-1">Deskripsi</Label>
            <Input
              id="description"
              placeholder="Contoh: Makan siang"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="h-12 rounded-2xl border-border/40 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest ml-1">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="50000"
              min="0.01"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-12 rounded-2xl border-border/40 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest ml-1">Kategori</Label>
              <Link
                href="/dashboard/categories"
                className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                title="Kelola Kategori"
              >
                <Settings2 className="w-3 h-3" /> Atur
              </Link>
            </div>
            <Select
              value={category}
              onValueChange={setCategory}
              required
              disabled={catLoading || filteredCategories.length === 0}
            >
              <SelectTrigger id="category" className="h-12 rounded-2xl border-border/40 px-4">
                <SelectValue placeholder={catLoading ? "Memuat kategori..." : "Pilih kategori"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px]">
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name} className="text-[10px] font-medium uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <CategoryIcon iconName={cat.icon} className="w-4 h-4 opacity-70" />
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

           
            {catLoading && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 animate-pulse">
                <span>⌛</span> Memuat daftar kategori...
              </p>
            )}
            {!catLoading && filteredCategories.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                <span>⚠️</span> Belum ada kategori.
                <Link href="/dashboard/categories" className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-300">
                  Tambahkan sekarang →
                </Link>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest ml-1">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-12 rounded-2xl border-border/40 focus:ring-primary/20"
            />
          </div>
        </div>

        {wallets.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="wallet" className="flex items-center gap-1 text-xs font-black uppercase tracking-widest ml-1">
              Dompet
              <span className="text-[9px] text-muted-foreground font-normal tracking-normal normal-case">(opsional)</span>
            </Label>
            <Select value={walletId} onValueChange={setWalletId}>
              <SelectTrigger id="wallet" className="h-12 rounded-2xl border-border/40 px-4 w-full">
                <SelectValue placeholder="Pilih dompet..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="_none" className="text-[10px] font-black uppercase tracking-widest py-3">Tanpa Dompet</SelectItem>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id} className="text-[10px] font-medium uppercase tracking-widest py-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon iconName={w.icon} className="w-4 h-4 opacity-70" />
                      <span>{w.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-auto pt-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold mb-4">
              <span className="shrink-0 text-base">⚠️</span> {error}
            </div>
          )}

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            {onCancel && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                className="rounded-2xl h-14 sm:h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first "
              >
                Batal
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || !category}
              className={`rounded-2xl h-14 sm:h-12 px-8 font-black text-white shadow-lg active:scale-95 transition-all w-full sm:w-auto ${
                onCancel ? "sm:ml-auto" : "w-full"
              } ${
                type === "income" ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-primary text-primary-foreground hover:brightness-110"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : isEditing ? (
                "Simpan Perubahan"
              ) : type === "income" ? (
                "Tambah Pemasukan"
              ) : (
                "Tambah Pengeluaran"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
