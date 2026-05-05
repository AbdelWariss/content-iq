import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "./errorHandler.js";
import type { UserRole } from "@contentiq/shared";

export interface AuthPayload {
  userId: string;
  role: UserRole;
  email: string;
}

// Ne pas augmenter Express.User ici pour éviter le conflit avec Passport IUser
// L'AuthPayload est accédé via getAuthUser() qui cast req.user

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token d'accès manquant");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    // Cast pour contourner le conflit de type Express.User vs AuthPayload
    (req as Request & { user: AuthPayload }).user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Token invalide ou expiré");
  }
}
