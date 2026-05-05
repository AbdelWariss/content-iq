import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { chat, getSession, clearSession } from "../controllers/assistant.controller.js";

const router: import("express").Router = Router();

router.use(authenticate);

router.post("/chat", apiLimiter, chat);
router.get("/session", getSession);
router.delete("/session", clearSession);

export default router;
