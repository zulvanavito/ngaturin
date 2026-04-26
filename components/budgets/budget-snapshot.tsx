"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight } from "lucide-react";

interface Budget { id: string; category: string; amount: number; }

function formatK(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n}`;
}

interface Props {
  transactions: any[];
  onSeeAll: () => void;
}

export function BudgetSnapshot({ transactions, onSeeAll }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const currentMonth = new Date().toISOString().substring(0, 7);

  const fetchBudgets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("budgets").select("*")
        .eq("user_id", user.id).eq("month", currentMonth)
        .order("category", { ascending: true }).limit(4);
      setBudgets(data || []);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [supabase, currentMonth]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const getSpent = (cat: string) =>
    transactions.filter(t => t.type === "expense" && t.category === cat)
      .reduce((s, t) => s + Number(t.amount), 0);

  if (loading) {
    return (
      <Card className="shadow-sm border-0 bg-card/60 backdrop-blur-xl animate-pulse h-32" />
    );
  }

  return (
    <Card className="shadow-sm border-0 bg-card/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="bg-muted/30 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Anggaran Bulanan
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground" onClick={onSeeAll}>
          <span>Lihat Semua</span>
          <ChevronRight className="w-3 h-3" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {budgets.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Belum ada anggaran. Atur di tab Anggaran!
          </p>
        ) : (
          budgets.map((b) => {
            const spent = getSpent(b.category);
            const pct = b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0;
            const barColor = pct >= 90 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500";
            const textColor = pct >= 90 ? "text-rose-600 dark:text-rose-400" : pct >= 75 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate max-w-[120px]">{b.category}</span>
                  <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatK(spent)}</span>
                  <span>{formatK(b.amount)}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
