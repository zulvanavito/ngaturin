"use client";

import { useState, useEffect, useCallback } from "react";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Bell, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";

interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: string | null;
  due_day: number;
  is_active: boolean;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function getDueStatus(dueDay: number): { label: string; color: string } {
  const today = new Date().getDate();
  const diff = dueDay - today;
  if (diff < 0) return { label: "Sudah lewat", color: "bg-red-500/10 text-red-600 border-red-500/20" };
  if (diff <= 3) return { label: `${diff} hari lagi`, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
  return { label: `Tgl ${dueDay}`, color: "bg-muted text-muted-foreground border-border/40" };
}

export default function BillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [deletingBill, setDeletingBill] = useState<RecurringBill | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const { categories } = useCategories();

  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDueDay, setFormDueDay] = useState("1");

  const fetchBills = useCallback(async () => {
    const res = await fetch("/api/recurring-bills");
    const data = await res.json();
    if (res.ok) setBills(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const openAdd = () => {
    setEditingBill(null);
    setFormName(""); setFormAmount(""); setFormCategory(""); setFormDueDay("1");
    setIsFormOpen(true);
  };

  const openEdit = (b: RecurringBill) => {
    setEditingBill(b);
    setFormName(b.name);
    setFormAmount(String(b.amount));
    setFormCategory(b.category || "");
    setFormDueDay(String(b.due_day));
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingBill ? `/api/recurring-bills/${editingBill.id}` : "/api/recurring-bills";
      const method = editingBill ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, amount: Number(formAmount), category: formCategory || null, due_day: Number(formDueDay), is_active: true }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchBills();
      setIsFormOpen(false);
      showToast("success", editingBill ? `Tagihan "${formName}" berhasil diperbarui!` : `Tagihan "${formName}" berhasil ditambahkan!`);
    } catch (err: any) { showToast("error", err.message || "Gagal menyimpan tagihan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingBill) return;
    const billName = deletingBill.name;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/recurring-bills/${deletingBill.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchBills();
      setDeletingBill(null);
      showToast("success", `Tagihan "${billName}" berhasil dihapus.`);
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus tagihan");
      setDeletingBill(null);
    } finally { setIsDeleting(false); }
  };

  const toggleActive = async (bill: RecurringBill) => {
    try {
      await fetch(`/api/recurring-bills/${bill.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bill, is_active: !bill.is_active }),
      });
      await fetchBills();
      showToast("info", `Tagihan "${bill.name}" ${bill.is_active ? "dinonaktifkan" : "diaktifkan"}.`);
    } catch {
      showToast("error", "Gagal mengubah status tagihan");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tagihan Berulang</h1>
          <p className="text-sm text-muted-foreground mt-1">Pantau tagihan rutin bulanan Anda.</p>
        </div>
        <Button onClick={openAdd} className="bg-brand-naval hover:bg-blue-900 text-white gap-2 h-11 rounded-xl shadow-md">
          <Plus className="w-4 h-4" /> Tambah Tagihan
        </Button>
      </div>

      <Card className="border border-border/40 bg-white dark:bg-card rounded-[2rem] overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Daftar Tagihan</CardTitle>
            <Badge variant="secondary" className="ml-auto">{bills.filter(b => b.is_active).length} aktif</Badge>
          </div>
          <CardDescription>Notifikasi muncul di dashboard 3 hari sebelum jatuh tempo.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat...
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>Belum ada tagihan. Tambahkan tagihan rutin di atas!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {bills.map((b) => {
                const status = getDueStatus(b.due_day);
                return (
                  <div key={b.id} className={`flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors ${!b.is_active ? "opacity-50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(b.amount)}{b.category ? ` · ${b.category}` : ""}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                      {status.label}
                    </span>
                    <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(b)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeletingBill(b)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) setIsFormOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBill ? "Edit Tagihan" : "Tagihan Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nama Tagihan</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Listrik PLN" required className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <Input value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="500000" type="number" min="1" required className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Jatuh Tempo</Label>
                <Input value={formDueDay} onChange={e => setFormDueDay(e.target.value)} type="number" min="1" max="31" placeholder="Tgl 1–31" required className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategori (Opsional)</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" className="bg-brand-naval hover:bg-blue-900 text-white rounded-xl shadow-md" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingBill ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingBill} onOpenChange={(o) => { if (!o) setDeletingBill(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Tagihan</DialogTitle>
            <DialogDescription>Hapus tagihan <strong>{deletingBill?.name}</strong>?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingBill(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? "Menghapus..." : "Hapus"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
