import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import {
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  hashToken,
  verifyRefreshToken,
} from "../utils/token.js";

describe("generateAccessToken", () => {
  it("retourne un JWT valide contenant userId, role et email", () => {
    const payload = { userId: "abc123", role: "free" as const, email: "test@example.com" };
    const token = generateAccessToken(payload);
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.userId).toBe("abc123");
    expect(decoded.role).toBe("free");
    expect(decoded.email).toBe("test@example.com");
  });

  it("expire en 15 minutes", () => {
    const token = generateAccessToken({ userId: "x", role: "free", email: "x@x.com" });
    const decoded = jwt.decode(token) as { exp: number; iat: number };
    expect(decoded.exp - decoded.iat).toBeLessThanOrEqual(15 * 60 + 1);
  });
});

describe("generateRefreshToken", () => {
  it("retourne un JWT différent du access token", () => {
    const payload = { userId: "abc123", role: "pro" as const, email: "a@b.com" };
    const access = generateAccessToken(payload);
    const refresh = generateRefreshToken(payload);
    expect(access).not.toBe(refresh);
  });
});

describe("verifyRefreshToken", () => {
  it("vérifie un refresh token valide", () => {
    const payload = { userId: "xyz", role: "admin" as const, email: "a@a.com" };
    const token = generateRefreshToken(payload);
    const result = verifyRefreshToken(token);
    expect(result.userId).toBe("xyz");
    expect(result.role).toBe("admin");
  });

  it("lève une erreur sur un token invalide", () => {
    expect(() => verifyRefreshToken("invalid.token.here")).toThrow();
  });

  it("lève une erreur sur un token expiré", () => {
    const expired = jwt.sign(
      { userId: "x", role: "free", email: "x@x.com" },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "0s" },
    );
    expect(() => verifyRefreshToken(expired)).toThrow();
  });
});

describe("generateSecureToken", () => {
  it("retourne une chaîne hexadécimale de 64 caractères", () => {
    const token = generateSecureToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("génère des tokens uniques à chaque appel", () => {
    expect(generateSecureToken()).not.toBe(generateSecureToken());
  });
});

describe("hashToken", () => {
  it("retourne toujours le même hash pour le même input", () => {
    const token = "mon-token-secret";
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("retourne une chaîne hexadécimale SHA-256 (64 chars)", () => {
    expect(hashToken("abc")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("deux inputs différents → deux hashes différents", () => {
    expect(hashToken("token-a")).not.toBe(hashToken("token-b"));
  });
});
