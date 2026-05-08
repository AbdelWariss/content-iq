import type { Request, Response } from "express";
import type Stripe from "stripe";
import { env } from "../config/env.js";
import { getStripe } from "../config/stripe.js";
import { AppError } from "../middleware/errorHandler.js";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";
import { getAuthUser } from "../utils/requestHelpers.js";

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  pro: env.STRIPE_PRO_PRICE_ID,
  business: env.STRIPE_BUSINESS_PRICE_ID,
};

export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const { plan } = req.body as { plan: string };

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    res.status(400).json({ success: false, error: { message: "Plan invalide" } });
    return;
  }

  const stripe = getStripe();
  if (!stripe) throw new AppError("Stripe non configuré", 503);

  const user = await User.findById(userId);
  if (!user) throw new AppError("Utilisateur introuvable", 404);

  let customerId = user.subscription.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId },
    });
    customerId = customer.id;
    user.subscription.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/dashboard?upgrade=success`,
    cancel_url: `${env.CLIENT_URL}/pricing?upgrade=cancelled`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
  });

  res.json({ success: true, data: { url: session.url } });
}

export async function createPortalSession(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const stripe = getStripe();
  if (!stripe) throw new AppError("Stripe non configuré", 503);

  const user = await User.findById(userId);
  if (!user?.subscription.stripeCustomerId) {
    throw new AppError("Aucun abonnement actif", 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: `${env.CLIENT_URL}/profile`,
  });

  res.json({ success: true, data: { url: session.url } });
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ received: false });
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  if (!env.STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ received: false });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error("Webhook signature invalide", err);
    res.status(400).json({ error: "Webhook signature invalide" });
    return;
  }

  const CREDIT_MAP: Record<string, number> = { pro: 500, business: 2000 };
  const ROLE_MAP: Record<string, string> = { pro: "pro", business: "business" };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan } = session.metadata ?? {};
        if (!userId || !plan) break;

        await User.findByIdAndUpdate(userId, {
          role: ROLE_MAP[plan] ?? "free",
          "subscription.status": "active",
          "subscription.stripeCustomerId": session.customer as string,
          "credits.total": CREDIT_MAP[plan] ?? 50,
          "credits.remaining": CREDIT_MAP[plan] ?? 50,
        });
        logger.info(`Upgrade plan ${plan} pour userId ${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await User.findByIdAndUpdate(userId, {
          "subscription.status": sub.status,
          "subscription.currentPeriodEnd": new Date(
            (sub as unknown as { current_period_end: number }).current_period_end * 1000,
          ),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await User.findByIdAndUpdate(userId, {
          role: "free",
          "subscription.status": "canceled",
          "credits.total": 50,
          "credits.remaining": 50,
        });
        logger.info(`Abonnement annulé pour userId ${userId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await User.findOneAndUpdate(
          { "subscription.stripeCustomerId": customerId },
          { "subscription.status": "past_due" },
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    logger.error("Erreur traitement webhook", err);
  }

  res.json({ received: true });
}
