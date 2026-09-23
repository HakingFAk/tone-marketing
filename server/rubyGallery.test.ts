import { describe, expect, it } from "vitest";
import { RUBY_GALLERY_IMAGE_ASSETS, getRubyGalleryAdditions } from "./rubyGallery.js";

describe("ruby test guitar gallery", () => {
  it("provides four distinct supplemental images for the test product", () => {
    expect(RUBY_GALLERY_IMAGE_ASSETS).toHaveLength(4);
    expect(new Set(RUBY_GALLERY_IMAGE_ASSETS.map(image => image.storageKey)).size).toBe(4);
  });

  it("never adds images beyond the configured gallery limit", () => {
    expect(getRubyGalleryAdditions(["original"], 8)).toHaveLength(4);
    expect(getRubyGalleryAdditions(["original", "a", "b", "c", "d", "e", "f", "g"], 8)).toHaveLength(0);
  });

  it("skips images already present in the product gallery", () => {
    const existing = [RUBY_GALLERY_IMAGE_ASSETS[0].storageKey];
    expect(getRubyGalleryAdditions(existing).map(image => image.storageKey)).not.toContain(existing[0]);
  });
});
