"use client";

import { Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function GoalsSkeleton() {
  return <Skeleton className="h-40 rounded-[2rem]" />;
}

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 pt-10">
      {/* 1. Top Bar: Search & Notifications */}
      <header className="flex items-center justify-between gap-4">
        <DashboardSearch />
        <NotificationBell />
      </header>

      {/* 2. Hero: Net Worth + Daily Budget + Greeting + Breakdown */}
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16 w-72" />
          <Skeleton className="h-5 w-56" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      }>
        <DashboardHero />
      </Suspense>

      <Suspense fallback={<div className="space-y-4"><Skeleton className="h-24 rounded-[2rem]" /></div>}>
        <GamificationWidget />
      </Suspense>

      {/* 3. Emergency Runway */}
      <Suspense fallback={<Skeleton className="h-28 rounded-[2rem]" />}>
        <EmergencyRunway />
      </Suspense>

      {/* 4. Smart Alerts */}
      <Suspense fallback={<Skeleton className="h-16 rounded-2xl" />}>
        <SmartAlerts />
      </Suspense>

      {/* 5. Two-column: 50/30/20 Progress + Subscription Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-52 rounded-[2rem]" />}>
          <BudgetHealthBar />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-52 rounded-[2rem]" />}>
          <SubscriptionCard />
        </Suspense>
      </div>

      {/* 6. Monthly Calendar Activity */}
      <Suspense fallback={<Skeleton className="h-80 rounded-[2rem]" />}>
        <MonthlyCalendarActivity />
      </Suspense>

      {/* 7. Two-column: Top Expenses + Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={
          <div className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        }>
          <TopExpenses />
        </Suspense>

        <Suspense fallback={
          <div className="bg-white dark:bg-card rounded-[2rem] border border-border/10 p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        }>
          <DashboardRecentTx />
        </Suspense>
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
        <Suspense fallback={<GoalsSkeleton />}>
          <GoalsSnapshot />
        </Suspense>
      </section>
    </div>
  );
}
