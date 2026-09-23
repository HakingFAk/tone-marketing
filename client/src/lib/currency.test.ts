import { describe, expect, it } from "vitest";
import { formatProductPrice, formatUsd, formatUsdRate } from "./currency";

describe("currency conversion", () => {
  it("formats a BRL product price in USD when English is selected", () => {
    expect(formatUsd(3000000, 0.18)).toBe("$5,400.00");
    expect(formatProductPrice(3000000, "en", 0.18, "Ask on WhatsApp")).toBe("$5,400.00");
    expect(formatProductPrice(3000000, "pt", 0.18, "Consulte no WhatsApp")).toBe("R$ 30.000,00");
  });

  it("uses explicit loading and unavailable states when the USD quote is absent", () => {
    expect(formatProductPrice(3000000, "en", null, "Ask on WhatsApp")).toBe("USD estimate unavailable");
    expect(formatProductPrice(3000000, "en", null, "Ask on WhatsApp", "USD estimate loading…")).toBe("USD estimate loading…");
    expect(formatUsdRate(0.18)).toBe("1 BRL = $0.1800");
  });
});
