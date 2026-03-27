import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Memuat data...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-10 min-h-[250px] gap-4 ${className}`}>
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full glass border border-white/10 dark:border-white/5 shadow-[0_20px_50px_rgba(44,47,48,0.05)]">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        {/* Spinner */}
        <Loader2 className="w-8 h-8 text-primary animate-spin relative z-10" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  );
}
