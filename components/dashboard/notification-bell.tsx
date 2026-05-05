"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import Link from "next/link";

interface Notification {
  id: string;
  type: "danger" | "warning" | "success" | "info";
  title: string;
  description: string;
  href?: string;
  time: string;
}

export function NotificationBell() {
  const { formatCurrency } = useFormatCurrency();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateNotifications = useCallback(async () => {
    try {
      const [billsRes, budgetsRes, txRes] = await Promise.all([
        fetch("/api/recurring-bills"),
        fetch("/api/budgets"),
        fetch(`/api/transactions?_t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const [bills, budgets, transactions] = await Promise.all([
        billsRes.ok ? billsRes.json() : [],
        budgetsRes.ok ? budgetsRes.json() : [],
        txRes.ok ? txRes.json() : [],
      ]);

      const items: Notification[] = [];
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.toISOString().substring(0, 7);
      const now = today.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

      // Bills due soon
      if (Array.isArray(bills)) {
        bills.forEach((bill: { id: string; name: string; amount: number; due_day: number }) => {
          const daysUntilDue = bill.due_day - currentDay;
          if (daysUntilDue >= 0 && daysUntilDue <= 3) {
            items.push({
              id: `bill-${bill.id}`,
              type: daysUntilDue === 0 ? "danger" : "warning",
              title: daysUntilDue === 0
                ? `${bill.name} jatuh tempo hari ini!`
                : `${bill.name} jatuh tempo ${daysUntilDue} hari lagi`,
              description: `Tagihan ${formatCurrency(bill.amount)} harus segera dibayar.`,
              href: "/dashboard/bills",
              time: now,
            });
          }
        });
      }

      // Budget warnings
      if (Array.isArray(budgets) && Array.isArray(transactions)) {
        const monthlyExpenses = transactions.filter(
          (t: { type: string; date: string }) => t.type === "expense" && t.date.startsWith(currentMonth)
        );
        budgets.forEach((budget: { id: string; category: string; amount: number }) => {
          const spent = monthlyExpenses
            .filter((t: { category: string }) => t.category === budget.category)
            .reduce((s: number, t: { amount: number }) => s + Number(t.amount), 0);
          const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
          if (pct >= 80) {
            items.push({
              id: `budget-${budget.id}`,
              type: pct >= 90 ? "danger" : "warning",
              title: `Budget ${budget.category} ${pct}%`,
              description: `${formatCurrency(spent)} dari ${formatCurrency(budget.amount)} sudah terpakai.`,
              href: "/dashboard/budgets",
              time: now,
            });
          }
        });
      }

      // Good savings
      if (Array.isArray(transactions)) {
        const monthlyTx = transactions.filter((t: { date: string }) => t.date.startsWith(currentMonth));
        const income = monthlyTx
          .filter((t: { type: string }) => t.type === "income")
          .reduce((s: number, t: { amount: number }) => s + Number(t.amount), 0);
        const expense = monthlyTx
          .filter((t: { type: string }) => t.type === "expense")
          .reduce((s: number, t: { amount: number }) => s + Number(t.amount), 0);

        if (income > 0 && (income - expense) / income >= 0.2) {
          items.push({
            id: "savings-good",
            type: "success",
            title: "Keuanganmu sehat bulan ini! 🎉",
            description: `Kamu menyisihkan ${Math.round(((income - expense) / income) * 100)}% dari pemasukan.`,
            time: now,
          });
        }
      }

      if (items.length === 0) {
        items.push({
          id: "no-alert",
          type: "info",
          title: "Semua terkendali!",
          description: "Tidak ada peringatan saat ini. Keuanganmu aman!",
          time: now,
        });
      }

      setNotifications(items);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { generateNotifications(); }, [generateNotifications]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alertCount = notifications.filter((n) => n.type === "danger" || n.type === "warning").length;

  const iconMap = {
    danger: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
    warning: <Bell className="w-3.5 h-3.5 text-amber-500" />,
    success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    info: <Info className="w-3.5 h-3.5 text-blue-500" />,
  };

  const bgMap = {
    danger: "bg-red-50 dark:bg-red-950/20",
    warning: "bg-amber-50 dark:bg-amber-950/20",
    success: "bg-emerald-50 dark:bg-emerald-950/20",
    info: "bg-blue-50 dark:bg-blue-950/20",
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative shrink-0 w-12 h-12 rounded-full bg-white dark:bg-card border border-border/10 hover:border-primary/30 transition-all"
      >
        <Bell className="w-[18px] h-[18px]" />
        {alertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-background animate-in zoom-in duration-200">
            {alertCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-14 z-50 w-80 sm:w-96 bg-white dark:bg-card border border-border/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between p-4 border-b border-border/5">
            <h4 className="text-base font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
              Notifikasi
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-muted/20 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-sm font-semibold text-muted-foreground" style={{ fontFeatureSettings: '"calt"' }}>Memuat...</div>
            ) : (
              notifications.map((notif) => {
                const content = (
                  <div className={`flex items-start gap-3 p-3 mx-2 my-1 rounded-xl ${bgMap[notif.type]} transition-colors hover:opacity-80 group cursor-pointer`}>
                    <div className="mt-0.5 shrink-0">{iconMap[notif.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                        {notif.title}
                      </p>
                      <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
                        {notif.description}
                      </p>
                    </div>
                    {notif.href && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-foreground mt-0.5 shrink-0 transition-colors" />
                    )}
                  </div>
                );

                if (notif.href) {
                  return (
                    <Link key={notif.id} href={notif.href} onClick={() => setIsOpen(false)}>
                      {content}
                    </Link>
                  );
                }
                return <div key={notif.id}>{content}</div>;
              })
            )}
          </div>

          <div className="p-3 border-t border-border/5">
            <p className="text-[10px] font-black text-muted-foreground/60 text-center uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
              Notifikasi otomatis berdasarkan data keuanganmu
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
