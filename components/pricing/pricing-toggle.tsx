"use client";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

export function PricingToggle({ isYearly, onToggle }: PricingToggleProps) {
  return (
    <div className="flex flex-row items-center justify-center gap-4 mb-12">
      <span
        className={`text-sm font-medium cursor-pointer transition-colors ${
          !isYearly ? "text-foreground" : "text-muted-foreground"
        }`}
        onClick={() => onToggle(false)}
      >
        Bulanan
      </span>

      <button
        onClick={() => onToggle(!isYearly)}
        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isYearly ? "bg-[#2bd887]" : "bg-zinc-200 dark:bg-zinc-700"
        }`}
        role="switch"
        aria-checked={isYearly}
      >
        <span className="sr-only">Toggle Pricing</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isYearly ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>

      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium cursor-pointer transition-colors ${
            isYearly ? "text-foreground" : "text-muted-foreground"
          }`}
          onClick={() => onToggle(true)}
        >
          Tahunan
        </span>
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-500">
          Hemat 20%
        </span>
      </div>
    </div>
  );
}
