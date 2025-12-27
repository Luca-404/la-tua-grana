import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { BuyVsRentResults } from "@/lib/investment/types";
import { getAgencyTaxBenefit } from "@/lib/taxes/taxCalculators";
import { RadialCostChart } from "./charts/RadialCostChart";

interface CostRecapProps {
  data: BuyVsRentResults;
  year: number;
  className: string;
}

const houseChartConfig = {
  agency: {
    label: "Agenzia",
    color: "var(--chart-1)",
  },
  notary: {
    label: "Notaio",
    color: "var(--chart-2)",
  },
  taxes: {
    label: "Imposte",
    color: "var(--chart-5)",
  },
  maintenance: {
    label: "Manutenzione",
    color: "var(--chart-4)",
  },
  renovation: {
    label: "Ristrutturazione",
    color: "var(--chart-6)",
  },
  mortgage: {
    label: "Mutuo",
    color: "var(--chart-3)",
  },
  condoFee: {
    label: "Spese condominiali",
    color: "var(--chart-7)",
  },
} satisfies ChartConfig;

const rentChartConfig = {
  agency: {
    label: "Agenzia",
    color: "var(--chart-1)",
  },
  rent: {
    label: "Affitto",
    color: "var(--chart-2)",
  },
  taxes: {
    label: "Imposte",
    color: "var(--chart-5)",
  },
  condoFee: {
    label: "Spese condominiali",
    color: "var(--chart-7)",
  },
} satisfies ChartConfig;

const houseCumulativeChartConfig = {
  costs: {
    label: "Costi generici",
    color: "var(--chart-1)",
  },
  maintenance: {
    label: "Manuetenzione",
    color: "var(--chart-4)",
  },
  taxes: {
    label: "Imposte",
    color: "var(--chart-5)",
  },
  mortgage: {
    label: "Mutuo",
    color: "var(--chart-3)",
  },
  condoFee: {
    label: "Spese condominiali",
    color: "var(--chart-7)",
  },
} satisfies ChartConfig;

const rentCumulativeChartConfig = {
  costs: {
    label: "Costi generici",
    color: "var(--chart-1)",
  },
  rent: {
    label: "Affitto",
    color: "var(--chart-2)",
  },
  taxes: {
    label: "Imposte",
    color: "var(--chart-5)",
  },
  condoFee: {
    label: "Spese condominiali",
    color: "var(--chart-7)",
  },
} satisfies ChartConfig;

export function CostRecap({ data, year, className }: CostRecapProps) {
  if (!data) return null;
  const firstYear = data.annualOverView[0];
  const yearData = data.annualOverView[year - 1];

  const agency = data.initialCosts.purchase.agency;
  
  const lastMortgageYearIndex = data.annualOverView.findIndex(d => d.purchase.mortgage);
  const openCosts = data.annualOverView[0]?.purchase.mortgage?.openCosts ?? 0;
  const finalMortgageData = lastMortgageYearIndex !== -1 
    ? data.annualOverView[lastMortgageYearIndex].purchase.mortgage
    : null;
  const cumulativeInterest = yearData.purchase.mortgage
    ? (yearData.purchase.mortgage.cumulativeInterestPaid ?? 0)
    : (finalMortgageData?.cumulativeInterestPaid ?? 0) + openCosts;

  const purchaseCosts = [
    {
      value: "Acquisto",
      agency: agency - getAgencyTaxBenefit(agency),
      notary: data.initialCosts.purchase.notary,
      renovation: data.initialCosts.purchase.renovation,
      taxes: firstYear.purchase.cumulativeTaxes + (firstYear.purchase.opportunityCost?.cumulativeTaxes ?? 0),
      maintenance: firstYear.purchase.cumulativeMaintenance,
      mortgage: (firstYear.purchase.mortgage?.openCosts ?? 0) + (firstYear.purchase.mortgage?.interestPaid ?? 0),
      condoFee: firstYear.condoFee,
    },
  ];
  const purchaseCumulativeCosts = [
    {
      value: "Acquisto",
      costs:
        agency - getAgencyTaxBenefit(agency) +
        data.initialCosts.purchase.notary +
        data.initialCosts.purchase.renovation,
      maintenance: yearData.purchase.cumulativeMaintenance,
      taxes: yearData.purchase.cumulativeTaxes + (yearData.purchase.opportunityCost?.cumulativeTaxes ?? 0),
      mortgage: cumulativeInterest,
      condoFee: yearData.condoFee,
    },
  ];
  const rentCosts = [
    {
      value: "Affitto",
      agency: data.initialCosts.rent.agency,
      rent: firstYear.rent.cumulativeRent,
      taxes: firstYear.rent.opportunityCost?.taxes ?? 0,
      condoFee: firstYear.condoFee,
    },
  ];
  const rentCumulativeCosts = [
    {
      value: "Affitto",
      costs: yearData.rent.cumulativeCosts,
      rent: yearData.rent.cumulativeRent,
      taxes: yearData.rent.opportunityCost?.cumulativeTaxes ?? 0,
      condoFee: yearData.condoFee,
    },
  ];

  return (
    <>
      <div className="col-span-4 text-3xl text-center font-bold">Costi</div>
      <Card className={className}>
        <CardContent className="grid grid-cols-2 gap-4">
          <RadialCostChart
            chartData={purchaseCosts}
            chartConfig={houseChartConfig}
            valueName="1° Anno"
            className="border-0 pb-0 col-span-2 md:col-span-1"
          />
          <RadialCostChart
            chartData={rentCosts}
            chartConfig={rentChartConfig}
            valueName="1° Anno"
            className="border-0 pb-0 col-span-2 md:col-span-1"
          />
          <RadialCostChart
            chartData={purchaseCumulativeCosts}
            chartConfig={houseCumulativeChartConfig}
            valueName="Cumulativi"
            className="border-0 col-span-2 md:col-span-1"
          />
          <RadialCostChart
            chartData={rentCumulativeCosts}
            chartConfig={rentCumulativeChartConfig}
            valueName="Cumulativi"
            className="border-0 col-span-2 md:col-span-1"
          />
        </CardContent>
      </Card>
    </>
  );
}
