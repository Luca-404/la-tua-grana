import { BuyVsRentResults } from "@/lib/investment/types";
import { useEffect, useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AssetsTable } from "./AssetsTable";
import { InvestmentRecap } from "./InvestmentRecap";
import { CostRecap } from "./CostRecap";
import { TaxBenefitRecap } from "./TaxBenefitRecap";

interface YearDetailsRecapProps {
  data: BuyVsRentResults;
  className?: string;
}

export function YearDetailsRecap({ data, className }: YearDetailsRecapProps) {
  const [year, setYear] = useState<number>(data.annualOverView.length);

  useEffect(() => {
    setYear(data.annualOverView.length);
  }, [data.annualOverView.length]);
  const boundedYear = Math.min(Math.max(1, year), Math.max(1, data.annualOverView.length || 1));

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
                      Anno {yearOption}
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
        <div className="grid grid-cols-4 gap-3">
          <CostRecap data={data} year={boundedYear} className="col-span-4" />
          <TaxBenefitRecap data={data} year={boundedYear} className="col-span-4" />
          <InvestmentRecap yearData={data.annualOverView[boundedYear - 1]} year={boundedYear} className="col-span-4 md:col-span-2" />
          <AssetsTable data={data} year={boundedYear} className="col-span-4" />
        </div>
      </CardContent>
    </Card>
  );
}
