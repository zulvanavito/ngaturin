"use client";

import { useState } from "react";
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
import { Plus, Save, X } from "lucide-react";

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  created_at: string;
  updated_at: string;
}

interface TransactionFormProps {
  editingTransaction?: Transaction | null;
  onCancel?: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "Makanan", label: "🍔 Makanan" },
  { value: "Transport", label: "🚗 Transport" },
  { value: "Belanja", label: "🛍️ Belanja" },
  { value: "Tagihan", label: "📄 Tagihan" },
  { value: "Gaji", label: "💰 Gaji" },
  { value: "Lainnya", label: "📦 Lainnya" },
];

export function TransactionForm({
  editingTransaction,
  onCancel,
  onSuccess,
}: TransactionFormProps) {
  const isEditing = !!editingTransaction;

  const [description, setDescription] = useState(editingTransaction?.description || "");
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || "");
  const [category, setCategory] = useState(editingTransaction?.category || "");
  const [type, setType] = useState<"income" | "expense">(editingTransaction?.type || "expense");
  const [date, setDate] = useState(
    editingTransaction?.date || new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = { description, amount: Number(amount), category, type, date };

      const url = isEditing
        ? `/api/transactions/${editingTransaction.id}`
        : "/api/transactions";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Terjadi kesalahan");
      }

      // Reset form if creating
      if (!isEditing) {
        setDescription("");
        setAmount("");
        setCategory("");
        setType("expense");
        setDate(new Date().toISOString().split("T")[0]);
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {isEditing ? (
            <>
              <Save className="w-5 h-5 text-primary" />
              Edit Transaksi
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-primary" />
              Tambah Transaksi
            </>
          )}
        </h2>
        {isEditing && onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/50 rounded-xl border border-border/30">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              type === "expense"
                ? "bg-white dark:bg-zinc-800 text-rose-500 shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              type === "income"
                ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pemasukan
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              placeholder="Contoh: Makan siang"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="50000"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category" className="h-11">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="mt-auto pt-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className={`w-full h-11 font-medium text-white ${
              type === "income"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-rose-500 hover:bg-rose-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
            {isLoading
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : type === "income"
                  ? "Tambah Pemasukan"
                  : "Tambah Pengeluaran"}
          </Button>
        </div>
      </form>
    </div>
  );
}
