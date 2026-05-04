import { User } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      {/* Cover Profile Skeleton */}
      <div className="w-full h-32 md:h-48 rounded-3xl bg-muted/30 animate-pulse relative mb-12">
        <div className="absolute -bottom-10 left-8">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[30px] border-4 border-background bg-muted/40 animate-pulse flex items-center justify-center">
            <User className="w-10 h-10 text-muted/20" />
          </div>
        </div>
        <div className="absolute -bottom-4 left-32 md:left-36 space-y-2">
          <div className="w-48 h-8 bg-muted/30 animate-pulse rounded-full" />
          <div className="w-32 h-4 bg-muted/20 animate-pulse rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 mt-16 px-4 md:px-8">
        {/* Sidebar Navigation Skeleton */}
        <div className="space-y-2 relative">
          <div className="lg:sticky lg:top-24 space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-muted/30" />
              <div className="w-32 h-5 bg-muted/30 rounded-full" />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-transparent">
              <div className="w-6 h-6 rounded-full bg-muted/20 animate-pulse" />
              <div className="w-28 h-5 bg-muted/20 animate-pulse rounded-full" />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-transparent">
              <div className="w-6 h-6 rounded-full bg-muted/20 animate-pulse" />
              <div className="w-36 h-5 bg-muted/20 animate-pulse rounded-full" />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-transparent">
              <div className="w-6 h-6 rounded-full bg-muted/20 animate-pulse" />
              <div className="w-32 h-5 bg-muted/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="min-w-0 pb-24">
          <div className="space-y-12">
            <div>
              {/* Header Skeleton */}
              <div className="mb-8 space-y-4">
                <div className="w-3/4 max-w-sm h-12 bg-muted/30 animate-pulse rounded-full" />
                <div className="w-full max-w-md h-6 bg-muted/20 animate-pulse rounded-full" />
                <div className="w-2/3 max-w-xs h-6 bg-muted/20 animate-pulse rounded-full" />
              </div>

              {/* Form Cards Skeleton */}
              <div className="space-y-8">
                {/* Email Card */}
                <div className="p-8 rounded-[30px] border border-border/40 bg-white/50 dark:bg-white/5 space-y-6">
                  <div className="space-y-3">
                    <div className="w-32 h-6 bg-muted/30 animate-pulse rounded-full" />
                    <div className="w-64 h-4 bg-muted/20 animate-pulse rounded-full" />
                  </div>
                  <div className="w-full h-14 bg-muted/20 animate-pulse rounded-[16px]" />
                </div>

                {/* Profile Fields Card */}
                <div className="p-8 rounded-[30px] border border-border/40 bg-white/50 dark:bg-white/5 space-y-8">
                  <div className="space-y-3">
                    <div className="w-40 h-6 bg-muted/30 animate-pulse rounded-full" />
                    <div className="w-72 h-4 bg-muted/20 animate-pulse rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="w-24 h-4 bg-muted/20 animate-pulse rounded-full" />
                      <div className="w-full h-14 bg-muted/20 animate-pulse rounded-[16px]" />
                    </div>
                    <div className="space-y-3">
                      <div className="w-24 h-4 bg-muted/20 animate-pulse rounded-full" />
                      <div className="w-full h-14 bg-muted/20 animate-pulse rounded-[16px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
