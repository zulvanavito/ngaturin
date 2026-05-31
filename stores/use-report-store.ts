import { create } from "zustand";
import type { ReportFilters, TransactionTypeFilter, TrendInterval, ReportViewMode, GeneratedInsight } from "@/lib/reports/report-types";
import { getCurrentMonth } from "@/lib/reports/date-utils";

interface ReportStoreState {
  filters: ReportFilters;
  trendInterval: TrendInterval;
  viewMode: ReportViewMode;
  isInsightExpanded: boolean;
  generatedInsight: GeneratedInsight | null;

  setSelectedMonth: (month: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedWallet: (wallet: string) => void;
  setSelectedType: (type: TransactionTypeFilter) => void;
  setTrendInterval: (interval: TrendInterval) => void;
  setViewMode: (mode: ReportViewMode) => void;
  setInsightExpanded: (value: boolean) => void;
  setGeneratedInsight: (insight: GeneratedInsight | null) => void;
  resetFilters: () => void;
}

const defaultFilters: ReportFilters = {
  selectedMonth: getCurrentMonth(),
  selectedCategory: "all",
  selectedWallet: "all",
  selectedType: "all",
};

export const useReportStore = create<ReportStoreState>((set) => ({
  filters: defaultFilters,
  trendInterval: "daily",
  viewMode: "overview",
  isInsightExpanded: false,
  generatedInsight: null,

  setSelectedMonth: (month) =>
    set((state) => ({
      filters: { ...state.filters, selectedMonth: month },
      generatedInsight: null,
    })),

  setSelectedCategory: (category) =>
    set((state) => ({
      filters: { ...state.filters, selectedCategory: category },
      generatedInsight: null,
    })),

  setSelectedWallet: (wallet) =>
    set((state) => ({
      filters: { ...state.filters, selectedWallet: wallet },
      generatedInsight: null,
    })),

  setSelectedType: (type) =>
    set((state) => ({
      filters: { ...state.filters, selectedType: type },
      generatedInsight: null,
    })),

  setTrendInterval: (interval) => set({ trendInterval: interval }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setInsightExpanded: (value) => set({ isInsightExpanded: value }),
  setGeneratedInsight: (insight) => set({ generatedInsight: insight }),
  resetFilters: () => set({ filters: defaultFilters, trendInterval: "daily", generatedInsight: null }),
}));
