import { useMemo } from "react";
import { useFuzzySearch } from "./use-fuzzy-search";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

export function useCategorySearch(
  categories: Category[],
  query: string,
  type: "income" | "expense" | "all"
) {
  const typedCategories = useMemo(() => {
    return categories.filter((c) => c.type === type || c.type === "all");
  }, [categories, type]);

  const results = useFuzzySearch(typedCategories, query, {
    keys: ["name"],
    threshold: 0.3,
  });

  return results;
}
