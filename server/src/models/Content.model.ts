import type {
  ContentLanguage,
  ContentLength,
  ContentStatus,
  ContentTone,
  ContentType,
  ExportFormat,
} from "@contentiq/shared";
import mongoose, { type Document, Schema } from "mongoose";

interface ExportRecord {
  format: ExportFormat;
  exportedAt: Date;
  cloudinaryUrl?: string;
}

interface PromptParams {
  subject: string;
  tone: ContentTone;
  language: ContentLanguage;
  length: ContentLength;
  customLength?: number;
  keywords?: string[];
  audience?: string;
  context?: string;
}

export interface IContent extends Document {
  userId: mongoose.Types.ObjectId;
  type: ContentType;
  title: string;
  body: string;
  bodyPlain: string;
  prompt: PromptParams;
  templateId?: mongoose.Types.ObjectId;
  tokensUsed: number;
  generationTime: number;
  tags: string[];
  isFavorite: boolean;
  status: ContentStatus;
  exportHistory: ExportRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "blog",
        "linkedin",
        "instagram",
        "twitter",
        "email",
        "newsletter",
        "product",
        "pitch",
        "youtube",
        "bio",
        "press",
        "slogan",
      ],
      required: true,
    },
    title: { type: String, maxlength: 200 },
    body: { type: String, required: true },
    bodyPlain: { type: String },
    prompt: {
      subject: { type: String, required: true },
      tone: { type: String, required: true },
      language: { type: String, required: true },
      length: { type: String, required: true },
      customLength: { type: Number },
      keywords: [{ type: String }],
      audience: { type: String },
      context: { type: String },
    },
    templateId: { type: Schema.Types.ObjectId, ref: "Template" },
    tokensUsed: { type: Number, default: 0 },
    generationTime: { type: Number, default: 0 },
    tags: [{ type: String, maxlength: 30 }],
    isFavorite: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "complete", "archived"],
      default: "complete",
    },
    exportHistory: [
      {
        format: { type: String },
        exportedAt: { type: Date },
        cloudinaryUrl: { type: String },
      },
    ],
  },
  { timestamps: true },
);

ContentSchema.index({ userId: 1, createdAt: -1 });
ContentSchema.index({ userId: 1, status: 1 });
ContentSchema.index({ userId: 1, isFavorite: 1 });
ContentSchema.index({ bodyPlain: "text", title: "text" });

export const Content = mongoose.model<IContent>("Content", ContentSchema);
