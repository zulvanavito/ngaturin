"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Goal } from "./goal-card";

export function GoalsSnapshot() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/goals")
      .then(res => res.json())
      .then(data => {
        setGoals(Array.isArray(data) ? data.slice(0, 2) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-24 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (goals.length === 0) return (
    <div className="text-center py-4">
      <p className="text-xs font-semibold text-muted-foreground" style={{ fontFeatureSettings: '"calt"' }}>Belum ada target aktif.</p>
      <Link href="/dashboard/goals" className="text-[10px] font-black text-primary hover:underline mt-1 inline-block uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
        Buat Target →
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {goals.map(goal => {
        const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
        return (
          <div key={goal.id} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground truncate max-w-[120px]" style={{ fontFeatureSettings: '"calt"' }}>{goal.title}</span>
              <span className="font-black tabular-nums" style={{ fontFeatureSettings: '"calt"' }}>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: goal.color }}
              />
            </div>
          </div>
        );
      })}
      
      <Link 
        href="/dashboard/goals" 
        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group mt-2"
      >
        <span className="text-[10px] font-black text-foreground uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>Lihat Semua Target</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
