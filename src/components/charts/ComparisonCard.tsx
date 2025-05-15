"use client";

import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TFRYearlyData } from "@/lib/tax";
import { useState } from "react";
import { CapitalChart } from "./CapitalChart";
import { GainAndLossChart } from "./GainAndLossChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type ComparisonCardProps = {
  data: TFRYearlyData[];
  isAdvancedOptionOn: boolean;
};

export function ComparisonCard({ data, isAdvancedOptionOn }: ComparisonCardProps) {
  const [year, setYear] = useState<number>(39);

  return (
    <Card className="w-full justify-center">
      <CardHeader className="flex place-content-between gap-2">
        <div>
          <CardTitle className="text-xl">Statistiche principali</CardTitle>
          {/* <CardDescription>
            Guadagno e tasse al termine del periodo
          </CardDescription> */}
        </div>
        <Select
          onValueChange={(value) => setYear(Number(value))}
          defaultValue="40"
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona un periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 anni</SelectItem>
            <SelectItem value="20">20 anni</SelectItem>
            <SelectItem value="30">30 anni</SelectItem>
            <SelectItem value="40">40 anni</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="grid grid-flow-row grid-cols-4 gap-4 pt-2">
        {/* {isAdvancedOptionOn && ( */}
        <div className="col-span-2">
          <CapitalChart data={data} year={year} isAdvancedOptionOn={isAdvancedOptionOn} />
        </div>
        {/* )} */}
        <div className="col-span-2">
          <GainAndLossChart data={data} year={year} />
        </div>
      </CardContent>
      <CardFooter className="flex-col justify-center gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
