import type { Transaction, Budget, Category, Debt, Goal } from "@/types/finance";
import type {
  ReportFilters,
  ReportSummary,
  IncomeExpenseTrendPoint,
  ExpenseBreakdownItem,
  TopCategoryItem,
  DailyExpensePoint,
  QuickSummary,
  BudgetPerformanceItem,
  GoalProgressItem,
  DebtSummary,
  TrendInterval,
} from "./report-types";
import { toNumber, safeDivide, normalizeCategoryKey, getCategoryDisplayName } from "./formatters";
import { getMonthDateRange, getDaysInMonth, getElapsedDaysInMonth } from "./date-utils";
import { format, eachDayOfInterval, subMonths, eachMonthOfInterval } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ─── Filter ──────────────────────────────────────────────

export function filterTransactions(
  transactions: Transaction[],
  filters: ReportFilters
): Transaction[] {
  const { start, end } = getMonthDateRange(filters.selectedMonth);

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) return false;
    if (txDate < start || txDate > end) return false;

    if (
      filters.selectedCategory !== "all" &&
      normalizeCategoryKey(tx.category) !== normalizeCategoryKey(filters.selectedCategory)
    ) {
      return false;
    }

    if (filters.selectedWallet !== "all" && tx.wallet_id !== filters.selectedWallet) {
      return false;
    }

    if (filters.selectedType !== "all" && tx.type !== filters.selectedType) {
      return false;
    }

    return true;
  });
}

/**
 * Filter transactions by category/wallet/type but NOT by month.
 * Used for multi-month trend charts.
 */
export function filterTransactionsWithoutMonth(
  transactions: Transaction[],
  filters: ReportFilters
): Transaction[] {
  return transactions.filter((tx) => {
    if (
      filters.selectedCategory !== "all" &&
      normalizeCategoryKey(tx.category) !== normalizeCategoryKey(filters.selectedCategory)
    ) {
      return false;
    }
    if (filters.selectedWallet !== "all" && tx.wallet_id !== filters.selectedWallet) return false;
    if (filters.selectedType !== "all" && tx.type !== filters.selectedType) return false;
    return true;
  });
}

// ─── Summary ─────────────────────────────────────────────

export function calculateSummary(transactions: Transaction[]): ReportSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    const amount = toNumber(tx.amount);
    if (tx.type === "income") totalIncome += amount;
    else if (tx.type === "expense") totalExpense += amount;
  }

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = safeDivide(netCashflow, totalIncome) * 100;

  return { totalIncome, totalExpense, netCashflow, savingsRate };
}

// ─── Income/Expense Trend ────────────────────────────────

export function calculateIncomeExpenseTrend(
  monthTransactions: Transaction[],
  allTransactions: Transaction[],
  selectedMonth: string,
  trendInterval: TrendInterval
): IncomeExpenseTrendPoint[] {
  switch (trendInterval) {
    case "daily":
      return calculateDailyTrend(monthTransactions, selectedMonth);
    case "weekly":
      return calculateWeeklyTrend(monthTransactions, selectedMonth);
    case "monthly":
      return calculateMonthlyTrend(allTransactions, selectedMonth);
    case "yearly":
      return calculateYearlyTrend(allTransactions);
    default:
      return calculateDailyTrend(monthTransactions, selectedMonth);
  }
}

function calculateDailyTrend(transactions: Transaction[], selectedMonth: string): IncomeExpenseTrendPoint[] {
  const { start, end } = getMonthDateRange(selectedMonth);
  const allDates = eachDayOfInterval({ start, end });

  const dateMap = new Map<string, { income: number; expense: number }>();
  for (const d of allDates) {
    dateMap.set(format(d, "yyyy-MM-dd"), { income: 0, expense: 0 });
  }

  for (const tx of transactions) {
    const entry = dateMap.get(tx.date);
    if (!entry) continue;
    const amount = toNumber(tx.amount);
    if (tx.type === "income") entry.income += amount;
    else if (tx.type === "expense") entry.expense += amount;
  }

  return allDates.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const entry = dateMap.get(key) ?? { income: 0, expense: 0 };
    return {
      label: format(d, "d MMM", { locale: localeId }),
      income: entry.income,
      expense: entry.expense,
      net: entry.income - entry.expense,
    };
  });
}

function calculateWeeklyTrend(transactions: Transaction[], selectedMonth: string): IncomeExpenseTrendPoint[] {
  const daysInMonth = getDaysInMonth(selectedMonth);
  const weekRanges = [
    { start: 1, end: 7, label: "Minggu 1" },
    { start: 8, end: 14, label: "Minggu 2" },
    { start: 15, end: 21, label: "Minggu 3" },
    { start: 22, end: 28, label: "Minggu 4" },
  ];
  if (daysInMonth > 28) {
    weekRanges.push({ start: 29, end: daysInMonth, label: "Minggu 5" });
  }

  const weeks = weekRanges.map((r) => ({ label: r.label, start: r.start, end: r.end, income: 0, expense: 0 }));

  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) continue;
    const day = txDate.getDate();
    const amount = toNumber(tx.amount);
    const weekIdx = weeks.findIndex((w) => day >= w.start && day <= w.end);
    if (weekIdx === -1) continue;
    if (tx.type === "income") weeks[weekIdx].income += amount;
    else if (tx.type === "expense") weeks[weekIdx].expense += amount;
  }

  return weeks.map((w) => ({
    label: w.label,
    income: w.income,
    expense: w.expense,
    net: w.income - w.expense,
  }));
}

