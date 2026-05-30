import { useMemo } from "react";
import Fuse, { IFuseOptions } from "fuse.js";

/**
 * A custom hook for client-side fuzzy searching using Fuse.js.
 * Strictly for small, bounded datasets as per GEMINI.md.
 * 
 * @param data The array of items to search through
 * @param query The search query string
 * @param options Fuse.js configuration options
 * @returns The filtered array of items
 */
export function useFuzzySearch<T>(
  data: T[],
  query: string,
  options: IFuseOptions<T>
) {
  const fuse = useMemo(() => {
    return new Fuse(data, {
      threshold: 0.3, // 0.0 is perfect match, 1.0 matches everything
      location: 0,
      distance: 100,
      minMatchCharLength: 1,
      findAllMatches: false,
      useExtendedSearch: true,
      ...options,
    });
  }, [data, options]);

  const results = useMemo(() => {
    if (!query.trim()) return data;
    return fuse.search(query).map((result) => result.item);
  }, [fuse, query, data]);

  return results;
}
