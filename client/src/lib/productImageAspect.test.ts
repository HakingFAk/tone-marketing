import { describe, expect, it } from "vitest";
import { DEFAULT_PRODUCT_IMAGE_ASPECT, getProductImageAspect } from "./productImageAspect";

describe("product image aspect", () => {
  it("preserves a portrait photo ratio so a full instrument can remain visible", () => {
    expect(getProductImageAspect(3, 4)).toBe(0.75);
  });

  it("preserves a landscape photo ratio and falls back safely when dimensions are invalid", () => {
    expect(getProductImageAspect(16, 9)).toBeCloseTo(16 / 9);
    expect(getProductImageAspect(0, 0)).toBe(DEFAULT_PRODUCT_IMAGE_ASPECT);
  });
});
