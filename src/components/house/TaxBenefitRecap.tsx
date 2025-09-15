import { Card, CardContent } from "@/components/ui/card";
import { BuyVsRentResults } from "@/lib/investment/types";
import { formatCurrency } from "@/lib/utils";

interface TaxBenefitRecapProps {
  data: BuyVsRentResults;
  year: number;
  className: string;
}
export function TaxBenefitRecap({ data, year, className }: TaxBenefitRecapProps) {
  const firstYear = data.annualOverView[0] ?? 0;
  const yearData = data.annualOverView[year - 1] ?? 0;
  return (
    <>
      <div className="col-span-4 text-3xl text-center font-bold">Detrazioni</div>
      <Card className={className}>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-2xl font-bold text-center col-span-2 md:col-span-1">Acquisto</div>
          <div className="text-2xl font-bold text-center col-span-2 md:col-span-1">Affitto</div>
          <div className="text-xl font-bold text-center col-span-2 md:col-span-1 border rounded-2xl p-4">
            1° Anno {formatCurrency(firstYear.purchase.cumulativeTaxBenefit)}
          </div>
          <div className="text-xl font-bold text-center col-span-2 md:col-span-1 border rounded-2xl p-4">
            1° Anno {formatCurrency(firstYear.rent.taxBenefit ?? 0)}
          </div>
          <div className="text-xl font-bold text-center col-span-2 md:col-span-1 border rounded-2xl p-4">
            Cumulativi {formatCurrency(yearData.purchase.cumulativeTaxBenefit)}
          </div>
          <div className="text-xl font-bold text-center col-span-2 md:col-span-1 border rounded-2xl p-4">
            Cumulativi {formatCurrency(yearData.rent.taxBenefit ?? 0)}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
