import { describe, expect, it } from "vitest";
import { toneContextForCategory } from "./AmbientAudio";

describe("toneContextForCategory", () => {
  it("maps instrument categories to their contextual ambience", () => {
    expect(toneContextForCategory("Guitarras")).toBe("guitar");
    expect(toneContextForCategory("Violões")).toBe("acoustic");
    expect(toneContextForCategory("Pedais")).toBe("effects");
    expect(toneContextForCategory("Amplificadores")).toBe("effects");
    expect(toneContextForCategory("Acessórios")).toBe("neutral");
  });
});
