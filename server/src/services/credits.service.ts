import type { CreditTransactionType } from "@contentiq/shared";
import type mongoose from "mongoose";
import { CreditTransaction } from "../models/CreditTransaction.model.js";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";
import { sendLowCreditsAlert } from "./email.service.js";

const LOW_CREDITS_THRESHOLD = 0.2; // 20%

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  contentId?: mongoose.Types.ObjectId,
): Promise<number> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { "credits.remaining": -amount } },
    { new: true },
  ).select("credits email name role");

  if (!user) throw new Error("Utilisateur non trouvé");

  await CreditTransaction.create({
    userId,
    amount: -amount,
    type: "consume" as CreditTransactionType,
    contentId,
    description,
    balanceAfter: user.credits.remaining,
  });

  const threshold = user.credits.total * LOW_CREDITS_THRESHOLD;
  if (user.credits.remaining <= threshold && user.credits.remaining > 0) {
    sendLowCreditsAlert(user.email, user.name, user.credits.remaining).catch((err) =>
      logger.error("Erreur alerte crédits :", err),
    );
  }

  return user.credits.remaining;
}

export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  description: string,
  stripePaymentId?: string,
): Promise<number> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { "credits.remaining": amount } },
    { new: true },
  ).select("credits");

  if (!user) throw new Error("Utilisateur non trouvé");

  await CreditTransaction.create({
    userId,
    amount,
    type,
    stripePaymentId,
    description,
    balanceAfter: user.credits.remaining,
  });

  return user.credits.remaining;
}
