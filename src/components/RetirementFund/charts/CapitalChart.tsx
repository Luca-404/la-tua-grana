import ColorSwatch from "@/components/ColorSwatch";
import { useFormData } from "@/components/provider/FormDataContext";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import useIsMobile from "@/lib/customHooks/mobile";
import { getTotalNetValue } from '@/lib/investment/investmentCalculator';
import { getCapitalGainTaxRate } from "@/lib/taxes/taxCalculators";
import { AssetType, RetirementSimulation } from "@/lib/taxes/types";
import { formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  nominalCapital: {
    label: "Capitale nominale",
  },
  realCapital: {
    label: "Capitale reale",
  },
  opCostNominalCapital: {
    label: "Capitale nominale costo opportunità",
  },
  opCostRealCapital: {
    label: "Capitale reale costo opportunità",
  },
  fund: {
    label: "Fondo",
    color: "var(--fund)",
  },
  fundWithAddition: {
    label: "Fondo con contributo",
    color: "var(--fund-with-addition)",
  },
  opportunityCost: {
    label: "Costo opportunità",
    color: "var(--opportunity-cost)",
  },
  company: {
    label: "Azienda",
    color: "var(--company)",
  },
} satisfies ChartConfig;

type CapitalChartProps = {
  data: RetirementSimulation[];
  year: number;
  isAdvancedOptionOn: boolean;
};

export function CapitalChart({ data, year, isAdvancedOptionOn }: CapitalChartProps) {
  const formData = useFormData();
  const [chartData, setChartData] = useState<
    {
      name: string;
      nominalCapital: number;
      realCapital: number;
      opCostNominalCapital?: number;
      opCostRealCapital?: number;
      optionalName?: string;
      fill?: string;
    }[]
  >([]);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!data || data.length === 0 || year > data.length || !formData) return;
    const lastYear = data[year - 1];
    const companyNetTFR = getTotalNetValue({asset: AssetType.COMPANY, data: data, year: year});
    const fundNetTFR = getTotalNetValue({asset: AssetType.RETIREMENT_FUND, data: data, year: year});

    setChartData([
      {
        name: "Versato",
        nominalCapital: lastYear.despoited.baseAmount,
        realCapital: lastYear.despoited.baseAmount * lastYear.inflationRate,
        fill: "var(--deposit)",
      },
      {
        name: "Azienda",
        nominalCapital: companyNetTFR,
        realCapital: companyNetTFR * lastYear.inflationRate,
        fill: chartConfig.company.color,
      },
    ]);

    if (lastYear.enhancedRetirementFund) {
      const fundWithAdditionNetTFR = getTotalNetValue({asset: AssetType.ENHANCED_RETIREMENT_FUND, data: data, year: year});
      setChartData((prev) => [
        ...prev,
        {
          name: "Fondo con contributo",
          nominalCapital: fundWithAdditionNetTFR,
          realCapital: fundWithAdditionNetTFR * lastYear.inflationRate,
          fill: chartConfig.fundWithAddition.color,
        },
      ]);
    }
    if (isAdvancedOptionOn && lastYear.opportunityCost && lastYear.despoited.personalAddition) {
      const opportunityCostNet = lastYear.opportunityCost.netValue - 
        ((lastYear.opportunityCost.netValue - lastYear.despoited.personalAddition) * (getCapitalGainTaxRate(AssetType.MIXED, formData.opportunityCostEquity) / 100))

      setChartData((prev) => [
        ...prev,
        {
          name: "Fondo",
          nominalCapital: fundNetTFR,
          realCapital: fundNetTFR * lastYear.inflationRate,
          opCostNominalCapital: opportunityCostNet,
          opCostRealCapital: opportunityCostNet * lastYear.inflationRate,
          // fill: chartConfig.opportunityCost.color,
          optionalName: "Costo opportunità",
        },
      ]);
    } else {
      setChartData((prev) => [
        ...prev,
        {
          name: "Fondo",
          nominalCapital: fundNetTFR,
          realCapital: fundNetTFR * lastYear.inflationRate,
          fill: chartConfig.fund.color,
        },
      ]);
    }
  }, [data, year, isAdvancedOptionOn]);

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData} layout="horizontal" margin={{ left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" type="category" />
        {!isMobile && <YAxis dataKey="nominalCapital" type="number" />}
        <ChartTooltip
          cursor={true}
          content={
            <ChartTooltipContent
              className="w-full"
              cursor={true}
              formatter={(value, name, item, index) => {
                const isFund = item.payload.name === "Fondo";
                return (
                  <>
                    <ColorSwatch color={isFund ? item.fill : item.payload.fill} />
                    {chartConfig[name as keyof typeof chartConfig]?.label || name}
                    <div className="flex items-baseline gap-1 tabular-nums text-foreground">
                      {formatNumber(value as string)} €
                    </div>
                    {index == 1 && name == "opCostNominalCapital" && (
                      <div className="flex basis-full items-center border-t py-1.5 text-xs text-foreground">
                        Capitale nominale totale
                        <div className="ml-auto flex items-baseline gap-0.5 font-bold tabular-nums text-foreground">
                          {formatNumber(item.payload.nominalCapital + item.payload.opCostNominalCapital)} €
                        </div>
                      </div>
                    )}
                    {index == 3 && (
                      <div className="flex basis-full items-center border-t py-1.5 text-xs text-foreground">
                        Capitale reale totale
                        <div className="ml-auto flex items-baseline gap-0.5 font-bold tabular-nums text-foreground">
                          {formatNumber(item.payload.realCapital + item.payload.opCostRealCapital)} €
                        </div>
                      </div>
                    )}
                  </>
                );
              }}
            />
          }
        />
        <Bar dataKey="nominalCapital" layout="horizontal" radius={[0, 0, 4, 4]} stackId="a" fill="var(--fund)" />
        {isAdvancedOptionOn && (
          <Bar
            dataKey="opCostNominalCapital"
            layout="horizontal"
            radius={[4, 4, 0, 0]}
            stackId="a"
            fill="var(--opportunity-cost)"
          >
          </Bar>
        )}
        <Bar dataKey="realCapital" layout="horizontal" radius={[0, 0, 4, 4]} stackId="b" fill="var(--fund)" />
        <Bar
          dataKey="opCostRealCapital"
          layout="horizontal"
          radius={[4, 4, 0, 0]}
          stackId="b"
          fill="var(--opportunity-cost)"
        >
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
