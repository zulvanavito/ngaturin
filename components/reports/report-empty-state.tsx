import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReportEmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function ReportEmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
  icon,
}: ReportEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 text-center gap-3", className)}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {ctaLabel && ctaHref && (
        <Button asChild size="sm" variant="outline" className="rounded-full mt-1">
          <a href={ctaHref}>{ctaLabel}</a>
        </Button>
      )}
    </div>
  );
}
