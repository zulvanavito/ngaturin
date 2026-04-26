"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, ChevronLeft, PieChart, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { BudgetCard, Budget } from "@/components/budgets/budget-card";
import { BudgetFormModal } from "@/components/budgets/budget-form-modal";
import { BudgetCardSkeleton } from "@/components/layout/skeletons";
import { useToast } from "@/lib/toast-context";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const [budgetsRes, txRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch(`/api/transactions?type=expense&month=${currentMonth}`)
      ]);

      if (budgetsRes.ok && txRes.ok) {
        const budgetsData = await budgetsRes.json();
        const txData = await txRes.json();
        setBudgets(budgetsData);
        setTransactions(txData);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate spent amount per category for the current month
  const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-04"
  
  const getSpent = useCallback((category: string) => {
    return transactions
      .filter(t => 
        t.type === "expense" && 
        t.category === category && 
        t.date && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, currentMonth]);

  const stats = useMemo(() => {
    let totalLimit = 0;
    let totalSpent = 0;
    budgets.forEach(b => {
      totalLimit += b.amount;
      totalSpent += getSpent(b.category);
    });
    return { totalLimit, totalSpent };
  }, [budgets, getSpent]);

  const handleCreate = () => {
    setSelectedBudget(null);
    setIsFormOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteBudgetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/budgets/${deleteBudgetId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Anggaran berhasil dihapus.");
        fetchData();
      } else {
        throw new Error();
      }
    } catch {
      showToast("error", "Gagal menghapus anggaran.");
    } finally {
      setIsDeleting(false);
      setDeleteBudgetId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
        <div className="space-y-6">
          <div className="w-40 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-64 h-12 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <BudgetCardSkeleton />
          <BudgetCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      {isFormOpen && (
        <BudgetFormModal 
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData}
          budget={selectedBudget}
        />
      )}

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
              Kontrol Pengeluaran.
            </h1>
            <p className="text-lg font-bold text-muted-foreground max-w-md">
              Pantau batas penggunaan dana Anda di bulan ini agar tetap terkendali.
            </p>
          </div>
          
          <Button 
            onClick={handleCreate}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg h-16 px-10 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-6 h-6 mr-3 stroke-[3px]" /> Buat Anggaran
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-primary/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-primary/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/60 mb-2">Total Limit Keseluruhan</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground truncate block">
              Rp {stats.totalLimit.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        <div className="bg-expense/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-expense/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-expense/60 mb-2">Total Terpakai Bulan Ini</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground truncate block">
              Rp {stats.totalSpent.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <PieChart className="w-6 h-6 text-primary" /> Anggaran Aktif
          </h2>
          <span className="text-xs font-bold text-muted-foreground">
            Bulan: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-muted/10 border-2 border-dashed border-border/40 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 md:p-24 text-center space-y-6">
            <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto">
              <PieChart className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Belum ada anggaran</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Tentukan kategori yang ingin dibatasi pemakaian dananya untuk bulan ini.
              </p>
            </div>
            <Button 
              onClick={handleCreate}
              variant="outline"
              className="rounded-full h-12 px-8 font-bold border-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            >
              Buat Batasan Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.slice(0, isExpanded ? budgets.length : 6).map(budget => (
                <BudgetCard 
                  key={budget.id} 
                  budget={budget} 
                  spent={getSpent(budget.category)}
                  onEdit={handleEdit}
                  onDelete={(budgetId) => setDeleteBudgetId(budgetId)}
                />
              ))}
            </div>

            {budgets.length > 6 && (
                <Button 
                  variant="ghost" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan</>
                  ) : (
                    <><ChevronDown className="w-4 h-4 mr-2" /> Lihat {budgets.length - 6} Anggaran Lainnya</>
                  )}
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-black text-white rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-expense/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <div className="relative z-10 flex-1 space-y-1 text-center md:text-left">
          <h3 className="text-xl font-bold">Tips: Batasi Pengeluaran Tersier</h3>
          <p className="text-sm text-white/60">
            Hindari kebocoran dompet dengan membatasi kategori belanja dan hiburan. Pastikan kebutuhan primer tetap terpenuhi lebih dulu.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteBudgetId && (
        <Dialog open={!!deleteBudgetId} onOpenChange={() => setDeleteBudgetId(null)}>
          <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Hapus Anggaran</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Apakah Anda yakin ingin menghapus batas anggaran ini? Data pengeluaran terkait tidak akan terpengaruh, tapi limit ini tidak akan aktif lagi.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setDeleteBudgetId(null)} className="rounded-2xl h-12 font-bold w-full sm:w-auto order-last sm:order-first">
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-2xl h-12 font-black w-full sm:w-auto">
                {isDeleting ? "Menghapus..." : "Hapus Anggaran"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
