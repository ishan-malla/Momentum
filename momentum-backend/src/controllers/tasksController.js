import Task from "../models/taskSchema.js";
import { applyXpChange, getTaskBaseXp } from "../services/gamificationService.js";
import { toUserProgress } from "../utils/userResponse.js";
import {
  doesTaskOccurOnDate,
  getOccurrenceCompletion,
  getOccurrenceKeyForDate,
  isOccurrenceCompletionAllowed,
  summarizeTaskCompletion,
} from "../utils/taskRecurrence.js";

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

const toTaskResponse = (taskDocument) => {
  const task = taskDocument.toObject ? taskDocument.toObject() : taskDocument;
  const summary = summarizeTaskCompletion(task);

  return {
    ...task,
    completed: summary.completed,
    completedAt: summary.completedAt,
    completionHistory: summary.completionHistory,
  };
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
    const effectiveFrequency = frequency ?? "daily";

    const normalizedReminderOffset = normalizeReminderOffset(
      effectiveFrequency,
      reminderOffsetDays,
    );

    const completionHistory = {};
    if (
      completed &&
      doesTaskOccurOnDate({ scheduledDate, frequency: effectiveFrequency }, scheduledDate)
    ) {
      const occurrenceKey = getOccurrenceKeyForDate(effectiveFrequency, scheduledDate);
      completionHistory[occurrenceKey] = new Date().toISOString();
    }

    const task = await Task.create({
      user: userId,
      name,
      scheduledDate,
      scheduledTime,
      priority,
      description,
      reminder,
      reminderOffsetDays: normalizedReminderOffset,
      frequency: effectiveFrequency,
      completed: Boolean(completed),
      completedAt: completed ? new Date() : undefined,
      completionHistory,
    });

    res.status(201).json(toTaskResponse(task));
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

    res.status(200).json({ tasks: tasks.map(toTaskResponse) });
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
      occurrenceDate,
    } = req.body;

    if (!validateFrequency(frequency)) {
      return res
        .status(400)
        .json({ message: "Frequency must be daily, weekly, or monthly" });
    }

    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    const previousScheduleSignature = `${task.frequency}:${task.scheduledDate}`;
    const completionHistory = new Map(Object.entries(summarizeTaskCompletion(task).completionHistory));
    let completionChanged = false;
    let xpDirection = 0;
    let completionOccurredAt = null;

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
      if (!occurrenceDate) {
        return res
          .status(400)
          .json({ message: "Occurrence date is required when updating completion" });
      }
      if (!doesTaskOccurOnDate(task, occurrenceDate)) {
        return res
          .status(400)
          .json({ message: "Task does not occur on the selected date" });
      }
      const nextCompleted = Boolean(completed);
      if (nextCompleted && !isOccurrenceCompletionAllowed(task, occurrenceDate)) {
        return res
          .status(400)
          .json({ message: "Task can only be completed during its scheduled window" });
      }
      const currentCompletion = getOccurrenceCompletion(task, occurrenceDate);
      if (currentCompletion.completed !== nextCompleted) {
        completionChanged = true;
        xpDirection = nextCompleted ? 1 : -1;
        completionOccurredAt = nextCompleted
          ? new Date().toISOString()
          : currentCompletion.completedAt ?? new Date().toISOString();
      }

      if (nextCompleted) {
        completionHistory.set(
          currentCompletion.occurrenceKey,
          completionOccurredAt ?? new Date().toISOString(),
        );
      } else {
        completionHistory.delete(currentCompletion.occurrenceKey);
      }
    }

    const nextScheduleSignature = `${task.frequency}:${task.scheduledDate}`;
    if (previousScheduleSignature !== nextScheduleSignature && completed === undefined) {
      completionHistory.clear();
      task.completed = false;
      task.completedAt = undefined;
    }
    task.completionHistory = completionHistory;
    const completionSummary = summarizeTaskCompletion(task);
    task.completed = completionSummary.completed;
    task.completedAt = completionSummary.completedAt
      ? new Date(completionSummary.completedAt)
      : undefined;

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

    const gamificationResult = completionChanged
      ? await applyXpChange({
          user: req.user,
          sourceType: "task",
          sourceId: task._id,
          baseXp: getTaskBaseXp(task.priority),
          direction: xpDirection,
          occurredAt: completionOccurredAt ? new Date(completionOccurredAt) : new Date(),
        })
      : {
          xpChange: 0,
          userProgress: toUserProgress(req.user),
          levelUpOccurred: false,
          levelUpData: null,
        };

    res.status(200).json({
      message: "Task updated",
      task: toTaskResponse(task),
      xpChange: gamificationResult.xpChange,
      userProgress: gamificationResult.userProgress,
      levelUpOccurred: gamificationResult.levelUpOccurred,
      levelUpData: gamificationResult.levelUpData,
    });
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
