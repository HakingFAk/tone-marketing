import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HomeAccessibleImage, HomeMenuButton } from "./HomeAccessibility";
import { translate } from "@/lib/i18n";

describe("home accessibility in English", () => {
  it("renders the English mobile menu aria-label", () => {
    const html = renderToStaticMarkup(<HomeMenuButton label={translate("en", "Abrir menu")} open={false} onClick={() => undefined}><span>menu</span></HomeMenuButton>);
    expect(html).toContain('aria-label="Open menu"');
  });

  it("renders translated alt text for the hero and owner images", () => {
    const hero = renderToStaticMarkup(<HomeAccessibleImage src="hero.jpg" alt={translate("en", "Guitarra em destaque")} />);
    const owner = renderToStaticMarkup(<HomeAccessibleImage src="owner.jpg" alt={translate("en", "Thiago, proprietário da Tone Marketing, em sua loja de instrumentos")} />);
    expect(hero).toContain('alt="Featured guitar"');
    expect(owner).toContain('alt="Thiago, owner of Tone Marketing, in his instrument store"');
  });
});
