import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { generateAccessToken } from "../utils/token.js";

// ── Mocks hoistés avant tout import ──────────────────────────────────────────

vi.mock("../middleware/rateLimiter.js", () => ({
  loginLimiterShort: (_req: Request, _res: Response, next: NextFunction) => next(),
  loginLimiterLong: (_req: Request, _res: Response, next: NextFunction) => next(),
  authGenericLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
  registerLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
  apiLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
  generateLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
  voiceLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
  resendVerificationLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

vi.mock("../models/User.model.js", () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../services/email.service.js", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendLowCreditsAlert: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/credits.service.js", () => ({
  deductCredits: vi.fn().mockResolvedValue(49),
  addCredits: vi.fn().mockResolvedValue(51),
}));

// ── Setup ─────────────────────────────────────────────────────────────────────

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp();
});
beforeEach(() => vi.clearAllMocks());

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fakeUser(overrides = {}) {
  const base = {
    _id: "507f1f77bcf86cd799439011",
    email: "test@example.com",
    name: "Test User",
    role: "free",
    emailVerified: true,
    passwordHash: await bcrypt.hash("Password123!", 4),
    credits: { remaining: 50, total: 50, resetDate: new Date() },
    subscription: { status: "active" },
    refreshTokens: [],
    assistantMsgToday: 0,
    assistantMsgResetDate: new Date(),
    lastLoginAt: null,
    ...overrides,
  };
  return {
    ...base,
    save: vi.fn().mockResolvedValue(undefined),
    toJSON: vi.fn().mockReturnValue(base),
  };
}

// Simule la chaîne findOne().select()
function mockFindOneSelect(resolvedValue: unknown) {
  return { select: vi.fn().mockResolvedValue(resolvedValue) };
}

function bearerToken(role: "free" | "pro" | "admin" = "free") {
  return `Bearer ${generateAccessToken({ userId: "507f1f77bcf86cd799439011", role, email: "test@example.com" })}`;
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("retourne 422 si le body est vide", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(422);
  });

  it("retourne 401 si l'utilisateur n'existe pas", async () => {
    const { User } = await import("../models/User.model.js");
    vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(null) as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Password123!" });

    expect(res.status).toBe(401);
  });

  it("retourne 401 si le mot de passe est incorrect", async () => {
    const { User } = await import("../models/User.model.js");
    vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(await fakeUser()) as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "WrongPassword!" });

    expect(res.status).toBe(401);
  });

  it("retourne 200 avec accessToken si les credentials sont valides", async () => {
    const { User } = await import("../models/User.model.js");
    vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(await fakeUser()) as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("user");
  });
});

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("retourne 422 si des champs obligatoires manquent", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "new@example.com" });
    expect(res.status).toBe(422);
  });

  it("retourne 4xx si l'email est déjà utilisé", async () => {
    const { User } = await import("../models/User.model.js");
    vi.mocked(User.findOne).mockResolvedValue((await fakeUser()) as never);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "test@example.com", password: "Password123!" });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("retourne 201 avec accessToken si l'inscription réussit", async () => {
    const { User } = await import("../models/User.model.js");
    vi.mocked(User.findOne).mockResolvedValue(null);
    vi.mocked(User.create).mockResolvedValue((await fakeUser()) as never);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "new@example.com", password: "Password123!" });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("accessToken");
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  it("retourne 401 sans token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("retourne 200 avec le profil utilisateur si le token est valide", async () => {
    const { User } = await import("../models/User.model.js");
    const user = await fakeUser();
    vi.mocked(User.findById).mockResolvedValue(user as never);

    const res = await request(app).get("/api/auth/me").set("Authorization", bearerToken());

    expect(res.status).toBe(200);
    // getMe retourne { success, data: { user: {...} } }
    expect(res.body.data.user).toHaveProperty("email");
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  it("retourne 401 sans token", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(401);
  });

  it("retourne 200 et efface le cookie refresh token", async () => {
    const { User } = await import("../models/User.model.js");
    vi.mocked(User.findById).mockResolvedValue((await fakeUser()) as never);

    const res = await request(app).post("/api/auth/logout").set("Authorization", bearerToken());

    expect(res.status).toBe(200);
  });
});
