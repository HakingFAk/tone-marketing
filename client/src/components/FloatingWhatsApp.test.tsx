import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FloatingWhatsApp, getWhatsAppTopicUrl, getWhatsAppTopics } from "./FloatingWhatsApp";

describe("FloatingWhatsApp", () => {
  it("renders an accessible Portuguese contact trigger", () => {
    const html = renderToStaticMarkup(<FloatingWhatsApp language="pt" />);
    expect(html).toContain("Falar com a Tone Market no WhatsApp");
    expect(html).toContain('aria-expanded="false"');
  });

  it("builds a WhatsApp topic URL and uses English copy for Brazilian and international shipping", () => {
    const html = renderToStaticMarkup(<FloatingWhatsApp language="en" />);
    expect(getWhatsAppTopicUrl("Hello! I have a question about shipping within Brazil or internationally from Tone Market.")).toContain(encodeURIComponent("Hello! I have a question about shipping within Brazil or internationally from Tone Market."));
    expect(html).toContain("Talk to Tone Market on WhatsApp");
  });

  it("offers three distinct WhatsApp conversation topics", () => {
    const topics = getWhatsAppTopics("pt");
    expect(topics.map(topic => topic.title)).toEqual(["Envios no Brasil e exterior", "Encontrar um instrumento", "Negociar ou vender"]);
    expect(getWhatsAppTopicUrl(topics[0].message)).toContain(encodeURIComponent("Olá! Tenho uma dúvida sobre envio dentro do Brasil ou internacional pela Tone Market."));
  });
});
