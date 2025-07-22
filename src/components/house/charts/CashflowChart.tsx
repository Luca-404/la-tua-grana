import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RetirementSimulation } from "@/lib/taxes/types";
import useIsMobile from "@/lib/customHooks/mobile";

const chartConfig = {
  year: {
    label: "Anno",
  },
  house: {
    label: "Depositato",
    color: "var(--deposit)",
  },
  rent: {
    label: "Fondo",
    color: "var(--fund)",
  },
} satisfies ChartConfig;

type LineChartProps = {
  data: RetirementSimulation[];
  isAdvancedOptionOn: boolean;
};

export function CashflowChart({ data, isAdvancedOptionOn }: LineChartProps) {
  const [chartData, setChartData] = useState<
    { year: number; fund: number; company: number; fundWithAddition?: number; opportunityCost?: number }[]
  >([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const hasAddition = isAdvancedOptionOn && data[0].enhancedRetirementFund;
    const chartData = data.map((item, index) => ({
      year: index,
      deposit: Number(item.despoited.baseAmount),
      fund: Number(item.retirementFund.netValue.toFixed(0)),
      company: Number(item.companyFund.netValue.toFixed(0)),
      fundWithAddition: data[0].enhancedRetirementFund ? Number(item.enhancedRetirementFund?.netValue.toFixed(0)) : undefined,
      opportunityCost: hasAddition ? Number(item.opportunityCost?.netValue.toFixed(0)) : undefined,
    }));

    setChartData(chartData);
  }, [data, isAdvancedOptionOn]);

  return (
    <ChartContainer config={chartConfig}>
      <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="year" type="number" />
        {!isMobile && <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />}
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
        <Line dataKey="deposit" type="monotone" stroke={chartConfig.deposit.color} strokeWidth={2} dot={false} />
        <Line dataKey="fund" type="monotone" stroke={chartConfig.fund.color} strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
