import mongoose, { type Document, Schema } from "mongoose";
import type { VoiceCommandSource } from "@contentiq/shared";

export interface IVoiceCommand extends Document {
  userId: mongoose.Types.ObjectId;
  transcript: string;
  matchedCommand?: string;
  confidence: number;
  source: VoiceCommandSource;
  success: boolean;
  executionTime: number;
  createdAt: Date;
}

const VoiceCommandSchema = new Schema<IVoiceCommand>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    transcript: { type: String, required: true },
    matchedCommand: { type: String },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    source: { type: String, enum: ["web_speech", "whisper"], required: true },
    success: { type: Boolean, required: true },
    executionTime: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

VoiceCommandSchema.index({ userId: 1, createdAt: -1 });

export const VoiceCommand = mongoose.model<IVoiceCommand>("VoiceCommand", VoiceCommandSchema);
