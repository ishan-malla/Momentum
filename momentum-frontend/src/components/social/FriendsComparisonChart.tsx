import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { LeaderboardEntry, SocialMetric } from "@/data/mockSocial";

type FriendsComparisonChartProps = {
  entries: LeaderboardEntry[];
  metric: SocialMetric;
  maxFriends?: number;
};

const metricMeta: Record<
  SocialMetric,
  {
    title: string;
    description: string;
    labels: string[];
    formatter: (value: number) => string;
  }
> = {
  xp: {
    title: "Weekly XP Comparison",
    description: "Top friends ranked by weekly XP across the last 7 check-ins.",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    formatter: (value) => `${value} XP`,
  },
  level: {
    title: "Level Progress Comparison",
    description: "Top friends ranked by level progression across recent milestones.",
    labels: ["M1", "M2", "M3", "M4", "M5", "M6", "Now"],
    formatter: (value) => `Lvl ${value}`,
  },
  streak: {
    title: "Streak Comparison",
    description: "Top friends ranked by current streak growth across the last 7 days.",
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"],
    formatter: (value) => `${value} days`,
  },
};

const lineColors = ["#6f8d6e", "#d4834d", "#4f7cac", "#9f6ba8", "#c95f5f", "#a89244"];

const metricValue = (entry: LeaderboardEntry, metric: SocialMetric) => {
  if (metric === "level") return entry.level;
  if (metric === "streak") return entry.streakCount;
  return entry.weeklyXp;
};

const FriendsComparisonChart = ({
  entries,
  metric,
  maxFriends = 4,
}: FriendsComparisonChartProps) => {
  const topEntries = useMemo(
    () =>
      [...entries]
        .sort((left, right) => metricValue(right, metric) - metricValue(left, metric))
        .slice(0, maxFriends),
    [entries, maxFriends, metric],
  );

  const chartConfig = useMemo(
    () =>
      topEntries.reduce((config, entry, index) => {
        config[entry.id] = {
          label: entry.username,
          color: lineColors[index % lineColors.length],
        };
        return config;
      }, {} as ChartConfig),
    [topEntries],
  );

  const chartData = useMemo(() => {
    const labels = metricMeta[metric].labels;

    return labels.map((label, index) =>
      topEntries.reduce(
        (point, entry) => {
          point.label = label;
          point[entry.id] = entry.history[metric][index] ?? 0;
          return point;
        },
        {} as Record<string, string | number>,
      ),
    );
  }, [metric, topEntries]);

  const formatter = metricMeta[metric].formatter;

  return (
    <Card className="rounded-[1.1rem] border border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          {metricMeta[metric].title}
        </CardTitle>
        <p className="text-sm text-[#7b7467]">{metricMeta[metric].description}</p>
      </CardHeader>
      <CardContent className="space-y-5 px-3 pb-5 sm:px-4">
        <div className="flex flex-wrap gap-x-5 gap-y-3 px-2">
          {topEntries.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-2 text-sm text-[#615a4f]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: lineColors[index % lineColors.length] }}
              />
              <span className="font-medium">{entry.username}</span>
            </div>
          ))}
        </div>

        <ChartContainer config={chartConfig} className="h-[320px]">
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 8, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="#e7dfd2" />
            <XAxis
              axisLine={false}
              dataKey="label"
              minTickGap={24}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickFormatter={(value) => formatter(Number(value))}
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
              width={72}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `${label}`}
                  valueFormatter={(value) => formatter(Number(value))}
                />
              }
              cursor={{ stroke: "#d8d1c4", strokeDasharray: "4 4" }}
            />
            {topEntries.map((entry) => (
              <Line
                key={entry.id}
                dataKey={entry.id}
                dot={false}
                activeDot={false}
                stroke={`var(--color-${entry.id})`}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                type="natural"
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default FriendsComparisonChart;
