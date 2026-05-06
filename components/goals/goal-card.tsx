"use client";

import { Target, Calendar, MoreVertical, Plus, Pencil, Trash2, Info, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  color: string;
  is_completed: boolean;
  is_auto_save: boolean;
  auto_save_amount: number;
  created_at: string;
}

interface GoalCardProps {
  goal: Goal;
  onDeposit: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onDetail: (goal: Goal) => void;
}


export function GoalCard({ goal, onDeposit, onEdit, onDelete, onDetail }: GoalCardProps) {
  const { formatCurrency } = useFormatCurrency();
  const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
  
  const daysLeft = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="group relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-6 sm:p-8 shadow-ring transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Background Accent */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 blur-2xl transition-transform duration-700 group-hover:scale-150 pointer-events-none"
        style={{ backgroundColor: goal.color }}
      />
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[1rem] sm:rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
            style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
          >
            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-lg sm:text-xl text-foreground tracking-tight leading-tight truncate">
              {goal.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {goal.category && (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  {goal.category}
                </span>
              )}
              {goal.is_completed && (
                <Badge variant="success" className="text-[9px] px-2 py-0 border-none uppercase">
                  Selesai
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50 transition-colors relative z-10">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-xl p-2">
            <DropdownMenuItem 
              onClick={() => onDetail(goal)}
              className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
            >
              <Info className="w-4 h-4" /> Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onEdit(goal)}
              className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
            >
              <Pencil className="w-4 h-4" /> Edit Target
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(goal.id)}
              className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold text-expense cursor-pointer hover:bg-expense/10"
            >
              <Trash2 className="w-4 h-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter">
              {progress}%
            </p>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Sisa</p>
              <p className="font-bold text-sm text-foreground">{formatCurrency(remaining)}</p>
            </div>
          </div>
          
          <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out rounded-full"
              style={{ 
                width: `${progress}%`, 
                backgroundColor: goal.color,
                boxShadow: `0 0 20px ${goal.color}30`
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4 px-2 sm:px-0">
          <div className="p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl bg-muted/20 border border-border/5 min-w-0">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 sm:mb-1">Terkumpul</p>
            <p className="font-bold text-xs sm:text-sm lg:text-base text-foreground truncate block">{formatCurrency(goal.current_amount)}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl bg-muted/20 border border-border/5 text-right min-w-0">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 sm:mb-1">Target</p>
            <p className="font-bold text-xs sm:text-sm lg:text-base text-foreground truncate block">{formatCurrency(goal.target_amount)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border/10">
          <div className="flex items-center gap-2">
            {goal.deadline ? (
              <Badge variant={daysLeft !== null && daysLeft < 0 ? "danger" : daysLeft !== null && daysLeft <= 7 ? "warning" : "accent"} className="gap-1.5 py-1 px-3 border-none text-[10px]">
                <Calendar className="w-3.5 h-3.5" />
                {daysLeft !== null && daysLeft < 0 
                  ? "Terlambat" 
                  : daysLeft === 0 
                    ? "Hari ini!" 
                    : `${daysLeft} hari lagi`
                }
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5 py-1 px-3 border-none text-[10px] opacity-60">
                No Deadline
              </Badge>
            )}
            {goal.is_auto_save && (
              <Badge variant="success" className="gap-1.5 py-1 px-3 border-none text-[10px]">
                <Bot className="w-3.5 h-3.5" />
                Auto-Save
              </Badge>
            )}
          </div>
          
          <Button 
            onClick={() => onDeposit(goal)}
            className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-6 shadow-md transition-all active:scale-95 group/btn"
          >
            <span className="group-hover/btn:scale-110 transition-transform flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 stroke-[3px]" /> Tambah Dana
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
