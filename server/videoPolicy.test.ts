import { describe, expect, it } from "vitest";
import { shouldPublishVideo } from "./videoPolicy";

describe("video publication policy", () => {
  it("allows published instrument demonstrations", () => {
    expect(shouldPublishVideo("demo", false, true)).toBe(true);
  });

  it("never publishes a client session without express consent", () => {
    expect(shouldPublishVideo("client", false, true)).toBe(false);
  });

  it("allows an authorized client session when publishing is requested", () => {
    expect(shouldPublishVideo("client", true, true)).toBe(true);
  });
});
