import mongoose, { type Document, Schema } from "mongoose";

/**
 * Trace des événements webhook Stripe déjà traités, pour garantir l'idempotence :
 * Stripe peut rejouer un même événement (retries) → on évite tout double traitement
 * (double crédit, double upgrade...). TTL 30 jours pour éviter une croissance infinie.
 */
export interface IProcessedWebhookEvent extends Document {
  eventId: string;
  type: string;
  createdAt: Date;
}

const ProcessedWebhookEventSchema = new Schema<IProcessedWebhookEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// TTL : suppression automatique après 30 jours
ProcessedWebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ProcessedWebhookEvent = mongoose.model<IProcessedWebhookEvent>(
  "ProcessedWebhookEvent",
  ProcessedWebhookEventSchema,
);
