"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TFRYearlyData } from "@/lib/tax";
import { useEffect, useState } from "react";

type CapitalChartProps = {
  data: TFRYearlyData[];
  year: number;
};

const chartConfig = {
  desktop: {
    label: "Gain",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Cost",
    color: "hsl(var(--chart-2))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export function GainAndLossChart({ data, year }: CapitalChartProps) {
  const [chartData, setChartData] = useState<
    { name: string; gain: number; cost: number }[]
  >([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const lastYear = data[year - 1];
    setChartData([
      {
        name: "Fund",
        gain: parseFloat(lastYear.fund.gain.toFixed(0)),
        cost: parseFloat(lastYear.fund.cost.toFixed(0)),
      },
      {
        name: "Company",
        gain: parseFloat(lastYear.company.gain.toFixed(0)),
        cost: parseFloat(lastYear.company.cost.toFixed(0)),
      },
    ]);
    if (lastYear.fundWithAddition && lastYear.opportunityCost) {
      setChartData((prev) => [
        ...prev,
        {
          name: "Fondo con contributo aggiuntivo",
          gain: parseFloat(lastYear.fundWithAddition.gain.toFixed(0)),
          cost: parseFloat(lastYear.fundWithAddition.cost.toFixed(0)),
        },
        {
          name: "Costo opportunità",
          gain: parseFloat(lastYear.opportunityCost.endYearCapital.toFixed(0)),
          cost: parseFloat(lastYear.opportunityCost.cost.toFixed(0)),
        },
      ]);
    }
  }, [year, data]);

  return (
    <Card className="w-full justify-center">
      <CardHeader>
        <CardTitle>Guadagni e costi</CardTitle>
        <CardDescription>
          Guadagno e tasse al termine del periodo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="gain" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="gain"
              layout="vertical"
              fill="var(--color-gain)"
              radius={4}
            >
              {/* <LabelList
                dataKey="name"
                position="insideLeft"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              /> */}
              <LabelList
                dataKey="gain"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
            <Bar
              dataKey="cost"
              layout="vertical"
              fill="var(--color-loss)"
              radius={4}
            >
              {/* <LabelList
                dataKey="name"
                position="insideLeft"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              /> */}
              <LabelList
                dataKey="cost"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
