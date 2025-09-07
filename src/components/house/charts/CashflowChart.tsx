import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BuyVsRentResults } from "@/lib/investment/types";
import { formatCurrency } from "@/lib/utils";
// import useIsMobile from "@/lib/customHooks/mobile";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  year: {
    label: "Anno",
  },
  house: {
    label: "Acquisto",
    color: "var(--company)",
  },
  rent: {
    label: "Affitto",
    color: "var(--fund)",
  },
} satisfies ChartConfig;

type LineChartProps = {
  data: BuyVsRentResults;
};

export function CashflowChart({ data }: LineChartProps) {
  const [chartData, setChartData] = useState<{ year: number; house: number; rent: number }[]>([]);
  // const isMobile = useIsMobile();
  const [firstYear, setFirstYear] = useState<{ year: number; house: number; rent: number } | null>(null);

  useEffect(() => {
    if (data?.annualOverView.length === 0) return;
    const chartData = data.annualOverView
      .map((item, index) => {
        const condoFee = item.condoFee?.capital;
        const houseCosts = item.purchase?.cashflow;
        const rentCosts = item.rent?.cashflow;
        return {
          year: index,
          house: Math.round(houseCosts - condoFee),
          rent: Math.round(rentCosts - condoFee),
        };
      })
      .filter((item): item is { year: number; house: number; rent: number } => item !== undefined);
    setFirstYear(chartData[0]);
    setChartData(chartData.slice(1));
  }, [data]);

  return (
    <Card>
      <CardHeader className="w-full justify-center">
        <CardTitle className="text-center text-xl md:text-2xl">Cashflow</CardTitle>
        <CardDescription>
          {firstYear && (
            <>
              Nel <b className="text-foreground">primo anno</b> il costo per l'acquisto è pari a
              <b className="text-foreground"> {formatCurrency(firstYear.house)}</b>, mentre quello per l'affitto è
              di
              <b className="text-foreground"> {formatCurrency(firstYear.rent)}</b>.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" type="number" />
            <YAxis tickLine={false} tickMargin={8} tickCount={3} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    return "Anno " + ((payload[0]?.payload.year as number) + 1);
                  }}
                />
              }
              cursor={false}
              defaultIndex={1}
            />
            <Line dataKey="house" type="monotone" stroke={chartConfig.house.color} strokeWidth={2} dot={false} />
            <Line dataKey="rent" type="monotone" stroke={chartConfig.rent.color} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
