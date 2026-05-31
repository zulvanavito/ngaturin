/**
 * Safely convert a value to number.
 * Handles string (from Supabase numeric), null, undefined, NaN.
 */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Safe division that returns 0 instead of NaN or Infinity.
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || !Number.isFinite(denominator)) return 0;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : 0;
}

/**
 * Format number as Indonesian Rupiah.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number as percentage string.
 */
export function formatPercentage(value: number): string {
  return `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;
}

/**
 * Normalize category name for grouping/matching.
 * Uses lowercase + trim for consistent keys.
 */
export function normalizeCategoryKey(category?: string | null): string {
  return (category || "Tanpa Kategori").trim().toLowerCase();
}

/**
 * Get display-friendly category name.
 * Preserves original casing but trims whitespace.
 */
export function getCategoryDisplayName(category?: string | null): string {
  const trimmed = (category || "").trim();
  return trimmed || "Tanpa Kategori";
}
