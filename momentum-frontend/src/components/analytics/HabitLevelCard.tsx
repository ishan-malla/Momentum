import { Card, CardContent } from "@/components/ui/card";
import type { HabitAnalyticsSummary } from "@/features/habit/habitAnalytics";
import { getLevelProgressPercent } from "@/features/habit/habitAnalytics";

type HabitLevelCardProps = {
  summary: HabitAnalyticsSummary;
};

const HabitLevelCard = ({ summary }: HabitLevelCardProps) => {
  const progress = getLevelProgressPercent(summary);

  return (
    <Card className="gap-0 rounded-[1.2rem] border-primary/20 bg-primary/95 py-0 text-primary-foreground shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-primary-foreground/75">
              Level Progress
            </p>
            <p className="mt-1 font-heading text-[1.9rem] font-semibold leading-none">
              Level {summary.level}
            </p>
          </div>
          <p className="font-secondary text-sm text-primary-foreground/85">
            {summary.totalXp} XP
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-primary-foreground/85">
            {summary.levelProgress}/{summary.levelGoal} XP toward the next level
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitLevelCard;
