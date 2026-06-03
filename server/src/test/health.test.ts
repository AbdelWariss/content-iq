import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
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

beforeAll(() => {
  app = createApp();
});

describe("GET /health", () => {
  it("retourne 200 avec status, version, commit et env", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("version");
    expect(res.body).toHaveProperty("commit");
    expect(res.body.env).toBe("test");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("expose 'dev' comme commit quand RENDER_GIT_COMMIT est absent", async () => {
    const res = await request(app).get("/health");
    expect(res.body.commit).toBe("dev");
  });
});
