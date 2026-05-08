import { Router } from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router: import("express").Router = Router();

router.use(authenticate);
router.get("/", getDashboardStats);

export default router;
