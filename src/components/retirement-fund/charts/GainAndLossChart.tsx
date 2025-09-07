import { useFormData } from "@/components/provider/FormDataContext";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import useIsMobile from "@/lib/customHooks/mobile";
import { getAssetTaxRate, getCapitalGainTaxRate } from "@/lib/taxes/taxCalculators";
import { AssetType, RetirementSimulation } from "@/lib/taxes/types";
import { formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type CapitalChartProps = {
  data: RetirementSimulation[];
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
    if (!data || data.length === 0 || year > data.length) return;

    const lastYear = data[year - 1];
    const depositCompanyTax = getAssetTaxRate({ asset: AssetType.COMPANY, data: data, year: year });
    const depositFundTax = getAssetTaxRate({ asset: AssetType.RETIREMENT_FUND, data: data, year: year });
    const depositTaxes = {
      company: lastYear.despoited.baseAmount * (depositCompanyTax / 100),
      fund: lastYear.despoited.baseAmount * (depositFundTax / 100),
    };
    setChartData([
      {
        name: "Azienda",
        gain: parseFloat(lastYear.companyFund.gain.toFixed(0)),
        depositTaxes: parseFloat(depositTaxes.company.toFixed(0)),
        returnTaxes: parseFloat(lastYear.companyFund.cost.toFixed(0)),
      },
      {
        name: "Fondo",
        gain: parseFloat(lastYear.retirementFund.gain.toFixed(0)),
        depositTaxes: parseFloat(depositTaxes.fund.toFixed(0)),
        returnTaxes: parseFloat(lastYear.retirementFund.cost.toFixed(0)),
      },
    ]);
    if (lastYear.enhancedRetirementFund && lastYear.opportunityCost && lastYear.despoited.personalAddition) {
        const returnOpportunityCostTax = (lastYear.opportunityCost.netValue - lastYear.despoited.personalAddition) 
                                            * (getCapitalGainTaxRate(AssetType.MIXED, formData.opportunityCostEquity) / 100);
      setChartData((prev) => [
        ...prev,
        {
          name: "Costo opportunità",
          gain: parseFloat((lastYear.opportunityCost?.gain ?? 0).toFixed(0)),
          depositTaxes: parseFloat((lastYear.opportunityCost?.cost ?? 0).toFixed(0)),
          returnTaxes: parseFloat(returnOpportunityCostTax.toFixed(0)),
        },
        {
          name: "Fondo con contributo",
          gain: parseFloat((lastYear.enhancedRetirementFund?.gain ?? 0).toFixed(0)),
          depositTaxes: parseFloat(depositTaxes.fund.toFixed(0)),
          returnTaxes: parseFloat((lastYear.enhancedRetirementFund?.cost ?? 0).toFixed(0)),
        },
      ]);
    }
  }, [year, data, formData.opportunityCostEquity]);

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData} layout="horizontal">
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" type="category" />
        {!isMobile && <YAxis dataKey="gain" type="number" axisLine={false} />}
        <ChartTooltip
          cursor={true}
          content={
            <ChartTooltipContent
              className="w-full"
              cursor={true}
              formatter={(value, name, item) => {
                return (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: item.color } as React.CSSProperties}
                    />
                    {chartConfig[name as keyof typeof chartConfig]?.label || name}
                    <div className="flex items-baseline gap-1 tabular-nums text-foreground">
                      {formatNumber(value as string)} €
                    </div>
                    {name == "gain" && (
                      <div className="flex basis-full items-center border-t py-1.5 text-xs text-foreground">
                        Guadagno totale
                        <div className="ml-auto flex items-baseline font-bold tabular-nums text-foreground">
                          {formatNumber(item.payload.gain)} €
                        </div>
                      </div>
                    )}
                    {name == "returnTaxes" && (
                      <div className="flex basis-full items-center border-t pt-1.5 text-xs text-foreground">
                        Imposte totali
                        <div className="ml-auto flex items-baseline font-bold tabular-nums text-foreground">
                          {formatNumber(item.payload.depositTaxes + item.payload.returnTaxes)} €
                        </div>
                      </div>
                    )}
                  </>
                );
              }}
            />
          }
        />
        <Bar dataKey="gain" layout="horizontal" fill={chartConfig.gain.color} radius={4} stackId={1}></Bar>
        <Bar
          dataKey="depositTaxes"
          layout="horizontal"
          fill={chartConfig.depositTaxes.color}
          radius={4}
          stackId={2}
        />
        <Bar
          dataKey="returnTaxes"
          layout="horizontal"
          fill={chartConfig.returnTaxes.color}
          radius={4}
          stackId={2}
        />
      </BarChart>
    </ChartContainer>
  );
}
