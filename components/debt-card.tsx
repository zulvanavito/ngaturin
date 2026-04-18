"use client";

import {
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  HandCoins,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Debt {
  id: string;
  type: "hutang" | "piutang";
  person_name: string;
  amount: number;
  paid_amount: number;
  description: string | null;
  due_date: string | null;
  is_settled: boolean;
  created_at: string;
}

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (debtId: string) => void;
  onPayment: (debt: Debt) => void;
  onToggleSettle: (debt: Debt) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

function getDeadlineInfo(
  dueDate: string | null,
): { label: string; color: string; isOverdue: boolean } | null {
  if (!dueDate) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      label: absDays === 1 ? "Terlambat 1 hari" : `Terlambat ${absDays} hari`,
      color: "text-red-500",
      isOverdue: true,
    };
  }
  if (diffDays === 0)
    return {
      label: "Jatuh tempo hari ini!",
      color: "text-amber-500",
      isOverdue: false,
    };
  if (diffDays === 1)
    return {
      label: "Jatuh tempo besok",
      color: "text-amber-500",
      isOverdue: false,
    };
  if (diffDays <= 7)
    return {
      label: `${diffDays} hari lagi`,
      color: "text-amber-500",
      isOverdue: false,
    };
  if (diffDays <= 30)
    return {
      label: `${diffDays} hari lagi`,
      color: "text-muted-foreground",
      isOverdue: false,
    };

  const months = Math.floor(diffDays / 30);
  return {
    label: `${months} bulan lagi`,
    color: "text-muted-foreground",
    isOverdue: false,
  };
}

export function DebtCard({
  debt,
  onEdit,
  onDelete,
  onPayment,
  onToggleSettle,
}: DebtCardProps) {
  const isHutang = debt.type === "hutang";

  const paidAmount = debt.paid_amount || 0;
  const remaining = Math.max(debt.amount - paidAmount, 0);
  const progress =
    debt.amount > 0
      ? Math.min(Math.round((paidAmount / debt.amount) * 100), 100)
      : 0;
  const deadlineInfo = !debt.is_settled ? getDeadlineInfo(debt.due_date) : null;

  return (
    <div
      className={`group relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
        debt.is_settled 
          ? "border-success/30 ring-1 ring-success/10 bg-success/[0.02]" 
          : "border-border/40 shadow-ring"
      }`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] sm:rounded-t-[2.5rem] ${debt.is_settled ? "bg-success" : isHutang ? "bg-expense" : "bg-piutang"}`}
      />

      <div
        className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.04] blur-3xl pointer-events-none ${debt.is_settled ? "bg-success" : isHutang ? "bg-expense" : "bg-piutang"}`}
      />

      {deadlineInfo?.isOverdue && (
        <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.08] blur-3xl pointer-events-none bg-red-500" />
      )}

      <div className="p-5 sm:p-7 pt-6 sm:pt-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 ${
                debt.is_settled 
                  ? "bg-success/10" 
                  : isHutang 
                    ? "bg-expense/10" 
                    : "bg-piutang/10"
              }`}
            >
              {debt.is_settled ? (
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              ) : isHutang ? (
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-expense" />
              ) : (
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-piutang" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight leading-tight truncate">
                {debt.person_name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isHutang ? "bg-expense/10 text-expense" : "bg-piutang/10 text-piutang"}`}
                >
                  {isHutang ? "Hutang" : "Piutang"}
                </span>
                {debt.is_settled && (
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-success/10 text-success">
                    Lunas ✓
                  </span>
                )}
              </div>
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
              {!debt.is_settled && remaining > 0 && (
                <DropdownMenuItem
                  onClick={() => onPayment(debt)}
                  className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
                >
                  <HandCoins className="w-4 h-4" /> Catat Pembayaran
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onToggleSettle(debt)}
                className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
              >
                <CheckCircle2 className="w-4 h-4" />{" "}
                {debt.is_settled ? "Batal Lunas" : "Tandai Lunas"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(debt)}
                className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
              >
                <Pencil className="w-4 h-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(debt.id)}
                className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold text-expense cursor-pointer hover:bg-expense/10"
              >
                <Trash2 className="w-4 h-4" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {debt.description && (
          <p className="text-xs text-muted-foreground mt-3 ml-14 sm:ml-[60px] truncate">
            {debt.description}
          </p>
        )}

        {/* Amount section */}
        <div className="mt-5 sm:mt-6 pt-4 border-t border-border/20 space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                {debt.is_settled ? "Total" : "Sisa"}
              </p>
              <p
                className={`text-lg sm:text-xl font-black tabular-nums tracking-tight ${debt.is_settled ? "text-success" : isHutang ? "text-expense" : "text-piutang"}`}
              >
                {formatCurrency(debt.is_settled ? debt.amount : remaining)}
              </p>
            </div>
            {paidAmount > 0 && !debt.is_settled && (
              <p className="text-xs text-muted-foreground tabular-nums">
                Terbayar: {formatCurrency(paidAmount)} /{" "}
                {formatCurrency(debt.amount)}
              </p>
            )}
          </div>

          {/* Progress bar — only show if there are partial payments */}
          {paidAmount > 0 && (
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    debt.is_settled
                      ? "bg-success"
                      : isHutang
                        ? "bg-expense"
                        : "bg-piutang"
                  }`}
                  style={{ width: `${debt.is_settled ? 100 : progress}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground/50 text-right">
                {debt.is_settled ? 100 : progress}%
              </p>
            </div>
          )}
        </div>

        {/* Deadline info */}
        {deadlineInfo && (
          <div
            className={`flex items-center gap-1.5 mt-3 text-xs font-bold ${deadlineInfo.color}`}
          >
            {deadlineInfo.isOverdue ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            {deadlineInfo.label}
          </div>
        )}

        {/* Smart contextual button */}
        {!debt.is_settled &&
          (remaining > 0 ? (
            <Button
              onClick={() => onPayment(debt)}
              variant="outline"
              className="w-full mt-4 rounded-2xl h-10 font-bold border-border/30 hover:bg-muted/20 text-xs transition-all"
            >
              <HandCoins className="w-4 h-4 mr-2" /> Catat Pembayaran
            </Button>
          ) : (
            <Button
              onClick={() => onToggleSettle(debt)}
              variant="outline"
              className="w-full mt-4 rounded-2xl h-10 font-bold border-success/30 hover:bg-success/10 text-success text-xs transition-all"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Konfirmasi Lunas
            </Button>
          ))}
      </div>
    </div>
  );
}
