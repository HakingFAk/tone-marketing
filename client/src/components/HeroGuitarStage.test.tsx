/** @vitest-environment jsdom */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeroGuitarStage } from "./HeroGuitarStage";

describe("HeroGuitarStage", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });
  it("renders a muted looping performance video without autoplay", () => {
    const html = renderToStaticMarkup(<HeroGuitarStage playing={false} muted={false} language="pt" onActivate={() => undefined} />);
    expect(html).toContain("Acordar a guitarra");
    expect(html).toContain("Sinal Tone");
    expect(html).not.toContain("Atmosfera do palco");
  });

  it("renders the active English performance state", () => {
    const html = renderToStaticMarkup(<HeroGuitarStage playing muted={false} language="en" onActivate={() => undefined} />);
    expect(html).toContain("Tone resonance");
    expect(html).not.toContain("A single guitar, awake in the signal.");
  });

  it("starts the session from the conceptual guitar stage", () => {
    const activate = vi.fn();
    render(<HeroGuitarStage playing={false} muted={false} language="pt" onActivate={activate} />);
    fireEvent.click(screen.getByRole("button", { name: "Acordar a guitarra" }));
    expect(activate).toHaveBeenCalledTimes(1);
  });
});
