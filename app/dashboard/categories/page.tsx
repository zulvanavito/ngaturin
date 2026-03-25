"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Tag, Loader2, X, Check } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/lib/toast-context";

const COMMON_ICONS = ["🍔","🚗","🛍️","📄","🎬","🏠","💰","📈","📦","✈️","🏥","📚","🎮","☕","🎁","💼","🔧","🐾","⚽","🎵"];

export default function CategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Form state
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("📦");
  const [formType, setFormType] = useState("expense");

  const resetForm = () => {
    setFormName("");
    setFormIcon("📦");
    setFormType("expense");
    setError(null);
  };

  const startAdd = () => {
    resetForm();
    setEditingId(null);
    setIsAdding(true);
  };

  const startEdit = (cat: { id: string; name: string; icon: string; type: string }) => {
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormType(cat.type);
    setError(null);
    setIsAdding(false);
    setEditingId(cat.id);
  };

  const handleSave = async () => {
    if (!formName.trim()) { setError("Nama kategori tidak boleh kosong"); return; }
    setSaving(true);
    setError(null);
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), icon: formIcon, type: formType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refetch();
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      showToast("success", editingId ? `Kategori "${formName}" berhasil diperbarui!` : `Kategori "${formName}" berhasil ditambahkan!`);
    } catch (err: any) {
      setError(err.message);
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const catName = categories.find(c => c.id === deleteId)?.name || "Kategori";
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      await refetch();
      showToast("success", `Kategori "${catName}" berhasil dihapus.`);
    } catch (err: any) {
      setError(err.message);
      showToast("error", err.message);
    } finally {
      setSaving(false);
      setDeleteId(null);
    }
  };

  const typeLabel: Record<string, { label: string; color: string }> = {
    expense: { label: "Pengeluaran", color: "bg-expense/10 text-expense border-expense/20" },
    income: { label: "Pemasukan", color: "bg-income/10 text-income border-income/20" },
    all: { label: "Keduanya", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back + Header */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori Kustom</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola kategori untuk transaksi dan anggaran Anda.
          </p>
        </div>
        <Button onClick={startAdd} className="bg-primary hover:brightness-110 text-primary-foreground gap-2 h-11 rounded-xl shadow-md">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] animate-in fade-in slide-in-from-top-4 overflow-hidden">
          <CardHeader className="pb-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editingId ? "Edit Kategori" : "Kategori Baru"}</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Ikon</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormIcon(emoji)}
                    className={`text-xl w-10 h-10 rounded-xl border transition-all ${formIcon === emoji ? "border-primary bg-primary/10 scale-110" : "border-border/40 hover:border-primary/40 bg-muted/30"}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Ikon terpilih: <span className="text-lg">{formIcon}</span></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nama Kategori</Label>
                <Input
                  id="cat-name"
                  placeholder="Contoh: Olahraga"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-type">Berlaku Untuk</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger id="cat-type" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="all">Keduanya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}

            <Button onClick={handleSave} disabled={saving || !formName.trim()} className="w-full bg-primary hover:brightness-110 text-primary-foreground shadow-md h-11 rounded-xl">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category List */}
      <Card className="border border-border/40 bg-white dark:bg-card rounded-[2rem] overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Daftar Kategori</CardTitle>
            <Badge variant="secondary" className="ml-auto">{categories.length}</Badge>
          </div>
          <CardDescription>Kategori ini tersedia di form transaksi dan anggaran</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat kategori...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Tag className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>Belum ada kategori. Mulai tambahkan di atas!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {categories.map((cat) => (
                <div key={cat.id} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group ${editingId === cat.id ? "bg-primary/5" : ""}`}>
                  <span className="text-2xl w-8 text-center">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{cat.name}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeLabel[cat.type]?.color}`}>
                    {typeLabel[cat.type]?.label}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEdit(cat)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(cat.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori ini? Transaksi yang sudah menggunakan kategori ini tidak akan terpengaruh, tapi kategori ini tidak akan tersedia lagi untuk transaksi baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
