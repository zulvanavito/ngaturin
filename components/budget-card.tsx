"use client";

import { PieChart, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function BudgetCard({
  budget,
  spent,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const pct =
    budget.amount > 0
      ? Math.min(Math.round((spent / budget.amount) * 100), 100)
      : 0;

  const isDanger = pct >= 90;
  const isWarning = pct >= 75 && pct < 90;

  const colorHex = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#9fe870"; // red, amber, wise green
  const barClass = isDanger
    ? "bg-expense"
    : isWarning
      ? "bg-chart-5"
      : "bg-primary";
  const textClass = isDanger
    ? "text-expense"
    : isWarning
      ? "text-chart-5"
      : "text-primary";

  return (
    <div className="group relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-6 sm:p-8 shadow-ring transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Background Accent */}
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] blur-2xl transition-transform duration-700 group-hover:scale-150 pointer-events-none"
        style={{ backgroundColor: colorHex }}
      />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[1rem] sm:rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
            style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
          >
            <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-lg sm:text-xl text-foreground tracking-tight leading-tight truncate">
              {budget.category}
            </h3>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground mt-1 block">
              Anggaran Bulanan
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted/50 transition-colors relative z-10 shrink-0"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-2xl border-border/40 shadow-xl p-2"
          >
            <DropdownMenuItem
              onClick={() => onEdit(budget)}
              className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
            >
              <Pencil className="w-4 h-4" /> Edit Limit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(budget.id)}
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
              {pct}%
            </p>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                Sisa Limit
              </p>
              <p
                className={`font-bold text-sm ${isDanger ? textClass : "text-foreground"}`}
              >
                {formatCurrency(Math.max(budget.amount - spent, 0))}
              </p>
            </div>
          </div>

          <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full ${barClass}`}
              style={{
                width: `${pct}%`,
                boxShadow: `0 0 20px ${colorHex}30`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 px-2 sm:px-0">
          <div className="p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl bg-muted/20 border border-border/5 min-w-0">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 sm:mb-1">
              Terpakai
            </p>
            <p className={`font-bold text-xs truncate block ${textClass}`}>
              {formatCurrency(spent)}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl bg-muted/20 border border-border/5 text-right min-w-0">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 sm:mb-1">
              Limit
            </p>
            <p className="font-bold text-xs text-foreground truncate block">
              {formatCurrency(budget.amount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
