import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getDashboardStats } from "../controllers/stats.controller.js";

const router: import("express").Router = Router();

router.use(authenticate);
router.get("/", getDashboardStats);

export default router;
