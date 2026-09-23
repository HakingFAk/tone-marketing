import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductDocumentManager, uploadProductDocument } from "./ProductDocumentManager";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    documents: {
      listAdmin: { useQuery: () => ({ data: [{ id: 1, title: "Nota fiscal original", fileName: "nota.pdf", published: 1, url: "/manus-storage/nota.pdf" }], refetch: vi.fn() }) },
      prepareUpload: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      create: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      update: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      remove: { useMutation: () => ({ mutate: vi.fn() }) },
    },
  },
}));

describe("ProductDocumentManager", () => {
  it("renders upload controls and the saved document list for an admin product", () => {
    const html = renderToStaticMarkup(<ProductDocumentManager productId={1} />);
    expect(html).toContain("Documentação do produto");
    expect(html).toContain("Selecionar PDF ou imagem");
    expect(html).toContain("Nota fiscal original");
    expect(html).toContain("Adicionar documento");
    expect(html).toContain("Editar documento");
  });

  it("uploads a supported document through the prepared storage URL", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ uploadUrl: "https://upload.example/document", key: "documents/nota.pdf", url: "/manus-storage/documents/nota.pdf" });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const file = { name: "nota.pdf", type: "application/pdf", size: 1024 } as File;
    await expect(uploadProductDocument(file, { mutateAsync })).resolves.toEqual({ storageKey: "documents/nota.pdf", url: "/manus-storage/documents/nota.pdf", fileName: "nota.pdf", mimeType: "application/pdf" });
    expect(mutateAsync).toHaveBeenCalledWith({ filename: "nota.pdf", contentType: "application/pdf" });
    expect(fetchMock).toHaveBeenCalledWith("https://upload.example/document", expect.objectContaining({ method: "PUT" }));
    vi.unstubAllGlobals();
  });
});
