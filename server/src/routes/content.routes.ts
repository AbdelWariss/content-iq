import { Router } from "express";
import {
  deleteContent,
  generate,
  getContent,
  improveContentHandler,
  listContents,
  searchContents,
  suggestKeywordsHandler,
  toggleFavorite,
  updateContent,
} from "../controllers/content.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { checkCredits } from "../middleware/checkCredits.js";
import { generateLimiter } from "../middleware/rateLimiter.js";

const router: import("express").Router = Router();

router.use(authenticate);

router.post("/generate", generateLimiter, checkCredits, generate);
router.post("/suggest-keywords", suggestKeywordsHandler);
router.get("/", listContents);
router.get("/search", searchContents);
router.get("/:id", getContent);
router.put("/:id", updateContent);
router.delete("/:id", deleteContent);
router.patch("/:id/favorite", toggleFavorite);
router.post("/:id/improve", checkCredits, improveContentHandler);

export default router;
