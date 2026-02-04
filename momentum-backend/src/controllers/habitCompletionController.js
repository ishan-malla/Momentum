import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import User from "../models/userSchema.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = dayjs().tz("Asia/Kathmandu").startOf("day");

    const habits = await HabitCompletion.find({ user: userId }).populate({
      path: "habitTemplate",
      select: "name habitType frequency skipDaysInAWeek streak xp isDeleted",
    });

    if (!habits || habits.length === 0) {
      return res.status(404).json({ message: "No habits found" });
    }

    const todaysHabit = habits.filter((habit) => {
      if (!habit.habitTemplate || habit.habitTemplate.isDeleted) return false;
      const habitDate = dayjs(habit.date).tz("Asia/Kathmandu").startOf("day");
      return habitDate.isSame(today, "day");
    });

    if (!todaysHabit || todaysHabit.length === 0) {
      return res.status(404).json({
        message: "No habits for today",
        debug: {
          totalHabits: habits.length,
          todayDate: today.format("YYYY-MM-DD"),
          habitDates: habits.map((h) =>
            dayjs(h.date).tz("Asia/Kathmandu").format("YYYY-MM-DD"),
          ),
        },
      });
    }

    return res.status(200).json(todaysHabit);
  } catch (error) {
    console.error("Error in getHabits:", error);
    return res.status(500).json({
      message: "Error fetching habits",
      error: error.message,
    });
  }
};

export const getHabitById = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;

    if (!habitId)
      return res.status(400).json({ message: "habit id does not exist" });

    const habit = await HabitCompletion.findOne({
      _id: habitId,
      user: userId,
    }).populate({
      path: "habitTemplate",
      select: "name habitType frequency skipDaysInAWeek streak xp isDeleted",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (!habit.habitTemplate || habit.habitTemplate.isDeleted) {
      return res.status(404).json({ message: "Habit template not found" });
    }

    return res.status(200).json(habit);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching habit",
      error: error.message,
    });
  }
};

