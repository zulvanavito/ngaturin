import type { TopCategoryItem } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { ReportEmptyState } from "./report-empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/lib/reports/formatters";
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneClasses } from "./status-badge";

interface TopCategoriesCardProps {
  data: TopCategoryItem[];
}

const trendConfig = {
  up: { label: "Naik", icon: TrendingUp, badgeClass: toneClasses.rose },
  down: { label: "Turun", icon: TrendingDown, badgeClass: toneClasses.green },
  stable: { label: "Stabil", icon: Minus, badgeClass: toneClasses.emerald },
  no_comparison: { label: "Belum ada data", icon: HelpCircle, badgeClass: toneClasses.neutral },
};

export function TopCategoriesCard({ data }: TopCategoriesCardProps) {
  const hasData = data.length > 0;

  return (
    <ReportSectionCard title="Kategori Teratas">
      {!hasData ? (
        <ReportEmptyState
          title="Belum ada kategori pengeluaran"
          description="Data kategori akan muncul setelah ada transaksi expense."
        />
      ) : (
        <div className="space-y-3">
          {data.map((item, idx) => {
            const trend = trendConfig[item.trend];
            const TrendIcon = trend.icon;

            return (
              <div key={idx} className="flex items-center gap-3">
                {/* Rank */}
                <span className="text-xs font-black text-muted-foreground w-5 text-center shrink-0">
                  {idx + 1}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{item.category}</p>
                    <span className="text-sm font-black text-foreground tabular-nums shrink-0">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs font-medium text-muted-foreground">{formatPercentage(item.percentage)} dari total</p>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border", trend.badgeClass)}>
                      <TrendIcon className="w-3 h-3" />
                      {item.trend === "no_comparison"
                        ? "Tanpa pembanding"
                        : item.trendPercentage !== undefined
                        ? `${Math.abs(item.trendPercentage).toFixed(0)}% ${trend.label}`
                        : trend.label
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ReportSectionCard>
  );
}
