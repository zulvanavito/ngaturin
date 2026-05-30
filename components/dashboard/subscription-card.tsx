"use client";

import { Crown, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  interval: string;
  amount: number;
  current_period_end: string | null;
}

interface SubscriptionCardProps {
  initialSubscription: Subscription | null;
}

const tierConfig: Record<string, {
  name: string;
  label: string;
  gradient: string;
  textColor: string;
  labelBg: string;
  icon: typeof Crown;
  description: string;
}> = {
  free: {
    name: "Free",
    label: "Paket Gratis",
    gradient: "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
    textColor: "text-slate-700 dark:text-slate-200",
    labelBg: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    icon: Sparkles,
    description: "Fitur dasar untuk mulai mencatat keuangan.",
  },
  plus: {
    name: "Plus",
    label: "Ngaturin PLUS",
    gradient: "from-[#9fe870] to-[#cdffad]",
    textColor: "text-[#163300]",
    labelBg: "bg-[#163300]/10 text-[#163300]",
    icon: Sparkles,
    description: "Kebebasan tanpa batas untuk keuanganmu.",
  },
  pro: {
    name: "Pro",
    label: "Ngaturin PRO",
    gradient: "from-[#0e0f0c] to-[#2a2d28]",
    textColor: "text-white",
    labelBg: "bg-white/20 text-white",
    icon: Crown,
    description: "Asisten cerdas untuk keuangan optimal.",
  },
};

export function SubscriptionCard({ initialSubscription }: SubscriptionCardProps) {
  const planId = initialSubscription?.plan_id || "free";
  const config = tierConfig[planId] || tierConfig.free;
  const Icon = config.icon;

  const currentPeriodEnd = initialSubscription?.current_period_end 
    ? new Date(initialSubscription.current_period_end).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Link
      href="/dashboard/profile"
      className="block group"
    >
      <div className={`relative bg-gradient-to-br ${config.gradient} rounded-[2rem] p-6 overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]`}>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-24 h-24" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${config.textColor} opacity-60`}>
              Paket Langganan
            </span>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${config.labelBg} uppercase tracking-widest`} style={{ fontFeatureSettings: '"calt"' }}>
              {planId === "free" ? "FREE" : initialSubscription?.interval === "yearly" ? "TAHUNAN" : "BULANAN"}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${config.textColor}`} />
              <h3 className={`text-xl font-black ${config.textColor}`} style={{ fontFeatureSettings: '"calt"' }}>
                {config.label}
              </h3>
            </div>
            <p className={`text-xs font-semibold ${config.textColor} opacity-60 max-w-[220px]`} style={{ fontFeatureSettings: '"calt"' }}>
              {config.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-current/10">
            <div>
              {planId === "free" ? (
                <span className={`text-[10px] font-black ${config.textColor} opacity-60`} style={{ fontFeatureSettings: '"calt"' }}>
                  Upgrade untuk fitur lengkap →
                </span>
              ) : currentPeriodEnd ? (
                <span className={`text-[10px] font-black ${config.textColor} opacity-60`} style={{ fontFeatureSettings: '"calt"' }}>
                  Berlaku hingga {currentPeriodEnd}
                </span>
              ) : (
                <span className={`text-[10px] font-black ${config.textColor} opacity-60`} style={{ fontFeatureSettings: '"calt"' }}>
                  Aktif
                </span>
              )}
            </div>
            <ChevronRight className={`w-4 h-4 ${config.textColor} opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
          </div>
        </div>
      </div>
    </Link>
  );
}
