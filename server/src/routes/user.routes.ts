import { Router } from "express";
import { getProfile, updateAvatar, updateProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router: import("express").Router = Router();

router.use(authenticate);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.patch("/me/avatar", updateAvatar);

export default router;
