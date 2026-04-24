import { Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  isAi?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PricingFeature[];
  buttonText: string;
  buttonHref: string;
  isPopular?: boolean;
  isComingSoon?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  isYearly: boolean;
}

export function PricingCard({ tier, isYearly }: PricingCardProps) {
  const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  const isFree = price === 0 && !tier.isComingSoon;

  return (
    <div
      className={cn(
        "relative flex flex-col p-8 rounded-[40px] border shadow-[0_0_0_1px_rgba(14,15,12,0.12)] transition-all duration-300",
        tier.isPopular ? "bg-primary border-primary" : "bg-card border-border/10 hover:shadow-xl",
        tier.isComingSoon && "opacity-70 border-dashed hover:opacity-100"
      )}
    >
      {/* Popular Badge */}
      {tier.isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary-foreground text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-primary/20">
          <Zap className="w-3.5 h-3.5 fill-current" />
          Terpopuler
        </div>
      )}

      {/* Coming Soon Badge */}
      {tier.isComingSoon && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border border-border/10">
          Akan Datang
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h3 className={cn(
          "text-2xl font-black mb-2 tracking-tight",
          tier.isPopular ? "text-primary-foreground" : "text-foreground"
        )}>
          {tier.name}
        </h3>
        <p className={cn(
          "text-sm font-medium h-10",
          tier.isPopular ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-8 flex items-baseline gap-2">
        {tier.isComingSoon ? (
          <span className="text-4xl font-black opacity-50">TBA</span>
        ) : (
          <>
            <span className={cn(
              "text-5xl font-black tracking-tighter",
              tier.isPopular ? "text-primary-foreground" : "text-foreground"
            )}>
              {isFree ? "Gratis" : `Rp ${price.toLocaleString('id-ID')}`}
            </span>
            {!isFree && (
              <span className={cn(
                "text-sm font-semibold",
                tier.isPopular ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                /{isYearly ? "tahun" : "bulan"}
              </span>
            )}
          </>
        )}
      </div>

      {/* Button */}
      <Link
        href={tier.buttonHref}
        className={cn(
          "w-full py-4 px-6 text-center rounded-[9999px] font-bold text-lg mb-8 wise-button-pill shadow-sm border",
          tier.isPopular 
            ? "bg-primary-foreground text-primary border-transparent hover:bg-primary-foreground/90" 
            : "bg-secondary text-secondary-foreground border-border/10 hover:bg-secondary/80",
          tier.isComingSoon && "pointer-events-none opacity-50"
        )}
      >
        {tier.buttonText}
      </Link>

      {/* Features */}
      <div className="flex-1">
        <p className={cn(
          "text-xs font-black uppercase tracking-widest mb-4",
          tier.isPopular ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          Yang Kamu Dapatkan:
        </p>
        <ul className="space-y-4">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                tier.isPopular 
                  ? "bg-primary-foreground/10 text-primary-foreground" 
                  : "bg-primary/10 text-primary-foreground"
              )}>
                <Check className="w-3 h-3" />
              </div>
              <span className={cn(
                "text-sm font-semibold leading-tight",
                tier.isPopular ? "text-primary-foreground/90" : "text-foreground"
              )}>
                {feature.text}
                {feature.isAi && (
                  <span className="inline-flex items-center gap-1 ml-2 bg-primary/20 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-black">
                    <Sparkles className="w-2.5 h-2.5" /> Beta
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
