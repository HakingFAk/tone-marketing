/** @vitest-environment jsdom */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeroSound } from "./HeroSound";
import { AmbientAudioProvider } from "./AmbientAudio";

describe("HeroSound", () => {
  afterEach(cleanup);

  it("does not autoplay and starts only after the visitor uses the ambience control", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    render(<AmbientAudioProvider><HeroSound language="pt" /></AmbientAudioProvider>);
    const audio = document.querySelector("audio") as HTMLAudioElement;
    expect(audio.autoplay).toBe(false);
    const start = screen.getByRole("button", { name: "Ouvir Guitarra" });
    fireEvent.click(start);
    expect(play).toHaveBeenCalledTimes(1);
    await screen.findByRole("button", { name: "Pausar ambientação" });
    const mute = screen.getByRole("button", { name: "Silenciar som" });
    fireEvent.click(mute);
    expect(audio.muted).toBe(true);
    expect(mute.getAttribute("aria-pressed")).toBe("true");
    expect(mute.getAttribute("aria-label")).toBe("Ativar som");
    fireEvent.click(mute);
    expect(audio.muted).toBe(false);
    expect(mute.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Pausar ambientação" }));
    expect(pause).toHaveBeenCalledTimes(1);
    play.mockRestore();
    pause.mockRestore();
  });

  it("renders English labels for international visitors", () => {
    render(<AmbientAudioProvider><HeroSound language="en" /></AmbientAudioProvider>);
    expect(screen.getByRole("button", { name: "Play Guitar ambience" })).toBeTruthy();
  });
});
