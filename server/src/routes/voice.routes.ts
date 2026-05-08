import { Router } from "express";
import {
  executeCommand,
  getVoices,
  synthesize,
  transcribe,
} from "../controllers/voice.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { voiceLimiter } from "../middleware/rateLimiter.js";

const router: import("express").Router = Router();

router.use(authenticate);

router.post("/transcribe", voiceLimiter, transcribe);
router.post("/synthesize", voiceLimiter, synthesize);
router.get("/voices", getVoices);
router.post("/command", voiceLimiter, executeCommand);

export default router;
