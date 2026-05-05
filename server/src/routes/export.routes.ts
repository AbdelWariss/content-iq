import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { exportPdf, exportDocx, exportMarkdown, exportTxt } from "../controllers/export.controller.js";

const router: import("express").Router = Router();

router.use(authenticate);

router.get("/:id/pdf", exportPdf);
router.get("/:id/docx", exportDocx);
router.get("/:id/markdown", exportMarkdown);
router.get("/:id/txt", exportTxt);

export default router;
