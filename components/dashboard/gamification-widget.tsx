"use client";

import { Flame, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

interface GamificationData {
  xp: number;
  level: number;
  current_streak: number;
}

interface GamificationWidgetProps {
  initialData: GamificationData | null;
}

export function GamificationWidget({ initialData }: GamificationWidgetProps) {
  const xpProgress = initialData ? (initialData.xp / 100) * 100 : 0;

  return (
    <Link 
      href="/dashboard/rewards"
      className="group block bg-white dark:bg-card border border-border/10 rounded-[2rem] p-5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Level & XP */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#9fe870]/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#9fe870]" />
              </div>
              <p className="text-xs font-black text-foreground uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
                Level {initialData?.level || 1}
              </p>
            </div>
            <p className="text-[10px] font-black text-muted-foreground/60" style={{ fontFeatureSettings: '"calt"' }}>
              {initialData?.xp || 0} / 100 XP
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#9fe870] transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-4 pl-6 border-l border-border/10">
          <div className="text-right">
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
              Streak
            </p>
            <p className="text-2xl font-black text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
              {initialData?.current_streak || 0}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${initialData?.current_streak ? 'bg-orange-500/10' : 'bg-muted/10'}`}>
            <Flame className={`w-7 h-7 ${initialData?.current_streak ? 'text-orange-500 fill-orange-500/20' : 'text-muted-foreground/30'}`} />
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}
