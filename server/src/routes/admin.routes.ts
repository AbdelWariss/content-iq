import { Router } from "express";
import {
  banUser,
  clearLogs,
  getAdminStats,
  listLogs,
  listUsers,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";

const router: import("express").Router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", listUsers);
router.put("/users/:id/role", updateUserRole);
router.post("/users/:id/ban", banUser);
router.get("/logs", listLogs);
router.delete("/logs", clearLogs);

export default router;
