"use client";

import {Bar, BarChart, XAxis, YAxis} from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {TFRYearlyData} from "@/utils/tax";
import {useEffect, useState} from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

// const chartData = [
//   { browser: "fund", capital: 275, fill: "var(--chart-5)" },
//   { browser: "fundWithAddition", capital: 275, fill: "var(--chart-1)" },
//   { browser: "company", capital: 200, fill: "var(--chart-3)" },
// ]

const chartConfig = {
    capital: {
        label: "Capitale netto",
    },
    fund: {
        label: "Fondo",
        color: "hsl(var(--chart-1))",
    },
    fundWithAddition: {
        label: "Fondo con contributo aggiuntivo",
        color: "hsl(var(--chart-2))",
    },
    company: {
        label: "Azienda",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

type CapitalChartProps = {
    data: TFRYearlyData[];
};

export function CapitalChart({data}: CapitalChartProps) {
    const [chartData, setChartData] = useState<
        { investment: string; capital: number; fill: string }[]
    >([]);
    const [year, setYear] = useState<number>(9);

    useEffect(() => {
        if (!data || data.length === 0) return;
        setChartData([
            {
                investment: "fund",
                capital: data[year - 1].fund.netCapital,
                fill: "var(--chart-5)",
            },
            {
                investment: "fundWithAddition",
                capital: data[year - 1].fund.netCapital,
                fill: "var(--chart-1)",
            },
            {
                investment: "company",
                capital: data[year - 1].company.netCapital,
                fill: "var(--chart-3)",
            },
        ]);
    }, [data, year]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Capitale netto</CardTitle>
                <CardDescription>Capitale netto al termine del periodo</CardDescription>
                <div className="flex justify-center">
                    <Select onValueChange={(value) => setYear(Number(value))} defaultValue="10">
                        <SelectTrigger>
                            <SelectValue placeholder="Seleziona un periodo"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 anni</SelectItem>
                            <SelectItem value="20">20 anni</SelectItem>
                            <SelectItem value="30">30 anni</SelectItem>
                            <SelectItem value="40">40 anni</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                            dataKey="investment"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                                chartConfig[value as keyof typeof chartConfig]?.label
                            }
                        />
                        <XAxis dataKey="capital" type="number" hide/>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel/>}
                        />
                        <Bar dataKey="capital" layout="vertical" radius={5}/>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
        </Card>
    );
}
