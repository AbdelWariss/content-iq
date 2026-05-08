import { PaginationSchema } from "@contentiq/shared";
import type { Request, Response } from "express";
import { CreditTransaction } from "../models/CreditTransaction.model.js";
import { User } from "../models/User.model.js";
import { getAuthUser } from "../utils/requestHelpers.js";

export async function getCredits(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const user = await User.findById(userId).select("credits subscription role");
  if (!user) {
    res.status(404).json({ success: false, error: { message: "Utilisateur introuvable" } });
    return;
  }
  res.json({
    success: true,
    data: { credits: user.credits, subscription: user.subscription, role: user.role },
  });
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const { page, limit } = PaginationSchema.parse(req.query);

  const [transactions, total] = await Promise.all([
    CreditTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v"),
    CreditTransaction.countDocuments({ userId }),
  ]);

  res.json({
    success: true,
    data: { transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
}
