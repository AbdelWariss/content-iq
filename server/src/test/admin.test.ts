import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { generateAccessToken } from "../utils/token.js";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../middleware/rateLimiter.js", () => ({
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  apiLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  generateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  voiceLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../models/User.model.js", () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock("../models/Content.model.js", () => ({
  Content: {
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../models/CreditTransaction.model.js", () => ({
  CreditTransaction: {
    aggregate: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

// ── Setup ─────────────────────────────────────────────────────────────────────

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp();
});
beforeEach(() => vi.clearAllMocks());

// ── Helpers ───────────────────────────────────────────────────────────────────

function token(role: "free" | "admin") {
  return `Bearer ${generateAccessToken({ userId: "adminId123", role, email: "admin@test.com" })}`;
}

// ── GET /api/admin/stats ──────────────────────────────────────────────────────

describe("GET /api/admin/stats", () => {
  it("retourne 401 sans token", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("retourne 403 pour un non-admin", async () => {
    const res = await request(app).get("/api/admin/stats").set("Authorization", token("free"));
    expect(res.status).toBe(403);
  });

  it("retourne 200 avec les stats pour un admin", async () => {
    const { User } = await import("../models/User.model.js");
    const { Content } = await import("../models/Content.model.js");
    const { CreditTransaction } = await import("../models/CreditTransaction.model.js");

    vi.mocked(User.aggregate).mockResolvedValue([
      { _id: "free", count: 10 },
      { _id: "pro", count: 3 },
    ]);
    vi.mocked(Content.countDocuments).mockResolvedValue(42);
    vi.mocked(CreditTransaction.aggregate).mockResolvedValue([{ total: 500 }]);
    vi.mocked(User.countDocuments).mockResolvedValue(2);

    const res = await request(app).get("/api/admin/stats").set("Authorization", token("admin"));

    expect(res.status).toBe(200);
    expect(res.body.data.users.total).toBe(13);
    expect(res.body.data.contents).toBe(42);
    expect(res.body.data.creditsConsumed).toBe(500);
  });
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────

describe("GET /api/admin/users", () => {
  it("retourne 401 sans token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("retourne 403 pour un non-admin", async () => {
    const res = await request(app).get("/api/admin/users").set("Authorization", token("free"));
    expect(res.status).toBe(403);
  });

  it("retourne 200 avec la liste paginée pour un admin", async () => {
    const { User } = await import("../models/User.model.js");
    const fakeUsers = [
      { _id: "u1", name: "Alice", email: "alice@test.com", role: "free" },
      { _id: "u2", name: "Bob", email: "bob@test.com", role: "pro" },
    ];

    vi.mocked(User.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(fakeUsers),
    } as never);
    vi.mocked(User.countDocuments).mockResolvedValue(2);

    const res = await request(app)
      .get("/api/admin/users?page=1&limit=15")
      .set("Authorization", token("admin"));

    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
  });
});

// ── PUT /api/admin/users/:id/role ─────────────────────────────────────────────

describe("PUT /api/admin/users/:id/role", () => {
  it("retourne 400 si le rôle est invalide", async () => {
    const res = await request(app)
      .put("/api/admin/users/someUserId/role")
      .set("Authorization", token("admin"))
      .send({ role: "superuser" });
    expect(res.status).toBe(400);
  });

  it("retourne 400 si l'admin essaie de modifier son propre rôle", async () => {
    const res = await request(app)
      .put("/api/admin/users/adminId123/role")
      .set("Authorization", token("admin"))
      .send({ role: "free" });
    expect(res.status).toBe(400);
  });

  it("retourne 200 si le rôle est valide et l'utilisateur différent", async () => {
    const { User } = await import("../models/User.model.js");
    vi.mocked(User.findByIdAndUpdate).mockResolvedValue({} as never);

    const res = await request(app)
      .put("/api/admin/users/otherUserId456/role")
      .set("Authorization", token("admin"))
      .send({ role: "pro" });

    expect(res.status).toBe(200);
  });
});
