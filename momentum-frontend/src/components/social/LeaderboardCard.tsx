import { useMemo, useState } from "react";
import SocialAvatar from "@/components/social/SocialAvatar";
import type { SocialProfileSummary } from "@/components/social/socialTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LeaderboardEntry, SocialMetric } from "@/data/mockSocial";

type LeaderboardCardProps = {
  entries: LeaderboardEntry[];
  metric?: SocialMetric;
  onMetricChange?: (metric: SocialMetric) => void;
  onSelectFriend?: (profile: SocialProfileSummary) => void;
};

const rankStyles: Record<number, string> = {
  1: "bg-[#f7edd2] text-[#946d0a]",
  2: "bg-[#ececef] text-[#5c6572]",
  3: "bg-[#f1e2d7] text-[#8a5b3a]",
};

const LeaderboardCard = ({
  entries,
  metric: controlledMetric,
  onMetricChange,
  onSelectFriend,
}: LeaderboardCardProps) => {
  const [uncontrolledMetric, setUncontrolledMetric] = useState<SocialMetric>("xp");
  const metric = controlledMetric ?? uncontrolledMetric;

  const handleMetricChange = (nextMetric: SocialMetric) => {
    if (!controlledMetric) {
      setUncontrolledMetric(nextMetric);
    }

    onMetricChange?.(nextMetric);
  };

  const sortedEntries = useMemo(() => {
    const valueFor = (entry: LeaderboardEntry) => {
      if (metric === "level") return entry.level;
      if (metric === "streak") return entry.streakCount;
      return entry.weeklyXp;
    };

    return [...entries]
      .sort((left, right) => valueFor(right) - valueFor(left))
      .map((entry, index) => ({ entry, rank: index + 1 }));
  }, [entries, metric]);

  return (
    <Card className="h-full max-h-[32rem] rounded-[1.1rem] border border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardContent className="flex h-full max-h-[32rem] flex-col gap-4 px-4 py-5 sm:px-5">
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold text-[#2f3e32]">
              Friends Leaderboard
            </h2>
            <p className="text-sm text-[#7b7467]">
              Switch between weekly XP, level, and streak views.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["xp", "Weekly XP"],
              ["level", "Level"],
              ["streak", "Streak"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMetricChange(value as SocialMetric)}
                className={[
                  "h-9 rounded-full px-3.5 text-sm shadow-none",
                  metric === value
                    ? "border-[#d6cec0] bg-[#f3ede4] text-[#2f3e32] hover:bg-[#ece4d8]"
                    : "border-[#ddd6c8] bg-[#fffdfa] text-[#304034] hover:bg-[#f6f1e8]",
                ].join(" ")}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(210,202,190,0.55)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-[999px] [&::-webkit-scrollbar-thumb]:bg-[rgba(210,202,190,0.55)] [&::-webkit-scrollbar-thumb]:border-[1px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:my-3 [&::-webkit-scrollbar-track]:bg-transparent">
          {sortedEntries.map(({ entry, rank }) => (
            <button
              type="button"
              key={entry.id}
              onClick={() => onSelectFriend?.(entry)}
              className={[
                "flex w-full items-center gap-3 rounded-[0.95rem] border px-3.5 py-3 text-left transition-colors sm:px-4 sm:py-3.5",
                entry.isCurrentUser
                  ? "border-[#d6e2cd] bg-[#e7f0df]"
                  : "border-transparent bg-[#fffdfa] hover:border-[#e6ded0] hover:bg-[#f8f3ea]",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  rankStyles[rank] ?? "bg-[#f4efe6] text-[#6d665a]",
                ].join(" ")}
              >
                {rank}
              </div>

              <SocialAvatar
                username={entry.username}
                avatarUrl={entry.avatarUrl}
                className="h-10 w-10"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#2f3e32] sm:text-[15px]">
                    {entry.username}
                  </p>
                  {entry.isCurrentUser ? (
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-[#4b6349]">
                      You
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-[#8a826f] sm:text-sm">
                  {metric === "xp"
                    ? "XP earned this week"
                    : metric === "level"
                      ? "Current level"
                      : "Current live streak"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#2f3e32] sm:text-[15px]">
                  {metric === "xp"
                    ? entry.weeklyXp
                    : metric === "level"
                      ? `Lvl ${entry.level}`
                      : `${entry.streakCount}d`}
                </p>
                <p className="text-xs text-[#8a826f] sm:text-sm">
                  {metric === "xp" ? "XP" : metric === "level" ? "Level" : "Streak"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
