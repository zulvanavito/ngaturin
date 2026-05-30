"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Settings2, TrendingDown, TrendingUp, Loader2, AlertTriangle, ArrowRight, Search, X, Tag } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { CategoryIcon } from "@/components/categories/category-icon";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCategorySearch } from "@/hooks/use-category-search";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

  // Dynamic categories and wallets
  const { categories: allCategories, loading: catLoading } = useCategories();
  const { wallets: allWallets } = useWallets();

  const [description, setDescription] = useState(editingTransaction?.description || "");
  const [amount, setAmount] = useState<number>(editingTransaction?.amount || 0);
  const [category, setCategory] = useState(editingTransaction?.category || "");
  
  // Default to first wallet if not editing
  const initialWalletId = useMemo(() => {
    if (editingTransaction?.wallet_id) return editingTransaction.wallet_id;
    if (allWallets.length > 0) return allWallets[0].id;
    return "";
  }, [editingTransaction, allWallets]);

  const [walletId, setWalletId] = useState(initialWalletId);

  // Sync walletId if wallets load and we don't have one yet
  useMemo(() => {
    if (!walletId && allWallets.length > 0) {
      setWalletId(allWallets[0].id);
    }
  }, [allWallets, walletId]);

  const initialType = (editingTransaction?.type === "transfer" ? "expense" : editingTransaction?.type) ?? defaultType ?? "expense";
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fuzzy Search for Categories
  const [catSearchQuery, setCatSearchQuery] = useState("");
  const deferredCatQuery = useDeferredValue(catSearchQuery);
  const searchedCategories = useCategorySearch(allCategories, deferredCatQuery, type);

  // Fuzzy Search for Wallets
  const [walletSearchQuery, setWalletSearchQuery] = useState("");
  const deferredWalletQuery = useDeferredValue(walletSearchQuery);
  const searchedWallets = useFuzzySearch(allWallets, deferredWalletQuery, {
    keys: ["name"],
    threshold: 0.3,
  });

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
    if (!walletId) {
      setError("Pilih dompet terlebih dahulu");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const sanitizedWalletId = walletId || null;
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
        setAmount(0);
        setCategory("");
        setWalletId(allWallets[0]?.id || "");
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

        {/* Missing Category Alert (Shadcn UI) */}
        {!catLoading && allCategories.length === 0 && (
          <Alert className="mt-4 bg-amber-500/10 border-amber-500/20 rounded-[1.5rem] animate-in fade-in slide-in-from-top-2 duration-300">
            <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Kategori Wajib
            </AlertTitle>
            <AlertDescription className="mt-1">
              <p className="text-[11px] text-muted-foreground font-medium leading-tight mb-2">
                Buat minimal satu kategori (misal: Makan, Gaji) untuk mencatat transaksi.
              </p>
              <Link 
                href="/dashboard/categories" 
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:underline"
              >
                Buat Sekarang <ArrowRight className="w-3 h-3" />
              </Link>
            </AlertDescription>
          </Alert>
        )}
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
            <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest ml-1">Jumlah</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onChange={setAmount}
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
            
            <div className="relative">
              <Select
                value={category}
                onValueChange={setCategory}
                required
                disabled={catLoading || allCategories.length === 0}
              >
                <SelectTrigger id="category" className="h-12 rounded-2xl border-border/40 px-4">
                  <SelectValue placeholder={catLoading ? "Memuat kategori..." : "Pilih kategori"} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[350px]">
                  {/* Category Search Input - Leveraging Fuse.js */}
                  <div className="sticky top-0 p-2 bg-popover z-10 border-b border-border/10">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        className="w-full h-9 pl-9 pr-8 bg-muted/50 rounded-xl text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="Cari kategori..."
                        value={catSearchQuery}
                        onChange={(e) => setCatSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()} 
                      />
                      {catSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCatSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-1">
                    {searchedCategories.length > 0 ? (
                      searchedCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className="text-[10px] font-medium uppercase tracking-widest py-2.5">
                          <div className="flex items-center gap-2">
                            <CategoryIcon iconName={cat.icon} className="w-4 h-4 opacity-70" />
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : deferredCatQuery ? (
                      <div className="py-6 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori tidak ditemukan</p>
                      </div>
                    ) : null}
                  </div>
                </SelectContent>
              </Select>
            </div>

           
            {catLoading && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Memuat daftar kategori...
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

        {allWallets.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="wallet" className="flex items-center gap-1 text-xs font-black uppercase tracking-widest ml-1">
              Dompet
            </Label>
            <Select value={walletId} onValueChange={setWalletId} required>
              <SelectTrigger id="wallet" className="h-12 rounded-2xl border-border/40 px-4 w-full">
                <SelectValue placeholder="Pilih dompet..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[350px]">
                {/* Wallet Search Input - Leveraging Fuse.js */}
                <div className="sticky top-0 p-2 bg-popover z-10 border-b border-border/10">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      className="w-full h-9 pl-9 pr-8 bg-muted/50 rounded-xl text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="Cari dompet..."
                      value={walletSearchQuery}
                      onChange={(e) => setWalletSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()} 
                    />
                    {walletSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setWalletSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-1">
                  {searchedWallets.length > 0 ? (
                    searchedWallets.map((w) => (
                      <SelectItem key={w.id} value={w.id} className="text-[10px] font-medium uppercase tracking-widest py-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconName={w.icon} className="w-4 h-4 opacity-70" />
                          <span>{w.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : deferredWalletQuery ? (
                    <div className="py-6 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dompet tidak ditemukan</p>
                    </div>
                  ) : null}
                </div>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-auto pt-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
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
