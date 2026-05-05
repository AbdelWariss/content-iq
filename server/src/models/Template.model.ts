import mongoose, { type Document, Schema } from "mongoose";
import type { ContentType } from "@contentiq/shared";

interface TemplateVariable {
  key: string;
  label: string;
  required: boolean;
}

export interface ITemplate extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: ContentType;
  category: "marketing" | "social" | "business" | "creative";
  promptSchema: string;
  variables: TemplateVariable[];
  isPublic: boolean;
  isPro: boolean;
  usageCount: number;
  createdAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 300 },
    type: {
      type: String,
      enum: [
        "blog", "linkedin", "instagram", "twitter", "email",
        "newsletter", "product", "pitch", "youtube", "bio", "press", "slogan",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["marketing", "social", "business", "creative"],
      required: true,
    },
    promptSchema: { type: String, required: true },
    variables: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        required: { type: Boolean, default: true },
      },
    ],
    isPublic: { type: Boolean, default: false },
    isPro: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

TemplateSchema.index({ userId: 1 });
TemplateSchema.index({ isPublic: 1, type: 1 });

export const Template = mongoose.model<ITemplate>("Template", TemplateSchema);
