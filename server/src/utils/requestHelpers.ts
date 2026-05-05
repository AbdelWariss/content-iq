import type { Request } from "express";
import type { AuthPayload } from "../middleware/authenticate.js";
import { UnauthorizedError } from "../middleware/errorHandler.js";

export function getAuthUser(req: Request): AuthPayload {
  const user = req.user as AuthPayload | undefined;
  if (!user?.userId) throw new UnauthorizedError();
  return user;
}
