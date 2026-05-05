/**
 * Shared currency formatter — module-level cached Intl.NumberFormat instance.
 * Avoids recreating the formatter on every call (js-cache-function-results).
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return formatter.format(amount);
}
