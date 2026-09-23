import { describe, expect, it } from "vitest";
import { translate } from "./i18n";

describe("language translations", () => {
  it("translates core storefront copy to English", () => {
    expect(translate("en", "Catálogo")).toBe("Catalog");
    expect(translate("en", "Comprar via WhatsApp")).toBe("Buy via WhatsApp");
    expect(translate("en", "Voltar para o catálogo")).toBe("Back to catalog");
  });

  it("translates accessibility labels used by the home page", () => {
    expect(translate("en", "Abrir menu")).toBe("Open menu");
    expect(translate("en", "Guitarra em destaque")).toBe("Featured guitar");
    expect(translate("en", "Thiago, proprietário da Tone Marketing, em sua loja de instrumentos")).toBe("Thiago, owner of Tone Marketing, in his instrument store");
  });

  it("keeps Portuguese copy as the default language", () => {
    expect(translate("pt", "Catálogo")).toBe("Catálogo");
    expect(translate("pt", "Comprar via WhatsApp")).toBe("Comprar via WhatsApp");
  });
});
