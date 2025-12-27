import ColorSwatch from "@/components/ColorSwatch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BuyVsRentResults } from "@/lib/investment/types";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

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

interface CapitalDetail {
  investment: number;
  costs: number;
  capital: number;
  houseValue?: number;
}

export interface PurchaseAndRentCapital {
  year: number;
  house: CapitalDetail & { houseValue: number };
  rent: CapitalDetail;
}

function getPurchaseAndRentCapital(data: BuyVsRentResults): PurchaseAndRentCapital[] {
  return data.annualOverView.map((item, index) => {
    const condoFee = item.condoFee ?? 0;
    const houseCosts = (item.purchase?.cumulativeCost ?? 0) - (item.purchase?.cumulativeTaxBenefit ?? 0) + condoFee + (item.purchase?.opportunityCost?.cumulativeTaxes ?? 0);
    const houseValue = item.purchase?.housePrice?.capital ?? 0;
    const houseOpportunityCost = (item.purchase?.opportunityCost?.capital ?? 0);
    const rentCosts = (item.rent?.cumulativeRent ?? 0) + (item.rent?.cumulativeCosts ?? 0) + condoFee  + (item.rent?.opportunityCost?.cumulativeTaxes ?? 0);
    const rentOpportunityCost = (item.rent?.opportunityCost?.capital ?? 0);
    const rentCapital = rentOpportunityCost > 0 ? rentOpportunityCost : data.generalInfo.initialEquity ?? 0;

    return {
      year: index,
      house: {
        investment: houseOpportunityCost,
        costs: houseCosts,
        houseValue: houseValue,
        capital: houseValue + houseOpportunityCost - houseCosts,
      },
      rent: {
        investment: rentOpportunityCost,
        costs: rentCosts,
        capital: rentCapital - rentCosts,
      },
    };
  });
}

export function AssetsChart({ data }: LineChartProps) {
  const summary = useMemo(() => getPurchaseAndRentCapital(data), [data]);
  const chartData = summary.map((s) => ({
    year: s.year,
    house: s.house.capital,
    rent: s.rent.capital,
  }));

  return (
    <Card>
      <CardHeader className="w-full justify-center">
        <CardTitle className="text-xl md:text-2xl">Patrimonio lordo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" type="number" />
            <YAxis tickLine={false} tickMargin={8} tickCount={3} />
            <ReferenceLine y={data.generalInfo.initialEquity} stroke={"var(--deposit"} />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  cursor={true}
                  labelFormatter={(_, payload) => {
                    return "Anno " + ((payload[0]?.payload.year as number) + 1);
                  }}
                  formatter={(value, name, item) => {
                    const yearData = summary[item.payload.year];
                    let costs = 0;
                    let investment = 0;
                    if (name === "house") {
                      investment = yearData.house.investment;
                      costs -= yearData.house.costs;
                    } else if (name === "rent") {
                      investment = yearData.rent.investment;
                      costs -= yearData.rent.costs;
                    }
                    return (
                      <div className="flex flex-col">
                        {name === "house" && (
                          <div className="flex items-center gap-2">
                            <ColorSwatch color={item.color} />
                            <div>Valore immobile</div>
                            <div className="ml-auto flex items-baseline tabular-nums">
                              {formatCurrency(yearData.house.houseValue)}
                            </div>
                          </div>
                        )}
                        {investment > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <ColorSwatch color={item.color} />
                            Capitale investito
                            <div className="ml-auto flex items-baseline gap-1 tabular-nums text-foreground">
                              {formatCurrency(investment)}
                            </div>
                          </div>
                        )}
                        {name === "rent" && !investment && (
                          <div className="flex items-center gap-2">
                            <ColorSwatch color={item.color} />
                            <div>Capitale</div>
                            <div className="ml-auto flex items-baseline tabular-nums">
                              {formatCurrency(data.generalInfo.initialEquity)}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <ColorSwatch color={item.color} />
                          <div>Costi {chartConfig[name as keyof typeof chartConfig]?.label || name}</div>
                          <div className="ml-auto flex items-baseline gap-1">{formatCurrency(costs)}</div>
                        </div>
                        <div className="flex basis-full items-center border-t py-1.5 mt-2 gap-2">
                          <ColorSwatch color={item.color} />
                          Capitale totale
                          <div className="ml-auto flex items-baseline font-bold tabular-nums">
                            {formatCurrency(value as string)}
                          </div>
                        </div>
                        {name === "rent" && (
                          <div className="flex items-center gap-2">
                            <ColorSwatch color={"var(--deposit"} />
                            <div>Capitale iniziale</div>
                            <div className="ml-auto flex items-baseline gap-1">
                              {formatCurrency(data.generalInfo.initialEquity)}
                            </div>
                          </div>
                        )}
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
