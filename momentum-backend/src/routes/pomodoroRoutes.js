import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPomodoroSession,
  getPomodoroData,
  updatePomodoroSettings,
} from "../controllers/pomodoroController.js";
import { getPomodoroAnalytics } from "../controllers/pomodoroAnalyticsController.js";

const router = express.Router();

router.use(protect);

router.get("/pomodoro", getPomodoroData);
router.get("/pomodoro/analytics", getPomodoroAnalytics);
router.patch("/pomodoro/settings", updatePomodoroSettings);
router.post("/pomodoro/session", createPomodoroSession);

export default router;
