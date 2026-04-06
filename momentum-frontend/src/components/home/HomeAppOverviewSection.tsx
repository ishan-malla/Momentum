import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { HomeAppOverviewData } from "@/features/home/homeAppOverview";

const activityChartConfig = {
  habits: { label: "Habits", color: "#6f8d6e" },
  tasks: { label: "Tasks", color: "#c18a4b" },
  focus: { label: "Focus", color: "#5f7fa3" },
} satisfies ChartConfig;

const consistencyChartConfig = {
  activeDays: { label: "Active days", color: "#7b8f72" },
} satisfies ChartConfig;

const cardClassName =
  "gap-0 rounded-[1.2rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]";

type Props = {
  data: HomeAppOverviewData;
  isLoading: boolean;
  hasError: boolean;
};

const HomeAppOverviewSection = ({ data, isLoading, hasError }: Props) => {
  const totalActivity = data.activity.reduce((sum, point) => sum + point.total, 0);
  const strongestArea = [...data.consistency].sort((a, b) => b.activeDays - a.activeDays)[0];

  return (
    <section className="animate-drop-in mx-auto mt-6 w-full px-4 sm:px-5 xl:max-w-7xl xl:px-0">
      {hasError ? (
        <p className="mb-3 text-sm text-[#7b7467]">
          Some overview numbers are partial right now.
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Card className={`${cardClassName} h-full`}>
          <CardContent className="space-y-3 p-5">
            <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
              Weekly Activity Mix
            </p>
            <div className="flex items-end justify-between gap-3">
              <p className="font-heading text-[2rem] font-semibold leading-none text-[#2f3e32]">
                {totalActivity}
              </p>
              <p className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Last 7 Days
              </p>
            </div>
            <p className="text-sm text-[#7b7467]">
              Habits, tasks, and focus sessions in one quick view.
            </p>

            {isLoading ? (
              <Skeleton className="h-[144px] rounded-xl" />
            ) : totalActivity === 0 ? (
              <div className="rounded-xl border border-[#e7dfd2] bg-[#faf6ef] px-3 py-8 text-sm text-[#7b7467]">
                No recent activity yet.
              </div>
            ) : (
              <ChartContainer config={activityChartConfig} className="h-[144px]">
                <LineChart data={data.activity} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e7dfd2" />
                  <XAxis axisLine={false} dataKey="label" tickLine={false} tick={{ fill: "#7b7467", fontSize: 11 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#7b7467", fontSize: 11 }} width={28} />
                  <ChartTooltip content={<ChartTooltipContent valueFormatter={(value) => `${value} items`} />} />
                  <Line dataKey="habits" dot={false} stroke="var(--color-habits)" strokeWidth={2.5} type="monotone" />
                  <Line dataKey="tasks" dot={false} stroke="var(--color-tasks)" strokeWidth={2.5} type="monotone" />
                  <Line dataKey="focus" dot={false} stroke="var(--color-focus)" strokeWidth={2.5} type="monotone" />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className={`${cardClassName} h-full`}>
          <CardContent className="space-y-3 p-5">
            <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
              Consistency By Pillar
            </p>
            <div className="flex items-end justify-between gap-3">
              <p className="font-heading text-[2rem] font-semibold leading-none text-[#2f3e32]">
                {strongestArea?.activeDays ?? 0}/7
              </p>
              <p className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                {strongestArea?.label ?? "No Data"}
              </p>
            </div>
            <p className="text-sm text-[#7b7467]">
              Which part of the app you showed up for most often this week.
            </p>

            {isLoading ? (
              <Skeleton className="h-[144px] rounded-xl" />
            ) : (
              <ChartContainer config={consistencyChartConfig} className="h-[144px]">
                <BarChart data={data.consistency} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e7dfd2" />
                  <XAxis axisLine={false} dataKey="label" tickLine={false} tick={{ fill: "#7b7467", fontSize: 11 }} />
                  <YAxis allowDecimals={false} axisLine={false} domain={[0, 7]} tickLine={false} tick={{ fill: "#7b7467", fontSize: 11 }} width={28} />
                  <ChartTooltip
                    content={<ChartTooltipContent valueFormatter={(value) => `${value} days`} />}
                    cursor={{ fill: "rgba(97,129,100,0.06)" }}
                  />
                  <Bar dataKey="activeDays" fill="var(--color-activeDays)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className={`${cardClassName} h-full`}>
          <CardContent className="space-y-3 p-5">
            <p className="text-[11px] font-secondary uppercase tracking-[0.14em] text-[#9c8b6d]">
              Overview Signals
            </p>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-[52px] rounded-xl" />
                ))}
              </div>
            ) : (
              data.insights.map((item) => (
                <div key={item.label} className="rounded-xl border border-[#e7dfd2] bg-[#faf6ef] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[#7b7467]">{item.label}</p>
                    <p className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {item.value}
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#7b7467]">{item.detail}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HomeAppOverviewSection;
