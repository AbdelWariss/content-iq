import mongoose, { type Document, Schema } from "mongoose";
import type {
  UserRole,
  SubscriptionStatus,
  ContentLanguage,
} from "@contentiq/shared";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  credits: {
    remaining: number;
    total: number;
    resetDate: Date;
  };
  subscription: {
    stripeCustomerId?: string;
    stripePriceId?: string;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date;
    gracePeriodEnd?: Date;
  };
  voicePreferences: {
    ttsVoice: string;
    speed: number;
    autoTts: boolean;
    language: string;
  };
  language: ContentLanguage;
  assistantMsgToday: number;
  assistantMsgResetDate: Date;
  refreshTokens: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 300 },
    role: {
      type: String,
      enum: ["free", "pro", "business", "admin"],
      default: "free",
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },
    credits: {
      remaining: { type: Number, default: 50, min: 0 },
      total: { type: Number, default: 50 },
      resetDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    subscription: {
      stripeCustomerId: { type: String },
      stripePriceId: { type: String },
      status: {
        type: String,
        enum: ["active", "past_due", "canceled", "trialing"],
        default: "active",
      },
      currentPeriodEnd: { type: Date },
      gracePeriodEnd: { type: Date },
    },
    voicePreferences: {
      ttsVoice: { type: String, default: "21m00Tcm4TlvDq8ikWAM" },
      speed: { type: Number, default: 1, enum: [0.75, 1, 1.25, 1.5] },
      autoTts: { type: Boolean, default: false },
      language: { type: String, default: "fr-FR" },
    },
    language: { type: String, enum: ["fr", "en"], default: "fr" },
    assistantMsgToday: { type: Number, default: 0 },
    assistantMsgResetDate: { type: Date, default: () => new Date() },
    refreshTokens: [{ type: String }],
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.passwordHash = undefined;
        ret.refreshTokens = undefined;
        ret.emailVerificationToken = undefined;
        ret.passwordResetToken = undefined;
        return ret;
      },
    },
  },
);

// Index déjà déclarés via `index: true` dans le schéma — pas de doublon

export const User = mongoose.model<IUser>("User", UserSchema);
