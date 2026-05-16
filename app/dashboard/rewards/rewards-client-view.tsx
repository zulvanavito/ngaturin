"use client";

import { useState, useMemo } from "react";
import { Flame, Trophy, Zap, Award, Crown, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";

const IconMap: Record<string, any> = {
  Zap,
  Award,
  Trophy,
  Flame,
  Crown,
  Star
};

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
}

interface GamificationProfile {
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
}

interface RewardsClientViewProps {
  profile: GamificationProfile | null;
  allBadges: Badge[];
  earnedBadgeIds: string[];
}

export function RewardsClientView({ 
  profile, 
  allBadges: badges, 
  earnedBadgeIds 
}: RewardsClientViewProps) {
  const earnedBadges = useMemo(() => new Set(earnedBadgeIds), [earnedBadgeIds]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const xpProgress = profile ? (profile.xp / 100) * 100 : 0;

  // Pagination logic
  const totalPages = Math.ceil(badges.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBadges = badges.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 pt-10">
      {/* Header */}
      <header className="space-y-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
        <h1 
          className="text-5xl sm:text-6xl font-black tracking-tighter leading-[0.85] text-foreground"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          Pencapaian
        </h1>
      </header>

      {/* Profile Overview */}
      <section className="bg-white dark:bg-card border border-border/10 rounded-[2.5rem] p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#9fe870]/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#9fe870]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                  Level {profile?.level || 1}
                </h2>
                <p className="text-sm font-semibold text-muted-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                  {profile?.xp || 0} / 100 XP untuk level berikutnya
                </p>
              </div>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#9fe870] transition-all duration-1000"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-around sm:justify-end gap-8">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-xl font-black text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                {profile?.current_streak || 0}
              </p>
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
                Streak
              </p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-xl font-black text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                {profile?.longest_streak || 0}
              </p>
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
                Terlama
              </p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xl font-black text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
                {earnedBadges.size}
              </p>
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest" style={{ fontFeatureSettings: '"calt"' }}>
                Lencana
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight text-foreground" style={{ fontFeatureSettings: '"calt"' }}>
            Lencana Koleksi
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-border/10 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2">
              Hal {currentPage} dari {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-border/10 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all rotate-180"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {currentBadges.map((badge) => {
            const isEarned = earnedBadges.has(badge.id);
            const Icon = IconMap[badge.icon_name] || Star;

            return (
              <div 
                key={badge.id}
                className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${
                  isEarned 
                    ? "bg-white dark:bg-card border-border/10 hover:border-primary/40 hover:scale-[1.05]" 
                    : "bg-muted/5 border-dashed border-border/20 opacity-60 grayscale"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-12 ${
                    isEarned ? "bg-[#9fe870] text-[#163300]" : "bg-muted text-muted-foreground/40"
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground mb-1" style={{ fontFeatureSettings: '"calt"' }}>
                      {badge.name}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-foreground leading-tight" style={{ fontFeatureSettings: '"calt"' }}>
                      {badge.description}
                    </p>
                  </div>
                  {isEarned && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#9fe870]" />
                  )}
                  {!isEarned && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/20 text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider">
                      +{badge.xp_reward} XP
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
