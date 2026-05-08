import { LoginSchema, RegisterSchema, ResetPasswordSchema } from "@contentiq/shared";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { AuthPayload } from "../middleware/authenticate.js";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../middleware/errorHandler.js";
import { User } from "../models/User.model.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/email.service.js";
import { logger } from "../utils/logger.js";
import { getAuthUser } from "../utils/requestHelpers.js";
import {
  COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  hashToken,
  verifyRefreshToken,
} from "../utils/token.js";

const MAX_REFRESH_TOKENS = 5;
const SALT_ROUNDS = 12;

function buildAuthPayload(user: { _id: unknown; role: string; email: string }): AuthPayload {
  return {
    userId: String(user._id),
    role: user.role as AuthPayload["role"],
    email: user.email,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = RegisterSchema.parse(req.body);

  const existing = await User.findOne({ email: body.email });
  if (existing) throw new ValidationError("Un compte avec cet email existe déjà");

  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
  const verificationToken = generateSecureToken();
  const verificationTokenHash = hashToken(verificationToken);

  const user = await User.create({
    email: body.email,
    name: body.name,
    passwordHash,
    role: "free",
    emailVerified: false,
    emailVerificationToken: verificationTokenHash,
    emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    credits: {
      remaining: 50,
      total: 50,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
    logger.error("Erreur envoi email vérification :", err),
  );

  const payload = buildAuthPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens = [hashToken(refreshToken)];
  user.lastLoginAt = new Date();
  await user.save();

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: user.toJSON(),
      message: "Compte créé. Vérifiez votre email.",
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = LoginSchema.parse(req.body);

  const user = await User.findOne({ email: body.email }).select("+passwordHash +refreshTokens");
  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const isValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!isValid) throw new UnauthorizedError("Email ou mot de passe incorrect");

  const payload = buildAuthPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const hashedNew = hashToken(refreshToken);
  user.refreshTokens = [...(user.refreshTokens ?? []).slice(-MAX_REFRESH_TOKENS + 1), hashedNew];
  user.lastLoginAt = new Date();
  await user.save();

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);

  res.json({
    success: true,
    data: { accessToken, user: user.toJSON() },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

  try {
    const authUser = getAuthUser(req);
    if (token) {
      const hashed = hashToken(token);
      await User.findByIdAndUpdate(authUser.userId, {
        $pull: { refreshTokens: hashed },
      });
    }
  } catch {
    // ignore si non authentifié
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, data: { message: "Déconnecté avec succès" } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  if (!token) throw new UnauthorizedError("Refresh token manquant");

  let payload: AuthPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError("Refresh token invalide ou expiré");
  }

  const hashed = hashToken(token);
  const user = await User.findOne({
    _id: payload.userId,
    refreshTokens: hashed,
  }).select("+refreshTokens");

  if (!user) throw new UnauthorizedError("Session expirée — reconnectez-vous");

  const newPayload = buildAuthPayload(user);
  const newAccessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  const hashedNew = hashToken(newRefreshToken);
  user.refreshTokens = [
    ...(user.refreshTokens ?? []).filter((t) => t !== hashed).slice(-MAX_REFRESH_TOKENS + 1),
    hashedNew,
  ];
  await user.save();

  res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { accessToken: newAccessToken, user: user.toJSON() } });
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  // req.user est le document Mongoose renvoyé par Passport
  const oauthUser = req.user as unknown as
    | { _id: unknown; role: string; email: string }
    | undefined;
  if (!oauthUser) throw new UnauthorizedError("Authentification Google échouée");

  const payload = buildAuthPayload(oauthUser);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await User.findByIdAndUpdate(oauthUser._id, {
    $push: { refreshTokens: { $each: [hashToken(refreshToken)], $slice: -MAX_REFRESH_TOKENS } },
    lastLoginAt: new Date(),
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, COOKIE_OPTIONS);

  const params = new URLSearchParams({ token: accessToken });
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params.toString()}`);
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };
  if (!email) throw new ValidationError("Email requis");

  const user = await User.findOne({ email });

  if (user) {
    const resetToken = generateSecureToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) =>
      logger.error("Erreur envoi email reset :", err),
    );
  }

  // Réponse identique que l'email existe ou non (sécurité)
  res.json({
    success: true,
    data: { message: "Si un compte existe, un email a été envoyé." },
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const body = ResetPasswordSchema.parse(req.body);
  const tokenHash = hashToken(body.token);

  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpiry: { $gt: new Date() },
  }).select("+passwordHash");

  if (!user) throw new AppError("Lien de réinitialisation invalide ou expiré", 400);

  user.passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshTokens = [];
  await user.save();

  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, data: { message: "Mot de passe réinitialisé avec succès." } });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const rawToken = req.params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  if (!token) throw new ValidationError("Token manquant");

  const tokenHash = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpiry: { $gt: new Date() },
  });

  if (!user) throw new AppError("Lien de vérification invalide ou expiré", 400);

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  await sendWelcomeEmail(user.email, user.name).catch((err) =>
    logger.error("Erreur envoi email bienvenue :", err),
  );

  res.json({ success: true, data: { message: "Email vérifié avec succès." } });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const { userId } = getAuthUser(req);
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur");

  res.json({ success: true, data: { user: user.toJSON() } });
}
