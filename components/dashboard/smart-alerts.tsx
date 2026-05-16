"use client";

import { useMemo, useState } from "react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import { AlertTriangle, CheckCircle2, Bell, ChevronRight, X } from "lucide-react";
import Link from "next/link";

interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  category?: string;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
}

interface Alert {
  id: string;
  type: "danger" | "warning" | "success";
  title: string;
  description: string;
  href?: string;
}

interface SmartAlertsProps {
  initialBills: RecurringBill[];
  initialBudgets: Budget[];
  initialTransactions: Transaction[];
}

export function SmartAlerts({
  initialBills,
  initialBudgets,
  initialTransactions,
}: SmartAlertsProps) {
  const { formatCurrency } = useFormatCurrency();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const newAlerts: Alert[] = [];
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toISOString().substring(0, 7);

    // Rule 1: Check bills due within 3 days
    initialBills.forEach((bill) => {
      const daysUntilDue = bill.due_day - currentDay;
      if (daysUntilDue >= 0 && daysUntilDue <= 3) {
        newAlerts.push({
          id: `bill-${bill.id}`,
          type: daysUntilDue === 0 ? "danger" : "warning",
          title: daysUntilDue === 0
            ? `${bill.name} jatuh tempo hari ini!`
            : `${bill.name} jatuh tempo ${daysUntilDue} hari lagi`,
          description: `Tagihan sebesar ${formatCurrency(bill.amount)} harus segera dibayar.`,
          href: "/dashboard/bills",
        });
      }
    });

    // Rule 2: Check budgets at >80% usage
    const monthlyExpenses = initialTransactions.filter(
      (t) => t.type === "expense" && t.date.startsWith(currentMonth)
    );

    initialBudgets.forEach((budget) => {
      const spent = monthlyExpenses
        .filter((t) => t.category === budget.category)
        .reduce((s, t) => s + Number(t.amount), 0);
      const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      if (pct >= 90) {
        newAlerts.push({
          id: `budget-critical-${budget.id}`,
          type: "danger",
          title: `Budget ${budget.category} hampir habis!`,
          description: `Sudah terpakai ${pct}% (${formatCurrency(spent)} dari ${formatCurrency(budget.amount)}).`,
          href: "/dashboard/budgets",
        });
      } else if (pct >= 80) {
        newAlerts.push({
          id: `budget-warning-${budget.id}`,
          type: "warning",
          title: `Budget ${budget.category} tersisa sedikit`,
          description: `Sudah terpakai ${pct}% (${formatCurrency(spent)} dari ${formatCurrency(budget.amount)}).`,
          href: "/dashboard/budgets",
        });
      }
    });

    // Rule 3: Positive insight - if monthly savings > 20%
    const monthlyTx = initialTransactions.filter((t) => t.date.startsWith(currentMonth));
    const income = monthlyTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthlyTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);

    if (income > 0 && (income - expense) / income >= 0.2) {
      newAlerts.push({
        id: "savings-good",
        type: "success",
        title: "Keuanganmu sehat bulan ini! 🎉",
        description: `Kamu berhasil menyisihkan ${Math.round(((income - expense) / income) * 100)}% dari pemasukan.`,
      });
    }

    return newAlerts;
  }, [initialBills, initialBudgets, initialTransactions, formatCurrency]);

  const dismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id));

  if (visibleAlerts.length === 0) return null;

  const styleMap = {
    danger: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200/60 dark:border-red-800/40",
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      titleColor: "text-red-700 dark:text-red-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200/60 dark:border-amber-800/40",
      icon: <Bell className="w-4 h-4 text-amber-500" />,
      titleColor: "text-amber-700 dark:text-amber-400",
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200/60 dark:border-emerald-800/40",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      titleColor: "text-emerald-700 dark:text-emerald-400",
    },
  };

  return (
    <section className="space-y-3">
      {visibleAlerts.slice(0, 3).map((alert) => {
        const style = styleMap[alert.type];
        const Wrapper = alert.href ? Link : "div";
        const wrapperProps = alert.href ? { href: alert.href } : {};

        return (
          <div
            key={alert.id}
            className={`relative flex items-start gap-3 p-4 rounded-2xl border ${style.bg} ${style.border} transition-all duration-200 group`}
          >
            <div className="mt-0.5 shrink-0">{style.icon}</div>
            <Wrapper {...(wrapperProps as any)} className="flex-1 min-w-0">
              <p className={`text-sm font-black ${style.titleColor}`} style={{ fontFeatureSettings: '"calt"' }}>
                {alert.title}
              </p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5 leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
                {alert.description}
              </p>
            </Wrapper>
            {alert.href && (
              <Link href={alert.href} className="shrink-0 self-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
              </Link>
            )}
            <button
              onClick={() => dismiss(alert.id)}
              className="shrink-0 self-start p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground/40" />
            </button>
          </div>
        );
      })}
    </section>
  );
}
