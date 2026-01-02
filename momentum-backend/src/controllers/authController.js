import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import { sendOTPEmail } from "../utils/emailService.js";
import { generateOTP } from "../utils/generateOTP.js";
import { emailRegex } from "../utils/validator.js";

// Signup
export const signup = async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.trim().toLowerCase();
    password = password.trim();
    username = username.trim();

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        await User.deleteOne({ email });
      } else {
        return res.status(400).json({
          message: "Email already registered",
        });
      }
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await User.create({
      username,
      email,
      password,
      role: role || "user",
      otp,
      otpExpiry,
      isVerified: false,
    });

    const emailResult = await sendOTPEmail(email, otp, username);
    if (!emailResult.success) {
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        message: "Failed to send verification email",
      });
    }

    res.status(201).json({
      message: "Signup successful. Please verify your email.",
      email: newUser.email,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    let { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        message: "Email/Username and password are required",
      });
    }

    if (email) email = email.trim().toLowerCase();
    if (username) username = username.trim();
    password = password.trim();

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before login",
        email: user.email,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
