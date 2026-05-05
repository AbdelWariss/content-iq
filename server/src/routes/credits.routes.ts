import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getCredits, getHistory } from "../controllers/credits.controller.js";

const router: import("express").Router = Router();

router.use(authenticate);
router.get("/", getCredits);
router.get("/history", getHistory);

export default router;
