import { describe, expect, it } from "vitest";
import { filterAdminProducts } from "./adminFilters";

const products = [
  { name: "Fender American Ultra Luxe", category: "Guitarras", available: 1, documents: [{ id: 1 }] },
  { name: "Pedal Vintage Drive", category: "Pedais", available: 0, documents: [] },
  { name: "Violão Studio", category: "Violões", available: 1, documents: [] },
];

describe("filterAdminProducts", () => {
  it("finds products by a case-insensitive name or category search", () => {
    expect(filterAdminProducts(products, { search: "fender", category: "all", availability: "all", documentation: "all" }).map(product => product.name)).toEqual(["Fender American Ultra Luxe"]);
    expect(filterAdminProducts(products, { search: "pedais", category: "all", availability: "all", documentation: "all" }).map(product => product.name)).toEqual(["Pedal Vintage Drive"]);
  });

  it("combines category, availability and documentation filters", () => {
    expect(filterAdminProducts(products, { search: "", category: "Guitarras", availability: "available", documentation: "with" }).map(product => product.name)).toEqual(["Fender American Ultra Luxe"]);
    expect(filterAdminProducts(products, { search: "", category: "all", availability: "available", documentation: "without" }).map(product => product.name)).toEqual(["Violão Studio"]);
  });
});
