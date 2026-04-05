import dayjs from "dayjs";
import { PomodoroSettings } from "../models/pomodoroSchema.js";

export const APP_TIMEZONE = "Asia/Kathmandu";
export const MIN_XP_ELIGIBLE_FOCUS_MINUTES = 5;
export const FIXED_FOCUS_XP = 10;

export const formatSettings = (settings) => ({
  focusDurationMin: settings.focusDurationInMinutes,
  breakDurationMin: settings.breakDurationInMinutes,
  longBreakDurationMin: settings.longBreakDurationInMinutes,
  sessionsUntilLongBreak: settings.sessionsTillLongBreak,
  soundEnabled: settings.soundEnabled,
});

export const formatSession = (session) => ({
  id: String(session._id),
  type: session.type === "focus" ? "Focus" : "Break",
  startTime: dayjs(session.startedAt).tz(APP_TIMEZONE).format("h:mm A"),
  endTime: dayjs(session.endedAt).tz(APP_TIMEZONE).format("h:mm A"),
  xp: session.xpEarned,
  durationInMinutes: session.durationInMinutes,
});

export const clampInteger = (value, min, max, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

export const calculateFocusXp = ({
  sessionDurationInMinutes,
}) => {
  if (sessionDurationInMinutes <= 0) return 0;
  if (sessionDurationInMinutes < MIN_XP_ELIGIBLE_FOCUS_MINUTES) return 0;
  return FIXED_FOCUS_XP;
};

export const getOrCreatePomodoroSettings = async (userId) => {
  let settings = await PomodoroSettings.findOne({ user: userId });

  if (!settings) {
    settings = await PomodoroSettings.create({ user: userId });
  }

  return settings;
};
