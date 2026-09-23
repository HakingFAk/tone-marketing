import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Admin from "./Admin";

vi.mock("wouter", () => ({ useLocation: () => ["/admin", vi.fn()] }));
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { name: "Thiago", role: "admin" }, loading: false, isAuthenticated: true }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    products: {
      list: { useQuery: () => ({ data: [], refetch: vi.fn() }) },
      create: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      update: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      remove: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

describe("admin catalog controls", () => {
  it("keeps the management form in Portuguese and renders search, filters and empty results", () => {
    const html = renderToStaticMarkup(<Admin />);
    expect(html).toContain("Painel de controle");
    expect(html).toContain("Preço em reais (opcional)");
    expect(html).toContain("Deixe vazio para &#x27;Consulte no WhatsApp&#x27;");
    expect(html).not.toContain("USD estimate");
    expect(html).toContain('aria-label="Buscar produto administrativo"');
    expect(html).toContain('aria-label="Filtrar por categoria"');
    expect(html).toContain('aria-label="Filtrar por disponibilidade"');
    expect(html).toContain('aria-label="Filtrar por documentação"');
    expect(html).toContain("grid gap-3 sm:grid-cols-3");
    expect(html).toContain("grid gap-5 sm:grid-cols-2");
    expect(html).toContain("flex flex-col justify-between gap-4 sm:flex-row sm:items-center");
    expect(html).toContain("Nenhum produto encontrado.");
  });
});
