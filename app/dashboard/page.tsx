import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { GamificationWidget } from "@/components/dashboard/gamification-widget";
import { EmergencyRunway } from "@/components/dashboard/emergency-runway";
import { SmartAlerts } from "@/components/dashboard/smart-alerts";
import { BudgetHealthBar } from "@/components/dashboard/budget-health-bar";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { DashboardRecentTx } from "@/components/dashboard/dashboard-recent-tx";
import { MonthlyCalendarActivity } from "@/components/dashboard/activity-heatmap";
import { TopExpenses } from "@/components/dashboard/top-expenses";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { GoalsSnapshot } from "@/components/goals/goals-snapshot";
import Link from "next/link";
import { 
  getUser, 
  getWallets, 
  getTransactions, 
  getDebts, 
  getInvestments, 
  getGamification, 
  getSubscription, 
  getRecurringBills, 
  getBudgets,
  getCategories,
  getUserProfile
} from "@/lib/dal";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage() {
  // Parallel fetching at the top level
  const [
    user,
    userProfile,
    wallets,
    allTransactions,
    debts,
    investments,
    gamification,
    subscription,
    bills,
    budgets,
    categories,
  ] = await Promise.all([
    getUser(),
    getUserProfile(),
    getWallets(),
    getTransactions(), // All transactions for various widgets
    getDebts(),
    getInvestments(),
    getGamification(),
    getSubscription(),
    getRecurringBills(),
    getBudgets(),
    getCategories(),
  ]);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";

  // Calculate monthly income/expense once here to pass down
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyTx = allTransactions.filter((t) => t.date.startsWith(currentMonth) && t.type !== "transfer");
  const monthlyIncome = monthlyTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const monthlyExpense = monthlyTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 pt-10">
      {/* 1. Top Bar: Search & Notifications */}
      <header className="flex items-center justify-between gap-4">
        <DashboardSearch />
        <NotificationBell 
          initialBills={bills} 
          initialBudgets={budgets} 
          initialTransactions={allTransactions} 
        />
      </header>

      {/* 2. Hero: Net Worth + Daily Budget + Greeting + Breakdown */}
      <DashboardHero 
        userName={userName}
        wallets={wallets}
        debts={debts}
        investments={investments}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
      />

      <GamificationWidget initialData={gamification} />

      {/* 3. Emergency Runway */}
      <EmergencyRunway 
        initialWallets={wallets} 
        initialTransactions={allTransactions} 
      />

      {/* 4. Smart Alerts */}
      <SmartAlerts 
        initialBills={bills} 
        initialBudgets={budgets} 
        initialTransactions={allTransactions} 
      />

      {/* 5. Two-column: 50/30/20 Progress + Subscription Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BudgetHealthBar 
          initialMonthlyIncome={monthlyIncome} 
          initialExpenses={monthlyTx.filter(t => t.type === "expense")} 
          categories={categories}
          userProfile={userProfile}
        />
        <SubscriptionCard initialSubscription={subscription} />
      </div>

      {/* 6. Monthly Calendar Activity */}
      <MonthlyCalendarActivity initialTransactions={allTransactions} />

      {/* 7. Two-column: Top Expenses + Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopExpenses initialTransactions={allTransactions} />
        <DashboardRecentTx initialTransactions={allTransactions} />
      </div>

      {/* 8. Goals Snapshot */}
      <section className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
            Target Keuangan
          </h3>
          <Link
            href="/dashboard/goals"
            className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            + Tambah
          </Link>
        </div>
        <Suspense fallback={<Skeleton className="h-40 rounded-[2rem]" />}>
          <GoalsSnapshot />
        </Suspense>
      </section>
    </div>
  );
}
