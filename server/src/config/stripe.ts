import Stripe from "stripe";
import { env } from "./env.js";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, { typescript: true });
  }
  return stripeClient;
}
