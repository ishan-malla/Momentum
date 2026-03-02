import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

type DeleteHabitConfirmModalProps = {
  open: boolean;
  habitName: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const DeleteHabitConfirmModal = ({
  open,
  habitName,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteHabitConfirmModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-md overflow-hidden p-0 shadow-lg animate-slide-in-right"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm habit deletion"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-destructive/10 p-1.5 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Delete Habit
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This will remove <span className="font-semibold">{habitName}</span>.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Habit"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeleteHabitConfirmModal;
