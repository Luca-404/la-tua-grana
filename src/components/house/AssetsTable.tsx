import { calculateGrowthMetrics, getNetCapitalGain, getNetInflationValue } from "@/lib/investment/investmentCalculator";
import { BuyVsRentResults } from "@/lib/investment/types";
import { AssetType } from "@/lib/taxes/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface AssetsTableProps {
  data: BuyVsRentResults;
  year: number;
  className?: string;
}

function getTotalCapitalByYear(data: BuyVsRentResults, year: number, equityRate: number, inflation: number) {
  const yearData = data.annualOverView[year - 1];
  const houseCosts = yearData.purchase?.cumulativeCost;
  const rentCosts = yearData.rent?.cumulativeRent + yearData.rent?.cumulativeCost;
  const condoFee = yearData.condoFee?.capital;
  const houseValue = yearData.purchase.housePrice?.capital;
  const houseOpportunityCost = yearData.purchase.opportunityCost;
  const rentOpportunityCost = yearData.rent.opportunityCost;
  let rentCapital = data.generalInfo.initialCapital;
  if (rentOpportunityCost?.capital) rentCapital = rentOpportunityCost.capital;

  const houseNominalGrossCapital = Math.round(
    houseValue + (houseOpportunityCost?.capital ?? 0) - condoFee - houseCosts
  );
  const purchaseOPNetCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: yearData.purchase.opportunityCost?.contributions ?? 0,
    finalCapital: yearData.purchase.opportunityCost?.capital ?? 0,
    equityRate: equityRate,
  });
  const netHouseSoldValue = 1 - ((data.generalInfo.houseResellingCosts ?? 0) / 100);
  const houseNominalNetCapital = Math.round((houseValue * netHouseSoldValue) + purchaseOPNetCapital - condoFee - houseCosts);
  const houseRealGrossCapital = getNetInflationValue({
    capital: houseNominalGrossCapital,
    inflationRate: inflation,
    years: year,
  })[year - 1];
  const houseRealNetCapital = getNetInflationValue({
    capital: houseNominalNetCapital,
    inflationRate: inflation,
    years: year,
  })[year - 1];

  const rentNominalGrossCapital = Math.round(rentCapital - condoFee - rentCosts);
  const rentNetCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: rentOpportunityCost?.contributions ?? rentCapital,
    finalCapital: rentOpportunityCost?.capital ?? rentCapital,
    equityRate: equityRate,
  });
  const rentNominalNetCapital = Math.round(rentNetCapital - condoFee - rentCosts);
  const rentRealGrossCapital = getNetInflationValue({
    capital: rentNominalGrossCapital,
    inflationRate: inflation,
    years: year,
  })[year - 1];
  const rentRealNetCapital = getNetInflationValue({
    capital: rentNominalNetCapital,
    inflationRate: inflation,
    years: year,
  })[year - 1];

  return {
    house: {
      nominalGross: houseNominalGrossCapital,
      nominalNet: houseNominalNetCapital,
      realGross: houseRealGrossCapital,
      realNet: houseRealNetCapital,
      metrics: calculateGrowthMetrics(data.generalInfo.initialCapital, houseNominalGrossCapital, year),
    },
    rent: {
      nominalGross: rentNominalGrossCapital,
      nominalNet: rentNominalNetCapital,
      realGross: rentRealGrossCapital,
      realNet: rentRealNetCapital,
      metrics: calculateGrowthMetrics(data.generalInfo.initialCapital, rentNominalGrossCapital, year),
    },
  };
}

export function AssetsTable({ data, year, className }: AssetsTableProps) {
  const { house, rent } = getTotalCapitalByYear(data, year, data.generalInfo.investmentEquity, data.generalInfo.inflation);

  const highlight = (val: number, other: number) => {
    if (val >= other) {
      if (val < data.generalInfo.initialCapital) {
        return "text-warning font-semibold";
      }
      return "text-gain font-semibold";
    }
    return "text-loss";
  };

  const highlightMetric = (val: number, other: number) => {
    if (val >= other) {
      if (val <= 0) {
        return "text-warning font-semibold";
      }
      return "text-gain font-semibold";
    }
    return "text-loss";
  };
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Patrimonio</CardTitle>
        <CardDescription>Sull'acquisto è stato ipotizzato un 5% di spese (sul valore dell'immobile) per vendere la casa</CardDescription>
        <div className="text-center text-2xl">Capitale iniziale {formatCurrency(data.generalInfo.initialCapital)}</div>
      </CardHeader>
      <CardContent className="overflow-hidden rounded-2xl md:border shadow-md w-full max-w-4xl mx-auto">
        <Table className="text-xl text-center">
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead className="text-center" colSpan={2}>
                Acquisto
              </TableHead>
              <TableHead className="text-center" colSpan={2}>
                Affitto
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead />
              <TableHead className="text-center">Lordo</TableHead>
              <TableHead className="text-center">Netto</TableHead>
              <TableHead className="text-center">Lordo</TableHead>
              <TableHead className="text-center">Netto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Nominale</TableCell>
              <TableCell className={highlight(house.nominalGross, rent.nominalGross)}>
                {formatCurrency(house.nominalGross)}
              </TableCell>
              <TableCell className={highlight(house.nominalNet, rent.nominalNet)}>
                {formatCurrency(house.nominalNet)}
              </TableCell>
              <TableCell className={highlight(rent.nominalGross, house.nominalGross)}>
                {formatCurrency(rent.nominalGross)}
              </TableCell>
              <TableCell className={highlight(rent.nominalNet, house.nominalNet)}>
                {formatCurrency(rent.nominalNet)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Reale</TableCell>
              <TableCell className={highlight(house.realGross, rent.realGross)}>
                {formatCurrency(house.realGross)}
              </TableCell>
              <TableCell className={highlight(house.realNet, rent.realNet)}>
                {formatCurrency(house.realNet)}
              </TableCell>
              <TableCell className={highlight(rent.realGross, house.realGross)}>
                {formatCurrency(rent.realGross)}
              </TableCell>
              <TableCell className={highlight(rent.realNet, house.realNet)}>
                {formatCurrency(rent.realNet)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>ROI</TableCell>
              <TableCell colSpan={2} className={highlightMetric(house.metrics.roi, rent.metrics.roi)}>
                {formatPercentage(house.metrics.roi)}
              </TableCell>
              <TableCell colSpan={2} className={highlightMetric(rent.metrics.roi, house.metrics.roi)}>
                {formatPercentage(rent.metrics.roi)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
