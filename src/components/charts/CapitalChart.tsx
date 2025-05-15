"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
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
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  AssetType,
  getCapitalGainTaxRate,
  getCompanyTaxRate,
  getCompoundNetValue,
  getFundTaxRate,
  TFRYearlyData,
} from "@/lib/tax";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  capital: {
    label: "Capitale netto",
  },
  fund: {
    label: "Fondo",
    color: "hsl(var(--chart-5))",
  },
  fundWithAddition: {
    label: "Fondo con contributo aggiuntivo",
    color: "hsl(var(--chart-1))",
  },
  opportunityCost: {
    label: "Costo opportunità",
    color: "hsl(var(--chart-2))",
  },
  company: {
    label: "Azienda",
    color: "hsl(var(--chart-3))",
  }
} satisfies ChartConfig;

type CapitalChartProps = {
  data: TFRYearlyData[];
  year: number;
  isAdvancedOptionOn: boolean;
};

export function CapitalChart({
  data,
  year,
  isAdvancedOptionOn,
}: CapitalChartProps) {
  const [chartData, setChartData] = useState<
    { name: string; capital: number; fill: string }[]
  >([]);

  const getTotalNetTFR = (net?: number, tax?: number): number => {
    if (!net || !tax) return 0;
    const allNetTFR = data[year - 1].tfr * (1 - tax / 100);
    const lastYearGain = net - data[year - 1].tfr;
    return allNetTFR + lastYearGain;
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const depositCompanyTax = getCompanyTaxRate(data);
    const depositFundTax = getFundTaxRate(year);
    const depositOpportunityCostTax = getCapitalGainTaxRate(
      AssetType.EQUITY,
      20 //TODO: get from data
    );

    const lastYear = data[year - 1];
    setChartData([
      {
        name: "Fondo",
        capital: getTotalNetTFR(lastYear.fund.netTFR, depositFundTax),
        fill: "var(--chart-5)",
      },
      {
        name: "Azienda",
        capital: getTotalNetTFR(lastYear.company.netTFR, depositCompanyTax),
        fill: "var(--chart-3)",
      },
    ]);

    if (isAdvancedOptionOn) {
      setChartData((prev) => [
        ...prev,
        {
          name: "Fondo con contributo aggiuntivo",
          capital: getTotalNetTFR(
            lastYear.fundWithAddition?.netTFR,
            depositFundTax
          ),
          fill: "var(--chart-1)",
        },
        {
          name: "Costo opportunità",
          capital: getCompoundNetValue(
            depositOpportunityCostTax,
            lastYear?.opportunityCost
          ),
          fill: "var(--chart-2)",
        },
      ]);
    }
  }, [data, year]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capitale netto</CardTitle>
        <CardDescription>Capitale netto al termine del periodo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
              hide
            />
            <XAxis dataKey="capital" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {/* <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            /> */}
            <Bar dataKey="capital" layout="vertical" radius={5} stackId="a">
              <LabelList
                dataKey="name"
                position="insideLeft"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
            {/* {data[0].fundWithAddition !== null && 
              <Bar
                layout="vertical"
                dataKey="capital"
                stackId="b"
                fill="var(--color-mobile)"
                radius={[4, 4, 0, 0]}
              />
            } */}
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
