import { getNetCapitalGain, getNetInflationValue } from "@/lib/investment/investmentCalculator";
import { BuyVsRentResults } from "@/lib/investment/types";
import { AssetType } from "@/lib/taxes/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface AssetsTableProps {
  data: BuyVsRentResults;
  equityRate: number;
  inflation: number;
  year: number;
  className?: string;
}

function getTotalCapitalByYear(data: BuyVsRentResults, year: number) {
  const yearData = data.annualOverView[year];
  const houseCosts = Number(yearData.purchase?.cumulativeCost);
  const rentCosts = Number(yearData.rent?.cumulativeRent + yearData.rent?.cumulativeCost);
  const condoFee = Number(yearData.condoFee?.capital);
  const houseValue = Number(yearData.purchase.housePrice?.capital);
  const houseOpportunityCost = yearData.purchase.opportunityCost;
  const rentOpportunityCost = yearData.rent.opportunityCost;
  let rentCapital = data.initialCapital;
  if (rentOpportunityCost?.capital) rentCapital = rentOpportunityCost.capital;

  return {
    house: {
      contribution: houseOpportunityCost?.totalContributions ?? 0,
      capital: Math.round(houseValue + (houseOpportunityCost?.capital ?? 0) - condoFee - houseCosts),
    },
    rent: {
      contribution: rentOpportunityCost?.totalContributions,
      capital: Math.round(rentCapital - condoFee - rentCosts),
    },
  };
}

function getRealAndNetValues(data: BuyVsRentResults, year: number, equityRate: number, inflation: number) {
  const { house, rent } = getTotalCapitalByYear(data, year);
  const realCapitalByYear = getNetInflationValue({
    capital: house.capital,
    inflationRate: inflation,
    years: year,
  });
  const realGrossCapital = realCapitalByYear[year - 1];
  const realContribuionCapitalByYear = getNetInflationValue({
    capital: house.contribution,
    inflationRate: inflation,
    years: year,
  });
  const realContributionGrossCapital = realContribuionCapitalByYear[year - 1];
  const netNominalCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: house.contribution,
    finalCapital: house.capital,
    equityRate: equityRate,
  });
  const netRealCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: realContributionGrossCapital,
    finalCapital: realGrossCapital,
    equityRate: equityRate,
  });
  // Rent
  const realRentCapitalByYear = getNetInflationValue({
    capital: rent.capital,
    inflationRate: inflation,
    years: year,
  });
  const realRentGrossCapital = realRentCapitalByYear[year - 1];
  const realContributionCapitalByYear = getNetInflationValue({
    capital: rent.contribution ?? 0,
    inflationRate: inflation,
    years: year,
  });
  const realRentContributionGrossCapital = realContributionCapitalByYear[year - 1];
  const netRentNominalCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: rent.contribution ?? 0,
    finalCapital: rent.capital,
    equityRate: equityRate,
  });
  const netRentRealCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: realRentContributionGrossCapital,
    finalCapital: realRentGrossCapital,
    equityRate: equityRate,
  });
  return {
    house: {
      nominalNet: netNominalCapital,
      nominalGross: house.capital,
      realNet: netRealCapital,
      realGross: realGrossCapital,
    },
    rent: {
      nominalNet: netRentNominalCapital,
      nominalGross: rent.capital,
      realNet: netRentRealCapital,
      realGross: realRentGrossCapital,
    },
  };
}



const highlight = (val: number, other: number) => (val >= other ? "text-green-600 font-semibold" : "text-red-600");

export function AssetsTable({ data, equityRate, inflation, year, className }: AssetsTableProps) {
  const { house, rent } = getRealAndNetValues(data, year, equityRate, inflation);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Patrimonio</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden rounded-2xl border shadow-md w-full max-w-4xl mx-auto">
        <Table className="text-xl text-center">
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead className="text-center" colSpan={2}>Acquisto</TableHead>
              <TableHead className="text-center" colSpan={2}>Affitto</TableHead>
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
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
