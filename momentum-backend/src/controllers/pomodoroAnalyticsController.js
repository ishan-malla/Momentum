import dayjs from "dayjs";
import mongoose from "mongoose";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { PomodoroSession } from "../models/pomodoroSchema.js";
import {
  APP_TIMEZONE,
  getOrCreatePomodoroSettings,
} from "./pomodoroControllerUtils.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_ANALYTICS_DAYS = 28;
const MIN_ANALYTICS_DAYS = 7;
const MAX_ANALYTICS_DAYS = 90;

const FOCUS_WINDOWS = [
  { key: "lateNight", label: "Late Night", range: "12 AM - 5 AM" },
  { key: "morning", label: "Morning", range: "5 AM - 11 AM" },
  { key: "midday", label: "Midday", range: "11 AM - 2 PM" },
  { key: "afternoon", label: "Afternoon", range: "2 PM - 6 PM" },
  { key: "evening", label: "Evening", range: "6 PM - 12 AM" },
];

const SESSION_LENGTH_BUCKETS = [
  { key: "quick", label: "Quick", range: "< 15 min" },
  { key: "classic", label: "Classic", range: "15 - 25 min" },
  { key: "deep", label: "Deep", range: "26 - 45 min" },
  { key: "extended", label: "Extended", range: "46+ min" },
];

const WEEKDAYS = [
  { key: 1, label: "Monday" },
  { key: 2, label: "Tuesday" },
  { key: 3, label: "Wednesday" },
  { key: 4, label: "Thursday" },
  { key: 5, label: "Friday" },
  { key: 6, label: "Saturday" },
  { key: 0, label: "Sunday" },
];

const clampAnalyticsDays = (value) => {
  const parsed = Number.parseInt(value ?? String(DEFAULT_ANALYTICS_DAYS), 10);
  if (Number.isNaN(parsed)) return DEFAULT_ANALYTICS_DAYS;
  return Math.min(Math.max(parsed, MIN_ANALYTICS_DAYS), MAX_ANALYTICS_DAYS);
};

const toPercent = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 100);
};

const roundToSingleDecimal = (value) => {
  return Math.round(value * 10) / 10;
};

const getDayKey = (date) => {
  return dayjs(date).tz(APP_TIMEZONE).format("YYYY-MM-DD");
};

const getDayLabel = (dayKey, days) => {
  return dayjs.tz(dayKey, APP_TIMEZONE).format(days > 14 ? "MMM D" : "ddd");
};

const getFocusWindowKey = (hour) => {
  if (hour < 5) return "lateNight";
  if (hour < 11) return "morning";
  if (hour < 14) return "midday";
  if (hour < 18) return "afternoon";
  return "evening";
};

const getSessionLengthKey = (durationInMinutes) => {
  if (durationInMinutes < 15) return "quick";
  if (durationInMinutes <= 25) return "classic";
  if (durationInMinutes <= 45) return "deep";
  return "extended";
};

const createDailyStats = () => ({
  focusMinutes: 0,
  breakMinutes: 0,
  focusSessions: 0,
  breakSessions: 0,
  xpEarned: 0,
});

const createDayKeys = (rangeStart, days) => {
  const dayKeys = [];

  for (let index = 0; index < days; index += 1) {
    dayKeys.push(rangeStart.add(index, "day").format("YYYY-MM-DD"));
  }

  return dayKeys;
};

const createDailyStatsByDay = (dayKeys) => {
  const statsByDay = {};

  for (const dayKey of dayKeys) {
    statsByDay[dayKey] = createDailyStats();
  }

  return statsByDay;
};

const createFocusWindowBreakdown = () => {
  return FOCUS_WINDOWS.map((window) => ({
    key: window.key,
    label: window.label,
    range: window.range,
    focusMinutes: 0,
    focusSessions: 0,
    averageDuration: 0,
  }));
};

const createSessionLengthBreakdown = () => {
  return SESSION_LENGTH_BUCKETS.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    range: bucket.range,
    sessionCount: 0,
    totalMinutes: 0,
    averageDuration: 0,
  }));
};

const createWeekdayStats = () => {
  return WEEKDAYS.map((weekday) => ({
    key: weekday.key,
    label: weekday.label,
    focusMinutes: 0,
    focusSessions: 0,
  }));
};

const findItemByKey = (items, key) => {
  for (const item of items) {
    if (item.key === key) {
      return item;
    }
  }

  return null;
};

const areDaysConsecutive = (previousDayKey, currentDayKey) => {
  const previousDay = dayjs.tz(previousDayKey, APP_TIMEZONE).startOf("day");
  const currentDay = dayjs.tz(currentDayKey, APP_TIMEZONE).startOf("day");

  return currentDay.diff(previousDay, "day") === 1;
};

