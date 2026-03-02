import { HabitCard } from "@/components/habit/habitCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border bg-card py-4">
            <CardContent className="px-4 sm:px-5">
              <div className="flex items-start gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-14" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
      {habits.map((habit, index) => (
        <HabitCard
          key={habit._id}
          habit={habit}
          orderIndex={index}
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
