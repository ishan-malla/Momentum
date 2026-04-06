import express from "express";
import { getAdminOverview } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/overview", getAdminOverview);

export default router;
