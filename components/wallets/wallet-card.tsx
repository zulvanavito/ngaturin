"use client";

import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/categories/category-icon";

export interface WalletData {
  id: string;
  name: string;
  icon: string;
  type:
    | "cash"
    | "bank"
    | "emoney"
    | "credit"
    | "investment"
    | "crypto"
    | "debit";
  color: string;
  balance: number;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

interface WalletCardProps {
  wallet: WalletData;
  onEdit: (wallet: WalletData) => void;
  onDelete: (walletId: string) => void;
  onViewHistory: (wallet: WalletData) => void;
}

const TYPE_LABELS: Record<string, string> = {
  cash: "Tunai",
  bank: "Bank",
  emoney: "E-Money",
  credit: "Kartu Kredit",
  investment: "Saham / Investasi",
  crypto: "Crypto",
  debit: "Debit",
};


export function WalletCard({
  wallet,
  onEdit,
  onDelete,
  onViewHistory,
}: WalletCardProps) {
  return (
    <div className="relative">
      <div className="group relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-ring transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] sm:rounded-t-[2.5rem]"
          style={{ background: wallet.color }}
        />

        {/* Subtle background glow */}
        <div
          className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.05] blur-3xl transition-transform duration-700 group-hover:scale-150 pointer-events-none"
          style={{ backgroundColor: wallet.color }}
        />

        {/* Main Content */}
        <div className="p-5 sm:p-7 pt-6 sm:pt-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              {/* Icon Bubble */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6"
                style={{
                  backgroundColor: `${wallet.color}18`,
                  color: wallet.color,
                }}
              >
                <CategoryIcon
                  iconName={wallet.icon}
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight leading-tight truncate">
                  {wallet.name}
                </h3>
                <span
                  className="inline-block mt-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${wallet.color}15`,
                    color: wallet.color,
                  }}
                >
                  {TYPE_LABELS[wallet.type] || wallet.type}
                </span>
              </div>
            </div>

            {/* Actions */}
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
                  onClick={() => onViewHistory(wallet)}
                  className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
                >
                  <Eye className="w-4 h-4" /> Lihat Riwayat
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(wallet)}
                  className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(wallet.id)}
                  className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold text-expense cursor-pointer hover:bg-expense/10"
                >
                  <Trash2 className="w-4 h-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Balance */}
          <div className="mt-5 sm:mt-6 pt-4 border-t border-border/20">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
              Saldo
            </p>
            <p
              className={`text-lg sm:text-xl lg:text-2xl font-black tabular-nums tracking-tight ${wallet.balance < 0 ? "text-expense" : "text-foreground"}`}
            >
              {formatCurrency(wallet.balance)}
            </p>
          </div>
        </div>

        {/* Mobile: Tap to view history hint */}
        <div className="lg:hidden border-t border-border/20">
          <button
            onClick={() => onViewHistory(wallet)}
            className="w-full px-5 sm:px-7 py-3 text-xs font-bold text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors text-center"
          >
            Ketuk untuk lihat riwayat →
          </button>
        </div>
      </div>
    </div>
  );
}
