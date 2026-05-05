import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { configurePassport } from "./config/passport.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import contentRoutes from "./routes/content.routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import assistantRoutes from "./routes/assistant.routes.js";
import exportRoutes from "./routes/export.routes.js";
import templateRoutes from "./routes/template.routes.js";
import creditsRoutes from "./routes/credits.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import stripeRoutes from "./routes/stripe.routes.js";

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

  // CORS
  app.use(
    cors({
      origin: env.CLIENT_URL,
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

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
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

  // Global error handler — doit être en dernier
  app.use(errorHandler);

  return app;
}
