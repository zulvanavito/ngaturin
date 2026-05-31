import { cn } from "@/lib/utils";

interface ReportSectionCardProps {
  title: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ReportSectionCard({
  title,
  titleRight,
  children,
  className,
  contentClassName,
}: ReportSectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl lg:rounded-[2rem] bg-white dark:bg-card border border-border/50 shadow-sm p-4 sm:p-5 lg:p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 
          className="text-base sm:text-lg font-black tracking-tight text-foreground"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          {title}
        </h2>
        {titleRight && <div className="flex items-center gap-2">{titleRight}</div>}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
