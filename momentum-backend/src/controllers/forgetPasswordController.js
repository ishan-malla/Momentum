import { emailRegex } from "../utils/validator.js";
import { generateOTP, generateOTPExpiry } from "../utils/generateOTP.js";
import User from "../models/userSchema.js";
import { sendOTPEmail } from "../utils/emailService.js";

//forget password
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please enter email" });
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiry = generateOTPExpiry(10);

    user.otpVerified = false;
    await user.save();

    await sendOTPEmail(email, otp, user.username);
    res.status(200).json({ message: "Forget Password OTP sent" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//verify reset otp

export const verifyResetOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp) return res.status(400).json({ message: "Please enter OTP" });
    if (!email) return res.status(400).json({ message: "Please enter email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otpExpiry || user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    if (String(otp).trim() !== String(user.otp ?? "").trim())
      return res.status(400).json({ message: "OTP does not match" });

    user.otpVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Successfully verified OTP" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { newPassword, email } = req.body;
    if (!newPassword)
      return res.status(400).json({ message: "Please enter new password" });
    if (!email) return res.status(400).json({ message: "Please enter email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otpVerified !== true)
      return res.status(400).json({ message: "Please verify OTP" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    user.password = newPassword.trim();
    user.otpVerified = false;
    await user.save();

    res.status(200).json({ message: "Successfully Changed Password" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
