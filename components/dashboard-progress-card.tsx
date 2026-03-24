"use client";

import { useMemo } from "react";
import type { Transaction } from "./transaction-form";

interface CategoryProgress {
  name: string;
  spent: number;
  total: number;
  colorClass: string;
}

interface DashboardProgressCardProps {
  transactions: Transaction[];
}

export function DashboardProgressCard({ transactions }: DashboardProgressCardProps) {
  
  
  const today = new Date();
  const day = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const categoryExpenses = useMemo(() => {
    const currentMonthTx = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === today.getMonth() && 
             txDate.getFullYear() === today.getFullYear() &&
             t.type === 'expense';
    });

    const expensesMap = currentMonthTx.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return expensesMap;
  }, [transactions, today.getMonth(), today.getFullYear()]);

  // Map into display data, sorting by highest spent
  const topCategories = useMemo(() => {

    const colors = ["bg-[#6B93D6]", "bg-[#BAAFE0]", "bg-[#85DABB]", "bg-[#F4B8C0]", "bg-[#F5C89A]"];
    
    const cats = Object.entries(categoryExpenses)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Show top 3
      .map(([name, spent], index) => {
      
        const estimatedBudget = 15000000; 
        const total = spent > estimatedBudget ? spent * 1.2 : estimatedBudget; 
        
        return {
          name,
          spent,
          total, 
          colorClass: colors[index % colors.length]
        };
      });
      
    
    if (cats.length === 0) {
      return [
        { name: "Belum ada", spent: 0, total: 1000, colorClass: "bg-muted" },
      ];
    }
    
    return cats;
  }, [categoryExpenses]);

  const calculatePercentage = (spent: number, total: number) => {
    if (total === 0) return 0;
    return Math.min(Math.round((spent / total) * 100), 100);
  };

  const getProgressLabel = (spent: number, total: number) => {
    if (total === 0) return "Belum diatur";
    const p = spent / total;
    if (p === 0) return "0 Pengeluaran";
    if (p < 0.5) return "Masih aman";
    if (p < 0.8) return "Hati-hati";
    if (p <= 1) return "Hampir habis";
    return "Melewati batas";
  };

  // Circular progress math
  const progressRatio = day / daysInMonth;
  const circleCircumference = 2 * Math.PI * 24; // r=24
  const strokeDashoffset = circleCircumference - progressRatio * circleCircumference;

  return (
    <div className="bg-white dark:bg-card rounded-[2rem] border border-border/40 p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center mt-6">
      
      {/* Left: Circular Progress for Days */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="relative flex items-center justify-center">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="24"
              className="stone-100"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              style={{ color: "rgba(100, 116, 139, 0.1)" }}
            />
            <circle
              cx="40"
              cy="40"
              r="24"
              className="text-foreground"
              strokeWidth="4"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Hari</span>
            <span className="text-xl font-bold leading-none mt-0.5">{day}</span>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-foreground">Progres Pengeluaran</h3>
          <p className="text-xs text-muted-foreground">Hari {day} dari {daysInMonth}</p>
        </div>
      </div>

      {/* Right: Linear Progress Bars */}
      <div className="flex-1 w-full space-y-4">
        {topCategories.map((cat, i) => {
          const percentage = calculatePercentage(cat.spent, cat.total);
          const labelDisplay = getProgressLabel(cat.spent, cat.total);
          
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-end">
                <div className="flex items-baseline gap-2">
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${cat.colorClass.replace('bg-', 'text-')}`}>
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{labelDisplay}</span>
                </div>
                <span className="text-[10px] font-bold">{cat.spent > cat.total && cat.total !== 1000 ? Math.round((cat.spent/cat.total)*100) : percentage}%</span>
              </div>
              <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${cat.colorClass} rounded-full`}
                  style={{ width: `${Math.min(cat.spent > cat.total && cat.total !== 1000 ? 100 : percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
