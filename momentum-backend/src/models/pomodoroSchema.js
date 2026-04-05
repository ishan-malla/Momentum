import mongoose from "mongoose";

const pomodoroSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    focusDurationInMinutes: {
      type: Number,
      default: 25,
      min: 1,
      max: 60,
    },
    breakDurationInMinutes: {
      type: Number,
      default: 5,
      min: 1,
      max: 30,
    },
    longBreakDurationInMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 60,
    },
    sessionsTillLongBreak: {
      type: Number,
      default: 4,
      min: 1,
      max: 12,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

pomodoroSettingsSchema.index({ user: 1 }, { unique: true });

const pomodoroSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["focus", "break"],
      required: true,
    },
    durationInMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 180,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

pomodoroSessionSchema.index({ user: 1, endedAt: -1 });

export const PomodoroSettings = mongoose.model(
  "PomodoroSettings",
  pomodoroSettingsSchema,
);
export const PomodoroSession = mongoose.model(
  "PomodoroSession",
  pomodoroSessionSchema,
);
