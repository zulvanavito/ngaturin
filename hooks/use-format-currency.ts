import { useUserPreferences } from "@/components/providers/user-preferences-provider";
import { formatCurrency as baseFormatCurrency } from "@/lib/utils/format";
import { useCallback } from "react";

export function useFormatCurrency() {
  const { showDecimals } = useUserPreferences();

  const formatCurrency = useCallback(
    (amount: number) => {
      return baseFormatCurrency(amount, showDecimals);
    },
    [showDecimals]
  );

  return { formatCurrency, showDecimals };
}
