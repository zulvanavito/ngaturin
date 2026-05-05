"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Target,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { GoalCard, Goal } from "@/components/goals/goal-card";
import { GoalFormModal } from "@/components/goals/goal-form-modal";
import { GoalDepositModal } from "@/components/goals/goal-deposit-modal";
import { GoalDetailModal } from "@/components/goals/goal-detail-modal";
import { GoalCardSkeleton } from "@/components/layout/skeletons";
import { useToast } from "@/lib/toast-context";

export default function GoalsPage() {
  const { formatCurrency } = useFormatCurrency();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const stats = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const completedCount = goals.filter((g) => g.is_completed).length;
    return { totalTarget, totalSaved, completedCount };
  }, [goals]);

  const handleCreate = () => {
    setSelectedGoal(null);
    setIsFormOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const handleDeposit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDepositOpen(true);
  };

  const handleDetail = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteGoalId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/goals/${deleteGoalId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Target berhasil dihapus.");
        fetchGoals();
      } else {
        throw new Error();
      }
    } catch {
      showToast("error", "Gagal menghapus target.");
    } finally {
      setIsDeleting(false);
      setDeleteGoalId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
        <div className="space-y-6">
          <div className="w-40 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-64 h-12 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      {isFormOpen && (
        <GoalFormModal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchGoals}
          goal={selectedGoal}
        />
      )}
      {isDepositOpen && (
        <GoalDepositModal
          open={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onSuccess={fetchGoals}
          goal={selectedGoal}
        />
      )}
      {isDetailOpen && (
        <GoalDetailModal
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          goal={selectedGoal}
        />
      )}

      {/* Hero Section */}
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Kembali ke Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-[55px] sm:text-[72px] font-black tracking-tighter leading-[0.85] text-foreground">
              Wujudkan Impian.
            </h1>
            <p className="text-lg font-bold text-muted-foreground max-w-md">
              Mulai menabung untuk target Anda hari ini. Langkah kecil menuju
              masa depan besar.
            </p>
          </div>

          <Button
            onClick={handleCreate}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg h-16 px-10 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-6 h-6 mr-3 stroke-[3px]" /> Buat Target Baru
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-primary/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-primary/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/60 mb-2">
            Total Terkumpul
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground truncate block">
              {formatCurrency(stats.totalSaved)}
            </span>
          </div>
        </div>
        <div className="bg-muted/30 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-border/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
            Target Kumulatif
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground truncate block">
              {formatCurrency(stats.totalTarget)}
            </span>
          </div>
        </div>
        <div className="bg-income/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-income/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-income/60 mb-2">
            Sudah Tercapai
          </p>
          <div className="flex items-center gap-3">
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground">
              {stats.completedCount}
            </span>
            <Sparkles className="w-8 h-8 text-income" />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" /> Target Aktif
          </h2>
          <span className="text-xs font-bold text-muted-foreground">
            Menampilkan {goals.length} target
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="bg-muted/10 border-2 border-dashed border-border/40 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 md:p-24 text-center space-y-6">
            <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto">
              <Target className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                Belum ada target finansial
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Mulai catat target Anda, mulai dari dana darurat hingga liburan
                impian.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              variant="outline"
              className="rounded-full h-12 px-8 font-bold border-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            >
              Buat Target Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {goals.slice(0, isExpanded ? goals.length : 4).map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDeposit={handleDeposit}
                  onEdit={handleEdit}
                  onDelete={(goalId) => setDeleteGoalId(goalId)}
                  onDetail={handleDetail}
                />
              ))}
            </div>

            {goals.length > 4 && (
              <Button 
                variant="ghost" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
              >
                {isExpanded ? (
                  <><ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-2" /> Lihat {goals.length - 4} Target Lainnya</>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-black text-white rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <AlertCircle className="w-8 h-8 text-primary" />
        </div>
        <div className="relative z-10 flex-1 space-y-1 text-center md:text-left">
          <h3 className="text-xl font-bold">Tips: Konsistensi adalah kunci</h3>
          <p className="text-sm text-white/60">
            Aktifkan fitur nabung otomatis di setiap target Anda dan atur
            tanggal gajian di profil untuk mulai menabung tanpa ribet.
          </p>
        </div>
        <Link href="/dashboard/profile">
          <Button className="bg-white text-black hover:bg-white/90 rounded-full h-12 px-8 font-bold shrink-0 relative z-10 transition-transform group-hover:scale-105">
            Atur Sekarang →
          </Button>
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteGoalId && (
        <Dialog open={!!deleteGoalId} onOpenChange={() => setDeleteGoalId(null)}>
          <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Hapus Target</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Apakah Anda yakin ingin menghapus target ini? Seluruh progres tabungan yang tercatat akan hilang dan tidak dapat dikembalikan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setDeleteGoalId(null)} className="rounded-2xl h-12 font-bold w-full sm:w-auto order-last sm:order-first">
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-2xl h-12 font-black w-full sm:w-auto">
                {isDeleting ? "Menghapus..." : "Hapus Target"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
