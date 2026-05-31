import type { ReportAnomaly } from "@/lib/reports/report-types";
import { ReportSectionCard } from "./report-section-card";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportExportCardProps {
  onOpenExport: () => void;
  hasData: boolean;
  anomalyCount?: number;
}

const severityIcon = {
  high: <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />,
  medium: <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />,
  low: <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />,
};

export function ReportExportCard({ onOpenExport, hasData, anomalyCount = 0 }: ReportExportCardProps) {
  return (
    <ReportSectionCard 
      title="Ekspor Laporan" 
      titleRight={
        <Button
          id="open-export-modal-btn"
          onClick={onOpenExport}
          disabled={!hasData}
          className="rounded-full bg-[#9fe870] text-[#163300] hover:scale-[1.05] active:scale-95 transition-transform font-bold shrink-0"
        >
          <Download className="w-4 h-4 mr-2" />
          Ekspor Data
        </Button>
      }
    >
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground mt-0.5">
          Unduh laporan berdasarkan periode dan filter aktif.
        </p>
        {anomalyCount > 0 && (
          <p className="text-xs text-[#b45309] mt-1 font-medium">
            {anomalyCount} peringatan terdeteksi pada laporan ini.
          </p>
        )}
      </div>
    </ReportSectionCard>
  );
}
