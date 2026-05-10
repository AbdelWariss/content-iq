import { Router } from "express";
import passport from "passport";
import {
  forgotPassword,
  getMe,
  googleCallback,
  login,
  logout,
  refresh,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter, registerLimiter, resendVerificationLimiter } from "../middleware/rateLimiter.js";

const router: import("express").Router = Router();

router.post("/register", authLimiter, registerLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", authenticate, logout);
router.post("/refresh", authLimiter, refresh);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth`,
  }),
  googleCallback,
);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authenticate, resendVerificationLimiter, resendVerification);
router.get("/me", authenticate, getMe);

export default router;
