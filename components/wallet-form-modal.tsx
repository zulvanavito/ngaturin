"use client";

import { useState, useEffect } from "react";
import { Wallet as WalletLucide, Search } from "lucide-react";
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

const WALLET_ICON_OPTIONS = [
  { name: "Wallet", label: "Dompet" },
  { name: "CreditCard", label: "Kartu Kredit" },
  { name: "Landmark", label: "Bank" },
  { name: "Smartphone", label: "E-Money" },
  { name: "Banknote", label: "Uang Tunai" },
  { name: "PiggyBank", label: "Celengan" },
  { name: "CircleDollarSign", label: "Dollar" },
  { name: "Briefcase", label: "Bisnis" },
  { name: "Home", label: "Rumah" },
  { name: "TrendingUp", label: "Investasi" },
  { name: "Receipt", label: "Kwitansi" },
  { name: "HandCoins", label: "Pinjaman" },
];

const WALLET_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#14b8a6", "#f97316", "#ec4899", "#64748b", "#0ea5e9",
  "#22c55e", "#a855f7",
];

const WALLET_TYPES = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Rekening Bank" },
  { value: "emoney", label: "E-Money" },
  { value: "credit", label: "Kartu Kredit" },
  { value: "investment", label: "Saham / Investasi" },
  { value: "crypto", label: "Crypto Asset" },
  { value: "debit", label: "Kartu Debit" },
];

interface WalletFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallet?: WalletData | null;
}

export function WalletFormModal({ open, onClose, onSuccess, wallet }: WalletFormModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Wallet");
  const [type, setType] = useState("bank");
  const [color, setColor] = useState("#3b82f6");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [iconSearch, setIconSearch] = useState("");

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setIcon(wallet.icon);
      setType(wallet.type);
      setColor(wallet.color);
    } else {
      setName("");
      setIcon("Wallet");
      setType("bank");
      setColor("#3b82f6");
    }
    setError("");
    setIconSearch("");
  }, [wallet, open]);

  const filteredIcons = iconSearch.trim()
    ? WALLET_ICON_OPTIONS.filter(i =>
        i.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
        i.name.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : WALLET_ICON_OPTIONS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Nama dompet tidak boleh kosong."); return; }

    setIsLoading(true);
    setError("");

    try {
      const url = wallet ? `/api/wallets/${wallet.id}` : "/api/wallets";
      const method = wallet ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), icon, type, color }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan dompet");
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
            <WalletLucide className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            {wallet ? "Edit Dompet" : "Buat Dompet Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            {wallet ? "Perbarui nama, ikon, atau tipe dompet ini." : "Buat kantong keuangan baru untuk memisahkan sumber dana Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Icon Picker */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Pilih Ikon</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Cari ikon..."
                value={iconSearch}
                onChange={e => setIconSearch(e.target.value)}
                className="h-10 pl-9 rounded-xl border-border/40 text-sm"
              />
            </div>
            <div className="grid grid-cols-6 gap-2 p-1">
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
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
              <span>Terpilih:</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
                <CategoryIcon iconName={icon} className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground">{WALLET_ICON_OPTIONS.find(o => o.name === icon)?.label || icon}</span>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest ml-1">Warna Aksen</Label>
            <div className="flex gap-2.5 flex-wrap">
              {WALLET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    color === c ? "border-foreground scale-125 shadow-lg" : "border-transparent hover:scale-110"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Nama Dompet</Label>
              <Input
                placeholder="BCA Utama"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-12 rounded-2xl border-border/40 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Tipe</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 rounded-2xl border-border/40 font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  {WALLET_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="rounded-xl cursor-pointer">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              disabled={isLoading || !name.trim()}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? "Menyimpan..." : wallet ? "Simpan Perubahan" : "Buat Dompet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
