import express from "express";
import {
  createHabitTemplate,
  deleteHabitTemplate,
  getHabitTemplate,
  getHabitTemplateById,
} from "../controllers/habitTemplateController.js";
import { streakMiddleware } from "../middleware/streakMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getHabits,
  getHabitById,
} from "../controllers/habitCompletionController.js";

const router = express.Router();

router.get("/habit-template", protect, getHabitTemplate);
router.get("/habit-template/:habitTemplateId", protect, getHabitTemplateById);
router.post("/habit-template", protect, createHabitTemplate);
router.delete("/habit-template/:habitTemplateId", protect, deleteHabitTemplate);

router.get("/habit", protect, streakMiddleware, getHabits);
router.get("/habit/:id", protect, streakMiddleware, getHabitById);
export default router;
