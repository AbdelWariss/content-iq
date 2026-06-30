import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../config/env.js", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    STRIPE_PRO_PRICE_ID: "price_pro",
    STRIPE_BUSINESS_PRICE_ID: "price_biz",
    CLIENT_URL: "http://localhost:5173",
    NODE_ENV: "test",
  },
}));

// constructEvent renvoie simplement le body JSON parsé (signature bypassée en test)
vi.mock("../config/stripe.js", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: (body: Buffer) => JSON.parse(body.toString()),
    },
  }),
}));

vi.mock("../models/ProcessedWebhookEvent.model.js", () => ({
  ProcessedWebhookEvent: { create: vi.fn() },
}));

vi.mock("../models/User.model.js", () => ({
  User: { findByIdAndUpdate: vi.fn(), findOneAndUpdate: vi.fn() },
}));

import { handleWebhook } from "../controllers/stripe.controller.js";
import { ProcessedWebhookEvent } from "../models/ProcessedWebhookEvent.model.js";
import { User } from "../models/User.model.js";

function makeReqRes(event: unknown) {
  const req = {
    headers: { "stripe-signature": "sig_test" },
    body: Buffer.from(JSON.stringify(event)),
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ProcessedWebhookEvent.create).mockResolvedValue({} as never);
});

describe("handleWebhook — idempotence", () => {
  it("acquitte sans retraiter si l'événement est un doublon (erreur 11000)", async () => {
    vi.mocked(ProcessedWebhookEvent.create).mockRejectedValueOnce({ code: 11000 });
    const { req, res } = makeReqRes({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: { metadata: { userId: "u1", plan: "pro" }, customer: "cus_1" } },
    });

    await handleWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ received: true, duplicate: true });
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled(); // pas de double upgrade
  });
});

describe("handleWebhook — checkout.session.completed", () => {
  it("upgrade le plan, fixe les crédits et lève la grace period", async () => {
    const { req, res } = makeReqRes({
      id: "evt_2",
      type: "checkout.session.completed",
      data: { object: { metadata: { userId: "u1", plan: "pro" }, customer: "cus_1" } },
    });

    await handleWebhook(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        role: "pro",
        "subscription.status": "active",
        "subscription.gracePeriodEnd": null,
        "credits.total": 500,
        "credits.remaining": 500,
      }),
    );
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});

describe("handleWebhook — invoice.payment_failed", () => {
  it("passe en past_due et pose une grace period de 3 jours", async () => {
    const { req, res } = makeReqRes({
      id: "evt_3",
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_1" } },
    });

    await handleWebhook(req, res);

    expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
    const [filter, update] = vi.mocked(User.findOneAndUpdate).mock.calls[0];
    expect(filter).toEqual({ "subscription.stripeCustomerId": "cus_1" });
    expect((update as Record<string, unknown>)["subscription.status"]).toBe("past_due");
    const grace = (update as Record<string, Date>)["subscription.gracePeriodEnd"];
    const deltaMs = grace.getTime() - Date.now();
    // ~3 jours (tolérance large)
    expect(deltaMs).toBeGreaterThan(2.8 * 24 * 3600 * 1000);
    expect(deltaMs).toBeLessThan(3.2 * 24 * 3600 * 1000);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});

describe("handleWebhook — événement inconnu", () => {
  it("acquitte proprement un type non géré", async () => {
    const { req, res } = makeReqRes({
      id: "evt_4",
      type: "customer.created",
      data: { object: {} },
    });

    await handleWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ received: true });
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
