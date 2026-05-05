import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@contentiq/shared";
import { ForbiddenError, UnauthorizedError } from "./errorHandler.js";
import type { AuthPayload } from "./authenticate.js";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  free: 0,
  pro: 1,
  business: 2,
  admin: 3,
};

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authUser = req.user as AuthPayload | undefined;
    if (!authUser) throw new UnauthorizedError();

    const userLevel = ROLE_HIERARCHY[authUser.role];
    const minRequired = Math.min(...roles.map((r) => ROLE_HIERARCHY[r]));

    if (userLevel < minRequired) {
      throw new ForbiddenError(`Plan ${roles[0]} requis. Votre plan actuel : ${authUser.role}`);
    }

    next();
  };
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const authUser = req.user as AuthPayload | undefined;
  if (!authUser || authUser.role !== "admin") {
    throw new ForbiddenError("Accès réservé aux administrateurs");
  }
  next();
}
