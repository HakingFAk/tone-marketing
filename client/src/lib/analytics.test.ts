import { describe, expect, it } from "vitest";
import { getToneAnalyticsIdentity, trackToneEvent } from "./analytics";

describe("analytics helpers", () => {
  it("is safe when rendered before browser APIs are available", () => {
    expect(getToneAnalyticsIdentity()).toEqual({ visitorId: "server-render", sessionId: "server-render" });
  });

  it("does not attempt to emit visitor data during server rendering", () => {
    expect(() => trackToneEvent({ eventType: "cart_add", productId: 42, source: "product_detail" })).not.toThrow();
  });
});
