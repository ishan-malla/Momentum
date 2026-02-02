import { HabitCompletion, HabitTemplate } from "../models/habitSchema.js";
import dayjs from "dayjs";
import User from "../models/userSchema.js";
//get
export const getHabits = async (req, res) => {
  try {
    const today = dayjs().startOf("day").toDate();
    const habits = await HabitCompletion.find().populate({
      path: "habitTemplate",
      select: "name habitType frequency skipDaysInAWeek streak xp ",
    });

    if (!habits) {
      return res.status(404).json({ message: "Habit not found" });
    }
    const todaysHabit = habits.filter((habit) =>
      dayjs(habit.date).isSame(today, "day"),
    );

    if (!todaysHabit[0])
      return res.status(400).json({ message: "No habits today" });

    return res.status(200).json(todaysHabit);

    // const habit
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching habits",
      error: error.message,
    });
  }
};

export const getHabitById = async (req, res) => {
  try {
    const { habitId } = req.params;

    if (!habitId)
      return res.status(400).json({ message: "habit id does not exits" });

    const habit = await HabitCompletion.findById(habitId).populate({
      path: "habitTemplate",
      select: "name habitType frequency skipDaysInAWeek streak xp",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
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

    const habit = await HabitCompletion.findById(habitId).populate({
      path: "habitTemplate",
      select: "habitType frequency skipDaysInAweek",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    if (habit.skipped)
      return res
        .status(400)
        .json({ message: "Skipped habit cannot be marked as complete" });

    const today = dayjs().startOf("day");
    const habitDate = dayjs(habit.date).startOf("day");
    if (!habitDate.isSame(today)) {
      return res
        .status(404)
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

//get skip days
export const getSkipInfo = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await HabitCompletion.findById(habitId).populate({
      path: "habitTemplate",
      select: "skipDaysInAWeek",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const weekStart = dayjs().startOf("week").toDate();
    const weekEnd = dayjs().endOf("week").toDate();

    const skipsUsedThisWeek = await HabitCompletion.countDocuments({
      habitTemplate: habit.habitTemplate._id,
      user: habit.user,
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

//update skip days

export const skipHabits = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { delta } = req.body;

    if (!habitId) {
      return res.status(400).json({ message: "habit id does not exist" });
    }
    if (!delta) {
      return res.status(400).json({ message: "delta does not exist" });
    }

    const habit = await HabitCompletion.findById(habitId).populate({
      path: "habitTemplate",
      select: "skipDaysInAWeek",
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (habit.completion) {
      return res
        .status(400)
        .json({ message: "Completed habit cannot be skipped" });
    }

    const today = dayjs().startOf("day");
    const habitDate = dayjs(habit.date).startOf("day");
    if (!habitDate.isSame(today)) {
      return res
        .status(404)
        .json({ message: "Only today's habits can be skipped" });
    }

    const weekStart = dayjs().startOf("week").toDate();
    const weekEnd = dayjs().endOf("week").toDate();

    const skipsUsedThisWeek = await HabitCompletion.countDocuments({
      habitTemplate: habit.habitTemplate._id,
      user: habit.user,
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
