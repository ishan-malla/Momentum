import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type TrendPoint = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  description: string;
  valueLabel: string;
  valueSuffix: string;
  data: TrendPoint[];
};

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export default function AdminValueTrendChart({
  title,
  description,
  valueLabel,
  valueSuffix,
  data,
}: Props) {
  const total = data.reduce((sum, point) => sum + point.value, 0);

  return (
    <Card className="rounded-[1.35rem] border-[#ddd6c8] bg-[#fffdfa] py-0 shadow-[0_10px_30px_rgba(57,52,43,0.06)]">
      <CardHeader className="space-y-1 px-5 py-5">
        <CardTitle className="font-heading text-xl text-[#2f3e32]">
          {title}
        </CardTitle>
        <p className="text-sm text-[#7b7467]">
          {description} Total {valueLabel.toLowerCase()}: {total.toLocaleString()}
          {valueSuffix}.
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              tickLine={false}
              tick={{ fill: "#7b7467", fontSize: 12 }}
              width={48}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  valueFormatter={(value) => `${value}${valueSuffix}`}
                />
              }
              cursor={{ fill: "rgba(97,129,100,0.06)" }}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
