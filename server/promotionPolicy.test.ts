import { describe, expect, it } from "vitest";
import { isPromotionLive } from "./promotionPolicy.js";

describe("isPromotionLive", () => {
  const now = new Date("2026-08-13T16:00:00.000Z");

  it("only exposes active promotions whose deadline is still in the future", () => {
    expect(isPromotionLive(1, new Date("2026-08-14T16:00:00.000Z"), now)).toBe(true);
    expect(isPromotionLive(1, new Date("2026-08-12T16:00:00.000Z"), now)).toBe(false);
    expect(isPromotionLive(0, new Date("2026-08-14T16:00:00.000Z"), now)).toBe(false);
    expect(isPromotionLive(1, null, now)).toBe(false);
  });
});
