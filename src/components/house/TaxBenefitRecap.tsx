import { Card, CardContent } from "@/components/ui/card";
import { BuyVsRentResults } from "@/lib/investment/types";
import { formatCurrency } from "@/lib/utils";
import { highlightMetric } from "./utils";

interface TaxBenefitRecapProps {
  data: BuyVsRentResults;
  year: number;
  className: string;
}
export function TaxBenefitRecap({ data, year, className }: TaxBenefitRecapProps) {
  const firstYear = data.annualOverView[0] ?? 0;
  const yearData = data.annualOverView[year - 1] ?? 0;
  const purchase = {
    firstYear: firstYear.purchase.cumulativeTaxBenefit ?? 0,
    year: yearData.purchase.cumulativeTaxBenefit ?? 0,
  };
  const rent = {
    firstYear: firstYear.rent.taxBenefit ?? 0,
    year: yearData.rent.taxBenefit ?? 0,
  };

  return (
    <>
      <div className="col-span-4 text-3xl text-center font-bold">Detrazioni</div>
      <Card className={className}>
        <CardContent className="grid grid-cols-2 gap-4 text-xl font-bold text-center col-span-2 md:col-span-1 rounded-2xl p-4">
          <div className="text-2xl font-bold col-span-2 md:col-span-1">Acquisto</div>
          <div className="text-2xl font-bold col-span-2 md:col-span-1">Affitto</div>

          <div>1° Anno <span className={highlightMetric(purchase.firstYear, rent.firstYear)}>{formatCurrency(purchase.firstYear)}</span></div>
          <div>1° Anno <span className={highlightMetric(rent.firstYear, purchase.firstYear)}>{formatCurrency(rent.firstYear)}</span></div>
          <div>Cumulativi <span className={highlightMetric(purchase.year, rent.year)}>{formatCurrency(purchase.year)}</span></div>
          <div>Cumulativi <span className={highlightMetric(rent.year, purchase.year)}>{formatCurrency(rent.year)}</span></div>
        </CardContent>
      </Card>
    </>
  );
}
