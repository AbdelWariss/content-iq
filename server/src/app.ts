import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import passport from "passport";
import { env } from "./config/env.js";
import { configurePassport } from "./config/passport.js";
import { Sentry } from "./config/sentry.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { logger } from "./utils/logger.js";

import adminRoutes from "./routes/admin.routes.js";
import assistantRoutes from "./routes/assistant.routes.js";
import authRoutes from "./routes/auth.routes.js";
import contentRoutes from "./routes/content.routes.js";
import creditsRoutes from "./routes/credits.routes.js";
import exportRoutes from "./routes/export.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import stripeRoutes from "./routes/stripe.routes.js";
import templateRoutes from "./routes/template.routes.js";
import userRoutes from "./routes/user.routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

export function createApp(): import("express").Express {
  const app = express();
  configurePassport();

  // Security headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        },
      },
    }),
  );

  // CORS — strip trailing slash to avoid browser origin mismatch
  const allowedOrigin = env.CLIENT_URL?.replace(/\/$/, "");
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || origin.replace(/\/$/, "") === allowedOrigin) cb(null, true);
        else cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // Passport (sans session — JWT only)
  app.use(passport.initialize());

  // Stripe webhook needs raw body — doit être avant express.json()
  app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // HTTP request logging
  app.use(
    morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }),
  );

  // Rate limiting global
  app.use("/api", apiLimiter);

  // Health check — reflète l'état réel de la connexion MongoDB.
  // 503 si la DB est down (le process reste vivant en mode dégradé, mais
  // le monitoring/Render détecte la dégradation au lieu d'un faux "ok").
  app.get("/health", (_req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? "ok" : "degraded",
      db: dbConnected ? "up" : "down",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      commit: env.RENDER_GIT_COMMIT?.slice(0, 7) ?? "dev",
      env: env.NODE_ENV,
    });
  });

  // Routes API
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/voice", voiceRoutes);
  app.use("/api/assistant", assistantRoutes);
  app.use("/api/export", exportRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/credits", creditsRoutes);
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/stripe", stripeRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Route non trouvée" },
    });
  });

  // Capture Sentry avant notre handler global. No-op si Sentry n'est pas
  // initialisé (pas de DSN) — donc inerte en dev/tests.
  if (env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }

  // Global error handler — doit être en dernier
  app.use(errorHandler);

  return app;
}
