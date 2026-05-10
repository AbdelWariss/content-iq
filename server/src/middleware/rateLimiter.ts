import rateLimit from "express-rate-limit";

const createLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMIT", message } },
    skip: (req) => req.ip === "127.0.0.1" && process.env.NODE_ENV === "test",
  });

export const authLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Trop de tentatives. Réessayez dans 15 minutes.",
);

export const registerLimiter = createLimiter(
  24 * 60 * 60 * 1000,
  3,
  "Trop de comptes créés depuis cette adresse IP. Réessayez demain.",
);

export const resendVerificationLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  "Trop de tentatives. Réessayez dans 1 heure.",
);

export const apiLimiter = createLimiter(
  60 * 1000,
  60,
  "Trop de requêtes. Réessayez dans 1 minute.",
);

export const generateLimiter = createLimiter(
  60 * 1000,
  10,
  "Limite de génération atteinte. Réessayez dans 1 minute.",
);

export const voiceLimiter = createLimiter(
  60 * 1000,
  20,
  "Limite voix atteinte. Réessayez dans 1 minute.",
);
