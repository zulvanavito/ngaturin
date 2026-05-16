"use client";

import { useMemo, useState } from "react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { ShieldCheck, Info } from "lucide-react";

interface WalletData {
  id: string;
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
}

interface EmergencyRunwayProps {
  initialWallets: WalletData[];
  initialTransactions: Transaction[];
}

export function EmergencyRunway({
  initialWallets,
  initialTransactions,
}: EmergencyRunwayProps) {
  const { formatCurrency } = useFormatCurrency();
  const [showTip, setShowTip] = useState(false);

  const { runwayMonths, totalLiquid, avgExpense } = useMemo(() => {
    const liquid = initialWallets.reduce((s, w) => s + Number(w.balance), 0);

    // Calculate average monthly expenses over last 3 months
    const now = new Date();
    const monthlyExpenses: number[] = [];

    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthExpense = initialTransactions
        .filter((t) => t.type === "expense" && t.date.startsWith(monthStr))
        .reduce((s, t) => s + Number(t.amount), 0);
      if (monthExpense > 0) monthlyExpenses.push(monthExpense);
    }

    const avg = monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((s, v) => s + v, 0) / monthlyExpenses.length
      : 0;

    const runway = avg > 0 ? liquid / avg : 0;

    return { runwayMonths: runway, totalLiquid: liquid, avgExpense: avg };
  }, [initialWallets, initialTransactions]);

  const runwayDisplay = runwayMonths > 0 ? runwayMonths.toFixed(1) : "0";
  const isHealthy = runwayMonths >= 3;
  const isMedium = runwayMonths >= 1 && runwayMonths < 3;

  const statusColor = isHealthy
    ? "text-emerald-600 dark:text-emerald-400"
    : isMedium
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  const statusBg = isHealthy
    ? "bg-emerald-500/10"
    : isMedium
      ? "bg-amber-500/10"
      : "bg-red-500/10";

  const statusLabel = isHealthy
    ? "Aman"
    : isMedium
      ? "Perlu Ditingkatkan"
      : "Kritis";

  return (
    <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl ${statusBg} flex items-center justify-center shrink-0`}>
          <ShieldCheck className={`w-5 h-5 ${statusColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
              Runway Dana Darurat
            </h3>
            <button
              className="relative"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              onClick={() => setShowTip(!showTip)}
            >
              <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary transition-colors" />
              {showTip && (
                <div className="absolute left-0 top-6 z-50 w-64 p-4 bg-card border border-border/20 rounded-[1.5rem] shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-xs font-black text-foreground mb-1" style={{ fontFeatureSettings: '"calt"' }}>Apa itu Runway?</p>
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
                    Berapa bulan kamu bisa bertahan tanpa pemasukan. Dihitung dari: Total Kas (Dompet) ÷ Rata-rata pengeluaran 3 bulan terakhir. Idealnya minimal 3–6 bulan.
                  </p>
                </div>
              )}
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tabular-nums ${statusColor}`} style={{ fontFeatureSettings: '"calt"' }}>
              {runwayDisplay}
            </span>
            <span className="text-sm font-semibold text-muted-foreground" style={{ fontFeatureSettings: '"calt"' }}>Bulan</span>
            <span className={`ml-auto text-[10px] font-black px-3 py-1 rounded-full ${statusBg} ${statusColor} uppercase tracking-widest`} style={{ fontFeatureSettings: '"calt"' }}>
              {statusLabel}
            </span>
          </div>
          <p className="text-xs font-semibold text-muted-foreground mt-2 tabular-nums" style={{ fontFeatureSettings: '"calt"' }}>
            {formatCurrency(totalLiquid)} kas ÷ {formatCurrency(avgExpense)}/bulan
          </p>
        </div>
      </div>
    </section>
  );
}