const buildFocusStreaks = (focusDayKeys, now) => {
  if (focusDayKeys.length === 0) {
    return {
      currentFocusStreak: 0,
      bestFocusStreak: 0,
    };
  }

  let bestFocusStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < focusDayKeys.length; index += 1) {
    if (areDaysConsecutive(focusDayKeys[index - 1], focusDayKeys[index])) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    if (runningStreak > bestFocusStreak) {
      bestFocusStreak = runningStreak;
    }
  }

  const lastDayKey = focusDayKeys[focusDayKeys.length - 1];
  const todayKey = now.format("YYYY-MM-DD");
  const yesterdayKey = now.subtract(1, "day").format("YYYY-MM-DD");

  if (lastDayKey !== todayKey && lastDayKey !== yesterdayKey) {
    return {
      currentFocusStreak: 0,
      bestFocusStreak,
    };
  }

  let currentFocusStreak = 1;

  for (let index = focusDayKeys.length - 1; index > 0; index -= 1) {
    if (!areDaysConsecutive(focusDayKeys[index - 1], focusDayKeys[index])) {
      break;
    }

    currentFocusStreak += 1;
  }

  return {
    currentFocusStreak,
    bestFocusStreak,
  };
};

const findBestFocusDay = (focusDayHistory) => {
  let bestFocusDay = null;

  for (const day of focusDayHistory) {
    if (!bestFocusDay) {
      bestFocusDay = day;
      continue;
    }

    if (day.totalMinutes > bestFocusDay.totalMinutes) {
      bestFocusDay = day;
      continue;
    }

    if (
      day.totalMinutes === bestFocusDay.totalMinutes &&
      day._id > bestFocusDay._id
    ) {
      bestFocusDay = day;
    }
  }

  return bestFocusDay;
};

const findStrongestWeekday = (weekdayStats) => {
  let strongestWeekday = null;

  for (const weekday of weekdayStats) {
    if (!strongestWeekday) {
      strongestWeekday = weekday;
      continue;
    }

    if (weekday.focusMinutes > strongestWeekday.focusMinutes) {
      strongestWeekday = weekday;
      continue;
    }

    if (
      weekday.focusMinutes === strongestWeekday.focusMinutes &&
      weekday.focusSessions > strongestWeekday.focusSessions
    ) {
      strongestWeekday = weekday;
    }
  }

  return strongestWeekday;
};

const findPreferredWindow = (focusWindowBreakdown) => {
  let preferredWindow = null;

  for (const window of focusWindowBreakdown) {
    if (!preferredWindow) {
      preferredWindow = window;
      continue;
    }

    if (window.focusSessions > preferredWindow.focusSessions) {
      preferredWindow = window;
      continue;
    }

    if (
      window.focusSessions === preferredWindow.focusSessions &&
      window.focusMinutes > preferredWindow.focusMinutes
    ) {
      preferredWindow = window;
    }
  }

  return preferredWindow;
};

const updateFocusWindowAverageDurations = (focusWindowBreakdown) => {
  for (const window of focusWindowBreakdown) {
    if (window.focusSessions === 0) {
      window.averageDuration = 0;
      continue;
    }

    window.averageDuration = roundToSingleDecimal(
      window.focusMinutes / window.focusSessions,
    );
  }
};

const updateSessionLengthAverageDurations = (sessionLengthBreakdown) => {
  for (const bucket of sessionLengthBreakdown) {
    if (bucket.sessionCount === 0) {
      bucket.averageDuration = 0;
      continue;
    }

    bucket.averageDuration = roundToSingleDecimal(
      bucket.totalMinutes / bucket.sessionCount,
    );
  }
};

