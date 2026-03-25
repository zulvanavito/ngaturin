"use client";

import { useState } from "react";
import { useWallets, type Wallet } from "@/hooks/use-wallets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, ArrowLeftRight, ChevronLeft, Wallet as WalletIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { FeatureTip } from "@/components/feature-tip";

const WALLET_ICONS = ["💳","💵","🏦","📱","💰","🪙","💼","🏧","💲","🎴"];
const WALLET_COLORS = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#14b8a6","#f97316","#ec4899","#64748b","#0ea5e9"];
const WALLET_TYPES = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Rekening Bank" },
  { value: "emoney", label: "E-Money" },
  { value: "credit", label: "Kartu Kredit" },
];

export default function WalletsPage() {
  const { wallets, loading, refetch } = useWallets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  // Form state
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("💳");
  const [formType, setFormType] = useState("bank");
  const [formColor, setFormColor] = useState("#3b82f6");

  // Transfer state
  const [fromWallet, setFromWallet] = useState("");
  const [toWallet, setToWallet] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const openAdd = () => {
    setEditingWallet(null);
    setFormName(""); setFormIcon("💳"); setFormType("bank"); setFormColor("#3b82f6");
    setIsFormOpen(true);
  };

  const openEdit = (w: Wallet) => {
    setEditingWallet(w);
    setFormName(w.name); setFormIcon(w.icon); setFormType(w.type); setFormColor(w.color);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingWallet ? `/api/wallets/${editingWallet.id}` : "/api/wallets";
      const method = editingWallet ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, icon: formIcon, type: formType, color: formColor }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await refetch();
      setIsFormOpen(false);
      showToast("success", editingWallet ? `Dompet "${formName}" berhasil diperbarui!` : `Dompet "${formName}" berhasil ditambahkan!`);
    } catch (err: any) {
      showToast("error", err.message || "Gagal menyimpan dompet");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWallet) return;
    const walletName = deletingWallet.name;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/wallets/${deletingWallet.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      await refetch();
      setDeletingWallet(null);
      showToast("success", `Dompet "${walletName}" berhasil dihapus.`);
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus dompet");
      setDeletingWallet(null);
    } finally { setIsDeleting(false); }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferring(true); setTransferError(null);
    try {
      const amount = Number(transferAmount.replace(/\D/g, ""));
      
      // Validate balance
      const sourceWallet = wallets.find(w => w.id === fromWallet);
      if (!sourceWallet) throw new Error("Dompet asal tidak ditemukan");
      if (sourceWallet.balance < amount) {
        throw new Error(`Saldo tidak mencukupi. Saldo saat ini: Rp ${sourceWallet.balance.toLocaleString("id-ID")}`);
      }

      const res = await fetch(`/api/wallets/${fromWallet}/transfer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toWalletId: toWallet, amount, description: transferDesc }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setIsTransferOpen(false); setFromWallet(""); setToWallet(""); setTransferAmount(""); setTransferDesc("");
      await refetch();
      const fromName = wallets.find(w => w.id === fromWallet)?.name || "Dompet";
      const toName = wallets.find(w => w.id === toWallet)?.name || "Dompet";
      showToast("success", `Transfer Rp ${amount.toLocaleString("id-ID")} dari ${fromName} ke ${toName} berhasil!`);
    } catch (err: any) {
      setTransferError(err.message);
    } finally { setTransferring(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dompet & Akun</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola semua sumber keuangan Anda.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTransferOpen(true)} className="gap-2 h-11 rounded-xl" disabled={wallets.length < 2}>
            <ArrowLeftRight className="w-4 h-4" /> Transfer
          </Button>
          <Button onClick={openAdd} className="bg-primary text-primary-foreground hover:brightness-110 gap-2 h-11 rounded-xl shadow-md">
            <Plus className="w-4 h-4" /> Tambah
          </Button>
        </div>
      </div>

      <FeatureTip
        id="wallets"
        title="💡 Tips: Dompet & Akun"
        tips={[
          "Tambahkan semua sumber keuanganmu: rekening bank, dompet tunai, kartu kredit, atau e-wallet seperti GoPay dan OVO.",
          "Gunakan fitur Transfer untuk memindahkan saldo antar dompet — transaksinya otomatis tercatat di kedua sisi.",
          "Saldo kartu kredit bisa diisi negatif untuk mencerminkan tagihan yang belum dibayar.",
          "Klik ikon pensil pada kartu dompet untuk mengubah nama, ikon, atau warna kapan saja.",
        ]}
      />

      {/* Total Balance Summary */}
      {!loading && wallets.length > 0 && (
        <div className="rounded-[2rem] border border-border/40 bg-white dark:bg-card shadow-sm px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Saldo Semua Dompet</p>
            <p className="text-2xl font-bold tracking-tight">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
                wallets.reduce((sum, w) => sum + w.balance, 0)
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
      )}

      {/* Wallet Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : wallets.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border/50 bg-white/50 dark:bg-card/50 p-12 text-center text-muted-foreground text-sm shadow-sm">
          <WalletIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>Belum ada dompet. Klik <strong>&quot;Tambah&quot;</strong> untuk memulai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((w) => (
            <div key={w.id} className="group relative rounded-[2rem] border border-border/40 p-6 overflow-hidden hover:shadow-md transition-all bg-white dark:bg-card shadow-sm">
              {/* Color accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: w.color }} />

              {/* Actions */}
              <div className="absolute top-4 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(w)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeletingWallet(w)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mt-1 mb-3">
                <span className="text-2xl">{w.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{w.name}</p>
                  <Badge variant="secondary" className="text-xs mt-0.5 h-5 font-normal">
                    {WALLET_TYPES.find(t => t.value === w.type)?.label || w.type}
                  </Badge>
                </div>
              </div>

              {/* Balance */}
              <div className="mt-2 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-0.5">Saldo</p>
                <p className={`text-lg font-bold tabular-nums ${w.balance < 0 ? "text-red-500" : ""}`}>
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(w.balance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) setIsFormOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWallet ? "Edit Dompet" : "Tambah Dompet Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Ikon</Label>
              <div className="flex flex-wrap gap-2">
                {WALLET_ICONS.map(e => (
                  <button key={e} type="button" onClick={() => setFormIcon(e)}
                    className={`text-xl w-10 h-10 rounded-xl border transition-all ${formIcon === e ? "border-primary bg-primary/10 scale-110" : "border-border/40 hover:border-primary/40 bg-muted/30"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="flex gap-2 flex-wrap">
                {WALLET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${formColor === c ? "border-foreground scale-125" : "border-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="w-name">Nama Dompet</Label>
                <Input id="w-name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="BCA Utama" required className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-type">Tipe</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger id="w-type" className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WALLET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl shadow-md" disabled={saving || !formName}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingWallet ? "Simpan" : "Tambah Dompet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={(o) => { if (!o) setIsTransferOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Antar Dompet</DialogTitle>
            <DialogDescription>Pindahkan saldo dari satu dompet ke dompet lain.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dari</Label>
                <Select value={fromWallet} onValueChange={setFromWallet} required>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Pilih dompet..." /></SelectTrigger>
                  <SelectContent>{wallets.filter(w => w.id !== toWallet).map(w => <SelectItem key={w.id} value={w.id}>{w.icon} {w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ke</Label>
                <Select value={toWallet} onValueChange={setToWallet} required>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Pilih dompet..." /></SelectTrigger>
                  <SelectContent>{wallets.filter(w => w.id !== fromWallet).map(w => <SelectItem key={w.id} value={w.id}>{w.icon} {w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Jumlah (Rp)</Label>
              <Input value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="100000" type="number" min="1" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (Opsional)</Label>
              <Input value={transferDesc} onChange={e => setTransferDesc(e.target.value)} placeholder="Transfer ke tabungan" className="h-10" />
            </div>
            {transferError && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{transferError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl shadow-md" disabled={transferring || !fromWallet || !toWallet || !transferAmount}>
                {transferring && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingWallet} onOpenChange={(o) => { if (!o) setDeletingWallet(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Dompet</DialogTitle>
            <DialogDescription>Hapus dompet <strong>{deletingWallet?.name}</strong>? Transaksi yang terhubung tidak akan ikut terhapus.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingWallet(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? "Menghapus..." : "Hapus"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
