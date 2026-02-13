import { Card } from "@/components/ui/card";

type PomodoroSession = {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  xp: number;
};

type Props = {
  sessions: PomodoroSession[];
};

export default function TodaysSessions({ sessions }: Props) {
  return (
    <Card>
      <div className="p-4 sm:p-6">
        <h2 className="text-base font-serif font-bold text-foreground sm:text-lg">
          Today's Sessions
        </h2>
      </div>

      <div className="divide-y divide-border">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground sm:p-6">
            <p className="text-sm font-franklin">
              No sessions completed yet. Start your first focus session!
            </p>
          </div>
        ) : (
          sessions
            .slice()
            .reverse()
            .map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-6 sm:py-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium font-franklin text-foreground">
                    {session.startTime} - {session.endTime}
                  </div>
                  <div className="mt-1 text-xs font-franklin text-muted-foreground">
                    {session.type} Session
                  </div>
                </div>

                {session.xp > 0 && (
                  <div className="shrink-0 text-sm font-medium font-franklin text-primary">
                    +{session.xp} XP
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </Card>
  );
}
