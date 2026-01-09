import express from "express";
import { createHabitTemplate } from "../controllers/habitTemplateController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/habit-template", protect, createHabitTemplate);

export default router;
