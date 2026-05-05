import mongoose, { type Document, Schema } from "mongoose";

interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isVoice: boolean;
}

export interface IAssistantSession extends Document {
  userId: mongoose.Types.ObjectId;
  messages: AssistantMessage[];
  pageContext?: string;
  editorSnapshot?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssistantSessionSchema = new Schema<IAssistantSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: () => new Date() },
        isVoice: { type: Boolean, default: false },
      },
    ],
    pageContext: { type: String },
    editorSnapshot: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

AssistantSessionSchema.index({ userId: 1, updatedAt: -1 });

export const AssistantSession = mongoose.model<IAssistantSession>(
  "AssistantSession",
  AssistantSessionSchema,
);
