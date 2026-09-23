import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { VideoShowcase } from "./VideoShowcase";

const queryState = vi.hoisted(() => ({ loading: false }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    videos: {
      list: {
        useQuery: ({ kind }: { kind: "demo" | "client" }) => ({
          isLoading: queryState.loading,
          data: queryState.loading ? undefined : kind === "demo"
            ? [{ id: 1, title: "Fender demo", description: "Pickup and finish overview.", country: null, url: "/manus-storage/fender-demo.mp4" }]
            : [{ id: 2, title: "First session", description: "Shared with authorization.", country: "United States", url: "/manus-storage/customer-session.mp4" }],
        }),
      },
    },
  },
}));

describe("VideoShowcase", () => {
  it("separates instrument demos from authorized customer sessions with playable video controls", () => {
    const html = renderToStaticMarkup(<VideoShowcase language="en" />);
    expect(html).toContain("Instrument demos");
    expect(html).toContain("Tone worldwide sessions");
    expect(html).toContain("Fender demo");
    expect(html).toContain("First session");
    expect(html).toContain("United States");
    expect(html).toContain('controls=""');
  });

  it("renders a loading skeleton for each video category while content is loading", () => {
    queryState.loading = true;
    const html = renderToStaticMarkup(<VideoShowcase language="en" />);
    queryState.loading = false;
    expect((html.match(/animate-pulse/g) || []).length).toBe(2);
    expect(html).not.toContain("Fender demo");
  });
});
