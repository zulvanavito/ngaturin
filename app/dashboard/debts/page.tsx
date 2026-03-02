"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, Loader2, ChevronLeft, TrendingDown, TrendingUp, CheckCircle2, Clock,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";

interface Debt {
  id: string;
  type: "hutang" | "piutang";
  person_name: string;
  amount: number;
  description: string | null;
  due_date: string | null;
  is_settled: boolean;
  created_at: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "hutang" | "piutang">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "settled">("all");
  const { showToast } = useToast();

  const [formType, setFormType] = useState<"hutang" | "piutang">("hutang");
  const [formPerson, setFormPerson] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  const fetchDebts = useCallback(async () => {
    const res = await fetch("/api/debts");
    if (res.ok) {
      const data = await res.json();
      setDebts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);

  const openAdd = (defaultType: "hutang" | "piutang" = "hutang") => {
    setEditingDebt(null);
    setFormType(defaultType);
    setFormPerson(""); setFormAmount(""); setFormDesc(""); setFormDueDate("");
    setIsFormOpen(true);
  };

  const openEdit = (d: Debt) => {
    setEditingDebt(d);
    setFormType(d.type);
    setFormPerson(d.person_name);
    setFormAmount(String(d.amount));
    setFormDesc(d.description || "");
    setFormDueDate(d.due_date ? d.due_date.split("T")[0] : "");
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingDebt ? `/api/debts/${editingDebt.id}` : "/api/debts";
      const method = editingDebt ? "PUT" : "POST";
      const body = {
        type: formType,
        person_name: formPerson,
        amount: Number(formAmount),
        description: formDesc || null,
        due_date: formDueDate || null,
        is_settled: editingDebt?.is_settled ?? false,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchDebts();
      setIsFormOpen(false);
      showToast("success", editingDebt ? "Catatan berhasil diperbarui!" : "Catatan berhasil ditambahkan!");
    } catch (err: any) {
      showToast("error", err.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleToggleSettle = async (debt: Debt) => {
    try {
      const res = await fetch(`/api/debts/${debt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...debt, is_settled: !debt.is_settled }),
      });
      if (!res.ok) throw new Error();
      await fetchDebts();
      showToast("success", debt.is_settled ? "Ditandai belum lunas." : "Ditandai sudah lunas! 🎉");
    } catch {
      showToast("error", "Gagal mengubah status");
    }
  };

  const handleDelete = async () => {
    if (!deletingDebt) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/debts/${deletingDebt.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchDebts();
      setDeletingDebt(null);
      showToast("success", "Catatan berhasil dihapus.");
    } catch {
      showToast("error", "Gagal menghapus");
      setDeletingDebt(null);
    } finally { setIsDeleting(false); }
  };

  const filtered = debts.filter((d) => {
    if (filterType !== "all" && d.type !== filterType) return false;
    if (filterStatus === "active" && d.is_settled) return false;
    if (filterStatus === "settled" && !d.is_settled) return false;
    return true;
  });

  const totalHutang = debts.filter(d => d.type === "hutang" && !d.is_settled).reduce((s, d) => s + d.amount, 0);
  const totalPiutang = debts.filter(d => d.type === "piutang" && !d.is_settled).reduce((s, d) => s + d.amount, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utang & Piutang</h1>
          <p className="text-sm text-muted-foreground mt-1">Catat dan pantau utang serta piutang Anda.</p>
        </div>
        <Button onClick={() => openAdd()} className="gradient-primary text-white gap-2 h-10 shrink-0">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openAdd("hutang")}
          className="relative overflow-hidden rounded-2xl bg-rose-500/5 border border-rose-500/15 p-4 text-left hover:bg-rose-500/10 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-rose-500/15 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hutang</span>
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 leading-tight">{formatCurrency(totalHutang)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {debts.filter(d => d.type === "hutang" && !d.is_settled).length} belum lunas
          </p>
          <span className="absolute bottom-3 right-3 text-rose-400/30 group-hover:text-rose-400/50 transition-colors">
            <Plus className="w-4 h-4" />
          </span>
        </button>
        <button
          onClick={() => openAdd("piutang")}
          className="relative overflow-hidden rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-4 text-left hover:bg-emerald-500/10 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-emerald-500/15 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Piutang</span>
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">{formatCurrency(totalPiutang)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {debts.filter(d => d.type === "piutang" && !d.is_settled).length} belum lunas
          </p>
          <span className="absolute bottom-3 right-3 text-emerald-400/30 group-hover:text-emerald-400/50 transition-colors">
            <Plus className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "hutang", "piutang"] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterType === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted"
            }`}
          >
            {t === "all" ? "Semua" : t === "hutang" ? "Hutang" : "Piutang"}
          </button>
        ))}
        <div className="w-px bg-border/40 mx-1" />
        {(["all", "active", "settled"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted"
            }`}
          >
            {s === "all" ? "Semua Status" : s === "active" ? "Belum Lunas" : "Lunas"}
          </button>
        ))}
      </div>

      {/* List */}
      <Card className="border-0 bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Daftar Catatan</span>
            <Badge variant="secondary">{filtered.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-14 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground text-sm">
              <div className="text-4xl mb-3">💸</div>
              <p>Belum ada catatan. Tambahkan di atas!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map((d) => {
                const isOverdue = d.due_date && !d.is_settled && new Date(d.due_date) < new Date();
                return (
                  <div
                    key={d.id}
                    className={`flex items-start gap-3 px-5 py-4 hover:bg-muted/20 transition-colors ${d.is_settled ? "opacity-50" : ""}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      d.type === "hutang" ? "bg-rose-500/10" : "bg-emerald-500/10"
                    }`}>
                      {d.type === "hutang"
                        ? <TrendingDown className="w-4 h-4 text-rose-500" />
                        : <TrendingUp className="w-4 h-4 text-emerald-500" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{d.person_name}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-4 ${d.type === "hutang"
                            ? "border-rose-500/30 text-rose-500"
                            : "border-emerald-500/30 text-emerald-500"}`}
                        >
                          {d.type === "hutang" ? "Hutang" : "Piutang"}
                        </Badge>
                        {d.is_settled && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted text-muted-foreground">
                            Lunas
                          </Badge>
                        )}
                      </div>
                      {d.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.description}</p>
                      )}
                      {d.due_date && (
                        <div className={`flex items-center gap-1 mt-0.5 text-xs ${isOverdue ? "text-rose-500" : "text-muted-foreground"}`}>
                          <Clock className="w-3 h-3" />
                          {isOverdue ? "Jatuh tempo: " : "Tenggat: "}{formatDate(d.due_date)}
                          {isOverdue && " ⚠️"}
                        </div>
                      )}
                    </div>

                    {/* Amount + actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className={`text-sm font-bold ${d.type === "hutang"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"}`}>
                        {formatCurrency(d.amount)}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className={`h-7 w-7 ${d.is_settled ? "text-muted-foreground" : "text-emerald-500"}`}
                          title={d.is_settled ? "Tandai belum lunas" : "Tandai lunas"}
                          onClick={() => handleToggleSettle(d)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(d)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeletingDebt(d)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) setIsFormOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDebt ? "Edit Catatan" : "Catatan Baru"}</DialogTitle>
            <DialogDescription>Catat hutang atau piutang Anda.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select value={formType} onValueChange={(v: any) => setFormType(v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hutang">💸 Hutang (saya yang berhutang)</SelectItem>
                  <SelectItem value="piutang">💰 Piutang (orang lain yang berhutang)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{formType === "hutang" ? "Nama Pemberi Hutang" : "Nama Peminjam"}</Label>
              <Input
                value={formPerson}
                onChange={e => setFormPerson(e.target.value)}
                placeholder={formType === "hutang" ? "Misal: Budi" : "Misal: Ani"}
                required className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input value={formAmount} onChange={e => setFormAmount(e.target.value)} type="number" min="1" placeholder="500000" required className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo (Opsional)</Label>
                <Input value={formDueDate} onChange={e => setFormDueDate(e.target.value)} type="date" className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Keterangan (Opsional)</Label>
              <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Contoh: untuk bayar kontrakan" className="h-10" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
              <Button type="submit" className="gradient-primary text-white" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingDebt ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingDebt} onOpenChange={(o) => { if (!o) setDeletingDebt(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Catatan?</DialogTitle>
            <DialogDescription>
              Hapus catatan <strong>{deletingDebt?.type === "hutang" ? "hutang" : "piutang"}</strong> dengan <strong>{deletingDebt?.person_name}</strong> sebesar <strong>{deletingDebt && formatCurrency(deletingDebt.amount)}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDebt(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
