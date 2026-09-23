export type SiteLanguage = "pt" | "en";

export function formatBrl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00a0/g, " ");
}

export function formatUsd(cents: number, rate: number) {
  return ((cents / 100) * rate).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatProductPrice(cents: number | null, language: SiteLanguage, usdRate: number | null | undefined, unavailableText: string, usdFallbackText = "USD estimate unavailable") {
  if (cents === null) return unavailableText;
  if (language === "en") return usdRate ? formatUsd(cents, usdRate) : usdFallbackText;
  return formatBrl(cents);
}

export function formatUsdRate(rate: number) {
  return `1 BRL = ${rate.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
}
