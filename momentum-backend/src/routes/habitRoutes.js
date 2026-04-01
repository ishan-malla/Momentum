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
import { heatMap } from "../controllers/habitHeatMapController.js";
import { getHabitAnalytics } from "../controllers/habitAnalyticsController.js";

const router = express.Router();

router.use(protect);

router.get("/habit-template", getHabitTemplate);
router.get("/habit-template/:habitTemplateId", getHabitTemplateById);
router.post("/habit-template", createHabitTemplate);
router.delete("/habit-template/:habitTemplateId", deleteHabitTemplate);

// Ensure daily habit docs/streak reset logic are applied before any /habit endpoint.
router.use("/habit", createHabit, streakMiddleware);

router.get("/habit", getHabits);
router.get("/habit/analytics", getHabitAnalytics);
router.get("/habit/:habitId", getHabitById);
router.patch("/habit/:habitId/progress", habitProgress);
router.patch("/habit/:habitId/skip-habit", skipHabits);
router.get("/habit/:habitId/skip-habit", getSkipInfo);

router.get("/habit-heatmap", createHabit, streakMiddleware, heatMap);
export default router;
