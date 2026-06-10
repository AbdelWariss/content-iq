import { beforeEach, describe, expect, it, vi } from "vitest";

// reconcileUserBilling utilise CreditTransaction.create ; on le mocke.
vi.mock("../models/CreditTransaction.model.js", () => ({
  CreditTransaction: { create: vi.fn().mockResolvedValue({}) },
}));
vi.mock("../models/User.model.js", () => ({ User: {} }));
vi.mock("../services/email.service.js", () => ({ sendLowCreditsAlert: vi.fn() }));

import { CreditTransaction } from "../models/CreditTransaction.model.js";
import { reconcileUserBilling } from "../services/credits.service.js";

type FakeUser = {
  _id: string;
  role: string;
  subscription: { status: string; gracePeriodEnd?: Date };
  credits: { remaining: number; total: number; resetDate: Date };
  save: ReturnType<typeof vi.fn>;
};

function makeUser(over: Partial<FakeUser> = {}): FakeUser {
  const future = new Date(Date.now() + 10 * 24 * 3600 * 1000);
  return {
    _id: "u1",
    role: "pro",
    subscription: { status: "active" },
    credits: { remaining: 100, total: 500, resetDate: future },
    save: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
}

beforeEach(() => vi.clearAllMocks());

describe("reconcileUserBilling — reset mensuel", () => {
  it("réinitialise les crédits au quota du plan quand l'échéance est dépassée", async () => {
    const past = new Date(Date.now() - 24 * 3600 * 1000);
    const user = makeUser({ credits: { remaining: 3, total: 500, resetDate: past } });

    await reconcileUserBilling(user as never);

    expect(user.credits.remaining).toBe(500); // quota Pro
    expect(user.credits.total).toBe(500);
    expect(user.credits.resetDate.getTime()).toBeGreaterThan(Date.now());
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(CreditTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "monthly_reset", amount: 500 }),
    );
  });

  it("ne touche à rien si l'échéance n'est pas atteinte", async () => {
    const user = makeUser();
    await reconcileUserBilling(user as never);
    expect(user.save).not.toHaveBeenCalled();
    expect(CreditTransaction.create).not.toHaveBeenCalled();
  });
});

describe("reconcileUserBilling — grace period", () => {
  it("downgrade vers Free quand la grace period past_due est dépassée", async () => {
    const past = new Date(Date.now() - 24 * 3600 * 1000);
    const future = new Date(Date.now() + 10 * 24 * 3600 * 1000);
    const user = makeUser({
      role: "pro",
      subscription: { status: "past_due", gracePeriodEnd: past },
      credits: { remaining: 100, total: 500, resetDate: future },
    });

    await reconcileUserBilling(user as never);

    expect(user.role).toBe("free");
    expect(user.subscription.status).toBe("canceled");
    expect(user.subscription.gracePeriodEnd).toBeUndefined();
    expect(user.credits.total).toBe(10); // quota Free
    expect(user.credits.remaining).toBe(10); // borné au quota Free
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it("ne downgrade pas si la grace period n'est pas dépassée", async () => {
    const future = new Date(Date.now() + 2 * 24 * 3600 * 1000);
    const user = makeUser({
      role: "pro",
      subscription: { status: "past_due", gracePeriodEnd: future },
    });
    await reconcileUserBilling(user as never);
    expect(user.role).toBe("pro");
    expect(user.save).not.toHaveBeenCalled();
  });
});
