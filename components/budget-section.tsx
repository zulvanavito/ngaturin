"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCategories } from "@/hooks/use-categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Target, X, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

interface BudgetSectionProps {
  transactions: any[];
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 6; // 2x3 grid

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

function formatRupiah(value: string) {
  const n = value.replace(/\D/g, "");
  if (!n) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(parseInt(n, 10));
}

// ── Budget Card ────────────────────────────────────────────────────────────────
function BudgetCard({
  budget,
  spent,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  spent: number;
  onEdit: (b: Budget) => void;
  onDelete: (b: Budget) => void;
}) {
  const pct = budget.amount > 0 ? Math.min(Math.round((spent / budget.amount) * 100), 100) : 0;
  const barColor =
    pct >= 90 ? "bg-rose-500" :
    pct >= 75 ? "bg-amber-500" :
    "bg-emerald-500";
  const textColor =
    pct >= 90 ? "text-rose-600 dark:text-rose-400" :
    pct >= 75 ? "text-amber-600 dark:text-amber-400" :
    "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="group relative rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-5 hover:shadow-md hover:border-border/60 transition-all duration-200">
      {/* Actions (hover) */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(budget)}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(budget)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Category */}
      <p className="font-semibold text-sm mb-3 pr-16 truncate">{budget.category}</p>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-muted/60 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Terpakai</p>
          <p className={`text-sm font-bold ${textColor}`}>{formatCurrency(spent)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Anggaran</p>
          <p className="text-sm font-medium">{formatCurrency(budget.amount)}</p>
        </div>
      </div>

      {/* Percentage badge */}
      <div className={`mt-3 text-right text-xs font-semibold ${textColor}`}>
        {pct}% {pct >= 100 ? "⚠️ Melebihi!" : pct >= 90 ? "🔴 Hampir habis" : pct >= 75 ? "🟡 Waspada" : "🟢 Aman"}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function BudgetSection({ transactions }: BudgetSectionProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");

  // Delete dialog
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { expenseCategories, loading: catLoading } = useCategories();

  const supabase = createClient();
  const currentMonth = new Date().toISOString().substring(0, 7);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchBudgets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("budgets").select("*")
        .eq("user_id", user.id).eq("month", currentMonth)
        .order("category", { ascending: true });
      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, currentMonth]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(budgets.length / ITEMS_PER_PAGE);
  const paginatedBudgets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return budgets.slice(start, start + ITEMS_PER_PAGE);
  }, [budgets, currentPage]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getSpent = (cat: string) =>
    transactions.filter(t => t.type === "expense" && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0);

  const openAdd = () => {
    setEditingBudget(null);
    setFormCategory("");
    setFormAmount("");
    setIsFormOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormCategory(b.category);
    setFormAmount(String(b.amount));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
    setFormCategory("");
    setFormAmount("");
  };

  // ── Save (Add / Edit) ───────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const parsedAmount = parseInt(formAmount.replace(/\D/g, ""), 10);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return;

      if (editingBudget) {
        // Edit existing
        await supabase.from("budgets")
          .update({ amount: parsedAmount, category: formCategory })
          .eq("id", editingBudget.id);
      } else {
        // Add new — if same category exists this month, update instead
        const existing = budgets.find(b => b.category === formCategory);
        if (existing) {
          await supabase.from("budgets").update({ amount: parsedAmount }).eq("id", existing.id);
        } else {
          await supabase.from("budgets").insert({
            user_id: user.id, category: formCategory, amount: parsedAmount, month: currentMonth,
          });
        }
      }
      await fetchBudgets();
      closeForm();
    } catch (err) {
      console.error("Error saving budget:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingBudget) return;
    setIsDeleting(true);
    try {
      await supabase.from("budgets").delete().eq("id", deletingBudget.id);
      await fetchBudgets();
      // Fix page if now empty
      const newTotal = Math.ceil((budgets.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > newTotal && newTotal > 0) setCurrentPage(newTotal);
    } catch (err) {
      console.error("Error deleting budget:", err);
    } finally {
      setIsDeleting(false);
      setDeletingBudget(null);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="shadow-sm border-0 bg-card/60 backdrop-blur-xl animate-pulse h-40">
        <CardContent className="h-full flex items-center justify-center text-muted-foreground text-sm">
          Memuat anggaran...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border-0 bg-card/60 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Anggaran Bulanan
            </CardTitle>
            <CardDescription>
              {budgets.length} anggaran aktif · Bulan Ini
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={openAdd} className="h-9 gap-1">
            <Plus className="w-4 h-4" /> Set Anggaran
          </Button>
        </CardHeader>

        <CardContent className="p-5">
          {budgets.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50 text-sm font-medium">
              Belum ada target anggaran. Klik <strong>"Set Anggaran"</strong> untuk memulai!
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedBudgets.map((b) => (
                  <BudgetCard
                    key={b.id}
                    budget={b}
                    spent={getSpent(b.category)}
                    onEdit={openEdit}
                    onDelete={setDeletingBudget}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}>
                      ← Sebelumnya
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}>
                      Selanjutnya →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Anggaran" : "Set Anggaran Baru"}</DialogTitle>
            <DialogDescription>
              {editingBudget
                ? "Ubah kategori atau nominal anggaran."
                : "Tentukan batas pengeluaran untuk sebuah kategori bulan ini."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="dlg-category">Kategori</Label>
              <Select
                value={formCategory}
                onValueChange={setFormCategory}
                required
                disabled={catLoading || expenseCategories.length === 0}
              >
                <SelectTrigger id="dlg-category" className="h-10">
                  <SelectValue placeholder={catLoading ? "Memuat..." : "Pilih kategori"} />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!catLoading && expenseCategories.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  ⚠️ Belum ada kategori.{" "}
                  <Link href="/dashboard/categories" className="font-semibold underline">
                    Tambah sekarang →
                  </Link>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dlg-amount">Batas Nominal (Rp)</Label>
              <Input
                id="dlg-amount"
                value={formatRupiah(formAmount)}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="Rp 0"
                required
                className="h-10"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
              <Button
                type="submit"
                className="gradient-primary text-white"
                disabled={saving || !formCategory || !formAmount}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? "Menyimpan..." : editingBudget ? "Simpan Perubahan" : "Simpan Anggaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      <Dialog open={!!deletingBudget} onOpenChange={(open) => { if (!open) setDeletingBudget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Anggaran</DialogTitle>
            <DialogDescription>
              Hapus anggaran <strong>{deletingBudget?.category}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingBudget(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
