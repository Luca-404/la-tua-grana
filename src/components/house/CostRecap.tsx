import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { AnnualOverViewItem, BuyVsRentResults } from "@/lib/investment/types";
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
    label: "Tasse",
    color: "var(--chart-5)",
  },
  maintenance: {
    label: "Manutenzione",
    color: "var(--chart-4)",
  },
  mortgage: {
    label: "Mutuo",
    color: "var(--chart-3)",
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
    label: "Tasse",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const houseCumulativeChartConfig = {
  maintenance: {
    label: "Manuetenzione",
    color: "var(--chart-2)",
  },
  taxes: {
    label: "Tasse",
    color: "var(--chart-5)",
  },
  mortgage: {
    label: "Mutuo",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const rentCumulativeChartConfig = {
  costs: {
    label: "Costi",
    color: "var(--chart-1)",
  },
  rent: {
    label: "Affitto",
    color: "var(--chart-2)",
  },
  taxes: {
    label: "Tasse",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function getCumulativeCosts(data: AnnualOverViewItem[], year: number) {
  return data
    .filter((d) => d.year <= year)
    .reduce(
      (acc, d, idx) => {
        const house = d.purchase.housePrice;
        const mortgage = d.purchase.mortgage;
        const purchaseOC = d.purchase.opportunityCost;
        const rentOC = d.rent.opportunityCost;

        if (mortgage) {
          const annualPayments = mortgage.monthlyPayment * 12;

          acc.purchase.mortgage.initialCosts ||= mortgage.openCosts;
          acc.purchase.mortgage.cumulativeInterest += mortgage.interestPaid;
          acc.purchase.mortgage.cumulativePayments += annualPayments + (idx === 0 ? mortgage.openCosts : 0);
        }

        if (house) {
          acc.purchase.taxes += d.purchase.cumulativeTaxes + (house.taxes ?? 0);
          acc.purchase.maintenance += house.capital * (1 / 100); //TODO get extraordanyMaintenance
        }

        if (purchaseOC && rentOC) {
          acc.purchase.taxes += purchaseOC.taxes ?? 0;
          acc.rent.taxes += rentOC.taxes ?? 0;
        }

        if (idx === 0) {
          acc.purchase.mortgage.cumulativeInterest += mortgage?.openCosts ?? 0;
        }

        return acc;
      },
      {
        purchase: {
          taxes: 0,
          maintenance: 0,
          mortgage: {
            initialCosts: 0,
            cumulativeInterest: 0,
            cumulativePayments: 0,
          },
        },
        rent: {
          taxes: 0,
        },
      }
    );
}

export function CostRecap({ data, year, className }: CostRecapProps) {
  const costs = getCumulativeCosts(data.annualOverView, year);
  const firstYear = data.annualOverView[0] ?? 0;
  const yearData = data.annualOverView[year - 1] ?? 0;

  // CALCOLO SOLO DEI COSTI INIZIALI => ESCLUSO QUELLI DURANTE IL PRIMO ANNO
  // const purchaseStartOpportunityCost = firstYear.purchase.opportunityCost?.contributions ?? 0;
  // const rentStartOpportunityCost = firstYear.rent.opportunityCost?.contributions ?? 0;
  // const purchaseAnnualOpportunityCost =
  //   (secondYear.purchase.opportunityCost?.contributions ?? 0) - purchaseStartOpportunityCost;
  // const rentAnnualyOpportunityCost =
  //   (secondYear.rent.opportunityCost?.contributions ?? 0) - rentStartOpportunityCost;

  // const isStartPurchaseHigher = purchaseStartOpportunityCost > rentStartOpportunityCost;
  // const isAnnualPurchaseHigher = purchaseAnnualOpportunityCost > rentAnnualyOpportunityCost;

  const purchaseCosts = [
    {
      value: "Acquisto",
      agency: data.initialCosts.purchase.agency,
      notary: data.initialCosts.purchase.notary,
      taxes: data.initialCosts.purchase.taxes,
      maintenance: data.initialCosts.purchase.maintenance,
      mortgage: data.initialCosts.purchase.mortgage,
    },
  ];
  const purchaseCumulativeCosts = [
    {
      value: "Acquisto",
      taxes: costs.purchase.taxes,
      maintenance: costs.purchase.maintenance,
      mortgage: costs.purchase.mortgage.cumulativeInterest,
    },
  ];
  const rentCosts = [
    {
      value: "Affitto",
      agency: data.initialCosts.rent.agency,
      rent: firstYear.rent.cumulativeRent,
      taxes: firstYear.rent.opportunityCost?.taxes ?? 0,
    },
  ];
  const rentCumulativeCosts = [
    {
      value: "Affitto",
      rent: yearData.rent.cumulativeRent,
      taxes: costs.rent.taxes,
      costs: yearData.rent.cumulativeCost,
    },
  ];

  return (
    <>
      <div className="col-span-4 text-3xl text-center font-bold">Costi</div>
      <Card className={className}>
        <CardContent className="grid grid-cols-2">
          <RadialCostChart
            chartData={purchaseCosts}
            chartConfig={houseChartConfig}
            valueName="Inziali"
            className="border-0 pb-0 col-span-2 md:col-span-1"
          />
          <RadialCostChart
            chartData={rentCosts}
            chartConfig={rentChartConfig}
            valueName="Inziali"
            className="border-0 pb-0 col-span-2 md:col-span-1"
          />
          <RadialCostChart
            chartData={purchaseCumulativeCosts}
            chartConfig={houseCumulativeChartConfig}
            valueName="Cumulativi"
            className="border-0 pt-0 col-span-2 md:col-span-1"
          />
          <RadialCostChart
            chartData={rentCumulativeCosts}
            chartConfig={rentCumulativeChartConfig}
            valueName="Cumulativi"
            className="border-0 pt-0 col-span-2 md:col-span-1"
          />
        </CardContent>
      </Card>
    </>
  );
}
