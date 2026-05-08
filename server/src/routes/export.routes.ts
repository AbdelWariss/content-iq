import { Router } from "express";
import {
  exportDocx,
  exportMarkdown,
  exportPdf,
  exportTxt,
} from "../controllers/export.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router: import("express").Router = Router();

router.use(authenticate);

router.get("/:id/pdf", exportPdf);
router.get("/:id/docx", exportDocx);
router.get("/:id/markdown", exportMarkdown);
router.get("/:id/txt", exportTxt);

export default router;
