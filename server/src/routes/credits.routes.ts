import { Router } from "express";
import { getCredits, getHistory } from "../controllers/credits.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router: import("express").Router = Router();

router.use(authenticate);
router.get("/", getCredits);
router.get("/history", getHistory);

export default router;
