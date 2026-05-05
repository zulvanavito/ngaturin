"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/categories/category-icon";
import { type WalletData, type WalletTransaction } from "@/components/wallets/wallet-card";
import { TransactionRowSkeleton } from "@/components/layout/skeletons";

interface WalletHistoryModalProps {
  open: boolean;
  onClose: () => void;
  wallet: WalletData | null;
}


export function WalletHistoryModal({ open, onClose, wallet }: WalletHistoryModalProps) {
  const { formatCurrency } = useFormatCurrency();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (walletId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?wallet_id=${walletId}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch wallet transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && wallet) {
      fetchHistory(wallet.id);
    } else if (!open) {
      setTransactions([]); // Clear when closed
    }
  }, [open, wallet, fetchHistory]);

  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    transactions.forEach(tx => {
      if (tx.type === "income" || tx.description?.endsWith("→ masuk")) {
        totalIn += tx.amount;
      } else {
        totalOut += tx.amount;
      }
    });
    return { totalIn, totalOut };
  }, [transactions]);

  if (!wallet) return null;

  const txIcon = (type: string) => {
    if (type === "transfer") return <ArrowLeftRight className="w-3.5 h-3.5" />;
    if (type === "income") return <ArrowDownLeft className="w-3.5 h-3.5 text-income" />;
    return <ArrowUpRight className="w-3.5 h-3.5 text-expense" />;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-0 max-h-[90vh] overflow-hidden">
        {/* Header with wallet color */}
        <div className="relative p-6 sm:p-8 pb-5" style={{ background: `linear-gradient(135deg, ${wallet.color}10, ${wallet.color}05)` }}>
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: wallet.color }} />

          <DialogHeader className="pt-2">
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: `${wallet.color}18`, color: wallet.color }}
              >
                <CategoryIcon iconName={wallet.icon} className="w-7 h-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">{wallet.name}</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">
                  Saldo: <span className={`font-bold ${wallet.balance < 0 ? "text-expense" : "text-foreground"}`}>{formatCurrency(wallet.balance)}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 sm:p-4 rounded-2xl bg-income/5 border border-income/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-income/60 mb-0.5">Uang Masuk</p>
              <p className="font-bold text-sm sm:text-base tabular-nums text-income">{formatCurrency(stats.totalIn)}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-expense/5 border border-expense/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-expense/60 mb-0.5">Uang Keluar</p>
              <p className="font-bold text-sm sm:text-base tabular-nums text-expense">{formatCurrency(stats.totalOut)}</p>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 overflow-y-auto custom-scrollbar max-h-[45vh]">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3  pt-2">Seluruh Riwayat Transaksi</p>

          {loading ? (
            <div className="space-y-2">
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground/50 font-medium">Belum ada transaksi di dompet ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isIncome = tx.type === "income" || tx.description?.endsWith("→ masuk");
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/20 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                      {txIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{tx.description}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(tx.date)} · {tx.category}</p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums shrink-0 ${isIncome ? "text-income" : "text-expense"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(tx.amount).replace("Rp", "").trim()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
          <Button variant="ghost" onClick={onClose} className="w-full rounded-2xl h-12 font-bold">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
