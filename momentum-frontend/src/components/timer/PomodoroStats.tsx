"use client";

import { Card } from "@/components/ui/card";

type Props = {
  sessionsCompleted: number;
  focusMinutes: number;
  xpEarned: number;
};

export default function PomodoroStats({
  sessionsCompleted,
  focusMinutes,
  xpEarned,
}: Props) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:gap-4">
      <Card className="w-[11rem] shrink-0 p-4 sm:w-auto">
        <p className="mb-1 text-xs font-franklin font-medium text-muted-foreground sm:text-sm">
          Sessions Today
        </p>
        <p className="text-2xl font-stat font-bold text-foreground sm:text-3xl">
          {sessionsCompleted}
        </p>
      </Card>

      <Card className="w-[11rem] shrink-0 p-4 sm:w-auto">
        <p className="mb-1 text-xs font-franklin font-medium text-muted-foreground sm:text-sm">
          Focus Time
        </p>
        <p className="text-2xl font-stat font-bold text-foreground sm:text-3xl">
          {focusMinutes} min
        </p>
      </Card>

      <Card className="w-[11rem] shrink-0 p-4 sm:w-auto">
        <p className="mb-1 text-xs font-franklin font-medium text-muted-foreground sm:text-sm">
          XP Earned
        </p>
        <p className="text-2xl font-stat font-bold text-primary sm:text-3xl">
          {xpEarned}
        </p>
      </Card>
    </div>
  );
}
