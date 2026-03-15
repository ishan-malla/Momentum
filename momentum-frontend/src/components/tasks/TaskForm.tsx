import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { TaskFrequency, TaskPayload, TaskPriority } from "@/features/tasks/taskTypes";

export type TaskFormValues = TaskPayload;

type Props = {
  title: string;
  initialValues?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

const DEFAULT_VALUES: TaskFormValues = {
  name: "",
  description: "",
  priority: "medium",
  frequency: "daily",
  reminder: true,
  reminderOffsetDays: 0,
  scheduledDate: "",
  scheduledTime: "",
};

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"];
const FREQUENCY_OPTIONS: TaskFrequency[] = ["daily", "weekly", "monthly"];

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-[color,box-shadow] hover:bg-muted/35 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20";

export default function TaskForm({
  title,
  initialValues = DEFAULT_VALUES,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: Props) {
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const idPrefix = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const updateValue = <K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFrequencyChange = (value: TaskFrequency) => {
    setValues((prev) => ({
      ...prev,
      frequency: value,
      reminderOffsetDays: value === "daily" ? 0 : prev.reminderOffsetDays ?? 0,
    }));
  };

  const showReminderOffset =
    values.reminder && (values.frequency === "weekly" || values.frequency === "monthly");
  const maxReminderOffset = values.frequency === "weekly" ? 6 : 30;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <Card className="p-4 sm:p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-base font-heading font-semibold text-foreground sm:text-lg">
            {title}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-name`} className="text-xs font-secondary">
              Task name
            </Label>
            <Input
              id={`${idPrefix}-name`}
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Plan weekly review"
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-date`} className="text-xs font-secondary">
              Scheduled date
            </Label>
            <Input
              id={`${idPrefix}-date`}
              type="date"
              value={values.scheduledDate}
              onChange={(event) => updateValue("scheduledDate", event.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-time`} className="text-xs font-secondary">
              Scheduled time
            </Label>
            <Input
              id={`${idPrefix}-time`}
              type="time"
              value={values.scheduledTime}
              onChange={(event) => updateValue("scheduledTime", event.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-priority`} className="text-xs font-secondary">
              Priority
            </Label>
            <select
              id={`${idPrefix}-priority`}
              value={values.priority}
              onChange={(event) =>
                updateValue("priority", event.target.value as TaskPriority)
              }
              className={inputClass}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-frequency`} className="text-xs font-secondary">
              Frequency
            </Label>
            <select
              id={`${idPrefix}-frequency`}
              value={values.frequency}
              onChange={(event) => handleFrequencyChange(event.target.value as TaskFrequency)}
              className={inputClass}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-description`} className="text-xs font-secondary">
              Description
            </Label>
            <textarea
              id={`${idPrefix}-description`}
              value={values.description ?? ""}
              onChange={(event) => updateValue("description", event.target.value)}
              placeholder="Optional context"
              className="min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-[color,box-shadow] hover:bg-muted/35 focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-secondary text-muted-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={values.reminder}
              onChange={(event) => {
                const next = event.target.checked;
                setValues((prev) => ({
                  ...prev,
                  reminder: next,
                  reminderOffsetDays: next ? prev.reminderOffsetDays ?? 0 : 0,
                }));
              }}
              className="h-4 w-4 rounded border border-input accent-[var(--success)] text-success focus:ring-success"
            />
            Enable reminder
          </label>

          {showReminderOffset && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-reminder-offset`} className="text-xs font-secondary">
                Reminder lead time (days before)
              </Label>
              <Input
                id={`${idPrefix}-reminder-offset`}
                type="number"
                min="0"
                max={maxReminderOffset}
                value={values.reminderOffsetDays ?? 0}
                onChange={(event) =>
                  updateValue(
                    "reminderOffsetDays",
                    Math.min(maxReminderOffset, Math.max(0, Number(event.target.value) || 0)),
                  )
                }
                className={inputClass}
              />
              <p className="text-[11px] text-muted-foreground">
                For weekly/monthly tasks, choose how many days early to email.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
