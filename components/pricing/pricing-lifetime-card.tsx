import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PricingTier } from "./pricing-card";

interface PricingLifetimeCardProps {
  tier: PricingTier;
}

export function PricingLifetimeCard({ tier }: PricingLifetimeCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col md:flex-row items-center justify-between p-8 md:p-10 rounded-[40px] border border-border/10 shadow-[0_0_0_1px_rgba(14,15,12,0.12)] bg-card w-full gap-8 transition-all duration-300 hover:shadow-xl",
        tier.isComingSoon && "opacity-70 border-dashed hover:opacity-100"
      )}
    >
      {/* Left side: Title, Desc, Features */}
      <div className="flex-1 w-full">
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            {tier.name}
          </h3>
          {tier.isComingSoon && (
             <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border border-border/10">
               Akan Datang
             </span>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-6">
          {tier.description}
        </p>

        {/* Horizontal Features */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {tier.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Check className="w-2.5 h-2.5 font-bold" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Price and Button */}
      <div className="flex flex-col sm:flex-row md:flex-col items-center justify-end gap-6 md:min-w-[200px] w-full md:w-auto border-t md:border-t-0 md:border-l border-border/10 pt-6 md:pt-0 md:pl-8">
        <div className="text-center sm:text-right md:text-center w-full">
          {tier.isComingSoon ? (
            <div className="text-4xl font-black opacity-50 mb-1">TBA</div>
          ) : (
            <div className="flex items-baseline justify-center sm:justify-end md:justify-center gap-1 mb-1">
              <span className="text-4xl font-black tracking-tighter text-foreground">
                Gratis
              </span>
            </div>
          )}
          <div className="text-xs font-semibold text-muted-foreground">Sekali bayar, akses selamanya</div>
        </div>

        <Link
          href={tier.buttonHref}
          className={cn(
            "w-full py-4 px-8 text-center rounded-[9999px] font-bold text-lg wise-button-pill shadow-sm border whitespace-nowrap",
            "bg-secondary text-secondary-foreground border-border/10 hover:bg-secondary/80",
            tier.isComingSoon && "pointer-events-none opacity-50"
          )}
        >
          {tier.buttonText}
        </Link>
      </div>
    </div>
  );
}
