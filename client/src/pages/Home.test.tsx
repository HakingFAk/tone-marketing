import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n";
import Home from "./Home";

vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    products: {
      list: {
        useQuery: () => ({ data: [{ id: 1, slug: "fender-american-ultra-luxe", name: "Fender American Ultra Luxe", category: "Guitarras", condition: "new", available: true, promotionActive: 1, priceCents: 3000000, images: [{ url: "/manus-storage/phone-portrait.jpg" }] }], isLoading: false }),
      },
    },
    currency: {
      usdQuote: {
        useQuery: () => ({ data: { rate: 0.18, updatedAt: 0, source: "ExchangeRate-API" } }),
      },
    },
    videos: {
      list: { useQuery: () => ({ data: [], isLoading: false }) },
    },
  },
}));

describe("Home English accessibility integration", () => {
  it("renders the real Home markup with translated accessibility attributes and interactive guitar hero", () => {
    const html = renderToStaticMarkup(<LanguageProvider initialLanguage="en"><Home /></LanguageProvider>);
    expect(html).toContain('aria-label="Open menu"');
    expect(html).toContain('aria-label="Press play to wake the guitar"');
    expect(html).toContain('alt="Thiago, owner of Tone Marketing, in his instrument store"');
    expect(html).toContain('data-testid="tone-signal-signature"');
    expect(html).not.toContain("Curadoria musical em Cuiabá");
    expect(html).toContain("$5,400.00");
    expect(html).toContain("1 BRL = $0.1800");
    expect(html).toContain("Shipping");
    expect(html).toContain("Trust");
    expect(html).toContain("International buyers");
    expect(html).toContain("phone-portrait.jpg");
    expect(html).toContain("object-contain");
    expect(html).toContain("Limited-time deals");
    expect(html).toContain("Limited deal");
    expect(html).toContain("Custom");
    expect(html).toContain("Custom No. 01 · Signature");
    expect(html).toContain("Share your Custom idea");
    expect(html).toContain("tone-custom-atelier-front-complete_5e584e60.png");
    expect(html).toContain("tone-custom-atelier-back-complete_fed61d0f.png");
    expect(html).toContain(">Back<");
  });
});
