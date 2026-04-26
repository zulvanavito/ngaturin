"use client";

import { useMemo, useState } from "react";
import { type RecurringBill } from "@/components/bills/bill-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BillHeatmapProps {
  bills: RecurringBill[];
  paidBillIds: Set<string>;
  onMonthChange?: (date: Date) => void;
}

export function BillHeatmap({ bills, paidBillIds, onMonthChange }: BillHeatmapProps) {
  const [viewDate, setViewDate] = useState(new Date());
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const monthName = viewDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    setViewDate(newDate);
    onMonthChange?.(newDate);
  };

  const dueDayMap = useMemo(() => {
    const map = new Map<number, { bills: RecurringBill[]; allPaid: boolean }>();
    const activeBills = bills.filter(b => b.is_active);

    for (const bill of activeBills) {
      // Logic for yearly bills: only show in due month
      // logic for monthly bills: always show
      const day = Math.min(bill.due_day, daysInMonth);
      if (!map.has(day)) map.set(day, { bills: [], allPaid: true });
      const entry = map.get(day)!;
      entry.bills.push(bill);
      if (!paidBillIds.has(bill.id)) entry.allPaid = false;
    }
    return map;
  }, [bills, paidBillIds, daysInMonth]);

  const days = [];
  // Fill empty cells for alignment
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = dueDayMap.get(d);
    const isToday = isCurrentMonth && d === today;
    const hasBills = !!entry;
    const allPaid = entry?.allPaid ?? false;
    const isOverdue = hasBills && !allPaid && (isCurrentMonth ? d < today : (viewDate < new Date()));

    days.push(
      <div
        key={d}
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all
          ${isToday ? "bg-primary text-primary-foreground font-black ring-2 ring-primary/30" : ""}
          ${hasBills && allPaid && !isToday ? "bg-income/10 text-income font-bold" : ""}
          ${isOverdue && !isToday ? "bg-red-500/10 text-red-500 font-bold" : ""}
          ${hasBills && !allPaid && !isOverdue && !isToday ? "bg-amber-500/10 text-amber-600 font-bold" : ""}
          ${!hasBills && !isToday ? "text-muted-foreground/60" : ""}
        `}
        title={entry ? entry.bills.map(b => b.name).join(", ") : undefined}
      >
        {d}
        {hasBills && (
          <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
            allPaid ? "bg-income" : isOverdue ? "bg-red-500" : "bg-amber-500"
          }`} />
        )}
      </div>
    );
  }

  const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-ring p-5 sm:p-7">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-black tracking-tight text-foreground capitalize">{monthName}</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(w => (
          <div key={w} className="w-8 h-6 sm:w-9 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/20">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-income" /> Lunas
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Mendatang
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Terlambat
        </div>
      </div>
    </div>
  );
}
