import { describe, expect, it } from "vitest";
import { buildCartMessage, buildOrderRequestMessage, buildPurchaseMessage, buildWhatsAppUrl } from "./whatsapp";

describe("purchase WhatsApp message", () => {
  it("includes customer name, product, price and direct link", () => {
    const message = buildPurchaseMessage({
      customerName: "  Ana Souza ",
      productName: "Fender American Ultra Luxe",
      priceCents: 3000000,
      condition: "new",
      available: true,
      productUrl: "https://tone.marketing/produto/fender-american-ultra-luxe",
    });
    expect(message).toContain("Ana Souza");
    expect(message).toContain("Fender American Ultra Luxe");
    expect(message).toContain("R$ 30.000,00");
    expect(message).toContain("https://tone.marketing/produto/fender-american-ultra-luxe");
    expect(buildWhatsAppUrl(message)).toContain("https://wa.me/5565993074442?text=");

    const englishMessage = buildPurchaseMessage({
      customerName: "Ana Souza",
      productName: "Fender American Ultra Luxe",
      priceCents: 3000000,
      condition: "new",
      available: true,
      productUrl: "https://tone.marketing/produto/fender-american-ultra-luxe",
      language: "en",
      usdRate: 0.18,
    });
    expect(englishMessage).toContain("Hello, my name is Ana Souza");
    expect(englishMessage).toContain("Estimated USD price: $5,400.00");
    expect(englishMessage).toContain("Original BRL list price: R$ 30.000,00");
    expect(englishMessage).toContain("Direct product link:");

    const internationalMessage = buildPurchaseMessage({
      customerName: "John",
      productName: "Fender",
      priceCents: 3000000,
      condition: "new",
      available: true,
      productUrl: "https://tone.marketing/produto/fender",
      language: "en",
      usdRate: 0.18,
      country: "United States",
      city: "Miami",
    });
    expect(internationalMessage).toContain("Destination: United States, Miami");
    expect(internationalMessage).toContain("freight, insurance, import duties and documentation");
  });

  it("lists every cart item in one negotiation message", () => {
    const message = buildCartMessage({
      customerName: "Thiago",
      items: [
        { name: "Guitarra rubi", priceCents: 120000, condition: "new", available: true, slug: "guitarra-rubi" },
        { name: "Violão âmbar", priceCents: null, condition: "used", available: false, slug: "violao-ambar" },
      ],
    });
    expect(message).toContain("Selecionei 2 instrumentos");
    expect(message).toContain("Guitarra rubi");
    expect(message).toContain("Violão âmbar");
    expect(message).toContain("/produto/guitarra-rubi");
    expect(message).toContain("/produto/violao-ambar");
  });

  it("creates an order request using a sold product as a reference", () => {
    const message = buildOrderRequestMessage({
      customerName: "Marina",
      productName: "Pedalboard violeta",
      productUrl: "https://tone.marketing/produto/pedalboard-violeta",
      country: "Brasil",
      city: "Cuiabá",
    });
    expect(message).toContain("Pedalboard violeta");
    expect(message).toContain("já foi vendido");
    expect(message).toContain("Tenho interesse de fazer uma encomenda");
    expect(message).toContain("Destino: Brasil, Cuiabá");

    const englishMessage = buildOrderRequestMessage({
      customerName: "Alex",
      productName: "Ruby guitar",
      productUrl: "https://tone.marketing/produto/ruby-guitar",
      language: "en",
      country: "United States",
    });
    expect(englishMessage).toContain("has already been sold");
    expect(englishMessage).toContain("custom order");
    expect(englishMessage).toContain("Destination: United States");
  });
});
