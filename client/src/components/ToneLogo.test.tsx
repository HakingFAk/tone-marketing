/** @vitest-environment jsdom */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ToneLogo } from "./ToneLogo";

describe("ToneLogo", () => {
  afterEach(cleanup);

  it("renders a visible static brand signature without an opening control", () => {
    render(<ToneLogo language="pt" />);
    const link = screen.getByRole("link", { name: "Início da Tone Market" });
    expect(link.className).toContain("tone-brand-lockup");
    expect(link.textContent).toContain("TONE");
    expect(link.textContent).toContain("MARKET");
    expect(screen.queryByRole("button", { name: /logo/i })).toBeNull();
  });

  it("uses a translated home label for international visitors", () => {
    render(<ToneLogo language="en" />);
    expect(screen.getByRole("link", { name: "Tone Market home" })).toBeTruthy();
  });
});
