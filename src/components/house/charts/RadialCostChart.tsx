import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { formatNumber } from "@/lib/utils";

type ChartData = Record<string, number | string>;

interface RadialCostChartProps {
  chartData: ChartData[];
  chartConfig: ChartConfig;
  valueName?: string;
  className?: string;
}

export function RadialCostChart({ chartData, chartConfig, valueName, className }: RadialCostChartProps) {
  const fields = Object.keys(chartConfig) as (keyof ChartConfig)[];
  const total = formatNumber(fields.reduce((sum, f) => sum + Number(chartData[0][f] ?? 0), 0));

  const formattedChartData = chartData.map((data) => {
    const copy: ChartData = { ...data };
    fields.forEach((f) => {
      if (typeof copy[f] === "number") {
        copy[f] = Number((copy[f] as number).toFixed(0));
      }
    });
    return copy;
  });

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0 text-2xl">
        <CardTitle className="text-center">{chartData[0].value as string}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 h-full items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px] max-h-[250px]"
        >
          <RadialBarChart
            data={formattedChartData}
            startAngle={180}
            endAngle={0}
            innerRadius={100}
            outerRadius={125}
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) =>
                  viewBox && "cx" in viewBox && "cy" in viewBox && (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 4}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {total} €
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 35}
                        className="fill-muted-foreground text-2xl"
                      >
                        {valueName}
                      </tspan>
                    </text>
                  )
                }
              />
            </PolarRadiusAxis>

            {fields.map((f) => (
              <RadialBar
                key={f}
                dataKey={f}
                stackId="a"
                cornerRadius={5}
                fill={chartConfig[f].color}
                className="stroke-transparent stroke-2"
              />
            ))}
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
