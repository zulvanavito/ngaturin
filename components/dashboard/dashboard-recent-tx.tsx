"use client";

import { type Transaction } from "@/components/finance/transaction-form";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DashboardRecentTxProps {
  initialTransactions: Transaction[];
}

export function DashboardRecentTx({ initialTransactions }: DashboardRecentTxProps) {
  const { formatCurrency } = useFormatCurrency();

  const recent = initialTransactions.slice(0, 5);

  return (
    <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
          Transaksi Terakhir
        </h3>
        <Link
          href="/dashboard/transactions"
          className="text-[10px] font-black text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="space-y-1">
        {recent.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm font-semibold" style={{ fontFeatureSettings: '"calt"' }}>
            Belum ada transaksi
          </div>
        ) : (
          recent.map((tx, idx) => {
            const isIncome = tx.type === "income";
            const isTransfer = tx.type === "transfer";

            return (
              <div
                key={tx.id || idx}
                className="flex items-center gap-3 py-3 border-b border-border/5 last:border-0"
              >
                {/* Indicator Dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  isIncome ? "bg-emerald-500" : isTransfer ? "bg-blue-500" : "bg-foreground/20"
                }`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate" style={{ fontFeatureSettings: '"calt"' }}>
                    {tx.category || tx.description || "Tanpa kategori"}
                  </p>
                  <p className="text-[11px] font-semibold text-muted-foreground truncate mt-0.5" style={{ fontFeatureSettings: '"calt"' }}>
                    {tx.description || ""} · {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>

                {/* Amount */}
                <span className={`text-sm font-black tabular-nums shrink-0 ${
                  isIncome ? "text-emerald-600 dark:text-emerald-400" : isTransfer ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                }`} style={{ fontFeatureSettings: '"calt"' }}>
                  {isIncome ? "+ " : tx.type === "expense" ? "- " : ""}
                  {formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Link */}
      <Link
        href="/dashboard/transactions"
        className="mt-4 flex items-center justify-center gap-2 py-3 text-xs font-black text-muted-foreground hover:text-primary transition-all border-t border-border/10 uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]"
      >
        Lihat semua riwayat <ArrowRight className="w-3 h-3" />
      </Link>
    </section>
  );
}
