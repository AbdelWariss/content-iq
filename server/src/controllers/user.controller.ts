import { UpdateProfileSchema } from "@contentiq/shared";
import type { Request, Response } from "express";
import { z } from "zod";
import { NotFoundError } from "../middleware/errorHandler.js";
import { User } from "../models/User.model.js";
import { getAuthUser } from "../utils/requestHelpers.js";

const AvatarSchema = z.object({
  avatarUrl: z
    .string()
    .url()
    .max(500)
    .refine((u) => u.startsWith("https://"), { message: "URL must use HTTPS" }),
});

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur");
  res.json({ success: true, data: { user: user.toJSON() } });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const body = UpdateProfileSchema.parse(req.body);

  const updateFields: Record<string, unknown> = {};
  if (body.name) updateFields.name = body.name;
  if (body.bio !== undefined) updateFields.bio = body.bio;
  if (body.language) updateFields.language = body.language;
  if (body.voicePreferences) {
    const vp = body.voicePreferences;
    if (vp.ttsVoice) updateFields["voicePreferences.ttsVoice"] = vp.ttsVoice;
    if (vp.speed) updateFields["voicePreferences.speed"] = Number(vp.speed);
    if (vp.autoTts !== undefined) updateFields["voicePreferences.autoTts"] = vp.autoTts;
    if (vp.language) updateFields["voicePreferences.language"] = vp.language;
  }

  const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
  if (!user) throw new NotFoundError("Utilisateur");
  res.json({ success: true, data: { user: user.toJSON() } });
}

export async function updateAvatar(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const { avatarUrl } = AvatarSchema.parse(req.body);

  const user = await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
  if (!user) throw new NotFoundError("Utilisateur");
  res.json({ success: true, data: { user: user.toJSON() } });
}
