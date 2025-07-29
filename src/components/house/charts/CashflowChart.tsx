import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
// import useIsMobile from "@/lib/customHooks/mobile";
import { FinalResults } from "@/pages/MortgageVsRent";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  year: {
    label: "Anno",
  },
  house: {
    label: "Acquisto",
    color: "var(--deposit)",
  },
  rent: {
    label: "Affitto",
    color: "var(--fund)",
  },
} satisfies ChartConfig;

type LineChartProps = {
  data: FinalResults;
};

export function CashflowChart({ data }: LineChartProps) {
  const [chartData, setChartData] = useState<{ year: number; house: number; rent: number }[]>([]);
  // const isMobile = useIsMobile();

  useEffect(() => {
    if (!data || data.annualOverView.length === 0) return;

    const chartData = data.annualOverView.map((item, index) => {
      const condoFee = Math.round(Number(data.annualOverView[index].condoFee?.capital ?? 0));
      const houseTotal = Math.round(Number(item.purchaseCosts?.cashflow ?? 0));
      const rentTotal = Math.round(Number(item.rentCost?.cashflow ?? 0));

      return {
        year: index,
        house: houseTotal + condoFee,
        rent: rentTotal + condoFee,
      };
    });

    setChartData(chartData);
  }, [data]);

  return (
    <Card>
      <CardHeader className="w-full justify-center">
        <CardTitle className="text-xl md:text-2xl">Cashflow</CardTitle>
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
