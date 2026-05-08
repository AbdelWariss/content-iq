import { Router } from "express";
import { chat, clearSession, getSession } from "../controllers/assistant.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { apiLimiter } from "../middleware/rateLimiter.js";

const router: import("express").Router = Router();

router.use(authenticate);

router.post("/chat", apiLimiter, chat);
router.get("/session", getSession);
router.delete("/session", clearSession);

export default router;
