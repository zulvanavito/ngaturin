"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
}

export function MonthlyCalendarActivity() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const data: Transaction[] = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => {
    const now = new Date();
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    if (next <= new Date(now.getFullYear(), now.getMonth(), 1)) {
      setViewDate(next);
    }
  };

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

    // Aggregate by date
    const dayMap = new Map<number, { income: number; expense: number }>();
    transactions
      .filter((t) => t.date.startsWith(monthStr) && t.type !== "transfer")
      .forEach((t) => {
        const day = parseInt(t.date.split("-")[2], 10);
        const existing = dayMap.get(day) || { income: 0, expense: 0 };
        if (t.type === "income") existing.income += Number(t.amount);
        else if (t.type === "expense") existing.expense += Number(t.amount);
        dayMap.set(day, existing);
      });

    // Build calendar grid
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0=Mon
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const weeks: ({ day: number; income: number; expense: number; isToday: boolean } | null)[][] = [];
    let currentWeek: ({ day: number; income: number; expense: number; isToday: boolean } | null)[] = [];

    // Pad first week
    for (let i = 0; i < adjustedFirstDay; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const data = dayMap.get(day) || { income: 0, expense: 0 };
      currentWeek.push({
        day,
        income: data.income,
        expense: data.expense,
        isToday: isCurrentMonth && today.getDate() === day,
      });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  }, [transactions, viewDate]);

  const formatCompact = (value: number): string => {
    if (value === 0) return "";
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}rb`;
    return String(value);
  };

  const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const isCurrentMonth = (() => {
    const now = new Date();
    return viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth();
  })();

  if (loading) {
    return <Skeleton className="h-80 rounded-[2rem]" />;
  }

  return (
    <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
          Aktivitas Bulan Ini
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl hover:bg-muted/20 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-[10px] font-black text-foreground min-w-[110px] text-center uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
            {viewDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-xl hover:bg-muted/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest py-1" style={{ fontFeatureSettings: '"calt"' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {calendarData.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map((cell, dayIdx) => {
              if (!cell) {
                return <div key={dayIdx} className="aspect-square" />;
              }
              const hasActivity = cell.income > 0 || cell.expense > 0;
              return (
                <div
                  key={dayIdx}
                  className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between transition-all
                    ${cell.isToday
                      ? "ring-2 ring-[#9fe870] bg-[#9fe870]/5"
                      : hasActivity
                        ? "bg-muted/10 hover:bg-muted/20"
                        : "hover:bg-muted/10"
                    }
                  `}
                >
                  <span className={`text-[10px] font-black leading-none tabular-nums ${cell.isToday ? "text-[#9fe870]" : "text-muted-foreground/60"}`} style={{ fontFeatureSettings: '"calt"' }}>
                    {cell.day}
                  </span>
                  <div className="space-y-0 mt-auto">
                    {cell.income > 0 && (
                      <p className="text-[8px] font-black text-emerald-500 leading-tight truncate tabular-nums" style={{ fontFeatureSettings: '"calt"' }}>
                        +{formatCompact(cell.income)}
                      </p>
                    )}
                    {cell.expense > 0 && (
                      <p className="text-[8px] font-black text-red-400 leading-tight truncate tabular-nums" style={{ fontFeatureSettings: '"calt"' }}>
                        -{formatCompact(cell.expense)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
