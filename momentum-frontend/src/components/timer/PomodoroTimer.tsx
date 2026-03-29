import PomodoroTimerContent from "@/components/timer/PomodoroTimerContent";
import { Button } from "@/components/ui/button";
import { useGetPomodoroDashboardQuery } from "@/features/pomodoro/pomodoroApiSlice";

export default function PomodoroTimer() {
  const { data, isLoading, error, refetch } = useGetPomodoroDashboardQuery();

  if (isLoading && !data) {
    return (
      <div className="mx-auto mt-8 w-full px-4 sm:px-5 xl:max-w-7xl xl:px-0">
        <p className="text-sm text-muted-foreground">Loading pomodoro...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto mt-8 w-full space-y-3 px-4 sm:px-5 xl:max-w-7xl xl:px-0">
        <p className="text-sm text-destructive">Could not load pomodoro data.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => refetch()}
          className="bg-transparent hover:bg-muted"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return <PomodoroTimerContent dashboard={data} />;
}
