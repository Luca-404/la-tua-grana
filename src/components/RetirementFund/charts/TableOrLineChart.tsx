import { useState } from "react";
import { TFRYearlyData } from "@/lib/taxes/types";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { SimulationTable } from "../SimulationTable";
import { CapitalFundLineChart } from "./CapitalFundLineChart";

type ComparisonCardProps = {
  data: TFRYearlyData[];
  isAdvancedOptionOn: boolean;
};

type ChartType = "graph" | "table";

export function TableOrLineChart({ data, isAdvancedOptionOn }: ComparisonCardProps) {
  const [chartType, setChartType] = useState<ChartType>("graph");

  return (
    <Card className="w-full justify-center">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Capitale nominale al netto della gestione patrimoniale</CardTitle>
        <CardDescription>
          Il capitale mostrato è al netto della tassazione annuale, ma al lordo di quella finale sul capitale versato
        </CardDescription>
        <CardAction>
          <Select onValueChange={(value) => setChartType(value as ChartType)} defaultValue="graph">
            <SelectTrigger>
              <SelectValue placeholder="Seleziona un periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="graph">Grafico</SelectItem>
              <SelectItem value="table">Tabella</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-flow-row grid-cols-4 gap-4 pt-2">
        {chartType === "table" ? (
          <div className="col-span-4">
            <SimulationTable data={data} />
          </div>
        ) : (
          <div className="col-span-4">
            <CapitalFundLineChart data={data} isAdvancedOptionOn={isAdvancedOptionOn} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
