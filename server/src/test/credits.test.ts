import { describe, expect, it } from "vitest";
import {
  advanceResetDate,
  creditsForTokens,
  isGracePeriodExpired,
  isMonthlyResetDue,
} from "../services/credits.service.js";

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

describe("isMonthlyResetDue", () => {
  const now = new Date("2026-06-15T00:00:00Z");

  it("retourne true si la date de reset est atteinte ou dépassée", () => {
    expect(isMonthlyResetDue(now, new Date("2026-06-14T23:59:00Z"))).toBe(true);
    expect(isMonthlyResetDue(now, new Date("2026-06-15T00:00:00Z"))).toBe(true);
  });

  it("retourne false si la date de reset est dans le futur", () => {
    expect(isMonthlyResetDue(now, new Date("2026-07-01T00:00:00Z"))).toBe(false);
  });

  it("retourne false si aucune date de reset", () => {
    expect(isMonthlyResetDue(now, null)).toBe(false);
    expect(isMonthlyResetDue(now, undefined)).toBe(false);
  });
});

describe("advanceResetDate", () => {
  it("avance d'un mois quand l'échéance vient de passer", () => {
    const now = new Date("2026-06-15T00:00:00Z");
    const next = advanceResetDate(now, new Date("2026-06-01T00:00:00Z"));
    expect(next.getTime()).toBeGreaterThan(now.getTime());
    expect(next.getUTCMonth()).toBe(6); // juillet (0-indexé)
  });

  it("saute plusieurs mois après une longue absence", () => {
    const now = new Date("2026-09-20T00:00:00Z");
    const next = advanceResetDate(now, new Date("2026-06-01T00:00:00Z"));
    expect(next.getTime()).toBeGreaterThan(now.getTime());
    expect(next.getUTCMonth()).toBe(9); // octobre
  });
});

describe("isGracePeriodExpired", () => {
  const now = new Date("2026-06-15T00:00:00Z");

  it("true seulement si past_due ET grace period dépassée", () => {
    expect(isGracePeriodExpired(now, "past_due", new Date("2026-06-14T00:00:00Z"))).toBe(true);
  });

  it("false si la grace period n'est pas encore dépassée", () => {
    expect(isGracePeriodExpired(now, "past_due", new Date("2026-06-16T00:00:00Z"))).toBe(false);
  });

  it("false si le statut n'est pas past_due", () => {
    expect(isGracePeriodExpired(now, "active", new Date("2026-06-01T00:00:00Z"))).toBe(false);
  });

  it("false si aucune grace period définie", () => {
    expect(isGracePeriodExpired(now, "past_due", null)).toBe(false);
  });
});
