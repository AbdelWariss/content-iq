import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
} from "../controllers/template.controller.js";

const router: import("express").Router = Router();

router.get("/", authenticate, listTemplates);
router.get("/:id", authenticate, getTemplate);
router.post("/", authenticate, createTemplate);
router.put("/:id", authenticate, updateTemplate);
router.delete("/:id", authenticate, deleteTemplate);
router.post("/:id/use", authenticate, useTemplate);

export default router;
