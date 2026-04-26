"use client";

import { useState, useEffect } from "react";
import { Tag, Info, Search } from "lucide-react";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CategoryIcon, ICON_OPTIONS } from "@/components/categories/category-icon";
import { Category } from "@/components/categories/category-card";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

export function CategoryFormModal({ open, onClose, onSuccess, category }: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Package");
  const [type, setType] = useState("expense");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [iconSearch, setIconSearch] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setType(category.type);
    } else {
      setName("");
      setIcon("Package");
      setType("expense");
    }
    setError("");
    setIconSearch("");
  }, [category, open]);

  const filteredIcons = iconSearch.trim()
    ? ICON_OPTIONS.filter(i =>
        i.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
        i.name.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : ICON_OPTIONS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kategori tidak boleh kosong.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const url = category ? `/api/categories/${category.id}` : "/api/categories";
      const method = category ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), icon, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan kategori");
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
            <Tag className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            {category ? "Edit Kategori" : "Buat Kategori Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            {category ? "Perbarui nama, ikon, atau tipe kategori ini." : "Pilih ikon, beri nama, dan tentukan tipe kategori."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Icon Picker */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Pilih Ikon</Label>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Cari ikon..."
                value={iconSearch}
                onChange={e => setIconSearch(e.target.value)}
                className="h-10 pl-9 rounded-xl border-border/40 text-sm"
              />
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
              {filteredIcons.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  title={opt.label}
                  aria-label={`Ikon ${opt.label}`}
                  onClick={() => setIcon(opt.name)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                    icon === opt.name
                      ? "border-primary bg-primary/10 scale-105 shadow-md"
                      : "border-border/30 hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <CategoryIcon iconName={opt.name} className="w-5 h-5" />
                </button>
              ))}
              {filteredIcons.length === 0 && (
                <p className="col-span-full text-center text-xs text-muted-foreground py-4">Tidak ditemukan.</p>
              )}
            </div>

            {/* Selected preview */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
              <span>Terpilih:</span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <CategoryIcon iconName={icon} className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-foreground">{ICON_OPTIONS.find(o => o.name === icon)?.label || icon}</span>
            </div>
          </div>

          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Nama Kategori</Label>
              <Input
                placeholder="Contoh: Olahraga"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-12 rounded-2xl border-border/40 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Berlaku Untuk</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 rounded-2xl border-border/40 font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  <SelectItem value="expense" className="rounded-xl cursor-pointer">Pengeluaran</SelectItem>
                  <SelectItem value="income" className="rounded-xl cursor-pointer">Pemasukan</SelectItem>
                  <SelectItem value="all" className="rounded-xl cursor-pointer">Keduanya</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={isLoading || !name.trim()}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? "Menyimpan..." : category ? "Simpan Perubahan" : "Buat Kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
