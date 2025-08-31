import { BuyVsRentResults } from "@/lib/investment/types";
import { useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig } from "../ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InvestmentCharts } from "./charts/InvestmentCharts";
import { RadialCostChart } from "./charts/RadialCostChart";

interface YearDetailsCardProps {
  data: BuyVsRentResults;
  className?: string;
}

const costChartConfig = {
  initial: {
    label: "Iniziali",
    color: "var(--chart-1)",
  },
  cumulative: {
    label: "Cumulativi",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function YearDetailsCard({ data, className }: YearDetailsCardProps) {
  const [year, setYear] = useState<number>(data.annualOverView.length);
  const firstYear = data.annualOverView[0] ?? 0;
  const yearData = data.annualOverView[year - 1] ?? 0;

  const purchaseCostData = [
    {
      value: "Acquisto",
      initial: firstYear.purchase.cumulativeCost - (firstYear.purchase.annualTaxBenefit ?? 0),
      cumulative: yearData.purchase.cumulativeCost - (yearData.purchase.annualTaxBenefit ?? 0),
    },
  ];
  // if (firstYear.purchase.mortgage) {
  //   purchaseCostData.push({
  //     value: "Mutuo",
  //     initial: firstYear.purchase.mortgage.openCosts - (firstYear.purchase.mortgage.taxBenefit ?? 0),
  //     cumulative: yearData.purchase.mortgage.cumulativeCost - (yearData.purchase.annualTaxBenefit ?? 0),
  //   });
  // }
  const rentCostData = [
    {
      value: "Affitto",
      initial: firstYear.rent.cumulativeCost + firstYear.rent.cumulativeRent,
      cumulative: yearData.rent.cumulativeCost + yearData.rent.cumulativeRent,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Resosconto dell'anno selezionato</CardTitle>
        <CardAction>
          <Select onValueChange={(value) => setYear(Number(value))} value={String(year)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona l'anno" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: data.annualOverView.length }).map((_, i) => {
                const yearOption = i + 1;

                if (yearOption % 5 === 0 || yearOption === data.annualOverView.length) {
                  return (
                    <SelectItem key={yearOption} value={String(yearOption)}>
                      Anno {yearOption}
                    </SelectItem>
                  );
                }
                return null;
              })}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {/* <InitialCapitalData data={data} /> */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 text-3xl text-center font-bold">Costi</div>
          {/* <RadialCostChart chartData={purchaseCostData} chartConfig={costChartConfig} /> */}
          <RadialCostChart chartData={purchaseCostData} chartConfig={costChartConfig} />
          <RadialCostChart chartData={rentCostData} chartConfig={costChartConfig} />
          <InvestmentCharts year={year} yearData={yearData} />
        </div>
      </CardContent>
    </Card>
  );
}
