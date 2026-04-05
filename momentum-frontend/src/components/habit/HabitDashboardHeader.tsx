import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router";

type Props = {
  greeting: string;
  username: string;
  totalHabits: number;
  bestStreak: number;
  onAddHabit: () => void;
  analyticsPath: string;
  xpActivityControl?: ReactNode;
};

const getHabitCountText = (totalHabits: number) => {
  if (totalHabits === 1) return "You have 1 habit scheduled for today.";
  return `You have ${totalHabits} habits scheduled for today.`;
};

export default function HabitDashboardHeader({
  greeting,
  username,
  totalHabits,
  onAddHabit,
  analyticsPath,
  xpActivityControl,
}: Props) {
  return (
    <section className="py-1">
      <div className="min-w-0">
        {xpActivityControl ? (
          <div className="mb-2 flex justify-end">{xpActivityControl}</div>
        ) : null}

        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {username}
        </h1>

        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {getHabitCountText(totalHabits)}
          </p>

          <div className="flex shrink-0 items-center gap-2.5 self-end sm:self-auto">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 border-border/80 bg-card px-3.5 text-sm text-foreground hover:bg-muted/60"
            >
              <Link to={analyticsPath}>See analytics</Link>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onAddHabit}
              className="h-9 bg-primary px-3.5 text-sm text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create habit
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
