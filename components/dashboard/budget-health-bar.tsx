"use client";

import { useMemo, useState, useEffect } from "react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { Info, Settings2, Loader2, Save } from "lucide-react";
import { type Category, type UserProfile } from "@/types/finance";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  category: string;
}

interface BudgetHealthBarProps {
  initialMonthlyIncome: number;
  initialExpenses: Transaction[];
  categories: Category[];
  userProfile?: UserProfile | null;
}

// Default classification — users could customize this in settings later
const NEEDS_CATEGORIES = [
  "makanan", "makan", "groceries", "belanja bahan", "transportasi", "transport",
  "bensin", "listrik", "air", "internet", "pulsa", "sewa", "kos", "kontrakan",
  "asuransi", "obat", "kesehatan", "rumah sakit", "laundry",
];

const SAVINGS_CATEGORIES = [
  "tabungan", "investasi", "deposito", "reksadana", "saham", "emas", "saving",
  "dana darurat", "goals",
];

export function BudgetHealthBar({
  initialMonthlyIncome,
  initialExpenses,
  categories,
  userProfile,
}: BudgetHealthBarProps) {
  const { formatCurrency } = useFormatCurrency();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [showTip, setShowTip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Targets state
  const baseNeeds = userProfile?.budget_needs_target ?? 50;
  const baseWants = userProfile?.budget_wants_target ?? 30;
  const baseSavings = userProfile?.budget_savings_target ?? 20;

  // Active display targets (Optimistic UI)
  const [activeNeeds, setActiveNeeds] = useState(baseNeeds);
  const [activeWants, setActiveWants] = useState(baseWants);
  const [activeSavings, setActiveSavings] = useState(baseSavings);

  // Modal form targets
  const [needsTarget, setNeedsTarget] = useState(baseNeeds);
  const [wantsTarget, setWantsTarget] = useState(baseWants);
  const [savingsTarget, setSavingsTarget] = useState(baseSavings);

  // Sync if props ever change externally
  useEffect(() => {
    setActiveNeeds(userProfile?.budget_needs_target ?? 50);
    setActiveWants(userProfile?.budget_wants_target ?? 30);
    setActiveSavings(userProfile?.budget_savings_target ?? 20);
  }, [userProfile?.budget_needs_target, userProfile?.budget_wants_target, userProfile?.budget_savings_target]);

  const totalTarget = needsTarget + wantsTarget + savingsTarget;
  const isValid = totalTarget === 100;

  const handleSaveTarget = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget_needs_target: needsTarget,
          budget_wants_target: wantsTarget,
          budget_savings_target: savingsTarget,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan data");
      
      // Optimistic UI Update: Langsung terapkan rasio baru ke layar
      setActiveNeeds(needsTarget);
      setActiveWants(wantsTarget);
      setActiveSavings(savingsTarget);
      
      showToast("success", "Rasio anggaran berhasil diperbarui!");
      setIsModalOpen(false);
      router.refresh(); // Refresh page to re-fetch data globally
    } catch {
      showToast("error", "Gagal memperbarui rasio anggaran");
    } finally {
      setIsSaving(false);
    }
  };

  const { needs, wants, savings, total } = useMemo(() => {
    const categoryGroupMap = new Map<string, "needs" | "wants" | "savings">();
    categories.forEach(c => {
      if (c.budget_group) {
        categoryGroupMap.set(c.name.toLowerCase().trim(), c.budget_group);
      }
    });

    const classify = (categoryName: string): "needs" | "wants" | "savings" => {
      const key = categoryName.toLowerCase().trim();
      const mapped = categoryGroupMap.get(key);
      if (mapped) return mapped;
      
      // Fallback untuk kategori lama/tanpa setup
      if (NEEDS_CATEGORIES.some((n) => key.includes(n))) return "needs";
      if (SAVINGS_CATEGORIES.some((s) => key.includes(s))) return "savings";
      return "wants";
    };

    let needs = 0, wants = 0, savings = 0;
    initialExpenses.forEach((t) => {
      const amount = Number(t.amount);
      const type = classify(t.category);
      if (type === "needs") needs += amount;
      else if (type === "savings") savings += amount;
      else wants += amount;
    });
    return { needs, wants, savings, total: needs + wants + savings };
  }, [initialExpenses, categories]);

  const base = initialMonthlyIncome > 0 ? initialMonthlyIncome : total > 0 ? total : 1;
  const needsPct = Math.round((needs / base) * 100);
  const wantsPct = Math.round((wants / base) * 100);
  const savingsPct = Math.round((savings / base) * 100);

  const bars = [
    {
      label: "Kebutuhan",
      sublabel: `Target ${activeNeeds}%`,
      value: needs,
      pct: needsPct,
      target: activeNeeds,
      color: "bg-emerald-500",
      trackColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Keinginan",
      sublabel: `Target ${activeWants}%`,
      value: wants,
      pct: wantsPct,
      target: activeWants,
      color: "bg-amber-500",
      trackColor: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Tabungan",
      sublabel: `Target ${activeSavings}%`,
      value: savings,
      pct: savingsPct,
      target: activeSavings,
      color: "bg-blue-500",
      trackColor: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
            Progres Pengeluaran
          </h3>
          <button
            className="relative"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onClick={() => setShowTip(!showTip)}
          >
            <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary transition-colors" />
            {showTip && (
              <div className="absolute left-0 top-6 z-50 w-64 p-4 bg-card border border-border/20 rounded-[1.5rem] shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
                <p className="text-xs font-black text-foreground mb-1" style={{ fontFeatureSettings: '"calt"' }}>Aturan Anggaran</p>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
                  Idealnya Anda menargetkan pengeluaran pada batasan yang ditentukan.
                  Anda dapat mengubah target persentase atau merubah klasifikasi kategori di Pengaturan.
                </p>
              </div>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest hidden sm:inline-block" style={{ fontFeatureSettings: '"calt"' }}>
            {new Date().toLocaleDateString("id-ID", { month: "long" })}
          </span>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button 
                onClick={() => {
                  setNeedsTarget(activeNeeds);
                  setWantsTarget(activeWants);
                  setSavingsTarget(activeSavings);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] sm:max-w-md p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-black">Rasio Anggaran Kustom</DialogTitle>
                <DialogDescription className="text-xs font-semibold">
                  Tentukan target persentase 100% Anda (Bawaan: 50/30/20).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="grid gap-2.5">
                  <Label className="font-bold text-sm ml-1 flex items-center justify-between text-emerald-600 dark:text-emerald-500">
                    <span>Kebutuhan (Needs)</span>
                    <span>{needsTarget}%</span>
                  </Label>
                  <Input type="number" min={0} max={100} value={needsTarget} onChange={(e) => setNeedsTarget(Number(e.target.value) || 0)} className="h-12 rounded-2xl border-border/40 font-black text-lg px-4" />
                </div>
                <div className="grid gap-2.5">
                  <Label className="font-bold text-sm ml-1 flex items-center justify-between text-amber-600 dark:text-amber-500">
                    <span>Keinginan (Wants)</span>
                    <span>{wantsTarget}%</span>
                  </Label>
                  <Input type="number" min={0} max={100} value={wantsTarget} onChange={(e) => setWantsTarget(Number(e.target.value) || 0)} className="h-12 rounded-2xl border-border/40 font-black text-lg px-4" />
                </div>
                <div className="grid gap-2.5">
                  <Label className="font-bold text-sm ml-1 flex items-center justify-between text-blue-600 dark:text-blue-400">
                    <span>Tabungan (Savings)</span>
                    <span>{savingsTarget}%</span>
                  </Label>
                  <Input type="number" min={0} max={100} value={savingsTarget} onChange={(e) => setSavingsTarget(Number(e.target.value) || 0)} className="h-12 rounded-2xl border-border/40 font-black text-lg px-4" />
                </div>
                <div className="flex items-center justify-between bg-muted/10 p-3 rounded-xl border border-border/10">
                  <span className="text-xs font-bold text-muted-foreground">Total Persentase</span>
                  <span className={cn("font-black text-sm", isValid ? "text-primary" : "text-red-500")}>
                    {totalTarget}%
                  </span>
                </div>
                {!isValid && <p className="text-[10px] text-red-500 font-bold text-center">Total wajib sama dengan 100%</p>}
              </div>
              <DialogFooter className="mt-2 flex-col sm:flex-row gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full font-bold w-full sm:w-auto">Batal</Button>
                <Button onClick={handleSaveTarget} disabled={!isValid || isSaving} className="wise-button-pill w-full sm:w-auto">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Rasio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {bars.map((bar) => {
          const isOver = bar.pct > bar.target;
          return (
            <div key={bar.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                    {bar.label}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{bar.sublabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black tabular-nums ${isOver ? "text-red-500" : bar.textColor}`} style={{ fontFeatureSettings: '"calt"' }}>
                    {bar.pct}%
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums" style={{ fontFeatureSettings: '"calt"' }}>
                    {formatCurrency(bar.value)}
                  </span>
                </div>
              </div>
              <div className={`h-2.5 w-full rounded-full overflow-hidden ${bar.trackColor}`}>
                <div className="relative h-full">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isOver ? "bg-red-500" : bar.color}`}
                    style={{ width: `${Math.min(bar.pct, 100)}%` }}
                  />
                  {/* Target marker */}
                  <div
                    className="absolute top-0 h-full w-px bg-foreground/20"
                    style={{ left: `${bar.target}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
