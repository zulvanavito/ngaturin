"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, AlertCircle, Lightbulb, Lock } from "lucide-react";
import { useReportStore } from "@/stores/use-report-store";
import { generateAiInsight } from "@/lib/reports/ai-actions";
import { Button } from "@/components/ui/button";
import type { FinancialReportResult } from "@/lib/reports/report-types";
import { cn } from "@/lib/utils";
import { toneClasses } from "./status-badge";

interface AiInsightReportProps {
  report: FinancialReportResult;
  period: string;
  isLocked: boolean;
}

export function AiInsightReport({ report, period, isLocked }: AiInsightReportProps) {
  const { generatedInsight, setGeneratedInsight } = useReportStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isLocked) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const insight = await generateAiInsight(report, period);
      setGeneratedInsight(insight);
    } catch (err: unknown) {
      console.error(err);
      setError("Gagal menghasilkan insight AI. Coba lagi nanti.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLocked) {
    return (
      <div className="w-full bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9fe870]/10 to-transparent pointer-events-none" />
        
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground relative z-10">
          <Lock className="w-8 h-8" />
        </div>
        <h3 
          className="font-black text-2xl tracking-tight text-foreground mb-2 relative z-10"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          Insight AI Terkunci
        </h3>
        <p 
          className="text-muted-foreground font-semibold text-sm max-w-md mx-auto mb-6 relative z-10"
          style={{ fontFeatureSettings: '"calt"' }}
        >
          Analisis mendalam otomatis dengan kecerdasan buatan hanya tersedia untuk pengguna paket Plus dan Pro.
        </p>
        <Button disabled variant="outline" className="rounded-full px-8 relative z-10">
          Upgrade Sekarang
        </Button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="w-full bg-card rounded-[2rem] p-12 border border-border flex flex-col items-center justify-center shadow-sm">
        <Loader2 className="w-10 h-10 animate-spin text-[#054d28] mb-4" />
        <h3 className="font-bold text-lg text-foreground">Menganalisis Laporan...</h3>
        <p className="text-muted-foreground text-sm">AI sedang mengolah data keuangan Anda.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-destructive/10 rounded-[2rem] p-8 border border-destructive/20 flex flex-col items-center justify-center text-center shadow-sm">
        <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
        <h3 className="font-bold text-lg text-destructive mb-2">Terjadi Kesalahan</h3>
        <p className="text-destructive/80 text-sm mb-6">{error}</p>
        <Button onClick={handleGenerate} variant="outline" className="rounded-full">
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (!generatedInsight) {
    return (
      <div className="w-full bg-card rounded-[2rem] p-8 md:p-12 border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e2f6d5] opacity-50 blur-[80px] -z-0 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 text-center md:text-left flex-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2f6d5] text-[#054d28] text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Insight Pintar
          </div>
          <h3 
            className="font-black text-3xl tracking-tight text-foreground mb-3 leading-tight"
            style={{ fontFeatureSettings: '"calt"' }}
          >
            Pahami Lebih Dalam Pola Keuangan Anda
          </h3>
          <p 
            className="text-muted-foreground font-semibold text-base"
            style={{ fontFeatureSettings: '"calt"' }}
          >
            Biarkan AI menganalisis ribuan data dari transaksi Anda dan memberikan ringkasan, proyeksi, serta rekomendasi khusus secara instan.
          </p>
        </div>
        
        <div className="relative z-10">
          <Button
            onClick={handleGenerate}
            className="rounded-full bg-[#9fe870] hover:bg-[#8ade5d] text-[#163300] font-bold px-8 py-6 text-lg hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Buat Insight AI
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#163300] text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#9fe870]" />
            <h3 
              className="font-black text-xl tracking-tight"
              style={{ fontFeatureSettings: '"calt"' }}
            >
              Laporan Analisis AI
            </h3>
          </div>
          <p className="text-[#9fe870]/80 text-sm font-semibold">
            Dibuat pada {new Date(generatedInsight.generatedAt).toLocaleString('id-ID')}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          variant="outline"
          size="sm"
          className="rounded-full bg-transparent border-white/20 text-white hover:bg-white/10"
        >
          Perbarui Analisis
        </Button>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Summary & Comparison */}
        <section>
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Ringkasan Eksekutif</h4>
          <p className="text-foreground text-base leading-relaxed font-medium">
            {generatedInsight.summary}
          </p>
          {generatedInsight.comparison && (
            <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{generatedInsight.comparison}</p>
            </div>
          )}
        </section>

        {/* Projection */}
        {generatedInsight.projection && (
          <section>
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Proyeksi Akhir Bulan</h4>
            <div className="p-4 bg-[#e2f6d5]/50 border border-[#9fe870]/50 rounded-xl">
              <p className="text-[#054d28] font-semibold">{generatedInsight.projection}</p>
            </div>
          </section>
        )}

        {/* Anomalies / Warnings */}
        {generatedInsight.anomalies.length > 0 && (
          <section>
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              Hal yang Perlu Diperhatikan <span className={cn("inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold", toneClasses.rose)}>{generatedInsight.anomalies.length}</span>
            </h4>
            <div className="space-y-3">
              {generatedInsight.anomalies.map((anomaly, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{anomaly}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {generatedInsight.recommendations.length > 0 && (
          <section>
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Rekomendasi Tindakan</h4>
            <div className="space-y-3">
              {generatedInsight.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-card rounded-xl border shadow-sm">
                  <Lightbulb className="w-5 h-5 text-[#ffc091] shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
