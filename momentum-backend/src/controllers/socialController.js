import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Friendship from "../models/friendshipSchema.js";
import XpEvent from "../models/xpEventSchema.js";
import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";
import { PomodoroSession } from "../models/pomodoroSchema.js";
import { calculateProgressFromTotalXp } from "../utils/gamificationUtils.js";
import { toUserProgress } from "../utils/userResponse.js";
import { APP_TIMEZONE } from "./pomodoroControllerUtils.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const HISTORY_DAYS = 7;
const ACTIVITY_LIMIT = 8;
const SIGNIFICANT_FOCUS_MINUTES = 60;
const SIGNIFICANT_XP = 50;

const getHistoryDayKeys = () => {
  const today = dayjs().tz(APP_TIMEZONE).startOf("day");
  const dayKeys = [];

  for (let index = HISTORY_DAYS - 1; index >= 0; index -= 1) {
    dayKeys.push(today.subtract(index, "day").format("YYYY-MM-DD"));
  }

  return dayKeys;
};

const createDailyXpStore = (userIds, dayKeys) => {
  const store = new Map();

  for (const userId of userIds) {
    const dailyValues = {};

    for (const dayKey of dayKeys) {
      dailyValues[dayKey] = 0;
    }

    store.set(String(userId), dailyValues);
  }

  return store;
};

const addDailyXp = (store, userId, dayKey, xp) => {
  const dailyValues = store.get(String(userId));

  if (!dailyValues || !dayKey || !(dayKey in dailyValues)) {
    return;
  }

  dailyValues[dayKey] += xp;
};

const formatTimeAgo = (value) => {
  const now = dayjs();
  const date = dayjs(value);
  const minutes = now.diff(date, "minute");

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = now.diff(date, "hour");
  if (hours < 24) return `${hours}h ago`;

  const days = now.diff(date, "day");
  if (days < 7) return `${days}d ago`;

  return date.format("MMM D");
};

const buildStreakMap = async (userIds) => {
  if (!userIds.length) {
    return new Map();
  }

  const habits = await HabitTemplate.aggregate([
    {
      $match: {
        user: { $in: userIds },
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: "$user",
        streakCount: { $max: "$streak" },
      },
    },
  ]);

  return new Map(
    habits.map((item) => [String(item._id), Number(item.streakCount) || 0]),
  );
};

