import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProfile,
  getProfileStats,
  updateProfile,
} from "../controllers/profileController.js";
import { removeAvatar, uploadAvatar } from "../controllers/avatarController.js";

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.get("/stats", getProfileStats);
router.patch("/", updateProfile);
router.post("/avatar", uploadAvatar);
router.delete("/avatar", removeAvatar);

export default router;
