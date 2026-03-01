"use client";

import { useState, useEffect, useCallback } from "react";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: "expense" | "income" | "all";
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Gagal memuat kategori");
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
      console.error("useCategories error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "all");
  const incomeCategories = categories.filter((c) => c.type === "income" || c.type === "all");

  return { categories, expenseCategories, incomeCategories, loading, error, refetch: fetchCategories };
}
