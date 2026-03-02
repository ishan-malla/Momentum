import { type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  isOpen: boolean;
  taskTitle: string;
  maxTaskTitleLength: number;
  onOpen: () => void;
  onTaskTitleChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function PomodoroTaskComposer({
  isOpen,
  taskTitle,
  maxTaskTitleLength,
  onOpen,
  onTaskTitleChange,
  onSubmit,
  onCancel,
}: Props) {
  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="default"
        onClick={onOpen}
        className="h-8 w-full gap-1.5 rounded-xl bg-primary px-3 text-xs font-secondary text-primary-foreground hover:bg-primary/90 sm:text-sm"
      >
        Add New Task
      </Button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="animate-fade-in rounded-xl border border-border/80 bg-muted/20 p-3"
    >
      <div className="flex flex-col gap-3">
        <Input
          value={taskTitle}
          onChange={(event) => onTaskTitleChange(event.target.value)}
          maxLength={maxTaskTitleLength}
          placeholder="Add a task"
          className="h-11 w-full font-franklin text-sm"
          autoFocus
        />

        <div className="mt-1 flex items-center justify-end gap-2">
          <Button type="submit" className="h-8 px-3 text-xs font-secondary">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 px-3 text-xs"
            onClick={onCancel}
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
