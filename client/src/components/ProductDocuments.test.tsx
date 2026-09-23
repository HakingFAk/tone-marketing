import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductDocumentList, ProductDocuments } from "./ProductDocuments";

describe("ProductDocuments", () => {
  it("renders no badge without published documents", () => {
    expect(renderToStaticMarkup(<ProductDocuments language="pt" documents={[]} />)).toBe("");
  });

  it("renders a localized documentation badge when files are available", () => {
    const html = renderToStaticMarkup(<ProductDocuments language="pt" documents={[{ id: 1, title: "Nota fiscal original", documentType: "invoice", fileName: "nota.pdf", mimeType: "application/pdf", url: "/manus-storage/nota.pdf" }]} />);
    expect(html).toContain("1 documento disponível");
  });

  it("renders document titles, localized types and open actions in the public panel list", () => {
    const html = renderToStaticMarkup(<ProductDocumentList language="en" documents={[{ id: 1, title: "Original invoice", documentType: "invoice", fileName: "invoice.pdf", mimeType: "application/pdf", url: "/manus-storage/invoice.pdf" }, { id: 2, title: "Inspection report", documentType: "inspection", fileName: "inspection.pdf", mimeType: "application/pdf", url: "/manus-storage/inspection.pdf" }]} />);
    expect(html).toContain("Original invoice");
    expect(html).toContain("Invoice · invoice.pdf");
    expect(html).toContain("Inspection · inspection.pdf");
    expect((html.match(/>Open</g) || []).length).toBe(2);
    expect(html).toContain('href="/manus-storage/invoice.pdf"');
  });
});
