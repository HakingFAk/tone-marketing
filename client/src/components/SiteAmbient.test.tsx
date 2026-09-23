import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteAmbient } from "./SiteAmbient";

describe("SiteAmbient", () => {
  it("renders the global atmospheric layer with subtle floating particles", () => {
    const html = renderToStaticMarkup(<SiteAmbient />);
    expect(html).toContain('class="tone-site-ambient"');
    expect(html).toContain("tone-site-vignette");
    expect(html).toContain("tone-site-rhythm");
    expect(html.match(/tone-site-particle/g)).toHaveLength(23);
  });
});