const buildActiveHabitCountMap = async (userIds) => {
  if (!userIds.length) {
    return new Map();
  }

  const habits = await HabitTemplate.aggregate([
    {
      $match: {
        user: { $in: userIds },
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: "$user",
        habitCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(habits.map((item) => [String(item._id), Number(item.habitCount) || 0]));
};

const buildDailyXpMap = async (userIds, dayKeys) => {
  const dailyXpMap = createDailyXpStore(userIds, dayKeys);

  if (!userIds.length) {
    return dailyXpMap;
  }

  const startDate = dayjs.tz(dayKeys[0], APP_TIMEZONE).startOf("day").toDate();
  const endDate = dayjs
    .tz(dayKeys[dayKeys.length - 1], APP_TIMEZONE)
    .endOf("day")
    .toDate();

  const xpEvents = await XpEvent.find({
    user: { $in: userIds },
    occurredAt: { $gte: startDate, $lte: endDate },
  })
    .select("user occurredAt xpDelta")
    .lean();

  for (const item of xpEvents) {
    const dayKey = dayjs(item.occurredAt).tz(APP_TIMEZONE).format("YYYY-MM-DD");
    addDailyXp(dailyXpMap, item.user, dayKey, item.xpDelta ?? 0);
  }

  return dailyXpMap;
};

const buildActivityFeed = async (users) => {
  if (!users.length) {
    return [];
  }

  const userIds = users.map((user) => user._id);
  const startDate = dayjs().tz(APP_TIMEZONE).subtract(6, "day").startOf("day").toDate();

  const [activeHabitCountMap, habitEvents, focusSessions, xpEvents] = await Promise.all([
    buildActiveHabitCountMap(userIds),
    HabitCompletion.find({
      user: { $in: userIds },
      completion: true,
      date: { $gte: startDate },
    })
      .select("user date updatedAt")
      .sort({ updatedAt: -1 })
      .lean(),
    PomodoroSession.find({
      user: { $in: userIds },
      type: "focus",
      xpEarned: { $gt: 0 },
      endedAt: { $gte: startDate },
    })
      .sort({ endedAt: -1 })
      .lean(),
    XpEvent.find({
      user: { $in: userIds },
      occurredAt: { $gte: startDate },
    })
      .select("user occurredAt xpDelta")
      .sort({ occurredAt: -1 })
      .lean(),
  ]);

  const xpDayMap = new Map();
  const habitDayMap = new Map();
  const focusDayMap = new Map();

  for (const item of xpEvents) {
    const userId = String(item.user);
    const dayKey = dayjs(item.occurredAt).tz(APP_TIMEZONE).format("YYYY-MM-DD");
    const mapKey = `${userId}-${dayKey}`;
    const current = xpDayMap.get(mapKey) ?? {
      totalXp: 0,
      lastOccurredAt: item.occurredAt,
    };

    current.totalXp += item.xpDelta ?? 0;

    if (new Date(item.occurredAt) > new Date(current.lastOccurredAt)) {
      current.lastOccurredAt = item.occurredAt;
    }

    xpDayMap.set(mapKey, current);
  }

  for (const item of habitEvents) {
    const userId = String(item.user);
    const dayKey = dayjs(item.date).tz(APP_TIMEZONE).format("YYYY-MM-DD");
    const mapKey = `${userId}-${dayKey}`;
    const current = habitDayMap.get(mapKey) ?? {
      completedHabitCount: 0,
      lastCompletedAt: item.updatedAt ?? item.date,
    };

    current.completedHabitCount += 1;

    if (new Date(item.updatedAt ?? item.date) > new Date(current.lastCompletedAt)) {
      current.lastCompletedAt = item.updatedAt ?? item.date;
    }

    habitDayMap.set(mapKey, current);
  }

  for (const item of focusSessions) {
    const userId = String(item.user);
    const dayKey = dayjs(item.endedAt).tz(APP_TIMEZONE).format("YYYY-MM-DD");
    const mapKey = `${userId}-${dayKey}`;
    const current = focusDayMap.get(mapKey) ?? {
      totalMinutes: 0,
      totalXp: 0,
      sessionCount: 0,
      lastEndedAt: item.endedAt,
    };

    current.totalMinutes += item.durationInMinutes ?? 0;
    current.totalXp += item.xpEarned ?? 0;
    current.sessionCount += 1;

    if (new Date(item.endedAt) > new Date(current.lastEndedAt)) {
      current.lastEndedAt = item.endedAt;
    }

    focusDayMap.set(mapKey, current);
  }

  const activityItems = [];
  const dayKeys = getHistoryDayKeys().reverse();

  for (const user of users) {
    const userId = String(user._id);
    const activeHabitCount = activeHabitCountMap.get(userId) ?? 0;

    for (const dayKey of dayKeys) {
      const mapKey = `${userId}-${dayKey}`;
      const habitInfo = habitDayMap.get(mapKey);
      const focusInfo = focusDayMap.get(mapKey);
      const xpInfo = xpDayMap.get(mapKey);
      const totalXp = xpInfo?.totalXp ?? 0;
      const hasCompletedAllHabits =
        activeHabitCount > 0 &&
        (habitInfo?.completedHabitCount ?? 0) >= activeHabitCount;
      const hasStrongFocusDay =
        (focusInfo?.totalMinutes ?? 0) >= SIGNIFICANT_FOCUS_MINUTES;

      if (hasCompletedAllHabits) {
        activityItems.push({
          id: `all-habits-${userId}-${dayKey}`,
          username: user.username,
          avatarUrl: user.avatarUrl || "",
          actionType: "habit",
          actionText: `completed all ${activeHabitCount} habits for the day.`,
          timeAgo: formatTimeAgo(habitInfo.lastCompletedAt),
          sortDate: habitInfo.lastCompletedAt,
        });
      }

      if (hasStrongFocusDay) {
        activityItems.push({
          id: `focus-day-${userId}-${dayKey}`,
          username: user.username,
          avatarUrl: user.avatarUrl || "",
          actionType: "achievement",
          actionText: `focused for ${focusInfo.totalMinutes} minutes across ${focusInfo.sessionCount} sessions.`,
          timeAgo: formatTimeAgo(focusInfo.lastEndedAt),
          sortDate: focusInfo.lastEndedAt,
        });
      }

      if (!hasCompletedAllHabits && !hasStrongFocusDay && totalXp >= SIGNIFICANT_XP) {
        const sortDate =
          focusInfo?.lastEndedAt ?? habitInfo?.lastCompletedAt ?? xpInfo?.lastOccurredAt;

        activityItems.push({
          id: `xp-day-${userId}-${dayKey}`,
          username: user.username,
          avatarUrl: user.avatarUrl || "",
          actionType: "level",
          actionText: `gained ${totalXp} XP in a strong day of progress.`,
          timeAgo: formatTimeAgo(sortDate),
          sortDate,
        });
      }
    }
  }

  return activityItems
    .sort((left, right) => new Date(right.sortDate) - new Date(left.sortDate))
    .slice(0, ACTIVITY_LIMIT)
    .map(({ sortDate, ...item }) => item);
};

const buildLeaderboard = (users, streakMap, dailyXpMap, dayKeys, currentUserId) => {
  const leaderboard = users.map((user) => {
    const userId = String(user._id);
    const currentStreak = streakMap.get(userId) ?? 0;
    const dailyXpValues = dailyXpMap.get(userId) ?? {};
    const progress = toUserProgress(user);
    const xpHistory = [];
    let runningXp = 0;

    for (const dayKey of dayKeys) {
      runningXp += dailyXpValues[dayKey] ?? 0;
      xpHistory.push(runningXp);
    }

    const weeklyXp = xpHistory[xpHistory.length - 1] ?? 0;
    const startingXp = Math.max(0, progress.totalXp - weeklyXp);

    return {
      id: userId,
      username: user.username,
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
      weeklyXp,
      level: progress.level,
      totalXp: progress.totalXp,
      streakCount: currentStreak,
      isCurrentUser: userId === currentUserId,
      history: {
        xp: xpHistory,
        level: xpHistory.map(
          (xp) => calculateProgressFromTotalXp(Math.max(0, startingXp + xp)).level,
        ),
        streak: dayKeys.map(() => currentStreak),
      },
    };
  });

  return leaderboard.sort((left, right) => right.weeklyXp - left.weeklyXp);
};

export const getSocialDashboard = async (req, res) => {
  try {
    const currentUserId = String(req.user._id);
    const friendships = await Friendship.find({
      status: "accepted",
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    })
      .populate("requester", "username bio avatarUrl totalXp level xp")
      .populate("recipient", "username bio avatarUrl totalXp level xp")
      .lean();

    const friendUsers = friendships
      .map((friendship) =>
        String(friendship.requester?._id) === currentUserId
          ? friendship.recipient
          : friendship.requester,
      )
      .filter(Boolean);

    const socialUsers = [
      {
        _id: req.user._id,
        username: req.user.username,
        bio: req.user.bio || "",
        avatarUrl: req.user.avatarUrl || "",
        totalXp: req.user.totalXp ?? 0,
        level: req.user.level ?? 1,
        xp: req.user.xp ?? 0,
      },
      ...friendUsers,
    ];

    const userIds = socialUsers.map((user) => user._id);
    const dayKeys = getHistoryDayKeys();
    const [streakMap, dailyXpMap, activityFeed] = await Promise.all([
      buildStreakMap(userIds),
      buildDailyXpMap(userIds, dayKeys),
      buildActivityFeed(socialUsers),
    ]);

    const leaderboard = buildLeaderboard(
      socialUsers,
      streakMap,
      dailyXpMap,
      dayKeys,
      currentUserId,
    );

    return res.status(200).json({
      leaderboard,
      activityFeed,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load social dashboard",
      error: error.message,
    });
  }
};