function calculateMonthlyTrend(transactions: Transaction[], selectedMonth: string): IncomeExpenseTrendPoint[] {
  const endDate = new Date(`${selectedMonth}-01T00:00:00`);
  const startDate = subMonths(endDate, 5);
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  return months.map((m) => {
    const monthKey = format(m, "yyyy-MM");
    const { start, end } = getMonthDateRange(monthKey);
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime()) || txDate < start || txDate > end) continue;
      const amount = toNumber(tx.amount);
      if (tx.type === "income") income += amount;
      else if (tx.type === "expense") expense += amount;
    }
    return { label: format(m, "MMM yyyy", { locale: localeId }), income, expense, net: income - expense };
  });
}

function calculateYearlyTrend(transactions: Transaction[]): IncomeExpenseTrendPoint[] {
  const yearMap = new Map<number, { income: number; expense: number }>();

  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) continue;
    const year = txDate.getFullYear();
    if (!yearMap.has(year)) yearMap.set(year, { income: 0, expense: 0 });
    const entry = yearMap.get(year)!;
    const amount = toNumber(tx.amount);
    if (tx.type === "income") entry.income += amount;
    else if (tx.type === "expense") entry.expense += amount;
  }

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, entry]) => ({
      label: String(year),
      income: entry.income,
      expense: entry.expense,
      net: entry.income - entry.expense,
    }));
}

// ─── Expense Breakdown ───────────────────────────────────

