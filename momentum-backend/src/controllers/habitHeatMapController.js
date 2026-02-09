import { HabitCompletion } from "../models/habitSchema.js";
import dayjs from "dayjs";
import mongoose from "mongoose";

export const heatMap = async (req, res) => {
  try {
    const userId = req.user.id;

    const start = dayjs().startOf("month").toDate();
    const end = dayjs().endOf("month").toDate();

    const habitsOftheMonth = await HabitCompletion.aggregate([
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
          _id: { $dayOfMonth: "$date" },
          habitsPerDayCount: { $sum: 1 },
          habitPerDayCompletionCount: {
            $sum: {
              $cond: [{ $eq: ["$completion", true] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          completionPercentage: {
            $cond: [
              { $eq: ["$habitsPerDayCount", 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      "$habitPerDayCompletionCount",
                      "$habitsPerDayCount",
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const roundedResults = habitsOftheMonth.map((item) => ({
      ...item,
      completionPercentage: Math.round(item.completionPercentage),
    }));

    res.status(200).json(roundedResults);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
