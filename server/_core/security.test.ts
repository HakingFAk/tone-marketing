import { describe, expect, it } from "vitest";
import { getTrustedOrigins } from "./security.js";

describe("trusted origins", () => {
  it("uses only the configured origin in production", () => {
    const previousMode = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const origins = getTrustedOrigins("https://tone.example.com");

    expect(origins).toEqual(new Set(["https://tone.example.com"]));
    process.env.NODE_ENV = previousMode;
  });

  it("includes local development origins outside production", () => {
    const previousMode = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const origins = getTrustedOrigins("http://localhost:3000");

    expect(origins.has("http://localhost:3000")).toBe(true);
    expect(origins.has("http://127.0.0.1:3000")).toBe(true);
    process.env.NODE_ENV = previousMode;
  });
});
