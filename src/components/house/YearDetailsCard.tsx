import { useState } from "react";
import { BuyVsRentResults } from "@/lib/investment/types";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InitialCapitalData } from "./InitialCapitalData";
import { RadialCostChart } from "./charts/RadialCostChart";
import { calculateCAGR } from "@/lib/investment/investmentCalculator";

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

const opportunityCostChartConfig = {
  initial: {
    label: "Depositato",
    color: "var(--chart-1)",
  },
  cumulative: {
    label: "Plus valenza",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function YearDetailsCard({ data, className }: YearDetailsCardProps) {
  const [year, setYear] = useState(data.annualOverView.length - 1);
  const yearData = data.annualOverView[year - 1] ?? 0;
  const firstYear = data.annualOverView[0] ?? 0;

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
  //     cumulative: yearData.purchase.cumulativeCost - (yearData.purchase.annualTaxBenefit ?? 0),
  //   });
  // }
  const rentCostData = [
    {
      value: "Affitto",
      initial: firstYear.rent.cumulativeCost + firstYear.rent.cumulativeRent,
      cumulative: yearData.rent.cumulativeCost + yearData.rent.cumulativeRent,
    },
  ];
  const isOpportunityCost = yearData.purchase.opportunityCost && yearData.rent.opportunityCost;
  const purchaseInvestmentData = [
    {
      value: "Acquisto",
      initial: yearData.purchase.opportunityCost?.totalContributions ?? 0,
      cumulative: yearData.purchase.opportunityCost?.capital ?? 0,
    },
  ];
  const rentInvestmentData = [
    {
      value: "Affitto",
      initial: yearData.rent.opportunityCost?.totalContributions ?? 0,
      cumulative: yearData.rent.opportunityCost?.capital ?? 0,
    },
  ];

  const purchaseAnnualReturn = calculateCAGR(
    yearData.purchase.opportunityCost?.totalContributions ?? 0,
    yearData.purchase.opportunityCost?.capital ?? 0,
    year
  );

  const rentAnnualReturn = calculateCAGR(
    yearData.rent.opportunityCost?.totalContributions ?? 0,
    yearData.rent.opportunityCost?.capital ?? 0,
    year
  );

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
                      {yearOption} anni
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
          <RadialCostChart chartData={purchaseCostData} chartConfig={costChartConfig} />
          <RadialCostChart chartData={rentCostData} chartConfig={costChartConfig} />
          {isOpportunityCost && (
            <>
              <div className="col-span-2 text-3xl text-center font-bold">Investimenti</div>
              <RadialCostChart
                chartData={purchaseInvestmentData}
                chartConfig={opportunityCostChartConfig}
                valueName={`CAGR ${(purchaseAnnualReturn * 100).toFixed(2)} %`}
              />
              <RadialCostChart
                chartData={rentInvestmentData}
                chartConfig={opportunityCostChartConfig}
                valueName={`CAGR ${(rentAnnualReturn * 100).toFixed(2)} %`}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
