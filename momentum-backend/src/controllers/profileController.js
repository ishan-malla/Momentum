import User from "../models/userSchema.js";
import XpEvent from "../models/xpEventSchema.js";
import dayjs from "dayjs";
import mongoose from "mongoose";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { toProfile } from "../utils/profileMapper.js";
import { toUserProgress } from "../utils/userResponse.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TIMEZONE = "Asia/Kathmandu";

const sumXpForRange = async (userId, startDate, endDate) => {
  const [result] = await XpEvent.aggregate([
    {
      $match: {
        user: reqObjectId(userId),
        occurredAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        xpEarned: { $sum: "$xpDelta" },
      },
    },
  ]);

  return result?.xpEarned ?? 0;
};

const reqObjectId = (value) => new mongoose.Types.ObjectId(String(value));

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({ profile: toProfile(req.user) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load profile",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body ?? {};
    const update = {};

    if (typeof username !== "undefined") {
      if (typeof username !== "string") {
        return res.status(400).json({ message: "Username must be a string" });
      }

      const normalizedUsername = username.trim().toLowerCase();
      if (normalizedUsername.length < 3 || normalizedUsername.length > 10) {
        return res.status(400).json({
          message: "Username must be between 3 and 10 characters",
        });
      }

      update.username = normalizedUsername;
    }

    if (typeof bio !== "undefined") {
      if (typeof bio !== "string") {
        return res.status(400).json({ message: "Bio must be a string" });
      }

      const normalizedBio = bio.trim();
      if (normalizedBio.length > 200) {
        return res.status(400).json({
          message: "Bio must be 200 characters or fewer",
        });
      }

      update.bio = normalizedBio;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -otp -otpExpiry -otpVerified");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated",
      profile: toProfile(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const getProfileStats = async (req, res) => {
  try {
    const now = dayjs().tz(APP_TIMEZONE);
    const todayStart = now.startOf("day").toDate();
    const todayEnd = now.endOf("day").toDate();
    const weekStart = now.startOf("week").toDate();
    const weekEnd = now.endOf("week").toDate();
    const monthStart = now.startOf("month").toDate();
    const monthEnd = now.endOf("month").toDate();

    const [xpToday, xpThisWeek, xpThisMonth] = await Promise.all([
      sumXpForRange(req.user._id, todayStart, todayEnd),
      sumXpForRange(req.user._id, weekStart, weekEnd),
      sumXpForRange(req.user._id, monthStart, monthEnd),
    ]);

    return res.status(200).json({
      progress: toUserProgress(req.user),
      periods: {
        today: xpToday,
        thisWeek: xpThisWeek,
        thisMonth: xpThisMonth,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load profile stats",
      error: error.message,
    });
  }
};
