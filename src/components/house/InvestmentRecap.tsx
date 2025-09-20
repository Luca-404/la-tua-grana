import { ChartConfig } from "@/components/ui/chart";
import { calculateGrowthMetrics } from "@/lib/investment/investmentCalculator";
import { AnnualOverViewItem } from "@/lib/investment/types";
import { RadialCostChart } from "./charts/RadialCostChart";

interface InvestmentRecapProps {
  yearData: AnnualOverViewItem;
  year: number;
  className: string;
}

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

export function InvestmentRecap({ yearData, year, className }: InvestmentRecapProps) {
  if (!yearData.purchase.opportunityCost || !yearData.rent.opportunityCost) {
    return null;
  }

  const opPurchaseCostTotalContribution = yearData.purchase.opportunityCost?.contributions ?? 0
  const purchaseInvestmentData = [
    {
      value: "Acquisto",
      initial: opPurchaseCostTotalContribution,
      cumulative: (yearData.purchase.opportunityCost?.capital ?? 0) - opPurchaseCostTotalContribution,
    },
  ];

  const opRentCostTotalContribution = yearData.rent.opportunityCost?.contributions ?? 0
  const rentInvestmentData = [
    {
      value: "Affitto",
      initial: opRentCostTotalContribution,
      cumulative: (yearData.rent.opportunityCost?.capital ?? 0) - opRentCostTotalContribution,
    },
  ];

  const purchaseMetrics = calculateGrowthMetrics({
    initial: yearData.purchase.opportunityCost?.contributions,
    equityInvested: yearData.purchase.opportunityCost?.contributions,
    finalValue: yearData.purchase.opportunityCost?.capital ?? 0,
    years: year
  });

  const rentMetrics = calculateGrowthMetrics({
    initial: yearData.rent.opportunityCost?.contributions,
    equityInvested: yearData.rent.opportunityCost?.contributions,
    finalValue: yearData.rent.opportunityCost?.capital ?? 0,
    years: year
  });

  return (
    <>
      <div className="col-span-4 text-3xl text-center font-bold">Investimenti</div>
      <RadialCostChart
        chartData={purchaseInvestmentData}
        chartConfig={opportunityCostChartConfig}
        valueName={`CAGR ${((purchaseMetrics.cagr ?? 0) * 100).toFixed(2)} %`}
        className={className}
      />
      <RadialCostChart
        chartData={rentInvestmentData}
        chartConfig={opportunityCostChartConfig}
        valueName={`CAGR ${((rentMetrics.cagr ?? 0) * 100).toFixed(2)} %`}
        className={className}
      />
    </>
  );
}