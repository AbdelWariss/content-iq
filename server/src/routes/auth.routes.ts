import { Router } from "express";
import passport from "passport";
import { authLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  register,
  login,
  logout,
  refresh,
  googleCallback,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} from "../controllers/auth.controller.js";

const router: import("express").Router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", authenticate, logout);
router.post("/refresh", refresh);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }), googleCallback);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.get("/me", authenticate, getMe);

export default router;
