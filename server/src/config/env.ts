import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI est requis"),
  REDIS_URL: z.string().min(1, "REDIS_URL est requis"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET doit faire au moins 32 caractères"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET doit faire au moins 32 caractères"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-", "Clé Anthropic invalide"),
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-5"),

  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_DEFAULT_VOICE_ID: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_BUSINESS_PRICE_ID: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@contentiq.app"),

  SENTRY_DSN: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables d'environnement invalides :");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
