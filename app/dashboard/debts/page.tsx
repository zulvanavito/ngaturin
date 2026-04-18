"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, ChevronLeft, Loader2, TrendingDown, TrendingUp, HandCoins, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { DebtCard, type Debt } from "@/components/debt-card";
import { DebtFormModal } from "@/components/debt-form-modal";
import { DebtPaymentModal } from "@/components/debt-payment-modal";
import { DebtUnsettleModal } from "@/components/debt-unsettle-modal";
import { DebtSettleConfirmationModal } from "@/components/debt-settle-confirmation-modal";
import { useToast } from "@/lib/toast-context";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isUnsettleOpen, setIsUnsettleOpen] = useState(false);
  const [isSettleConfirmOpen, setIsSettleConfirmOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [deleteDebtId, setDeleteDebtId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "hutang" | "piutang">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "settled">("all");
  const [showPersonSummary, setShowPersonSummary] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const fetchDebts = useCallback(async () => {
    try {
      const res = await fetch("/api/debts");
      if (res.ok) {
        const data = await res.json();
        // Ensure paid_amount defaults to 0
        setDebts(data.map((d: Debt) => ({ ...d, paid_amount: d.paid_amount || 0 })));
      }
    } catch (err) {
      console.error("Failed to fetch debts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);

  const filtered = useMemo(() => {
    return debts.filter((d) => {
      if (filterType !== "all" && d.type !== filterType) return false;
      if (filterStatus === "active" && d.is_settled) return false;
      if (filterStatus === "settled" && !d.is_settled) return false;
      return true;
    });
  }, [debts, filterType, filterStatus]);

  const stats = useMemo(() => {
    const totalHutang = debts.filter(d => d.type === "hutang" && !d.is_settled).reduce((s, d) => s + Math.max(d.amount - (d.paid_amount || 0), 0), 0);
    const totalPiutang = debts.filter(d => d.type === "piutang" && !d.is_settled).reduce((s, d) => s + Math.max(d.amount - (d.paid_amount || 0), 0), 0);
    const netPosition = totalPiutang - totalHutang;
    const activeHutang = debts.filter(d => d.type === "hutang" && !d.is_settled).length;
    const activePiutang = debts.filter(d => d.type === "piutang" && !d.is_settled).length;
    return { totalHutang, totalPiutang, netPosition, activeHutang, activePiutang };
  }, [debts]);

  // Group debts by person for the Person Directory
  const personSummary = useMemo(() => {
    const map: Record<string, { hutang: number; piutang: number; count: number }> = {};
    debts.filter(d => !d.is_settled).forEach(d => {
      const remaining = Math.max(d.amount - (d.paid_amount || 0), 0);
      if (!map[d.person_name]) map[d.person_name] = { hutang: 0, piutang: 0, count: 0 };
      if (d.type === "hutang") map[d.person_name].hutang += remaining;
      else map[d.person_name].piutang += remaining;
      map[d.person_name].count++;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      net: data.piutang - data.hutang,
      hutang: data.hutang,
      piutang: data.piutang,
      count: data.count,
    })).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [debts]);

  const handleCreate = () => {
    setSelectedDebt(null);
    setIsFormOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsFormOpen(true);
  };

  const handlePayment = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentOpen(true);
  };

  const handleToggleSettle = async (debt: Debt) => {
    if (debt.is_settled) {
      // Unsettling → open the smart reversal modal
      setSelectedDebt(debt);
      setIsUnsettleOpen(true);
      return;
    }

    // Settling
    const remaining = debt.amount - (debt.paid_amount || 0);

    if (remaining > 0) {
      // Partial debt → open confirmation modal
      setSelectedDebt(debt);
      setIsSettleConfirmOpen(true);
      return;
    }

    // Fully paid (remaining is 0) → fast toggle
    try {
      const res = await fetch(`/api/debts/${debt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...debt,
          is_settled: true,
          paid_amount: debt.amount,
        }),
      });
      if (!res.ok) throw new Error();
      await fetchDebts();
      showToast("success", "Ditandai sudah lunas! 🎉");
    } catch {
      showToast("error", "Gagal mengubah status.");
    }
  };

  const handleSettleConfirmSuccess = () => {
    fetchDebts();
    showToast("success", "Status berhasil diperbarui & pelunasan dicatat.");
  };

  const handleUnsettleSuccess = () => {
    fetchDebts();
    showToast("success", "Status berhasil dikembalikan.");
  };

  const handleDelete = async () => {
    if (!deleteDebtId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/debts/${deleteDebtId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchDebts();
      showToast("success", "Catatan berhasil dihapus.");
    } catch {
      showToast("error", "Gagal menghapus catatan.");
    } finally {
      setIsDeleting(false);
      setDeleteDebtId(null);
    }
  };

  const handleFormSuccess = () => {
    fetchDebts();
    showToast("success", "Catatan berhasil disimpan!");
  };

  const handlePaymentSuccess = () => {
    fetchDebts();
    showToast("success", "Pembayaran berhasil dicatat! 💸");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Memuat catatan Anda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      {/* Modals */}
      <DebtFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        debt={selectedDebt}
      />
      <DebtPaymentModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        debt={selectedDebt}
      />
      <DebtUnsettleModal
        open={isUnsettleOpen}
        onClose={() => setIsUnsettleOpen(false)}
        onSuccess={handleUnsettleSuccess}
        debt={selectedDebt}
      />
      <DebtSettleConfirmationModal
        open={isSettleConfirmOpen}
        onClose={() => setIsSettleConfirmOpen(false)}
        onSuccess={handleSettleConfirmSuccess}
        debt={selectedDebt}
      />

      {/* Hero Section */}
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-[55px] sm:text-[72px] font-black tracking-tighter leading-[0.85] text-foreground">
              Pantau Utang.
            </h1>
            <p className="text-lg font-bold text-muted-foreground max-w-md">
              Catat, lacak, dan lunasi hutang serta piutang Anda dengan teratur.
            </p>
          </div>

          <Button
            onClick={handleCreate}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base h-14 px-8 shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-3 stroke-[3px]" /> Tambah Catatan
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <button
          onClick={() => { setFilterType("hutang"); setFilterStatus("active"); }}
          className="bg-expense/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-expense/10 text-left hover:bg-expense/10 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-expense/10 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-expense" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-expense/60">Hutang Aktif</p>
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-black text-expense tabular-nums">{formatCurrency(stats.totalHutang)}</span>
          <p className="text-xs text-muted-foreground mt-1">{stats.activeHutang} catatan belum lunas</p>
        </button>

        <button
          onClick={() => { setFilterType("piutang"); setFilterStatus("active"); }}
          className="bg-income/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-income/10 text-left hover:bg-income/10 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-income/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-income" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-income/60">Piutang Aktif</p>
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-black text-income tabular-nums">{formatCurrency(stats.totalPiutang)}</span>
          <p className="text-xs text-muted-foreground mt-1">{stats.activePiutang} catatan belum lunas</p>
        </button>

        <div className="bg-muted/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-border/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Posisi Bersih</p>
          <span className={`text-lg sm:text-xl lg:text-2xl font-black tabular-nums ${stats.netPosition >= 0 ? "text-income" : "text-expense"}`}>
            {stats.netPosition >= 0 ? "+" : ""}{formatCurrency(stats.netPosition)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">{stats.netPosition >= 0 ? "Anda lebih banyak diutangi" : "Anda lebih banyak berutang"}</p>
        </div>
      </div>

      {/* Person Directory (toggleable) */}
      {personSummary.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowPersonSummary(!showPersonSummary)}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Users className="w-4 h-4" /> {showPersonSummary ? "Sembunyikan" : "Lihat"} Ringkasan Per Orang
            <span className="text-xs text-muted-foreground/50">({personSummary.length} orang)</span>
          </button>

          {showPersonSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {personSummary.map(p => (
                <div
                  key={p.name}
                  className="p-4 rounded-2xl border border-border/30 bg-white dark:bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <span className="text-xs font-medium text-muted-foreground">{p.count} catatan</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    {p.hutang > 0 && (
                      <span className="text-xs font-bold text-expense tabular-nums">Hutang: {formatCurrency(p.hutang)}</span>
                    )}
                    {p.piutang > 0 && (
                      <span className="text-xs font-bold text-income tabular-nums">Piutang: {formatCurrency(p.piutang)}</span>
                    )}
                  </div>
                  <div className={`mt-2 pt-2 border-t border-border/20 text-xs font-black tabular-nums ${p.net >= 0 ? "text-income" : "text-expense"}`}>
                    Net: {p.net >= 0 ? "+" : ""}{formatCurrency(p.net)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "hutang", "piutang"] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
              filterType === t
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-muted/20 text-muted-foreground border-border/30 hover:bg-muted/40"
            }`}
          >
            {t === "all" ? "Semua" : t === "hutang" ? "Hutang" : "Piutang"}
          </button>
        ))}
        <div className="w-px bg-border/40 mx-1 self-stretch" />
        {(["all", "active", "settled"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-muted/20 text-muted-foreground border-border/30 hover:bg-muted/40"
            }`}
          >
            {s === "all" ? "Semua Status" : s === "active" ? "Belum Lunas" : "Lunas"}
          </button>
        ))}
      </div>

      {/* Debts Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <HandCoins className="w-6 h-6 text-primary" /> Daftar Catatan
          </h2>
          <span className="text-xs font-bold text-muted-foreground">
            {filtered.length} catatan
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-muted/10 border-2 border-dashed border-border/40 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center space-y-6">
            <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto">
              <HandCoins className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Belum ada catatan</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Tambahkan catatan hutang atau piutang untuk mulai memantau posisi keuangan Anda.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              variant="outline"
              className="rounded-full h-12 px-8 font-bold border-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            >
              Buat Catatan Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.slice(0, isExpanded ? filtered.length : 6).map(debt => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteDebtId(id)}
                  onPayment={handlePayment}
                  onToggleSettle={handleToggleSettle}
                />
              ))}
            </div>

            {filtered.length > 6 && (
              <Button 
                variant="ghost" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
              >
                {isExpanded ? (
                  <><ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-2" /> Lihat {filtered.length - 6} Catatan Lainnya</>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDebtId} onOpenChange={() => setDeleteDebtId(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Hapus Catatan</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Apakah Anda yakin ingin menghapus catatan utang/piutang ini? Data akan hilang dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteDebtId(null)} className="rounded-2xl h-12 font-bold w-full sm:w-auto order-last sm:order-first">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-2xl h-12 font-black w-full sm:w-auto">
              {isDeleting ? "Menghapus..." : "Hapus Catatan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
