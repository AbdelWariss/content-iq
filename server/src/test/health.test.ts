import mongoose from "mongoose";
import request from "supertest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";

// Rate limiter neutralisé (comme les autres tests d'intégration)
vi.mock("../middleware/rateLimiter.js", () => ({
  loginLimiterShort: (_req: unknown, _res: unknown, next: () => void) => next(),
  loginLimiterLong: (_req: unknown, _res: unknown, next: () => void) => next(),
  authGenericLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  registerLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  apiLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  generateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  voiceLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  resendVerificationLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

let app: ReturnType<typeof createApp>;

/** Simule l'état de connexion Mongo (readyState : 1 = connecté, 0 = déconnecté). */
function mockDbState(readyState: 0 | 1) {
  vi.spyOn(mongoose, "connection", "get").mockReturnValue({
    readyState,
  } as unknown as typeof mongoose.connection);
}

beforeAll(() => {
  app = createApp();
});

afterEach(() => vi.restoreAllMocks());

describe("GET /health", () => {
  it("retourne 200 / ok / db up quand MongoDB est connecté", async () => {
    mockDbState(1);
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.db).toBe("up");
    expect(res.body).toHaveProperty("version");
    expect(res.body).toHaveProperty("commit");
    expect(res.body.env).toBe("test");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("retourne 503 / degraded / db down quand MongoDB est déconnecté", async () => {
    mockDbState(0);
    const res = await request(app).get("/health");
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("degraded");
    expect(res.body.db).toBe("down");
  });

  it("expose 'dev' comme commit quand RENDER_GIT_COMMIT est absent", async () => {
    mockDbState(1);
    const res = await request(app).get("/health");
    expect(res.body.commit).toBe("dev");
  });
});