const loadFocusDayHistory = async (userId) => {
  const objectUserId = new mongoose.Types.ObjectId(userId);

  return PomodoroSession.aggregate([
    {
      $match: {
        user: objectUserId,
        type: "focus",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$endedAt",
            timezone: APP_TIMEZONE,
          },
        },
        totalMinutes: { $sum: "$durationInMinutes" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

export const getPomodoroAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = clampAnalyticsDays(req.query.days);
    const now = dayjs().tz(APP_TIMEZONE);
    const rangeStart = now.startOf("day").subtract(days - 1, "day");
    const rangeEnd = now.endOf("day");

    const settings = await getOrCreatePomodoroSettings(userId);

    const [recentSessions, focusDayHistory] = await Promise.all([
      PomodoroSession.find({
        user: userId,
        endedAt: {
          $gte: rangeStart.toDate(),
          $lte: rangeEnd.toDate(),
        },
      })
        .select("type durationInMinutes startedAt endedAt xpEarned")
        .sort({ endedAt: 1 })
        .lean(),
      loadFocusDayHistory(userId),
    ]);

    const dayKeys = createDayKeys(rangeStart, days);
    const dailyStatsByDay = createDailyStatsByDay(dayKeys);
    const focusWindowBreakdown = createFocusWindowBreakdown();
    const sessionLengthBreakdown = createSessionLengthBreakdown();
    const weekdayStats = createWeekdayStats();

    let focusSessions = 0;
    let breakSessions = 0;
    let focusMinutes = 0;
    let breakMinutes = 0;
    let xpEarned = 0;
    let onTargetSessions = 0;

    for (const session of recentSessions) {
      const dayKey = getDayKey(session.endedAt);
      const dayStats = dailyStatsByDay[dayKey];

      if (!dayStats) {
        continue;
      }

      const duration = session.durationInMinutes ?? 0;
      const sessionXp = session.xpEarned ?? 0;
      xpEarned += sessionXp;
      dayStats.xpEarned += sessionXp;

      if (session.type === "focus") {
        focusSessions += 1;
        focusMinutes += duration;
        dayStats.focusMinutes += duration;
        dayStats.focusSessions += 1;

        if (duration >= settings.focusDurationInMinutes) {
          onTargetSessions += 1;
        }

        const startHour = dayjs(session.startedAt ?? session.endedAt)
          .tz(APP_TIMEZONE)
          .hour();
        const focusWindow = findItemByKey(
          focusWindowBreakdown,
          getFocusWindowKey(startHour),
        );
        if (focusWindow) {
          focusWindow.focusMinutes += duration;
          focusWindow.focusSessions += 1;
        }

        const sessionLength = findItemByKey(
          sessionLengthBreakdown,
          getSessionLengthKey(duration),
        );
        if (sessionLength) {
          sessionLength.sessionCount += 1;
          sessionLength.totalMinutes += duration;
        }

        const weekday = findItemByKey(
          weekdayStats,
          dayjs(session.endedAt).tz(APP_TIMEZONE).day(),
        );
        if (weekday) {
          weekday.focusMinutes += duration;
          weekday.focusSessions += 1;
        }

        continue;
      }

      breakSessions += 1;
      breakMinutes += duration;
      dayStats.breakMinutes += duration;
      dayStats.breakSessions += 1;
    }

    updateFocusWindowAverageDurations(focusWindowBreakdown);
    updateSessionLengthAverageDurations(sessionLengthBreakdown);

    const focusDayKeys = focusDayHistory.map((entry) => entry._id);
    const { currentFocusStreak, bestFocusStreak } = buildFocusStreaks(
      focusDayKeys,
      now,
    );
    const bestFocusDay = findBestFocusDay(focusDayHistory);
    const strongestWeekday = findStrongestWeekday(weekdayStats);
    const preferredWindow = findPreferredWindow(focusWindowBreakdown);

    let activeDays = 0;
    const dailyTrend = [];

    for (const dayKey of dayKeys) {
      const stats = dailyStatsByDay[dayKey];

      if (stats.focusSessions > 0) {
        activeDays += 1;
      }

      dailyTrend.push({
        date: dayKey,
        label: getDayLabel(dayKey, days),
        focusMinutes: stats.focusMinutes,
        breakMinutes: stats.breakMinutes,
        focusSessions: stats.focusSessions,
        breakSessions: stats.breakSessions,
        xpEarned: stats.xpEarned,
      });
    }

    const averageFocusMinutes =
      focusSessions > 0 ? roundToSingleDecimal(focusMinutes / focusSessions) : 0;
    const averageBreakMinutes =
      breakSessions > 0 ? roundToSingleDecimal(breakMinutes / breakSessions) : 0;

    return res.status(200).json({
      days,
      summary: {
        focusSessions,
        breakSessions,
        focusMinutes,
        breakMinutes,
        activeDays,
        averageFocusMinutes,
        averageBreakMinutes,
        currentFocusStreak,
        bestFocusStreak,
        onTargetSessions,
        onTargetRate: toPercent(onTargetSessions, focusSessions),
        targetFocusMinutes: settings.focusDurationInMinutes,
        xpEarned,
      },
      dailyTrend,
      focusWindowBreakdown,
      sessionLengthBreakdown,
      highlights: {
        bestFocusDayLabel: bestFocusDay
          ? dayjs.tz(bestFocusDay._id, APP_TIMEZONE).format("MMM D, YYYY")
          : null,
        bestFocusDayMinutes: bestFocusDay?.totalMinutes ?? 0,
        strongestWeekdayLabel:
          strongestWeekday && strongestWeekday.focusMinutes > 0
            ? strongestWeekday.label
            : null,
        strongestWeekdayMinutes: strongestWeekday?.focusMinutes ?? 0,
        preferredWindowLabel:
          preferredWindow && preferredWindow.focusSessions > 0
            ? preferredWindow.label
            : null,
        preferredWindowRange:
          preferredWindow && preferredWindow.focusSessions > 0
            ? preferredWindow.range
            : null,
        preferredWindowSessions: preferredWindow?.focusSessions ?? 0,
        preferredWindowMinutes: preferredWindow?.focusMinutes ?? 0,
        focusToBreakRatio:
          breakMinutes > 0 ? roundToSingleDecimal(focusMinutes / breakMinutes) : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load pomodoro analytics",
      error: error.message,
    });
  }
};
