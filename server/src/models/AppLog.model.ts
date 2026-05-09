import mongoose, { type Document, Schema } from "mongoose";

export type LogLevel = "info" | "warn" | "error";
export type LogCategory = "auth" | "generation" | "credits" | "system" | "admin";

export interface IAppLog extends Document {
  level: LogLevel;
  category: LogCategory;
  action: string;
  message: string;
  details?: Record<string, unknown>;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  ip?: string;
  createdAt: Date;
}

const AppLogSchema = new Schema<IAppLog>(
  {
    level: { type: String, enum: ["info", "warn", "error"], required: true },
    category: {
      type: String,
      enum: ["auth", "generation", "credits", "system", "admin"],
      required: true,
    },
    action: { type: String, required: true },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AppLogSchema.index({ createdAt: -1 });
AppLogSchema.index({ level: 1, createdAt: -1 });
AppLogSchema.index({ category: 1, createdAt: -1 });
AppLogSchema.index({ userId: 1, createdAt: -1 });

// TTL: auto-delete logs older than 90 days
AppLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AppLog = mongoose.model<IAppLog>("AppLog", AppLogSchema);
