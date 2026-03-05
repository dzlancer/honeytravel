let ratesCache: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_TTL = 3600000; // 1 hour

export async function getExchangeRates(): Promise<Record<string, number>> {
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_TTL) {
    return ratesCache.rates;
  }

  try {
    const res = await fetch(
      process.env.EXCHANGE_RATE_API_URL ||
        'https://api.exchangerate-api.com/v4/latest/USD',
    );
    const data = await res.json();
    ratesCache = { rates: data.rates, timestamp: Date.now() };
    return data.rates;
  } catch {
    // Fallback rates
    return { USD: 1, EUR: 0.92, GBP: 0.79, DZD: 134.5, MAD: 10.1, TND: 3.12 };
  }
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (from === to) return amount;
  const inUsd = from === 'USD' ? amount : amount / (rates[from] || 1);
  return to === 'USD' ? inUsd : inUsd * (rates[to] || 1);
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
