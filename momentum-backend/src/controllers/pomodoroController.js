import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { PomodoroSession } from "../models/pomodoroSchema.js";
import { applyXpChange } from "../services/gamificationService.js";
import { toUserProgress } from "../utils/userResponse.js";
import {
  APP_TIMEZONE,
  calculateFocusXp,
  clampInteger,
  formatSession,
  formatSettings,
  getOrCreatePomodoroSettings,
} from "./pomodoroControllerUtils.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getPomodoroData = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await getOrCreatePomodoroSettings(userId);

    const todayStart = dayjs().tz(APP_TIMEZONE).startOf("day").toDate();
    const todayEnd = dayjs().tz(APP_TIMEZONE).endOf("day").toDate();

    const sessions = await PomodoroSession.find({
      user: userId,
      endedAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    })
      .sort({ endedAt: 1 })
      .lean();

    const focusSessions = sessions.filter((session) => session.type === "focus");
    const sessionsCompleted = focusSessions.length;
    const focusMinutes = focusSessions.reduce(
      (sum, session) => sum + (session.durationInMinutes ?? 0),
      0,
    );
    const xpEarned = sessions.reduce(
      (sum, session) => sum + (session.xpEarned ?? 0),
      0,
    );

    res.status(200).json({
      settings: formatSettings(settings),
      sessions: sessions.map((session) => formatSession(session)),
      stats: {
        sessionsCompleted,
        focusMinutes,
        xpEarned,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching pomodoro data",
      error: error.message,
    });
  }
};

export const updatePomodoroSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await getOrCreatePomodoroSettings(userId);

    settings.focusDurationInMinutes = clampInteger(
      req.body.focusDurationMin,
      1,
      60,
      settings.focusDurationInMinutes,
    );
    settings.breakDurationInMinutes = clampInteger(
      req.body.breakDurationMin,
      1,
      30,
      settings.breakDurationInMinutes,
    );
    settings.longBreakDurationInMinutes = clampInteger(
      req.body.longBreakDurationMin,
      1,
      60,
      settings.longBreakDurationInMinutes,
    );
    settings.sessionsTillLongBreak = clampInteger(
      req.body.sessionsUntilLongBreak,
      1,
      12,
      settings.sessionsTillLongBreak,
    );

    if (typeof req.body.soundEnabled === "boolean") {
      settings.soundEnabled = req.body.soundEnabled;
    }

    await settings.save();

    res.status(200).json({
      message: "Pomodoro settings updated",
      settings: formatSettings(settings),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating pomodoro settings",
      error: error.message,
    });
  }
};

export const createPomodoroSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, durationInMinutes } = req.body;

    if (!type || !["focus", "break"].includes(type)) {
      return res.status(400).json({ message: "Invalid session type" });
    }

    const sessionDuration = clampInteger(durationInMinutes, 1, 180, NaN);
    if (Number.isNaN(sessionDuration)) {
      return res.status(400).json({ message: "Invalid duration" });
    }

    const settings = await getOrCreatePomodoroSettings(userId);
    const endedAt = dayjs().tz(APP_TIMEZONE);
    const startedAt = endedAt.subtract(sessionDuration, "minute");
    const xpEarned =
      type === "focus"
        ? calculateFocusXp({
            sessionDurationInMinutes: sessionDuration,
          })
        : 0;

    const createdSession = await PomodoroSession.create({
      user: userId,
      type,
      durationInMinutes: sessionDuration,
      startedAt: startedAt.toDate(),
      endedAt: endedAt.toDate(),
      xpEarned,
    });

    const gamificationResult =
      xpEarned > 0
        ? await applyXpChange({
            user: req.user,
            sourceType: "pomodoro",
            sourceId: createdSession._id,
            baseXp: xpEarned,
            direction: 1,
            occurredAt: endedAt.toDate(),
          })
        : {
            xpChange: 0,
            userProgress: toUserProgress(req.user),
            levelUpOccurred: false,
            levelUpData: null,
          };

    res.status(201).json({
      message: "Pomodoro session saved",
      session: formatSession(createdSession),
      xpChange: gamificationResult.xpChange,
      userProgress: gamificationResult.userProgress,
      levelUpOccurred: gamificationResult.levelUpOccurred,
      levelUpData: gamificationResult.levelUpData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating pomodoro session",
      error: error.message,
    });
  }
};
