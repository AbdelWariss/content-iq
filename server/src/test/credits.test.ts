import { describe, expect, it } from "vitest";
import { creditsForTokens } from "../services/credits.service.js";

describe("creditsForTokens", () => {
  it("facture au minimum 1 crédit", () => {
    expect(creditsForTokens(0)).toBe(1);
    expect(creditsForTokens(1)).toBe(1);
    expect(creditsForTokens(500)).toBe(1);
  });

  it("arrondit au crédit supérieur (1 crédit ≈ 500 tokens)", () => {
    expect(creditsForTokens(501)).toBe(2);
    expect(creditsForTokens(999)).toBe(2);
    expect(creditsForTokens(1000)).toBe(2);
    expect(creditsForTokens(1001)).toBe(3);
    expect(creditsForTokens(2200)).toBe(5);
  });

  it("gère les valeurs non valides en facturant 1 crédit", () => {
    expect(creditsForTokens(Number.NaN)).toBe(1);
    expect(creditsForTokens(-100)).toBe(1);
    expect(creditsForTokens(Number.POSITIVE_INFINITY)).toBe(1);
  });
});
