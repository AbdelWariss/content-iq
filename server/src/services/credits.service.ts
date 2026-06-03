import type { CreditTransactionType } from "@contentiq/shared";
import type { FilterQuery } from "mongoose";
import type mongoose from "mongoose";
import { CreditTransaction } from "../models/CreditTransaction.model.js";
import { type IUser, User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";
import { sendLowCreditsAlert } from "./email.service.js";

const LOW_CREDITS_THRESHOLD = 0.2; // 20%
const TOKENS_PER_CREDIT = 500;

/**
 * Convertit un nombre de tokens consommés en crédits facturés.
 * 1 crédit ≈ 500 tokens, avec un minimum de 1 crédit par génération.
 */
export function creditsForTokens(tokens: number): number {
  if (!Number.isFinite(tokens) || tokens <= 0) return 1;
  return Math.max(1, Math.ceil(tokens / TOKENS_PER_CREDIT));
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  contentId?: mongoose.Types.ObjectId,
): Promise<number> {
  // Décrément atomique et conditionnel : empêche le solde de passer sous zéro
  // même si deux générations concurrentes franchissent checkCredits en parallèle.
  const atomicFilter: FilterQuery<IUser> = {
    _id: userId,
    "credits.remaining": { $gte: amount },
  };
  let user = await User.findOneAndUpdate(
    atomicFilter,
    { $inc: { "credits.remaining": -amount } },
    { new: true },
  ).select("credits email name role");

  let deducted = amount;

  if (!user) {
    // Solde insuffisant au moment de la déduction (course concurrente) :
    // on déduit uniquement ce qui reste et on borne le solde à zéro.
    const current = await User.findById(userId).select("credits email name role");
    if (!current) throw new Error("Utilisateur non trouvé");

    deducted = Math.min(amount, Math.max(0, current.credits.remaining));
    current.credits.remaining -= deducted;
    await current.save();
    user = current;
  }

  await CreditTransaction.create({
    userId,
    amount: -deducted,
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
