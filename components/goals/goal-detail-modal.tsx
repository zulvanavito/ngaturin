"use client";

import { Target, Calendar, Type, Clock, AlignLeft, Bot } from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Goal } from "./goal-card";

interface GoalDetailModalProps {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
}


export function GoalDetailModal({ open, onClose, goal }: GoalDetailModalProps) {
  const { formatCurrency } = useFormatCurrency();
  if (!goal) return null;

  const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  const daysLeft = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm"
            style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
          >
            <Target className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
            {goal.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-center md:text-left">
            Detail progres simpanan dan target Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-bold text-foreground">Progres Pencapaian</span>
              <span className="text-xl font-black" style={{ color: goal.color }}>{progress}%</span>
            </div>
            <div className="h-4 w-full bg-muted/40 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${progress}%`, backgroundColor: goal.color }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-muted/20 border border-border/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Terkumpul</p>
              <p className="font-bold text-base text-foreground">{formatCurrency(goal.current_amount)}</p>
            </div>
            <div className="p-4 rounded-3xl bg-muted/20 border border-border/5 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Kekurangan</p>
              <p className="font-bold text-base text-foreground">{formatCurrency(remaining)}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border/20 p-4 bg-white dark:bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 shrink-0 min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Target Total</p>
                <p className="text-sm font-bold text-foreground truncate">{formatCurrency(goal.target_amount)}</p>
              </div>
            </div>

            {goal.category && (
              <div className="flex items-center gap-3 border-t border-border/10 pt-3">
                <Type className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 shrink-0 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Kategori</p>
                  <p className="text-sm font-bold text-foreground truncate">{goal.category}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 border-t border-border/10 pt-3">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 shrink-0 min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Tenggat Waktu</p>
                {goal.deadline ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">
                      {new Date(goal.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysLeft !== null && daysLeft < 0 ? "bg-expense/10 text-expense" : "bg-primary/10 text-primary"}`}>
                      {daysLeft !== null && daysLeft < 0 ? "Lewat tenggat" : daysLeft === 0 ? "Hari Ini" : `${daysLeft} hari lagi`}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-muted-foreground truncate">Tanpa target waktu</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 border-t border-border/10 pt-3">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 shrink-0 min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Dibuat Pada</p>
                <p className="text-xs font-bold text-foreground truncate">
                  {new Date(goal.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {goal.is_auto_save && (
              <div className="flex items-center gap-3 border-t border-border/10 pt-3">
                <Bot className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 shrink-0 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Auto-Save per Bulan</p>
                  <p className="text-sm font-bold text-primary truncate">{formatCurrency(goal.auto_save_amount)}</p>
                </div>
              </div>
            )}
          </div>

          {goal.description && (
            <div className="space-y-2 p-4 rounded-3xl bg-muted/20 border border-border/5">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catatan / Detail Tambahan</span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
                {goal.description}
              </p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
