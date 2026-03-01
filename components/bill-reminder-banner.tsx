"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  is_active: boolean;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function BillReminderBanner() {
  const [urgentBills, setUrgentBills] = useState<RecurringBill[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch("/api/recurring-bills");
        if (!res.ok) return;
        const bills: RecurringBill[] = await res.json();
        const today = new Date().getDate();
        const urgent = bills.filter((b) => b.is_active && b.due_day - today >= 0 && b.due_day - today <= 3);
        setUrgentBills(urgent);
      } catch {
        // silently fail — banner is not critical
      }
    };
    fetchBills();
  }, []);

  if (dismissed || urgentBills.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
      <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
          {urgentBills.length === 1 ? "Tagihan segera jatuh tempo!" : `${urgentBills.length} tagihan segera jatuh tempo!`}
        </p>
        <ul className="space-y-0.5">
          {urgentBills.map((b) => {
            const diff = b.due_day - new Date().getDate();
            return (
              <li key={b.id} className="text-xs text-amber-700 dark:text-amber-400">
                <span className="font-medium">{b.name}</span> — {formatCurrency(b.amount)}{" "}
                <span className="opacity-70">({diff === 0 ? "hari ini!" : `${diff} hari lagi`})</span>
              </li>
            );
          })}
        </ul>
        <Link href="/dashboard/bills" className="text-xs font-semibold text-amber-800 dark:text-amber-300 underline mt-2 inline-block hover:opacity-80">
          Kelola Tagihan →
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-600 dark:text-amber-400 hover:opacity-70 flex-shrink-0 mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
