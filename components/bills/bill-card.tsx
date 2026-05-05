"use client";

import { MoreVertical, Pencil, Trash2, CheckCircle2, Clock, AlertTriangle, CreditCard, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: string | null;
  due_day: number;
  is_active: boolean;
  billing_cycle: string;
  plan_name: string | null;
  is_autopay: boolean;
}

interface BillCardProps {
  bill: RecurringBill;
  isPaidThisMonth: boolean;
  onEdit: (bill: RecurringBill) => void;
  onDelete: (bill: RecurringBill) => void;
  onPay: (bill: RecurringBill) => void;
  onToggleActive: (bill: RecurringBill) => void;
}


function getDueInfo(dueDay: number, isPaid: boolean): { label: string; color: string; isOverdue: boolean } {
  if (isPaid) return { label: "Lunas bulan ini", color: "text-income", isOverdue: false };

  const today = new Date().getDate();
  const diff = dueDay - today;

  if (diff < 0) return { label: `Terlambat ${Math.abs(diff)} hari`, color: "text-red-500", isOverdue: true };
  if (diff === 0) return { label: "Jatuh tempo hari ini!", color: "text-amber-500", isOverdue: false };
  if (diff <= 3) return { label: `${diff} hari lagi`, color: "text-amber-500", isOverdue: false };
  return { label: `Tgl ${dueDay}`, color: "text-muted-foreground", isOverdue: false };
}

export function BillCard({ bill, isPaidThisMonth, onEdit, onDelete, onPay, onToggleActive }: BillCardProps) {
  const { formatCurrency } = useFormatCurrency();
  const dueInfo = getDueInfo(bill.due_day, isPaidThisMonth);
  const cycleLabel = bill.billing_cycle === "yearly" ? "Tahunan" : "Bulanan";

  return (
    <div className={`group relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-ring transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${!bill.is_active ? "opacity-50" : ""} ${isPaidThisMonth ? "ring-1 ring-income/20" : ""}`}>
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] sm:rounded-t-[2.5rem] ${isPaidThisMonth ? "bg-income" : dueInfo.isOverdue ? "bg-red-500" : "bg-primary"}`} />

      {/* Overdue glow */}
      {dueInfo.isOverdue && !isPaidThisMonth && (
        <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.08] blur-3xl pointer-events-none bg-red-500" />
      )}
      {/* Paid glow */}
      {isPaidThisMonth && (
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.04] blur-3xl pointer-events-none bg-income" />
      )}

      <div className="p-5 sm:p-7 pt-6 sm:pt-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 ${isPaidThisMonth ? "bg-income/10" : "bg-primary/10"}`}>
              {isPaidThisMonth
                ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-income" />
                : <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              }
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight leading-tight truncate">
                {bill.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                  {cycleLabel}
                </span>
                {bill.plan_name && (
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {bill.plan_name}
                  </span>
                )}
                {bill.is_autopay && (
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-income/10 text-income flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" /> Auto
                  </span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50 transition-colors relative z-10 shrink-0">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-border/40 shadow-xl p-2">
              {!isPaidThisMonth && bill.is_active && (
                <DropdownMenuItem onClick={() => onPay(bill)} className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50">
                  <CreditCard className="w-4 h-4" /> Bayar Sekarang
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onToggleActive(bill)} className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50">
                <RefreshCw className="w-4 h-4" /> {bill.is_active ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(bill)} className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50">
                <Pencil className="w-4 h-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(bill)} className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold text-expense cursor-pointer hover:bg-expense/10">
                <Trash2 className="w-4 h-4" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category */}
        {bill.category && (
          <p className="text-xs text-muted-foreground mt-3 ml-14 sm:ml-[60px] truncate">{bill.category}</p>
        )}

        {/* Amount + Due */}
        <div className="mt-5 sm:mt-6 pt-4 border-t border-border/20">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                Nominal
              </p>
              <p className="text-lg sm:text-xl font-black tabular-nums tracking-tight text-foreground">
                {formatCurrency(bill.amount)}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${dueInfo.color}`}>
              {isPaidThisMonth
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : dueInfo.isOverdue
                  ? <AlertTriangle className="w-3.5 h-3.5" />
                  : <Clock className="w-3.5 h-3.5" />
              }
              {dueInfo.label}
            </div>
          </div>
        </div>

        {/* Quick pay button */}
        {!isPaidThisMonth && bill.is_active && (
          <Button
            onClick={() => onPay(bill)}
            variant="outline"
            className="w-full mt-4 rounded-2xl h-10 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary text-xs transition-all"
          >
            <CreditCard className="w-4 h-4 mr-2" /> Bayar Sekarang
          </Button>
        )}
        {isPaidThisMonth && (
          <div className="w-full mt-4 rounded-2xl h-10 bg-income/5 border border-income/10 flex items-center justify-center gap-2 text-xs font-bold text-income">
            <CheckCircle2 className="w-4 h-4" /> Sudah Dibayar Bulan Ini
          </div>
        )}
      </div>
    </div>
  );
}
