import { Router } from "express";
import { handleWebhook } from "../controllers/stripe.controller.js";

const router: import("express").Router = Router();

// Raw body requis pour vérification signature Stripe (configuré dans app.ts)
router.post("/stripe", handleWebhook);

export default router;
