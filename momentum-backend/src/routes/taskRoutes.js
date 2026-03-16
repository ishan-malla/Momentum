import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/tasksController.js";

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
