import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.model.js";
import { getAuthUser } from "../utils/requestHelpers.js";
import { InsufficientCreditsError } from "./errorHandler.js";

export const CREDITS_PER_GENERATION = 1;

export async function checkCredits(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authUser = getAuthUser(req);

  const user = await User.findById(authUser.userId).select("credits role");
  if (!user) throw new InsufficientCreditsError();

  if (user.role !== "admin" && user.credits.remaining < CREDITS_PER_GENERATION) {
    throw new InsufficientCreditsError();
  }

  next();
}
