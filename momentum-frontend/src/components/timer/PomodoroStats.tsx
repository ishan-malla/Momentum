"use client";

import { Card } from "@/components/ui/card";

type Props = {
  sessionsCompleted: number;
  workDurationMin: number;
};

export default function PomodoroStats({ sessionsCompleted, workDurationMin }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      <Card className="p-4">
        <p className="mb-1 text-xs font-franklin font-medium text-muted-foreground sm:text-sm">
          Sessions Today
        </p>
        <p className="text-2xl font-stat font-bold text-foreground sm:text-3xl">
          {sessionsCompleted}
        </p>
      </Card>

      <Card className="p-4">
        <p className="mb-1 text-xs font-franklin font-medium text-muted-foreground sm:text-sm">
          Focus Time
        </p>
        <p className="text-2xl font-stat font-bold text-accent sm:text-3xl">
          {sessionsCompleted * workDurationMin} min
        </p>
      </Card>
    </div>
  );
}

