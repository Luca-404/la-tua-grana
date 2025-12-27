import {
  calculateGrowthMetrics,
  getNetCapitalGain,
  getNetInflationValue,
} from "@/lib/investment/investmentCalculator";
import { BuyVsRentResults } from "@/lib/investment/types";
import { AssetType } from "@/lib/taxes/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { HoverQuestionMark } from "../ui/custom/question-mark";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { highlightMetric } from "./utils";

interface AssetsTableProps {
  data: BuyVsRentResults;
  year: number;
  className?: string;
}

function getTotalCapitalByYear(data: BuyVsRentResults, year: number, equityRate: number, inflation: number) {
  const yearData = data.annualOverView[year - 1];
  const buyCosts = yearData.purchase?.cumulativeCost;
  const buyTaxBenefit = yearData.purchase?.cumulativeTaxBenefit ?? 0;
  const rentCosts = yearData.rent?.cumulativeRent + yearData.rent?.cumulativeCosts;
  const rentTaxBenefit = yearData.rent?.taxBenefit ?? 0;
  const condoFee = yearData.condoFee;
  const houseValue = yearData.purchase.housePrice?.capital;
  const buyOpportunityCost = yearData.purchase.opportunityCost;
  const rentOpportunityCost = yearData.rent.opportunityCost;
  let rentCapital = data.generalInfo.initialEquity;
  if (rentOpportunityCost?.capital) rentCapital = rentOpportunityCost.capital;

  // buy
  const buyNominalGrossCapital = Math.round(houseValue + (buyOpportunityCost?.capital ?? 0) + buyTaxBenefit - condoFee - buyCosts);
  const buyOPNetCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: yearData.purchase.opportunityCost?.contributions ?? 0,
    finalCapital: yearData.purchase.opportunityCost?.capital ?? 0,
    equityRate: equityRate,
  });
  const netHouseSoldValue = 1 - (data.generalInfo.houseResellingCosts ?? 0) / 100;
  const buyNominalNetCapital = Math.round(houseValue * netHouseSoldValue + buyOPNetCapital - condoFee - buyCosts);
  const buyRealGrossCapital = getNetInflationValue({
    capital: buyNominalGrossCapital,
    inflationRate: inflation,
    years: year,
  })[year - 1];
  const buyRealNetCapital = getNetInflationValue({
    capital: buyNominalNetCapital,
    inflationRate: inflation,
    years: year,
  })[year - 1];

  // rent
  const rentNominalGrossCapital = Math.round(rentCapital + rentTaxBenefit - condoFee - rentCosts);
  const rentOPNetCapital = getNetCapitalGain({
    assetType: AssetType.MIXED,
    deposited: rentOpportunityCost?.contributions ?? rentCapital,
    finalCapital: rentOpportunityCost?.capital ?? rentCapital,
    equityRate: equityRate,
  });
  const rentNominalNetCapital = Math.round(rentOPNetCapital - condoFee - rentCosts);
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
      nominalGross: buyNominalGrossCapital,
      nominalNet: buyNominalNetCapital,
      realGross: buyRealGrossCapital,
      realNet: buyRealNetCapital,
      metrics: calculateGrowthMetrics({
        initial: data.generalInfo.initialInvestment,
        equityInvested: data.generalInfo.initialEquity,
        additionalEquity:
          (buyOpportunityCost?.contributions ?? 0) -
          (data.annualOverView[0].purchase.opportunityCost?.contributions ?? 0),
        finalValue: buyNominalGrossCapital,
        years: year,
      }),
    },
    rent: {
      nominalGross: rentNominalGrossCapital,
      nominalNet: rentNominalNetCapital,
      realGross: rentRealGrossCapital,
      realNet: rentRealNetCapital,
      metrics: calculateGrowthMetrics({
        initial: data.generalInfo.initialEquity,
        equityInvested: data.generalInfo.initialEquity,
        additionalEquity:
          (rentOpportunityCost?.contributions ?? 0) -
          (data.annualOverView[0].rent.opportunityCost?.contributions ?? 0),
        finalValue: rentNominalGrossCapital,
        years: year,
      }),
    },
  };
}

export function AssetsTable({ data, year, className }: AssetsTableProps) {
  const { house, rent } = getTotalCapitalByYear(
    data,
    year,
    data.generalInfo.stockAllocation,
    data.generalInfo.inflation
  );

  const highlight = (val: number, other: number) => {
    if (val >= other) {
      if (val < data.generalInfo.initialEquity) {
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
        <div className="text-center text-2xl">
          Capitale iniziale {formatCurrency(data.generalInfo.initialEquity)}{" "}
          {data.generalInfo.debt > 0 && `| Prestito iniziale ${formatCurrency(data.generalInfo.debt)}`}
        </div>
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
              <TableCell className="flex items-center justify-center gap-2">
                ROI
                <HoverQuestionMark>
                  Misura la redditività dell'investimento, indipendentemente da chi mette i soldi (equity + debito)
                </HoverQuestionMark>
              </TableCell>
              <TableCell colSpan={2} className={highlightMetric(house.metrics.roi, rent.metrics.roi)}>
                {formatPercentage(house.metrics.roi)}
              </TableCell>
              <TableCell colSpan={2} className={highlightMetric(rent.metrics.roi, house.metrics.roi)}>
                {formatPercentage(rent.metrics.roi)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center justify-center gap-2">
                ROE
                <HoverQuestionMark>
                  Misura la redditività dell'investimento, considerando solo il capitale usato<br/>
                  N.B. per semplicità di calcolo ho usato come capitale finale il patrimonio lordo e non netto
                  {/* inoltre ho considerato i versamenti ulteriori fatti in caso di investimento */}
                </HoverQuestionMark>
              </TableCell>
              <TableCell colSpan={2} className={highlightMetric(house.metrics.roe, rent.metrics.roe)}>
                {formatPercentage(house.metrics.roe)}
              </TableCell>
              <TableCell colSpan={2} className={highlightMetric(rent.metrics.roe, house.metrics.roe)}>
                {formatPercentage(rent.metrics.roe)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
