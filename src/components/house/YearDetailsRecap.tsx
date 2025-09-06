import { BuyVsRentResults } from "@/lib/investment/types";
import { useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AssetsTable } from "./AssetsTable";
import { InvestmentRecap } from "./InvestmentRecap";
import { CostRecap } from "./CostRecap";

interface YearDetailsRecapProps {
  data: BuyVsRentResults;
  className?: string;
}

export function YearDetailsRecap({ data, className }: YearDetailsRecapProps) {
  const [year, setYear] = useState<number>(data.annualOverView.length);

  const yearData = data.annualOverView[year - 1] ?? 0;

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
          <CostRecap year={year} data={data} className="col-span-4" />
          <InvestmentRecap year={year} yearData={yearData} className="col-span-2" />
          <AssetsTable data={data} equityRate={60} inflation={2} year={year} className="col-span-4" />
        </div>
      </CardContent>
    </Card>
  );
}
