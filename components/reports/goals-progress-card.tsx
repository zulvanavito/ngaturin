import type { GoalProgressItem } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { ReportEmptyState } from "./report-empty-state";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./status-badge";
import { formatCurrency, formatPercentage } from "@/lib/reports/formatters";
import { format, parseISO, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Target, CheckCircle2 } from "lucide-react";

interface GoalsProgressCardProps {
  data: GoalProgressItem[];
}

function getGoalHealth(item: GoalProgressItem): string {
  if (item.isCompleted) return "Tercapai";
  if (!item.deadline) return "Tidak ada deadline";

  const daysLeft = differenceInDays(parseISO(item.deadline), new Date());
  if (daysLeft < 0) return "Terlambat";
  if (daysLeft <= 30 && item.percentage < 80) return "Berisiko";
  if (item.percentage >= 80) return "On Track";
  return "Dalam Rencana";
}

export function GoalsProgressCard({ data }: GoalsProgressCardProps) {
  const hasData = data.length > 0;

  return (
    <ReportSectionCard title="Progress Tujuan Finansial">
      {!hasData ? (
        <ReportEmptyState
          title="Belum ada tujuan finansial."
          description="Buat goals agar progress tabungan bisa dipantau."
          ctaLabel="Buat Goals"
          ctaHref="/dashboard/goals"
          icon={<Target className="w-5 h-5" />}
        />
      ) : (
        <div className="space-y-4">
          {data.map((goal) => {
            const healthStatus = getGoalHealth(goal);
            const progressColor = goal.isCompleted
              ? "[&_[data-slot=progress-indicator]]:bg-[#9fe870]"
              : goal.percentage < 30
              ? "[&_[data-slot=progress-indicator]]:bg-[#ffd11a]"
              : "[&_[data-slot=progress-indicator]]:bg-[#9fe870]";

            return (
              <div key={goal.id} className="p-3 rounded-xl border border-border/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {goal.isCompleted && <CheckCircle2 className="w-4 h-4 text-[#054d28] shrink-0" />}
                    <p className={cn("text-sm font-semibold", goal.isCompleted ? "text-muted-foreground line-through" : "text-foreground")}>
                      {goal.title}
                    </p>
                  </div>
                  <StatusBadge status={healthStatus} className="shrink-0" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="tabular-nums font-medium text-foreground">{formatCurrency(goal.currentAmount)}</span>
                  <span className="tabular-nums">{formatPercentage(goal.percentage)}</span>
                  <span className="tabular-nums">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <Progress value={Math.min(goal.percentage, 100)} className={cn("h-2 mb-1.5", progressColor)} />
                {goal.deadline && !goal.isCompleted && (
                  <p className="text-xs text-muted-foreground">
                    Deadline: {format(parseISO(goal.deadline), "d MMMM yyyy", { locale: id })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ReportSectionCard>
  );
}
