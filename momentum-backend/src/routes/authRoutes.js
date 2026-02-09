import express from "express";
import { signup, login, refresh, logout } from "../controllers/authController.js";
import {
  forgetPassword,
  resetPassword,
  verifyResetOTP,
} from "../controllers/forgetPasswordController.js";

import {
  verifyOTP,
  resendOTP,
} from "../controllers/userVerificationControlller.js";
import { createHabit } from "../middleware/createHabitMiddleware.js";

const router = express.Router();

//user auth
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

//verify user
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

//forget password
router.post("/forget-password", forgetPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
