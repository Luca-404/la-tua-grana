import ColorSwatch from "@/components/ColorSwatch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BuyVsRentResults } from "@/lib/investment/types";
import { formatNumber } from "@/lib/utils";
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

export function AssetsChart({ data }: LineChartProps) {
  const [chartData, setChartData] = useState<{ year: number; house: number; rent: number }[]>([]);
  // const isMobile = useIsMobile();

  useEffect(() => {
    if (data?.annualOverView.length === 0) return;

    const chartData = data.annualOverView.map((item, index) => {
      const houseCosts = Number(item.purchase?.cumulativeCost);
      const rentCosts = Number(item.rent?.cumulativeRent + item.rent?.cumulativeCost);
      const condoFee = Number(item.condoFee?.capital);
      const houseValue = Number(item.purchase.housePrice?.capital);
      const houseOpportunityCost = Number(item.purchase.opportunityCost?.capital ?? 0);
      const rentOpportunityCost = Number(item.rent.opportunityCost?.capital);
      let rentCapital = data.initialCapital;
      if (rentOpportunityCost > 0) rentCapital = rentOpportunityCost;

      return {
        year: index,
        house: Math.round(houseValue + houseOpportunityCost - condoFee - houseCosts),
        rent: Math.round(rentCapital - condoFee - rentCosts),
      };
    });

    setChartData(chartData);
  }, [data]);

  return (
    <Card>
      <CardHeader className="w-full justify-center">
        <CardTitle className="text-xl md:text-2xl">Patrimonio</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" type="number" />
            <YAxis tickLine={false} tickMargin={8} tickCount={3} />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  cursor={true}
                  labelFormatter={(_, payload) => {
                    return "Anno " + ((payload[0]?.payload.year as number) + 1);
                  }}
                  formatter={(value, name, item) => {
                    const yearData = data.annualOverView[item.payload.year];
                    const houseCosts = yearData.purchase?.cumulativeCost;
                    const rentCosts = yearData.rent?.cumulativeRent + yearData.rent?.cumulativeCost;
                    const condoFee = yearData.condoFee?.capital;
                    const houseValue = yearData.purchase.housePrice?.capital;
                    const houseOpportunityCost = Number(yearData.purchase.opportunityCost?.capital);
                    const rentOpportunityCost = Number(yearData.rent.opportunityCost?.capital);

                    let costs = -condoFee;
                    let investment = 0;
                    if (name === "house") {
                      investment = houseOpportunityCost;
                      costs -= houseCosts;
                    } else if (name === "rent") {
                      investment = rentOpportunityCost;
                      costs -= rentCosts;
                    }
                    return (
                      <div className="flex flex-col">
                        {name === "house" && (
                          <div className="flex items-center gap-2">
                            <ColorSwatch color={item.color} />
                            <div>Valore immobile</div>
                            <div className="ml-auto flex items-baseline tabular-nums">
                              {formatNumber(houseValue)} €
                            </div>
                          </div>
                        )}
                        {investment > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <ColorSwatch color={item.color} />
                            Capitale investito
                            <div className="ml-auto flex items-baseline gap-1 tabular-nums text-foreground">
                              {formatNumber(investment)} €
                            </div>
                          </div>
                        )}
                        {(name === "rent" && !investment) && (
                          <div className="flex items-center gap-2">
                            <ColorSwatch color={item.color} />
                            <div>Capitale iniziale</div>
                            <div className="ml-auto flex items-baseline tabular-nums">
                              {formatNumber(data.initialCapital)} €
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <ColorSwatch color={item.color} />
                          <div>Costi {chartConfig[name as keyof typeof chartConfig]?.label || name}</div>
                          <div className="ml-auto flex items-baseline gap-1">{formatNumber(costs)} €</div>
                        </div>
                        <div className="flex basis-full items-center border-t py-1.5 mt-2 gap-2">
                          <ColorSwatch color={item.color} />
                          Capitale totale
                          <div className="ml-auto flex items-baseline font-bold tabular-nums">
                            {formatNumber(value as string)} €
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Line dataKey="house" type="monotone" stroke={chartConfig.house.color} strokeWidth={2} dot={false} />
            <Line dataKey="rent" type="monotone" stroke={chartConfig.rent.color} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
