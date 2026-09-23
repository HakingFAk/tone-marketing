import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n";
import Product from "./Product";

vi.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useRoute: () => [true, { slug: "fender-american-ultra-luxe" }],
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    products: {
      bySlug: {
        useQuery: () => ({ data: { id: 1, slug: "fender-american-ultra-luxe", name: "Fender American Ultra Luxe", category: "Guitarras", condition: "new", available: true, priceCents: 3000000, description: "Impeccable condition.", specifications: "Original case\nInvoice included", images: [], videos: [], documents: [{ id: 1, title: "Original invoice", documentType: "invoice", fileName: "invoice.pdf", mimeType: "application/pdf", url: "/manus-storage/invoice.pdf" }] }, isLoading: false }),
      },
    },
    currency: {
      usdQuote: { useQuery: () => ({ data: { rate: 0.18, updatedAt: 0, source: "ExchangeRate-API" }, isLoading: false }) },
    },
  },
}));

describe("Product USD integration", () => {
  it("renders the English detail price and conversion disclosure", () => {
    const html = renderToStaticMarkup(<LanguageProvider initialLanguage="en"><Product /></LanguageProvider>);
    expect(html).toContain("$5,400.00");
    expect(html).toContain("Estimated from R$ 30.000,00");
    expect(html).toContain("1 BRL = $0.1800");
    expect(html).toContain("Technical notes");
    expect(html).toContain("Original case");
    expect(html).toContain("Country for shipping quote (optional)");
    expect(html).toContain("Worldwide shipping is quoted individually via WhatsApp.");
    expect(html).toContain("Brazil &amp; worldwide service");
    expect(html).toContain("Shipping guide");
    expect(html).toContain("Inspection standard");
    expect(html).toContain("Quote this instrument");
    expect(html).toContain("1 document available");
    expect(html).toContain("hidden md:inline");
  });
});
