import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Ressource") {
    super(`${resource} non trouvée`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Non autorisé") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès interdit") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Données invalides") {
    super(message, 422, "VALIDATION_ERROR");
  }
}

export class InsufficientCreditsError extends AppError {
  constructor() {
    super("Crédits insuffisants", 402, "INSUFFICIENT_CREDITS");
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Données invalides",
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`AppError ${err.statusCode}: ${err.message}`, { stack: err.stack });
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code ?? "ERROR",
        message: err.message,
      },
    });
    return;
  }

  const error = err instanceof Error ? err : new Error(String(err));
  logger.error("Erreur non gérée :", { message: error.message, stack: error.stack });

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Une erreur interne est survenue"
          : error.message,
    },
  });
};
