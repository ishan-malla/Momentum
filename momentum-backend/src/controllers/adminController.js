import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import User from "../models/userSchema.js";
import XpEvent from "../models/xpEventSchema.js";
import { HabitTemplate } from "../models/habitSchema.js";
import { PomodoroSession } from "../models/pomodoroSchema.js";
import Task from "../models/taskSchema.js";
import { APP_TIMEZONE } from "./pomodoroControllerUtils.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_DAYS = 14;
const MIN_DAYS = 7;
const MAX_DAYS = 30;

const clampDays = (value) => {
  const parsed = Number.parseInt(String(value ?? DEFAULT_DAYS), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_DAYS;
  return Math.min(Math.max(parsed, MIN_DAYS), MAX_DAYS);
};

const getDateEntries = (days) => {
  const today = dayjs().tz(APP_TIMEZONE).startOf("day");

  return Array.from({ length: days }, (_, index) => {
    const date = today.subtract(days - 1 - index, "day");

    return {
      key: date.format("YYYY-MM-DD"),
      label: date.format("MMM D"),
      start: date.startOf("day").toDate(),
      end: date.endOf("day").toDate(),
    };
  });
};

const toValueMap = (items, valueKey = "value") => {
  return new Map(items.map((item) => [String(item._id), Number(item[valueKey]) || 0]));
};

const createBreakdown = (entries) => {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);

  return entries.map((entry) => ({
    label: entry.label,
    value: entry.value,
    share: total > 0 ? Math.round((entry.value / total) * 100) : 0,
  }));
};

export const getAdminOverview = async (req, res) => {
  try {
    const days = clampDays(req.query.days);
    const dateEntries = getDateEntries(days);
    const startDate = dateEntries[0].start;
    const endDate = dateEntries[dateEntries.length - 1].end;

    const [
      totalUsers,
      verifiedUsers,
      adminUsers,
      usersBeforeWindow,
      signups,
      xpTrendRows,
      activeUserRows,
      xpSourceRows,
      habitCount,
      taskCount,
      focusSessionCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ createdAt: { $lt: startDate } }),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: APP_TIMEZONE,
              },
            },
            value: { $sum: 1 },
          },
        },
      ]),
      XpEvent.aggregate([
        {
          $match: {
            occurredAt: { $gte: startDate, $lte: endDate },
            xpDelta: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$occurredAt",
                timezone: APP_TIMEZONE,
              },
            },
            value: { $sum: "$xpDelta" },
          },
        },
      ]),
      XpEvent.aggregate([
        {
          $match: {
            occurredAt: { $gte: startDate, $lte: endDate },
            xpDelta: { $gt: 0 },
          },
        },
        { $group: { _id: "$user" } },
        { $count: "value" },
      ]),
      XpEvent.aggregate([
        {
          $match: {
            occurredAt: { $gte: startDate, $lte: endDate },
            xpDelta: { $gt: 0 },
          },
        },
        { $group: { _id: "$sourceType", value: { $sum: "$xpDelta" } } },
      ]),
      HabitTemplate.countDocuments({ isDeleted: { $ne: true } }),
      Task.countDocuments(),
      PomodoroSession.countDocuments({ type: "focus" }),
    ]);

    const signupMap = toValueMap(signups);
    const xpMap = toValueMap(xpTrendRows);
    let runningUsers = usersBeforeWindow;

    const userTrend = dateEntries.map(({ key, label }) => {
      const newUsers = signupMap.get(key) ?? 0;
      runningUsers += newUsers;

      return {
        date: key,
        label,
        newUsers,
        totalUsers: runningUsers,
      };
    });

    const xpTrend = dateEntries.map(({ key, label }) => ({
      date: key,
      label,
      xpGained: xpMap.get(key) ?? 0,
    }));

    const xpGained = xpTrend.reduce((sum, point) => sum + point.xpGained, 0);
    const xpSourceMap = toValueMap(xpSourceRows);

    return res.json({
      days,
      summary: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        activeUsers: activeUserRows[0]?.value ?? 0,
        xpGained,
      },
      userTrend,
      xpTrend,
      xpSourceBreakdown: createBreakdown([
        { label: "Habits", value: xpSourceMap.get("habit") ?? 0 },
        { label: "Tasks", value: xpSourceMap.get("task") ?? 0 },
        { label: "Pomodoro", value: xpSourceMap.get("pomodoro") ?? 0 },
      ]),
      platformBreakdown: createBreakdown([
        { label: "Habit templates", value: habitCount },
        { label: "Tasks", value: taskCount },
        { label: "Focus sessions", value: focusSessionCount },
      ]),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't load admin overview.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
