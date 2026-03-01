import { HabitCompletion } from "../models/habitSchema.js";
import dayjs from "dayjs";
import mongoose from "mongoose";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TIMEZONE = "Asia/Kathmandu";

export const heatMap = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = dayjs().tz(APP_TIMEZONE);

    const rawYear = req.query.year;
    const rawMonth = req.query.month;

    let targetYear = now.year();
    let targetMonth = now.month();

    if (rawYear !== undefined) {
      const parsedYear = Number.parseInt(rawYear, 10);
      if (Number.isNaN(parsedYear) || parsedYear < 1970 || parsedYear > 9999) {
        return res.status(400).json({
          success: false,
          message: "Invalid year. Use a 4-digit year like 2026.",
        });
      }
      targetYear = parsedYear;
    }

    if (rawMonth !== undefined) {
      const parsedMonth = Number.parseInt(rawMonth, 10);
      if (Number.isNaN(parsedMonth) || parsedMonth < 0 || parsedMonth > 11) {
        return res.status(400).json({
          success: false,
          message: "Invalid month. Use 0-11 (0 = January, 11 = December).",
        });
      }
      targetMonth = parsedMonth;
    }

    const currentMonthStart = now.startOf("month");
    const requestedMonthStart = dayjs()
      .tz(APP_TIMEZONE)
      .year(targetYear)
      .month(targetMonth)
      .startOf("month");

    const earliestCompletion = await HabitCompletion.findOne({
      user: new mongoose.Types.ObjectId(userId),
    })
      .sort({ date: 1 })
      .select("date")
      .lean();

    const minimumMonthStart = earliestCompletion
      ? dayjs(earliestCompletion.date).tz(APP_TIMEZONE).startOf("month")
      : currentMonthStart;

    let selectedMonthStart = requestedMonthStart;
    if (selectedMonthStart.isBefore(minimumMonthStart, "month")) {
      selectedMonthStart = minimumMonthStart;
    }
    if (selectedMonthStart.isAfter(currentMonthStart, "month")) {
      selectedMonthStart = currentMonthStart;
    }

    const start = selectedMonthStart.startOf("month").toDate();
    const end = selectedMonthStart.endOf("month").toDate();

    const habitsOfTheMonth = await HabitCompletion.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: {
            $dayOfMonth: { date: "$date", timezone: APP_TIMEZONE },
          },
          totalHabits: { $sum: 1 },
          completedHabits: {
            $sum: {
              $cond: [{ $eq: ["$completion", true] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalDays = selectedMonthStart.daysInMonth();
    const progressData = Array.from({ length: totalDays }, () => 0);

    for (const dayData of habitsOfTheMonth) {
      const dayIndex = dayData._id - 1;
      if (dayIndex < 0 || dayIndex >= totalDays) continue;

      const completedHabits = dayData.completedHabits ?? 0;
      const totalHabits = dayData.totalHabits ?? 0;

      progressData[dayIndex] =
        totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    }

    res.status(200).json({
      year: selectedMonthStart.year(),
      month: selectedMonthStart.month(),
      totalDays,
      hasData: habitsOfTheMonth.length > 0,
      progressData,
      bounds: {
        minYear: minimumMonthStart.year(),
        minMonth: minimumMonthStart.month(),
        maxYear: currentMonthStart.year(),
        maxMonth: currentMonthStart.month(),
        canGoPrev: selectedMonthStart.isAfter(minimumMonthStart, "month"),
        canGoNext: selectedMonthStart.isBefore(currentMonthStart, "month"),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
