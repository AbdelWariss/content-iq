import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticate } from "../middleware/authenticate.js";
import { authorize, requireAdmin } from "../middleware/authorize.js";
import { ForbiddenError, UnauthorizedError } from "../middleware/errorHandler.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Request> = {}): Request {
  return { headers: {}, ...overrides } as Request;
}

function makeRes(): Response {
  return {} as Response;
}

const next = vi.fn() as unknown as NextFunction;

// ── authenticate ──────────────────────────────────────────────────────────────

describe("authenticate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lève UnauthorizedError si aucun header Authorization", () => {
    const req = makeReq({ headers: {} });
    expect(() => authenticate(req, makeRes(), next)).toThrow(UnauthorizedError);
  });

  it("lève UnauthorizedError si header ne commence pas par 'Bearer '", () => {
    const req = makeReq({ headers: { authorization: "Basic token123" } });
    expect(() => authenticate(req, makeRes(), next)).toThrow(UnauthorizedError);
  });

  it("lève UnauthorizedError si le token est invalide", () => {
    const req = makeReq({ headers: { authorization: "Bearer invalid.token.here" } });
    expect(() => authenticate(req, makeRes(), next)).toThrow(UnauthorizedError);
  });

  it("appelle next() et attache le payload si le token est valide", () => {
    const payload = { userId: "u1", role: "free", email: "u@test.com" };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: "15m" });
    const req = makeReq({ headers: { authorization: `Bearer ${token}` } });

    authenticate(req, makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as Request & { user: typeof payload }).user.userId).toBe("u1");
  });
});

// ── authorize ─────────────────────────────────────────────────────────────────

describe("authorize", () => {
  beforeEach(() => vi.clearAllMocks());

  function authedReq(role: string): Request {
    return { user: { userId: "u1", role, email: "u@test.com" } } as unknown as Request;
  }

  it("autorise un admin à accéder à une route pro", () => {
    const mw = authorize("pro");
    mw(authedReq("admin"), makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("autorise un pro à accéder à une route pro", () => {
    const mw = authorize("pro");
    mw(authedReq("pro"), makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("lève ForbiddenError pour un free sur une route pro", () => {
    const mw = authorize("pro");
    expect(() => mw(authedReq("free"), makeRes(), next)).toThrow(ForbiddenError);
  });

  it("autorise un free sur une route free", () => {
    const mw = authorize("free");
    mw(authedReq("free"), makeRes(), next);
    expect(next).toHaveBeenCalled();
  });
});

// ── requireAdmin ──────────────────────────────────────────────────────────────

describe("requireAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  function authedReq(role: string): Request {
    return { user: { userId: "u1", role, email: "u@test.com" } } as unknown as Request;
  }

  it("autorise un admin", () => {
    requireAdmin(authedReq("admin"), makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("lève ForbiddenError pour un non-admin", () => {
    for (const role of ["free", "pro", "business"]) {
      vi.clearAllMocks();
      expect(() => requireAdmin(authedReq(role), makeRes(), next)).toThrow(ForbiddenError);
    }
  });
});
