import { describe, expect, it } from "vitest";
import { extensionForContentType, parseProductImage } from "./uploadPolicy.js";

describe("upload policy", () => {
  it("accepts a valid PNG payload", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const image = `data:image/png;base64,${png.toString("base64")}`;
    expect(parseProductImage(image, "image/png")).toEqual(png);
  });

  it("rejects mismatched image content", () => {
    const payload = `data:image/png;base64,${Buffer.from("not an image").toString("base64")}`;
    expect(() => parseProductImage(payload, "image/png")).toThrow("conteúdo do arquivo");
  });

  it("uses an extension derived from the accepted MIME type", () => {
    expect(extensionForContentType("video/quicktime")).toBe("mov");
    expect(() => extensionForContentType("application/x-msdownload")).toThrow("Tipo de arquivo");
  });
});