export function calculateExpenseBreakdown(
  expenseTransactions: Transaction[],
  categories: Category[]
): ExpenseBreakdownItem[] {
  const totalExpense = expenseTransactions.reduce((sum, tx) => sum + toNumber(tx.amount), 0);
  const categoryMap = new Map<string, { amount: number; displayName: string }>();

  const categoryMeta = new Map<string, Category>();
  for (const cat of categories) {
    categoryMeta.set(normalizeCategoryKey(cat.name), cat);
  }

  for (const tx of expenseTransactions) {
    const key = normalizeCategoryKey(tx.category);
    const existing = categoryMap.get(key);
    if (existing) {
      existing.amount += toNumber(tx.amount);
    } else {
      categoryMap.set(key, {
        amount: toNumber(tx.amount),
        displayName: getCategoryDisplayName(tx.category),
      });
    }
  }

  return Array.from(categoryMap.entries())
    .map(([key, data]) => {
      const meta = categoryMeta.get(key);
      return {
        category: data.displayName,
        amount: data.amount,
        percentage: safeDivide(data.amount, totalExpense) * 100,
        icon: meta?.icon,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

// ─── Top Categories ──────────────────────────────────────

export function calculateTopCategories(
  currentExpenses: Transaction[],
  previousExpenses: Transaction[]
): TopCategoryItem[] {
  const totalExpense = currentExpenses.reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const currentMap = new Map<string, { amount: number; displayName: string }>();
  for (const tx of currentExpenses) {
    const key = normalizeCategoryKey(tx.category);
    const existing = currentMap.get(key);
    if (existing) {
      existing.amount += toNumber(tx.amount);
    } else {
      currentMap.set(key, { amount: toNumber(tx.amount), displayName: getCategoryDisplayName(tx.category) });
    }
  }

  const previousMap = new Map<string, number>();
  for (const tx of previousExpenses) {
    const key = normalizeCategoryKey(tx.category);
    previousMap.set(key, (previousMap.get(key) ?? 0) + toNumber(tx.amount));
  }

  return Array.from(currentMap.entries())
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5)
    .map(([key, data]) => {
      const prevAmount = previousMap.get(key);
      let trend: TopCategoryItem["trend"] = "no_comparison";
      let trendPercentage: number | undefined;

      if (prevAmount !== undefined && prevAmount > 0) {
        const delta = data.amount - prevAmount;
        trendPercentage = safeDivide(delta, prevAmount) * 100;
        if (Math.abs(trendPercentage) < 5) trend = "stable";
        else trend = delta > 0 ? "up" : "down";
      }

      return {
        category: data.displayName,
        amount: data.amount,
        percentage: safeDivide(data.amount, totalExpense) * 100,
        trend,
        trendPercentage,
      };
    });
}

// ─── Daily Expenses ──────────────────────────────────────

export function calculateDailyExpenses(
  expenseTransactions: Transaction[],
  selectedMonth: string
): DailyExpensePoint[] {
  const { start, end } = getMonthDateRange(selectedMonth);
  const allDates = eachDayOfInterval({ start, end });

  const dateMap = new Map<string, number>();
  for (const d of allDates) {
    dateMap.set(format(d, "yyyy-MM-dd"), 0);
  }

  for (const tx of expenseTransactions) {
    const key = tx.date;
    if (dateMap.has(key)) {
      dateMap.set(key, (dateMap.get(key) ?? 0) + toNumber(tx.amount));
    }
  }

  let maxAmount = 0;
  let maxDate = "";
  for (const [date, amount] of dateMap) {
    if (amount > maxAmount) {
      maxAmount = amount;
      maxDate = date;
    }
  }

  return allDates.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const amount = dateMap.get(key) ?? 0;
    return { date: key, amount, isHighest: key === maxDate && maxAmount > 0 };
  });
}

// ─── Quick Summary ───────────────────────────────────────

export function calculateQuickSummary(
  filteredTransactions: Transaction[],
  dailyExpenses: DailyExpensePoint[],
  selectedMonth: string
): QuickSummary {
  const relevantDays = getElapsedDaysInMonth(selectedMonth);
  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const averageDailyExpense = safeDivide(totalExpense, relevantDays);

  const highest = dailyExpenses.find((d) => d.isHighest);
  const highestExpenseDay = highest && highest.amount > 0 ? highest.date : null;

  const totalTransactions = filteredTransactions.length;

  const relevantDaily = dailyExpenses.slice(0, relevantDays);
  const noSpendDays = relevantDaily.filter((d) => d.amount === 0).length;

  return { averageDailyExpense, highestExpenseDay, totalTransactions, noSpendDays };
}

// ─── Budget Performance ──────────────────────────────────

export function calculateBudgetPerformance(
  budgets: Budget[],
  expenseTransactions: Transaction[],
  selectedMonth: string
): BudgetPerformanceItem[] {
  const matchingBudgets = budgets.filter((b) => b.month === selectedMonth);

  const expenseByCategory = new Map<string, number>();
  for (const tx of expenseTransactions) {
    const key = normalizeCategoryKey(tx.category);
    expenseByCategory.set(key, (expenseByCategory.get(key) ?? 0) + toNumber(tx.amount));
  }

  const elapsedDays = getElapsedDaysInMonth(selectedMonth);
  const totalDays = getDaysInMonth(selectedMonth);
  const expectedUsage = safeDivide(elapsedDays, totalDays) * 100;

  return matchingBudgets.map((budget) => {
    const key = normalizeCategoryKey(budget.category);
    const allocated = toNumber(budget.amount);
    const realized = expenseByCategory.get(key) ?? 0;
    const remaining = allocated - realized;
    const usedPercentage = safeDivide(realized, allocated) * 100;

    let status: BudgetPerformanceItem["status"] = "Aman";
    if (usedPercentage > 100) status = "Over-budget";
    else if (usedPercentage > 85) status = "Hampir Habis";
    else if (usedPercentage > 60) status = "Waspada";

    const timeRisk: BudgetPerformanceItem["timeRisk"] =
      usedPercentage > expectedUsage + 25 ? "faster_than_expected" : "normal";

    return {
      category: getCategoryDisplayName(budget.category),
      allocated,
      realized,
      remaining,
      usedPercentage,
      status,
      timeRisk,
    };
  });
}

// ─── Goals Progress ──────────────────────────────────────

export function calculateGoalsProgress(goals: Goal[]): GoalProgressItem[] {
  return goals
    .map((goal) => {
      const currentAmount = toNumber(goal.current_amount);
      const targetAmount = toNumber(goal.target_amount);
      const percentage = safeDivide(currentAmount, targetAmount) * 100;

      return {
        id: goal.id,
        title: goal.title,
        currentAmount,
        targetAmount,
        percentage,
        deadline: goal.deadline,
        isCompleted: goal.is_completed,
      };
    })
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });
}

// ─── Debt Summary ────────────────────────────────────────

export function calculateDebtSummary(debts: Debt[]): DebtSummary {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeDebtTotal = 0;
  let activeReceivableTotal = 0;
  let overdueCount = 0;
  let nearestDueDate: Date | null = null;
  let nearestDueName: string | null = null;

  for (const debt of debts) {
    if (debt.is_settled) continue;

    const remaining = Math.max(toNumber(debt.amount) - toNumber(debt.paid_amount), 0);
    if (remaining === 0) continue;

    if (debt.type === "hutang") activeDebtTotal += remaining;
    else if (debt.type === "piutang") activeReceivableTotal += remaining;

    if (debt.due_date) {
      const dueDate = new Date(debt.due_date);
      if (!isNaN(dueDate.getTime())) {
        if (dueDate < today) overdueCount++;
        if (!nearestDueDate || (dueDate >= today && dueDate < nearestDueDate)) {
          nearestDueDate = dueDate;
          nearestDueName = debt.name;
        }
      }
    }
  }

  return {
    activeDebtTotal,
    activeReceivableTotal,
    netPosition: activeReceivableTotal - activeDebtTotal,
    overdueCount,
    nearestDueDebt: nearestDueName,
  };
}
