import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TFRYearlyData } from "@/lib/tax";
import useIsMobile from "@/lib/customHooks/mobile";

const chartConfig = {
  year: {
    label: "Anno",
  },
  deposit: {
    label: "Depositato",
    color: "var(--deposit)",
  },
  fund: {
    label: "Fondo",
    color: "var(--fund)",
  },
  company: {
    label: "Azienda",
    color: "var(--company)",
  },
  opportunityCost: {
    label: "Costo opportunità",
    color: "var(--opportunity-cost)",
  },
  fundWithAddition: {
    label: "Fondo con contributo aggiuntivo",
    color: "var(--fund-with-addition)",
  },
} satisfies ChartConfig;

type LineChartProps = {
  data: TFRYearlyData[];
  isAdvancedOptionOn: boolean;
};

export function CapitalFundLineChart({ data, isAdvancedOptionOn }: LineChartProps) {
  const [chartData, setChartData] = useState<
    { year: number; fund: number; company: number; fundWithAddition?: number; opportunityCost?: number }[]
  >([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const hasAddition = isAdvancedOptionOn && data[0].fundWithAddition;
    const chartData = data.map((item, index) => ({
      year: index,
      deposit: Number(item.tfr),
      fund: Number(item.fund.netTFR.toFixed(0)),
      company: Number(item.company.netTFR.toFixed(0)),
      fundWithAddition: data[0].fundWithAddition ? Number(item.fundWithAddition?.netTFR.toFixed(0)) : undefined,
      opportunityCost: hasAddition ? Number(item.opportunityCost?.endYearCapital.toFixed(0)) : undefined,
    }));

    setChartData(chartData);
  }, [data, isAdvancedOptionOn]);

  return (
    <ChartContainer config={chartConfig}>
      {/* <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
            <Area
              dataKey="fund"
              type="natural"
              fill="var(--chart-1)"
            //   fillOpacity={0.2}
              stroke="var(--chart-1)"
              stackId="a"
            />
            <Area
              dataKey="company"
              type="natural"
              fill="var(--chart-2)"
            //   fillOpacity={0.2}
              stroke="var(--chart-2)"
              stackId="b"
            />
            <Area
              dataKey="opportunityCost"
              type="natural"
              fill="var(--chart-3)"
              fillOpacity={0.1}
              stroke="var(--chart-3)"
              stackId="a"
            />
          </AreaChart> */}
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
        <Line dataKey="company" type="monotone" stroke={chartConfig.company.color} strokeWidth={2} dot={false} />
        <Line
          dataKey="fundWithAddition"
          type="monotone"
          stroke={chartConfig.fundWithAddition.color}
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="opportunityCost"
          type="monotone"
          stroke={chartConfig.opportunityCost.color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
