import User from "../models/userSchema.js";
import {
  ensureUserFriendCode,
  generateUniqueFriendCode,
} from "../utils/friendCodeService.js";
import { ensureGamificationState } from "../services/gamificationService.js";
import { sendOTPEmail } from "../utils/emailService.js";
import { generateOTP } from "../utils/generateOTP.js";
import { toClientUser } from "../utils/userResponse.js";
import { emailRegex } from "../utils/validator.js";
import {
  clearRefreshTokenCookie,
  hashToken,
  setRefreshTokenCookie,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenService.js";

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
      friendCode: await generateUniqueFriendCode(),
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
      user: toClientUser(newUser),
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
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (email) email = email.trim().toLowerCase();
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
        message: "Email not verified. Please verify your email before login.",
        email: user.email,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await ensureUserFriendCode(user);
    await ensureGamificationState(user);

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);
    user.refreshTokenHash = hashToken(refreshToken);
    user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.status(200).json({
      message: "Login successful",
      user: toClientUser(user),
      token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Refresh access token using refresh token cookie
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Session expired. Please log in." });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || decoded.type !== "refresh" || !decoded.id) {
      return res.status(401).json({ message: "Session expired. Please log in." });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: "Session expired. Please log in." });
    }

    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      return res.status(401).json({ message: "Session expired. Please log in." });
    }

    if (hashToken(refreshToken) !== user.refreshTokenHash) {
      return res.status(401).json({ message: "Session expired. Please log in." });
    }

    await ensureUserFriendCode(user);
    await ensureGamificationState(user);

    // Rotate refresh token
    const newRefreshToken = signRefreshToken(user);
    setRefreshTokenCookie(res, newRefreshToken);
    user.refreshTokenHash = hashToken(newRefreshToken);
    user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    const accessToken = signAccessToken(user);
    return res.status(200).json({
      message: "Session refreshed",
      user: toClientUser(user),
      token: accessToken,
    });
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please log in." });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    clearRefreshTokenCookie(res);

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, {
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
          });
        }
      } catch {
        // Ignore invalid refresh token
      }
    }

    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return res.status(200).json({ message: "Logged out" });
  }
};
