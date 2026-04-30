"use client";

import { useState, useEffect, useCallback } from "react";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: "expense" | "income" | "all";
}

let cachedCategories: Category[] | null = null;
let fetchPromise: Promise<Category[]> | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (force = false) => {
    if (cachedCategories && !force) {
      setCategories(cachedCategories);
      setLoading(false);
      return;
    }

    if (!fetchPromise || force) {
      fetchPromise = fetch("/api/categories").then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat kategori");
        const data = await res.json();
        cachedCategories = data;
        return data;
      });
    }

    try {
      setLoading(!cachedCategories);
      const data = await fetchPromise;
      setCategories(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
      console.error("useCategories error:", err);
      cachedCategories = null; // Reset on error
      fetchPromise = null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "all");
  const incomeCategories = categories.filter((c) => c.type === "income" || c.type === "all");

  return { categories, expenseCategories, incomeCategories, loading, error, refetch: () => fetchCategories(true) };
}
