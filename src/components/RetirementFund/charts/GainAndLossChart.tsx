import { useFormData } from "@/components/provider/FormDataContext";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import useIsMobile from "@/lib/customHooks/mobile";
import { AssetType, getCapitalGainTaxRate, getCompanyTaxRate, getFundTaxRate, TFRYearlyData } from "@/lib/tax";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type CapitalChartProps = {
  data: TFRYearlyData[];
  year: number;
};

const chartConfig = {
  gain: {
    label: "Guadagno",
    color: "var(--gain)",
  },
  depositTaxes: {
    label: "Imposte sul deposito",
    color: "var(--loss)",
  },
  returnTaxes: {
    label: "Imposte sul rendimento",
    color: "var(--loss)",
  },
} satisfies ChartConfig;

export function GainAndLossChart({ data, year }: CapitalChartProps) {
  const [chartData, setChartData] = useState<
    { name: string; gain: number; depositTaxes: number; returnTaxes: number }[]
  >([]);
  const isMobile = useIsMobile();
  const formData = useFormData();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const lastYear = data[year - 1];
    const depositCompanyTax = getCompanyTaxRate(data, year);
    const depositFundTax = getFundTaxRate(year);
    const depositOpportunityCostTax = getCapitalGainTaxRate(AssetType.EQUITY, formData.opportunityCostEquity);
    const depositTaxes = {
      company: lastYear.tfr * (depositCompanyTax / 100),
      fund: lastYear.tfr * (depositFundTax / 100),
    };
    const returnOpportunityCostTax =
      ((lastYear.opportunityCost?.endYearCapital ?? 0) - (lastYear.opportunityCost?.depositedCapital ?? 0)) *
      (depositOpportunityCostTax / 100);

    setChartData([
      {
        name: "Azienda",
        gain: parseFloat(lastYear.company.gain.toFixed(0)),
        depositTaxes: parseFloat(depositTaxes.company.toFixed(0)),
        returnTaxes: parseFloat(lastYear.company.cost.toFixed(0)),
      },
      {
        name: "Fondo",
        gain: parseFloat(lastYear.fund.gain.toFixed(0)),
        depositTaxes: parseFloat(depositTaxes.fund.toFixed(0)),
        returnTaxes: parseFloat(lastYear.fund.cost.toFixed(0)),
      },
    ]);
    if (lastYear.fundWithAddition && lastYear.opportunityCost) {
      setChartData((prev) => [
        ...prev,
        {
          name: "Costo opportunità",
          gain: parseFloat((lastYear.opportunityCost?.endYearCapital ?? 0).toFixed(0)),
          depositTaxes: parseFloat((lastYear.opportunityCost?.cost ?? 0).toFixed(0)),
          returnTaxes: parseFloat(returnOpportunityCostTax.toFixed(0)),
        },
        {
          name: "Fondo con contributo",
          gain: parseFloat((lastYear.fundWithAddition?.gain ?? 0).toFixed(0)),
          depositTaxes: parseFloat(depositTaxes.fund.toFixed(0)),
          returnTaxes: parseFloat((lastYear.fundWithAddition?.cost ?? 0).toFixed(0)),
        },
      ]);
    }
  }, [year, data, formData.opportunityCostEquity]);

  // const CustomXAxisTick = (props: any) => {
  //   const { x, y, payload } = props;
  //   const words = payload.value.split(" ");
  //   return (
  //     <g transform={`translate(${x},${y})`}>
  //       <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
  //         {words.map((word: string, idx: number) => (
  //           <tspan x={0} dy={idx === 0 ? 0 : 14} key={idx}>
  //             {word}
  //           </tspan>
  //         ))}
  //       </text>
  //     </g>
  //   );
  // };

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData} layout="horizontal">
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" type="category" />
        {!isMobile && <YAxis dataKey="gain" type="number" axisLine={false} />}
        {/* <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tick={<CustomXAxisTick />} /> */}
        <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="gain" layout="horizontal" fill={chartConfig.gain.color} radius={4} stackId={1}>
          {/* {!isMobile && (
            <LabelList
              dataKey="gain"
              position="insideBottom"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          )} */}
        </Bar>
        <Bar
          dataKey="depositTaxes"
          layout="horizontal"
          fill={chartConfig.depositTaxes.color}
          radius={4}
          stackId={2}
        >
          {/* {!isMobile && (
            <LabelList
              dataKey="depositTaxes"
              position="insideBottom"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          )} */}
        </Bar>
        <Bar dataKey="returnTaxes" layout="horizontal" fill={chartConfig.returnTaxes.color} radius={4} stackId={2}>
          {/* {!isMobile && (
            <LabelList
              dataKey="returnTaxes"
              position="insideBottom"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          )} */}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
