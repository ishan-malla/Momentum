import Task from "../models/taskSchema.js";
import User from "../models/userSchema.js";
import { sendTaskReminderEmail } from "../utils/emailService.js";

const parseDateParts = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
};

const parseTimeParts = (value) => {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return { hours, minutes };
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getReminderDateTime = (task) => {
  const dateParts = parseDateParts(task.scheduledDate);
  const timeParts = parseTimeParts(task.scheduledTime);
  if (!dateParts || !timeParts) return null;

  const base = new Date(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
    0,
    0,
  );

  const offsetDays =
    task.frequency === "daily" ? 0 : Math.max(0, task.reminderOffsetDays ?? 0);
  base.setDate(base.getDate() - offsetDays);
  return base;
};

export const startTaskReminderJob = () => {
  const intervalMs = 5 * 60 * 1000;

  setInterval(async () => {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - intervalMs);

      const tasks = await Task.find({ reminder: true }).lean();
      if (!tasks.length) return;

      const users = await User.find({
        _id: { $in: tasks.map((task) => task.user) },
      })
        .select("email username")
        .lean();
      const userMap = new Map(users.map((user) => [String(user._id), user]));

      await Promise.all(
        tasks.map(async (task) => {
          const reminderDateTime = getReminderDateTime(task);
          if (!reminderDateTime) return;

          if (reminderDateTime < windowStart || reminderDateTime > now) return;

          const reminderKey = formatDateKey(reminderDateTime);
          if (task.reminderSentFor === reminderKey) return;

          const user = userMap.get(String(task.user));
          if (!user?.email) return;

          const result = await sendTaskReminderEmail(user.email, user.username, task);
          if (!result.success) return;

          await Task.updateOne(
            { _id: task._id },
            { $set: { reminderSentAt: new Date(), reminderSentFor: reminderKey } },
          );
        }),
      );
    } catch (error) {
      console.error("Task reminder job error:", error);
    }
  }, intervalMs);
};
