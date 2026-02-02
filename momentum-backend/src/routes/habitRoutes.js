import express from "express";
import {
  createHabitTemplate,
  deleteHabitTemplate,
  getHabitTemplate,
  getHabitTemplateById,
} from "../controllers/habitTemplateController.js";
import { streakMiddleware } from "../middleware/streakMiddleware.js";
import { createHabit } from "../middleware/createHabitMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getHabits,
  getHabitById,
  habitProgress,
  skipHabits,
  getSkipInfo,
} from "../controllers/habitCompletionController.js";

const router = express.Router();

router.get("/habit-template", protect, getHabitTemplate);
router.get("/habit-template/:habitTemplateId", protect, getHabitTemplateById);
router.post("/habit-template", protect, createHabitTemplate);
router.delete("/habit-template/:habitTemplateId", protect, deleteHabitTemplate);

router.get("/habit", protect, createHabit, streakMiddleware, getHabits);
router.get("/habit/:habitId", protect, streakMiddleware, getHabitById);
router.patch(
  "/habit/:habitId/progress",
  protect,
  habitProgress,
  streakMiddleware,
);
router.patch(
  "/habit/:habitId/skip-habit",
  protect,
  habitProgress,
  streakMiddleware,
  skipHabits,
);
router.get(
  "/habit/:habitId/skip-habit",
  protect,
  habitProgress,
  streakMiddleware,
  getSkipInfo,
);

export default router;
