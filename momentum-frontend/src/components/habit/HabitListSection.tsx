import { HabitCard } from "@/components/habit/habitCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Habit } from "@/features/habit/habitApiSlice";
import { readHabitErrorMessage } from "@/features/habit/habitErrors";

type HabitListSectionProps = {
  habits: Habit[];
  habitsError: unknown;
  isLoading: boolean;
  hasQueryError: boolean;
  onRetry: () => void;
  emptyMessage: string;
  actionsDisabled: boolean;
  onToggleBinary: (habitId: string, nextCompleted: boolean) => void;
  onUpdateQuantity: (habitId: string, delta: 1 | -1) => void;
  onToggleSkip: (habitId: string, nextSkipped: boolean) => void;
  onDelete: (habitTemplateId: string, habitName: string) => void;
};

const HabitListSection = ({
  habits,
  habitsError,
  isLoading,
  hasQueryError,
  onRetry,
  emptyMessage,
  actionsDisabled,
  onToggleBinary,
  onUpdateQuantity,
  onToggleSkip,
  onDelete,
}: HabitListSectionProps) => {
  if (isLoading) {
    return (
      <Card className="py-5">
        <CardContent className="px-5 text-sm text-muted-foreground sm:px-6">
          Loading habits...
        </CardContent>
      </Card>
    );
  }

  if (hasQueryError) {
    return (
      <Card className="py-5">
        <CardContent className="flex items-center justify-between gap-4 px-5 sm:px-6">
          <p className="text-sm text-destructive">
            {readHabitErrorMessage(habitsError, "Failed to load habits.")}
          </p>
          <Button type="button" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card className="py-5">
        <CardContent className="px-5 text-sm text-muted-foreground sm:px-6">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {habits.map((habit) => (
        <HabitCard
          key={habit._id}
          habit={habit}
          actionsDisabled={actionsDisabled}
          onToggleBinary={onToggleBinary}
          onUpdateQuantity={onUpdateQuantity}
          onToggleSkip={onToggleSkip}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default HabitListSection;