export const habitProgress = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;
    const { delta } = req.body;

    if (!delta) {
      return res.status(400).json({ message: "delta does not exist" });
    }
    if (!habitId) {
      return res.status(400).json({ message: "habit id does not exist" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const habit = await HabitCompletion.findOne({
      _id: habitId,
      user: userId,
    }).populate({
      path: "habitTemplate",
      select: "habitType frequency skipDaysInAweek isDeleted",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (!habit.habitTemplate || habit.habitTemplate.isDeleted) {
      return res.status(404).json({ message: "Habit template not found" });
    }

    if (habit.skipped)
      return res
        .status(400)
        .json({ message: "Skipped habit cannot be marked as complete" });

    const today = dayjs().tz("Asia/Kathmandu").startOf("day");
    const habitDate = dayjs(habit.date).tz("Asia/Kathmandu").startOf("day");

    if (!habitDate.isSame(today, "day")) {
      return res
        .status(400)
        .json({ message: "Only today's habits can be updated" });
    }

    const habitType = habit.habitTemplate.habitType;

    if (habitType === "binary") {
      if (delta === 1 && !habit.completion) {
        habit.completion = true;
        user.totalXp += 10;
      }
      if (delta === -1 && habit.completion) {
        habit.completion = false;
        user.totalXp -= 10;
      }
    }

    if (habitType === "quantitative") {
      const newQuantity = habit.quantity + delta;
      const maxFrequency = habit.habitTemplate.frequency;

      if (newQuantity > maxFrequency) {
        return res.status(400).json({
          message: `Quantity cannot be more than ${maxFrequency}`,
        });
      }
      if (newQuantity < 0) {
        return res
          .status(400)
          .json({ message: "Quantity cannot be less than 0" });
      }

      const wasComplete = habit.quantity === maxFrequency;
      habit.quantity = newQuantity;

      if (newQuantity === maxFrequency && !wasComplete) {
        habit.completion = true;
        user.totalXp += 10;
      }
      if (newQuantity < maxFrequency && wasComplete) {
        habit.completion = false;
        user.totalXp -= 10;
      }
    }

    await habit.save();
    await user.save();

    return res.status(200).json({
      message: "Habit progress updated successfully",
      habit,
      totalXp: user.totalXp,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating habit progress",
      error: error.message,
    });
  }
};

export const getSkipInfo = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;

    const habit = await HabitCompletion.findOne({
      _id: habitId,
      user: userId,
    }).populate({
      path: "habitTemplate",
      select: "skipDaysInAWeek isDeleted",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (!habit.habitTemplate || habit.habitTemplate.isDeleted) {
      return res.status(404).json({ message: "Habit template not found" });
    }

    const weekStart = dayjs().tz("Asia/Kathmandu").startOf("week").toDate();
    const weekEnd = dayjs().tz("Asia/Kathmandu").endOf("week").toDate();

    const skipsUsedThisWeek = await HabitCompletion.countDocuments({
      habitTemplate: habit.habitTemplate._id,
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd },
      skipped: true,
    });

    const skipsRemaining =
      habit.habitTemplate.skipDaysInAWeek - skipsUsedThisWeek;

    return res.status(200).json({
      skipsRemaining,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching skip info",
      error: error.message,
    });
  }
};

export const skipHabits = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { delta } = req.body;
    const userId = req.user.id;

    if (!habitId) {
      return res.status(400).json({ message: "habit id does not exist" });
    }
    if (!delta) {
      return res.status(400).json({ message: "delta does not exist" });
    }

    const habit = await HabitCompletion.findOne({
      _id: habitId,
      user: userId,
    }).populate({
      path: "habitTemplate",
      select: "skipDaysInAWeek isDeleted",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (!habit.habitTemplate || habit.habitTemplate.isDeleted) {
      return res.status(404).json({ message: "Habit template not found" });
    }

    if (habit.completion) {
      return res
        .status(400)
        .json({ message: "Completed habit cannot be skipped" });
    }

    const today = dayjs().tz("Asia/Kathmandu").startOf("day");
    const habitDate = dayjs(habit.date).tz("Asia/Kathmandu").startOf("day");

    if (!habitDate.isSame(today, "day")) {
      return res
        .status(400)
        .json({ message: "Only today's habits can be skipped" });
    }

    const weekStart = dayjs().tz("Asia/Kathmandu").startOf("week").toDate();
    const weekEnd = dayjs().tz("Asia/Kathmandu").endOf("week").toDate();

    const skipsUsedThisWeek = await HabitCompletion.countDocuments({
      habitTemplate: habit.habitTemplate._id,
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd },
      skipped: true,
    });

    const maxSkipsPerWeek = habit.habitTemplate.skipDaysInAWeek;

    if (delta === 1) {
      if (habit.skipped) {
        return res.status(400).json({ message: "Habit already skipped" });
      }

      if (skipsUsedThisWeek >= maxSkipsPerWeek) {
        return res.status(400).json({
          message: `No skips remaining this week. Limit: ${maxSkipsPerWeek}`,
        });
      }

      habit.skipped = true;
      await habit.save();

      return res.status(200).json({
        message: "Habit marked as skipped",
        skipsUsed: skipsUsedThisWeek + 1,
        skipsRemaining: maxSkipsPerWeek - (skipsUsedThisWeek + 1),
      });
    }

    if (delta === -1) {
      if (!habit.skipped) {
        return res.status(400).json({ message: "Habit is not skipped" });
      }

      habit.skipped = false;
      await habit.save();

      return res.status(200).json({
        message: "Habit marked as unskipped",
        skipsUsed: skipsUsedThisWeek - 1,
        skipsRemaining: maxSkipsPerWeek - (skipsUsedThisWeek - 1),
      });
    }

    return res.status(400).json({ message: "Invalid delta value" });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating skip status",
      error: error.message,
    });
  }
};
