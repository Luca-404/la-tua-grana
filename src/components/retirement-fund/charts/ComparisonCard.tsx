import { useEffect, useState } from "react";
import { getCompanyTaxRate, getRetirementFundTaxRate } from "@/lib/taxes/taxCalculators";
import { RetirementSimulation } from "@/lib/taxes/types";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { CapitalChart } from "./CapitalChart";
import { GainAndLossChart } from "./GainAndLossChart";

type ComparisonCardProps = {
  data: RetirementSimulation[];
  isAdvancedOptionOn: boolean;
};

export function ComparisonCard({ data, isAdvancedOptionOn }: ComparisonCardProps) {
  const [year, setYear] = useState<number>(data.length);
  const showGainAdLoss = isAdvancedOptionOn;
  useEffect(() => {
    setYear(data.length);
  }, [data.length]);
  
  return (
    <Card className="w-full justify-center">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Statistiche principali</CardTitle>
        <CardDescription>
          Capitale netto sia sulla tassazione delle plusvalenze che sui depositi al termine del periodo
          selezionato. <br />
          Attualmente la tassazione sul capitale versato è:
          <div className="flex gap-4 mt-2">
            <span>
              fondo pensione: <strong className="text-foreground">{getRetirementFundTaxRate(year)} %</strong>
            </span>
            <span>
              azienda: <strong className="text-foreground">{getCompanyTaxRate(data, year)} %</strong>
            </span>
          </div>
        </CardDescription>
        <CardAction>
          <Select onValueChange={(value) => setYear(Number(value))} value={String(year)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona un periodo" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: data.length }).map((_, i) => {
                const yearOption = i + 1;

                if (yearOption % 5 === 0 || yearOption === data.length) {
                  return (
                    <SelectItem key={yearOption} value={String(yearOption)}>
                      {yearOption} anni
                    </SelectItem>
                  );
                }
                return null;
              })}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-flow-row grid-cols-4 gap-4 pt-2">
        <div className={`col-span-4 md:col-span-${showGainAdLoss ? "2" : "4"} `}>
          <CapitalChart data={data} year={year} isAdvancedOptionOn={isAdvancedOptionOn} />
        </div>
        {showGainAdLoss && (
          <div className="col-span-4 md:col-span-2">
            <GainAndLossChart data={data} year={year} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
