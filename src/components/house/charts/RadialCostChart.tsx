import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

interface RadialCostChartProps {
  chartData: chartData[];
  chartConfig: ChartConfig;
  valueName?: string;
  className?: string;
}

type chartData = {
  value: string;
  initial: number;
  cumulative: number;
};

export function RadialCostChart({ chartData, chartConfig, valueName, className }: RadialCostChartProps) {
  const totalVisitors = chartData[0].initial + chartData[0].cumulative;

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0 text-2xl">
        <CardTitle>{chartData[0].value}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 h-full items-center justify-center pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px] max-h-[250px]">
          <RadialBarChart data={chartData} endAngle={180} innerRadius={100} outerRadius={150}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 4}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalVisitors.toLocaleString()} €
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 35} className="fill-muted-foreground text-2xl">
                          {valueName}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="cumulative"
              fill={chartConfig.cumulative.color}
              stackId="a"
              cornerRadius={5}
              className="stroke-transpacumulative stroke-2"
            />
            <RadialBar
              dataKey="initial"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.initial.color}
              className="stroke-transpacumulative stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
