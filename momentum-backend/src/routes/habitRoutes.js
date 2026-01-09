import express from "express";
import {
  createHabitTemplate,
  deleteHabitTemplate,
} from "../controllers/habitTemplateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/habit-template", protect, createHabitTemplate);
router.delete("/habit-template/:habitTemplateId", protect, deleteHabitTemplate);
export default router;
