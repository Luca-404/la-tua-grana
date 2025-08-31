import Disclaimer from "@/components/Disclaimer";
import { AssetsChart } from "@/components/house/charts/AssetsChart";
import { CashflowChart } from "@/components/house/charts/CashflowChart";
import { MortgageVsRentInputs } from "@/components/house/MortgageHome";
import { YearDetailsCard } from "@/components/house/YearDetailsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyVsRentResults } from "@/lib/investment/types";
import { useState } from "react";

export function MortgageVsRent() {
  const [showGraph, setShowGraph] = useState(false);
  const [results, setResults] = useState<BuyVsRentResults | null>(null);

  const handleCalculationsComplete = (finalResults: BuyVsRentResults) => {
    setResults(finalResults);
    console.log("Final Results:", finalResults);
    setShowGraph(true);
  };

  return (
    <div className="flex flex-col flex-grow mx-auto mt-8 w-full max-w-screen-xl ">
      <Card>
        <CardHeader className="w-full justify-center">
          <CardTitle className="text-xl md:text-3xl">Acquisto vs Affitto</CardTitle>
        </CardHeader>
        <CardContent>
          <MortgageVsRentInputs onCalculationsComplete={handleCalculationsComplete} />
        </CardContent>
      </Card>
      <Disclaimer />

      {(showGraph && results !== null) && (
        <div className="flex flex-col gap-4 pb-6">
          {/* <InitialCapitalData data={results} /> */}
          <YearDetailsCard data={results} />
          <AssetsChart data={results} />
          <CashflowChart data={results} />
          {/* <ExplanationCard /> */}
        </div>
      )}
    </div>
  );
}

export default MortgageVsRent;
