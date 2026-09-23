import { describe, expect, it } from "vitest";
import { buildInternationalInquiryUrl } from "./international";

describe("international WhatsApp inquiry", () => {
  it("includes destination and shipping topics in English", () => {
    const url = decodeURIComponent(buildInternationalInquiryUrl({ language: "en", name: "John", country: "United States", city: "Miami", shippingPreference: "Fastest option" }));
    expect(url).toContain("John");
    expect(url).toContain("United States");
    expect(url).toContain("Miami");
    expect(url).toContain("Preferred shipping: Fastest option");
    expect(url).toContain("freight, insurance, import duties, documentation and payment options");
  });

  it("includes destination and shipping topics in Portuguese", () => {
    const url = decodeURIComponent(buildInternationalInquiryUrl({ language: "pt", name: "Ana", country: "Chile" }));
    expect(url).toContain("Ana");
    expect(url).toContain("Chile");
    expect(url).toContain("frete, seguro, impostos de importação, documentação e opções de pagamento");
  });
});
