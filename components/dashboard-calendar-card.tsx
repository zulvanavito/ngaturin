"use client";

import { useMemo } from "react";
import type { Transaction } from "./transaction-form";

interface DashboardCalendarProps {
  transactions: Transaction[];
}

export function DashboardCalendarCard({ transactions }: DashboardCalendarProps) {
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun, 1=Mon...
  
  // Format MM YYYY for header
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  
  // Create blank calendar grid (6 weeks max)
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1; // Align 1st with correct day of week
    if (day > 0 && day <= daysInMonth) return day;
    return null;
  });
  
  // Determine if we need 5 or 6 rows based on whether items exist in last row
  const rowsNeeded = calendarDays[35] !== null ? 42 : 35;
  const visibleDays = calendarDays.slice(0, rowsNeeded);

  // Group real transactions by their day in the current month
  const activityData = useMemo(() => {
    const map: Record<number, { value: string; isNegative: boolean, raw: number }> = {};
    
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type !== 'transfer') {
        const dateNum = d.getDate();
        
        // aggregate net or purely total expenses by day? Let's sum net or track expenses
        // Let's just track overall movement for that day
        const amount = t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount);
        
        if (!map[dateNum]) {
           map[dateNum] = { value: '', isNegative: false, raw: 0 };
        }
        
        map[dateNum].raw += amount;
      }
    });

    // Format for display
    Object.keys(map).forEach(key => {
      const idx = Number(key);
      const raw = map[idx].raw;
      
      // format to match K/JT sizing (like "-25RB")
      let formatted = '';
      const absRaw = Math.abs(raw);
      
      if (absRaw >= 1000000) {
        formatted = `${(absRaw / 1000000).toLocaleString('id-ID', {maximumFractionDigits:1})}JT`;
      } else if (absRaw >= 1000) {
        formatted = `${Math.floor(absRaw / 1000)}RB`;
      } else if (absRaw > 0) {
        formatted = `${absRaw}`;
      }
      
      if (absRaw > 0) {
        map[idx].value = raw < 0 ? `-${formatted}` : `+${formatted}`;
        map[idx].isNegative = raw < 0;
      }
    });

    return map;
  }, [transactions, currentMonth, currentYear]);


  return (
    <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-6 sm:p-8 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-bold text-foreground text-lg mb-1">Aktivitas Bulan Ini</h3>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-4 mb-2">{monthName}</p>
      </div>
      
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1">
        {/* Day headers */}
        {['MG', 'SN', 'SL', 'RB', 'KM', 'JM', 'SB'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-2">
            {d}
          </div>
        ))}
        
        {/* Calendar Grid */}
        {visibleDays.map((day, i) => {
          const isToday = day === today.getDate();
          const data = day ? activityData[day] : null;
          
          return (
            <div 
              key={i} 
              className={`
                relative h-12 sm:h-16 rounded-xl flex items-start justify-start p-2 transition-colors
                ${!day ? 'opacity-0' : 'bg-muted/10 hover:bg-muted/30'}
                ${isToday ? 'border-2 border-rose-300 bg-rose-50/50 dark:bg-rose-500/5' : 'border border-transparent'}
              `}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium ${isToday ? 'text-rose-500' : 'text-foreground/80'}`}>
                    {day}
                  </span>
                  
                  {data && data.value && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center mt-1 w-full px-1">
                      <span className={`text-[8px] sm:text-[10px] font-bold truncate block w-full text-center ${data.isNegative ? 'text-rose-400' : 'text-emerald-500'}`}>
                        {data.value}
                      </span>
                    </div>
                  )}

                  {/* Active dot indicator on cells with values */}
                  {data && data.value && (
                    <div className={`absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full opacity-50 ${data.isNegative ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
