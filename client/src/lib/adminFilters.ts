export type AdminCatalogProduct = { name: string; category: string; available: number | boolean; documents?: unknown[] };
export type AdminCatalogFilters = { search: string; category: string; availability: string; documentation: string };

export function filterAdminProducts<T extends AdminCatalogProduct>(products: T[], filters: AdminCatalogFilters) {
  const normalized = filters.search.trim().toLocaleLowerCase("pt-BR");
  return products.filter(product => {
    const matchesSearch = !normalized || `${product.name} ${product.category}`.toLocaleLowerCase("pt-BR").includes(normalized);
    const matchesCategory = filters.category === "all" || product.category === filters.category;
    const matchesAvailability = filters.availability === "all" || (filters.availability === "available" ? !!product.available : !product.available);
    const hasDocuments = (product.documents?.length || 0) > 0;
    const matchesDocumentation = filters.documentation === "all" || (filters.documentation === "with" ? hasDocuments : !hasDocuments);
    return matchesSearch && matchesCategory && matchesAvailability && matchesDocumentation;
  });
}
