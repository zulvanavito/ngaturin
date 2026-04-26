import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ message = "Memuat data...", className = "" }: { message?: string, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] gap-4 ${className}`}>
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-sm font-bold text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

export function WalletCardSkeleton() {
  return (
    <div className="relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-ring overflow-hidden">
      <Skeleton className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] sm:rounded-t-[2.5rem]" />
      <div className="p-5 sm:p-7 pt-6 sm:pt-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24 sm:w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="mt-5 sm:mt-6 pt-4 border-t border-border/20 space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-40" />
        </div>
      </div>
      <div className="lg:hidden border-t border-border/20 p-4 flex justify-center">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-5 sm:p-6 shadow-ring">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-[1.25rem]" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

export function BudgetCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-5 sm:p-6 shadow-ring">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
    </div>
  );
}

export function BillCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-5 shadow-ring">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-6 sm:p-8 shadow-ring flex flex-col min-h-[320px]">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col justify-end space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-2xl mt-4" />
      </div>
    </div>
  );
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-border/40">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20 ml-auto" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
    </div>
  );
}

export function InvestmentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-5 sm:p-6 shadow-ring">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-[1.25rem]" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="mt-4 pt-4 border-t border-border/20 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-3 w-16 ml-auto" />
          <Skeleton className="h-5 w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function InvestmentChartSkeleton() {
  return (
    <div className="bg-card border border-border/40 rounded-[2.5rem] p-6 sm:p-8 shadow-ring">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-[1.5rem]" />
    </div>
  );
}

export function DebtCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 p-5 sm:p-7 pt-6 sm:pt-8 shadow-ring">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="mt-5 sm:mt-6 pt-4 border-t border-border/20 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
        </div>
      </div>
    </div>
  );
}
