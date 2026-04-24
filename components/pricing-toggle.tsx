"use client";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

export function PricingToggle({ isYearly, onToggle }: PricingToggleProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-12">
      <div className="relative flex items-center bg-secondary/50 rounded-[9999px] p-1 border border-border/10">
        <button
          onClick={() => onToggle(false)}
          className={`relative z-10 px-6 py-3 text-sm font-semibold rounded-[9999px] transition-colors ${
            !isYearly
              ? "text-black bg-primary"
              : "text-black hover:bg-primary/40"
          }`}
        >
          Bulanan
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`relative z-10 px-6 py-3 text-sm font-semibold rounded-[9999px] transition-colors flex items-center gap-2 ${
            isYearly
              ? "text-black bg-primary"
              : "text-black hover:bg-primary/40"
          }`}
        >
          Tahunan
        </button>

        {/* Animated Background Pill */}
        <div
          className="absolute inset-y-1 bg-white dark:bg-black rounded-[9999px] shadow-sm transition-all duration-300 ease-out border border-border/10"
          style={{
            left: isYearly ? "50%" : "0.25rem",
            right: isYearly ? "0.25rem" : "50%",
            width: "calc(50% - 0.25rem)",
          }}
        />
      </div>

      {/* Discount Badge */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="bg-primary/20 text-primary-foreground px-3 py-1 rounded-full border border-primary/30">
          Hemat 20% dengan Tahunan 🎉
        </span>
      </div>
    </div>
  );
}
