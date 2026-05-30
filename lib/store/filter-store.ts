import { create } from "zustand";

export type DateRangePreset = "all" | "7d" | "30d" | "this_month" | "this_year" | "custom";

interface FilterState {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Transaction Filters
  selectedWalletId: string | "all";
  setSelectedWalletId: (id: string | "all") => void;

  selectedCategory: string | "all";
  setSelectedCategory: (category: string | "all") => void;

  transactionType: string | "all";
  setTransactionType: (type: string | "all") => void;

  // Date Range
  dateRangePreset: DateRangePreset;
  setDateRangePreset: (preset: DateRangePreset) => void;
  
  customDateRange: {
    from: string;
    to: string;
  };
  setCustomDateRange: (range: { from: string; to: string }) => void;

  sortBy: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  setSortBy: (sort: "date_desc" | "date_asc" | "amount_desc" | "amount_asc") => void;

  // Actions
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Search
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Transaction Filters
  selectedWalletId: "all",
  setSelectedWalletId: (id) => set({ selectedWalletId: id }),

  selectedCategory: "all",
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  transactionType: "all",
  setTransactionType: (type) => set({ transactionType: type }),

  // Date Range
  dateRangePreset: "all",
  setDateRangePreset: (preset) => set({ dateRangePreset: preset }),

  customDateRange: {
    from: "",
    to: "",
  },
  setCustomDateRange: (range) => set({ customDateRange: range }),

  sortBy: "date_desc",
  setSortBy: (sort) => set({ sortBy: sort }),

  // Actions
  resetFilters: () => set({
    searchQuery: "",
    selectedWalletId: "all",
    selectedCategory: "all",
    transactionType: "all",
    dateRangePreset: "all",
    customDateRange: { from: "", to: "" },
    sortBy: "date_desc",
  }),
}));
