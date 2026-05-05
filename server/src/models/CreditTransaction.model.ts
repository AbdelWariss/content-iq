import mongoose, { type Document, Schema } from "mongoose";
import type { CreditTransactionType } from "@contentiq/shared";

export interface ICreditTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: CreditTransactionType;
  contentId?: mongoose.Types.ObjectId;
  stripePaymentId?: string;
  description: string;
  balanceAfter: number;
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["consume", "topup", "monthly_reset", "bonus", "refund"],
      required: true,
    },
    contentId: { type: Schema.Types.ObjectId, ref: "Content" },
    stripePaymentId: { type: String },
    description: { type: String, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

CreditTransactionSchema.index({ userId: 1, createdAt: -1 });

export const CreditTransaction = mongoose.model<ICreditTransaction>(
  "CreditTransaction",
  CreditTransactionSchema,
);
