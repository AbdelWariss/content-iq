import { PLAN_LIMITS, type UserRole } from "@contentiq/shared";
import type { CreditTransactionType } from "@contentiq/shared";
import type { FilterQuery, HydratedDocument } from "mongoose";
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

// ── Réconciliation de facturation (reset mensuel + grace period) ──────────────

/** Le quota mensuel est-il échu ? (resetDate atteinte ou dépassée) */
export function isMonthlyResetDue(now: Date, resetDate?: Date | null): boolean {
  return !!resetDate && now.getTime() >= new Date(resetDate).getTime();
}

/** Avance la date de reset mois par mois jusqu'à dépasser `now` (gère les absences longues). */
export function advanceResetDate(now: Date, resetDate: Date): Date {
  const next = new Date(resetDate);
  while (next.getTime() <= now.getTime()) next.setMonth(next.getMonth() + 1);
  return next;
}

/** La période de grâce (3j après échec de paiement) est-elle dépassée ? */
export function isGracePeriodExpired(
  now: Date,
  status?: string,
  gracePeriodEnd?: Date | null,
): boolean {
  return (
    status === "past_due" && !!gracePeriodEnd && now.getTime() > new Date(gracePeriodEnd).getTime()
  );
}

/**
 * Réconcilie l'état de facturation d'un utilisateur à la lecture (lazy reconciliation) :
 *   1. downgrade vers Free si la grace period (3j) après échec de paiement est dépassée
 *   2. reset mensuel des crédits si l'échéance `resetDate` est atteinte
 *
 * Approche on-read plutôt qu'un worker BullMQ : robuste sur un déploiement
 * web mono-service (Render), sans process worker séparé. Sauvegarde le document
 * uniquement si un changement a eu lieu.
 */
export async function reconcileUserBilling(user: HydratedDocument<IUser>): Promise<void> {
  const now = new Date();
  let changed = false;

  // 1. Grace period dépassée → downgrade Free
  if (isGracePeriodExpired(now, user.subscription?.status, user.subscription?.gracePeriodEnd)) {
    user.role = "free";
    user.subscription.status = "canceled";
    user.subscription.gracePeriodEnd = undefined;
    const freeQuota = PLAN_LIMITS.free.credits;
    user.credits.total = freeQuota;
    user.credits.remaining = Math.min(user.credits.remaining, freeQuota);
    changed = true;
  }

  // 2. Reset mensuel des crédits si échéance atteinte (selon le plan courant)
  if (isMonthlyResetDue(now, user.credits?.resetDate)) {
    const quota = PLAN_LIMITS[user.role as UserRole]?.credits ?? user.credits.total;
    user.credits.remaining = quota;
    user.credits.total = quota;
    user.credits.resetDate = advanceResetDate(now, new Date(user.credits.resetDate));
    changed = true;
    await CreditTransaction.create({
      userId: user._id,
      amount: quota,
      type: "monthly_reset" as CreditTransactionType,
      description: "Réinitialisation mensuelle des crédits",
      balanceAfter: quota,
    });
  }

  if (changed) await user.save();
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
