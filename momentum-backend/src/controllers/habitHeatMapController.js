import { HabitCompletion } from "../models/habitSchema.js";
import dayjs from "dayjs";

export const heatMap = async (req, res) => {
  const userId = req.user.id;

  const start = dayjs().startOf("month").toDate();
  const end = dayjs().endOf("month").toDate();

  const habits = await HabitCompletion.find({
    user: userId,
    date: { $gte: start, $lte: end },
  }).populate({
    path: "habitTemplate",
    select: "name habitType frequency skipDaysInAWeek streak isDeleted",
    match: { isDeleted: { $ne: true } },
  });

  res.status(200).json(habits);
};
