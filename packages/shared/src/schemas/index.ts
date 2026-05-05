import { z } from "zod";

export const ContentTypeSchema = z.enum([
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
]);

export const ContentToneSchema = z.enum([
  "professional",
  "casual",
  "inspiring",
  "technical",
  "humorous",
  "persuasive",
]);

export const ContentLengthSchema = z.enum(["short", "medium", "long", "custom"]);
export const ContentLanguageSchema = z.enum(["fr", "en", "es", "ar"]);

export const GenerateContentSchema = z.object({
  type: ContentTypeSchema,
  subject: z.string().min(3).max(500),
  tone: ContentToneSchema,
  language: ContentLanguageSchema,
  length: ContentLengthSchema,
  customLength: z.number().min(50).max(5000).optional(),
  keywords: z.array(z.string().max(50)).max(10).optional(),
  audience: z.string().max(200).optional(),
  context: z.string().max(1000).optional(),
  templateId: z.string().optional(),
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre",
    }),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(300).optional(),
  language: z.enum(["fr", "en"]).optional(),
  voicePreferences: z
    .object({
      ttsVoice: z.string().optional(),
      speed: z.enum(["0.75", "1", "1.25", "1.5"]).optional(),
      autoTts: z.boolean().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export const AssistantMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  pageContext: z.string().optional(),
  editorSnapshot: z.string().max(500).optional(),
});

export const TemplateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  type: ContentTypeSchema,
  category: z.enum(["marketing", "social", "business", "creative"]),
  promptSchema: z.string().min(10),
  variables: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      required: z.boolean(),
    }),
  ),
  isPublic: z.boolean().default(false),
});

export const ContentUpdateSchema = z.object({
  body: z.string().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type GenerateContentInput = z.infer<typeof GenerateContentSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type AssistantMessageInput = z.infer<typeof AssistantMessageSchema>;
export type TemplateInput = z.infer<typeof TemplateSchema>;
export type ContentUpdateInput = z.infer<typeof ContentUpdateSchema>;
