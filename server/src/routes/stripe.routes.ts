import { Router } from "express";
import { createCheckoutSession, createPortalSession } from "../controllers/stripe.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router: import("express").Router = Router();

router.use(authenticate);
router.post("/checkout", createCheckoutSession);
router.post("/portal", createPortalSession);

export default router;
