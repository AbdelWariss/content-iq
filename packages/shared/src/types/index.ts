export type UserRole = "free" | "pro" | "business" | "admin";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

export type ContentType =
  | "blog"
  | "linkedin"
  | "instagram"
  | "twitter"
  | "email"
  | "newsletter"
  | "product"
  | "pitch"
  | "youtube"
  | "bio"
  | "press"
  | "slogan";

export type ContentTone =
  | "professional"
  | "casual"
  | "inspiring"
  | "technical"
  | "humorous"
  | "persuasive";

export type ContentLength = "short" | "medium" | "long" | "custom";
export type ContentLanguage = "fr" | "en" | "es" | "ar";
export type ContentStatus = "draft" | "complete" | "archived";

export type ExportFormat = "pdf" | "docx" | "markdown" | "txt" | "zip";

export type AssistantMessageRole = "user" | "assistant";
export type VoiceCommandSource = "web_speech" | "whisper";

export type CreditTransactionType =
  | "consume"
  | "topup"
  | "monthly_reset"
  | "bonus"
  | "refund";

export interface UserCredits {
  remaining: number;
  total: number;
  resetDate: string;
}

export interface UserSubscription {
  stripeCustomerId?: string;
  stripePriceId?: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
}

export interface VoicePreferences {
  ttsVoice: string;
  speed: 0.75 | 1 | 1.25 | 1.5;
  autoTts: boolean;
  language: string;
}

export interface ContentPromptParams {
  subject: string;
  tone: ContentTone;
  language: ContentLanguage;
  length: ContentLength;
  keywords?: string[];
  audience?: string;
  context?: string;
  customLength?: number;
}

export interface PlanLimits {
  credits: number;
  contentTypes: ContentType[] | "all";
  voiceCommands: boolean;
  assistantMessagesPerDay: number | null;
  exports: ExportFormat[];
  customTemplates: boolean;
  apiAccess: boolean;
  teamSeats: number;
}

export const PLAN_LIMITS: Record<UserRole, PlanLimits> = {
  free: {
    credits: 50,
    contentTypes: ["blog", "linkedin", "instagram", "twitter", "email", "product"],
    voiceCommands: false,
    assistantMessagesPerDay: 5,
    exports: ["pdf", "txt"],
    customTemplates: false,
    apiAccess: false,
    teamSeats: 0,
  },
  pro: {
    credits: 500,
    contentTypes: "all",
    voiceCommands: true,
    assistantMessagesPerDay: null,
    exports: ["pdf", "docx", "markdown", "txt"],
    customTemplates: true,
    apiAccess: false,
    teamSeats: 0,
  },
  business: {
    credits: 2000,
    contentTypes: "all",
    voiceCommands: true,
    assistantMessagesPerDay: null,
    exports: ["pdf", "docx", "markdown", "txt", "zip"],
    customTemplates: true,
    apiAccess: true,
    teamSeats: 5,
  },
  admin: {
    credits: 999999,
    contentTypes: "all",
    voiceCommands: true,
    assistantMessagesPerDay: null,
    exports: ["pdf", "docx", "markdown", "txt", "zip"],
    customTemplates: true,
    apiAccess: true,
    teamSeats: 999,
  },
};
