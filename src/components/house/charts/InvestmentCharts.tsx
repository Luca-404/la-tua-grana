import { calculateCAGR } from "@/lib/investment/investmentCalculator";
import { AnnualOverViewItem } from "@/lib/investment/types";
import { RadialCostChart } from "./RadialCostChart";
import { ChartConfig } from "@/components/ui/chart";

interface InvestmentChartsProps {
  yearData: AnnualOverViewItem;
  year: number;
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

export function InvestmentCharts({ yearData, year }: InvestmentChartsProps) {
  if (!yearData.purchase.opportunityCost || !yearData.rent.opportunityCost) {
    return null;
  }

  const opPurchaseCostTotalContribution = yearData.purchase.opportunityCost?.totalContributions ?? 0
  const purchaseInvestmentData = [
    {
      value: "Acquisto",
      initial: opPurchaseCostTotalContribution,
      cumulative: (yearData.purchase.opportunityCost?.capital ?? 0) - opPurchaseCostTotalContribution,
    },
  ];

  const opRentCostTotalContribution = yearData.rent.opportunityCost?.totalContributions ?? 0
  const rentInvestmentData = [
    {
      value: "Affitto",
      initial: opRentCostTotalContribution,
      cumulative: (yearData.rent.opportunityCost?.capital ?? 0) - opRentCostTotalContribution,
    },
  ];

  const purchaseAnnualReturn = calculateCAGR(
    yearData.purchase.opportunityCost?.totalContributions,
    yearData.purchase.opportunityCost?.capital ?? 0,
    year
  );

  const rentAnnualReturn = calculateCAGR(
    yearData.rent.opportunityCost?.totalContributions,
    yearData.rent.opportunityCost?.capital ?? 0,
    year
  );

  return (
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
  );
}