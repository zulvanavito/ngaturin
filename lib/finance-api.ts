import yahooFinance from 'yahoo-finance2';

export interface PriceResult {
  symbol: string;
  price: number;
  currency: string;
  success: boolean;
  error?: string;
}

/**
 * Validates and normalizes Yahoo Finance symbols.
 * Example for IDX: 'BBCA' -> 'BBCA.JK'
 */
const normalizeSymbol = (symbol: string, type: string): string => {
  let normalized = symbol.trim().toUpperCase();
  if (type === 'saham' && !normalized.includes('.')) {
    // Defaults to IDX (Jakarta) for Indonesian stocks if no suffix is provided
    normalized += '.JK';
  } else if (type === 'kripto') {
    // Yahoo Finance crypto format usually uses -USD (e.g., BTC-USD, ETH-USD)
    if (!normalized.includes('-')) {
      normalized += '-USD';
    }
  }
  return normalized;
};

/**
 * Fetches the current price for a given asset using Yahoo Finance.
 */
export async function fetchAssetPrice(symbol: string, type: string): Promise<PriceResult> {
  const querySymbol = normalizeSymbol(symbol, type);

  try {
    const result = await yahooFinance.quote(querySymbol);

    if (result && typeof result === 'object' && 'regularMarketPrice' in result) {
      const quote = result as { regularMarketPrice: number; currency?: string };
      // Basic handling: if price is in USD (crypto usually) and we need IDR, 
      // we would ideally convert it. For MVP, we'll return raw and convert later if needed.
      return {
        symbol: querySymbol,
        price: quote.regularMarketPrice,
        currency: quote.currency || 'USD',
        success: true,
      };
    }

    return {
      symbol: querySymbol,
      price: 0,
      currency: 'Unknown',
      success: false,
      error: 'Price strictly not found in result',
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching price';
    console.error(`Failed to fetch price for ${querySymbol}:`, error);
    return {
      symbol: querySymbol,
      price: 0,
      currency: 'Unknown',
      success: false,
      error: errorMessage,
    };
  }
}
