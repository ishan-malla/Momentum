import Task from "../models/taskSchema.js";

const validateFrequency = (value) =>
  !value || ["daily", "weekly", "monthly"].includes(value);

const normalizeReminderOffset = (frequency, reminderOffsetDays) => {
  if (reminderOffsetDays === undefined || reminderOffsetDays === null) return 0;
  const parsed = Number(reminderOffsetDays);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  if (frequency === "daily") return 0;
  const cap = frequency === "weekly" ? 6 : 30;
  return Math.min(parsed, cap);
};

const parseDateParts = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
};

const isCompletionAllowed = (task, now = new Date()) => {
  const parts = parseDateParts(task.scheduledDate);
  if (!parts) return false;

  const taskDate = new Date(parts.year, parts.month, parts.day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (task.frequency === "daily") {
    return (
      taskDate.getFullYear() === today.getFullYear() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getDate() === today.getDate()
    );
  }

  if (task.frequency === "weekly") {
    const weekStart = new Date(taskDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return today >= weekStart && today <= weekEnd;
  }

  return (
    taskDate.getFullYear() === today.getFullYear() &&
    taskDate.getMonth() === today.getMonth()
  );
};

export const createTask = async (req, res) => {
  try {
    const {
      name,
      scheduledDate,
      scheduledTime,
      priority,
      description,
      reminder,
      reminderOffsetDays,
      frequency,
      completed,
    } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(400).json({ message: "User does not exist" });
    if (!name) {
      return res.status(400).json({ message: "Task name is required" });
    }
    if (!scheduledDate) {
      return res.status(400).json({ message: "Scheduled date is required" });
    }
    if (!scheduledTime) {
      return res.status(400).json({ message: "Scheduled time is required" });
    }
    if (!priority) {
      return res.status(400).json({ message: "Priority is required" });
    }
    if (!validateFrequency(frequency)) {
      return res
        .status(400)
        .json({ message: "Frequency must be daily, weekly, or monthly" });
    }

    const normalizedReminderOffset = normalizeReminderOffset(
      frequency,
      reminderOffsetDays,
    );

    const task = await Task.create({
      user: userId,
      name,
      scheduledDate,
      scheduledTime,
      priority,
      description,
      reminder,
      reminderOffsetDays: normalizedReminderOffset,
      frequency,
      completed: Boolean(completed),
      completedAt: completed ? new Date() : undefined,
    });

    res.status(201).json(task);
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Task validation failed",
        error: error.message,
      });
    }
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: "User does not exist" });

    const { frequency, scheduledDate } = req.query;
    if (!validateFrequency(frequency)) {
      return res
        .status(400)
        .json({ message: "Frequency must be daily, weekly, or monthly" });
    }

    const filter = { user: userId };
    if (frequency) filter.frequency = frequency;
    if (scheduledDate) filter.scheduledDate = scheduledDate;

    const tasks = await Task.find(filter).sort({
      scheduledDate: 1,
      scheduledTime: 1,
      createdAt: 1,
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(400).json({ message: "User does not exist" });

    const {
      name,
      scheduledDate,
      scheduledTime,
      priority,
      description,
      reminder,
      reminderOffsetDays,
      frequency,
      completed,
    } = req.body;

    if (!validateFrequency(frequency)) {
      return res
        .status(400)
        .json({ message: "Frequency must be daily, weekly, or monthly" });
    }

    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (name !== undefined) task.name = name;
    if (scheduledDate !== undefined) task.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) task.scheduledTime = scheduledTime;
    if (priority !== undefined) task.priority = priority;
    if (description !== undefined) task.description = description;
    if (reminder !== undefined) task.reminder = reminder;
    if (reminderOffsetDays !== undefined) {
      task.reminderOffsetDays = normalizeReminderOffset(
        frequency ?? task.frequency,
        reminderOffsetDays,
      );
    }
    if (frequency !== undefined) task.frequency = frequency;

    if (completed !== undefined) {
      const nextCompleted = Boolean(completed);
      if (nextCompleted && !isCompletionAllowed(task)) {
        return res
          .status(400)
          .json({ message: "Task can only be completed during its scheduled window" });
      }
      task.completed = nextCompleted;
      task.completedAt = nextCompleted ? new Date() : undefined;
    }

    if (
      scheduledDate !== undefined ||
      scheduledTime !== undefined ||
      reminderOffsetDays !== undefined ||
      reminder !== undefined
    ) {
      task.reminderSentAt = undefined;
      task.reminderSentFor = undefined;
    }

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Task validation failed",
        error: error.message,
      });
    }
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(400).json({ message: "User does not exist" });

    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};
