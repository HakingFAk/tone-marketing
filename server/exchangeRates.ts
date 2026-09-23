type ExchangeRateApiResponse = {
  result?: string;
  time_last_update_unix?: number;
  rates?: { USD?: number };
};

export type UsdQuote = {
  rate: number | null;
  updatedAt: number | null;
  source: string;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
let cached: { value: UsdQuote; expiresAt: number } | null = null;

export async function getBrlToUsdQuote(): Promise<UsdQuote> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/BRL", {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Exchange-rate response: ${response.status}`);

    const payload = await response.json() as ExchangeRateApiResponse;
    const rate = payload.rates?.USD;
    if (payload.result !== "success" || typeof rate !== "number" || rate <= 0) {
      throw new Error("Invalid BRL/USD rate payload");
    }

    const value: UsdQuote = {
      rate,
      updatedAt: payload.time_last_update_unix ? payload.time_last_update_unix * 1000 : Date.now(),
      source: "ExchangeRate-API",
    };
    cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  } catch (error) {
    console.warn("[Currency] BRL/USD quote unavailable", error);
    return { rate: null, updatedAt: null, source: "Unavailable" };
  }
}
