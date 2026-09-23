/** @vitest-environment jsdom */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { nextMutedState, VideoPlayer } from "./VideoPlayer";

describe("VideoPlayer", () => {
  afterEach(cleanup);
  it("renders video controls with an accessible Portuguese volume button", () => {
    const html = renderToStaticMarkup(<VideoPlayer src="/demo.mp4" title="Demo" language="pt" />);
    expect(html).toContain('controls=""');
    expect(html).toContain('aria-label="Silenciar vídeo"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("uses English audio copy for international viewers", () => {
    const html = renderToStaticMarkup(<VideoPlayer src="/demo.mp4" title="Demo" language="en" />);
    expect(html).toContain('aria-label="Mute video sound"');
  });

  it("toggles the muted state used by the public volume button", () => {
    expect(nextMutedState(false)).toBe(true);
    expect(nextMutedState(true)).toBe(false);
  });

  it("silences and reactivates the video element when the public volume button is clicked", () => {
    render(<VideoPlayer src="/demo.mp4" title="Demo de guitarra" language="pt" />);
    const video = screen.getByLabelText("Demo de guitarra") as HTMLVideoElement;
    const button = screen.getByRole("button", { name: "Silenciar vídeo" });
    expect(video.muted).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(button);
    expect(video.muted).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Ativar som do vídeo");
    fireEvent.click(button);
    expect(video.muted).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });
});
