import Disclaimer from "@/components/Disclaimer";
import { CashflowChart } from "@/components/house/charts/CashflowChart";
import { MortgageVsRentInputs } from "@/components/house/MortgageHome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompoundPerformance, RentCost } from "@/lib/investment/types";
import { useState } from "react";

export interface FinalResults {
  annualOverView: Array<{
    year: number;
    rentCost: RentCost;
    condoFee: CompoundPerformance;
    housePrice: CompoundPerformance;
    purchaseCosts: {
      cashflow: number;
      cumulativeCost: number;
      taxBenefit?: number;
      mortgage?: {
        housePaid: number;
        interestPaid: number;
        remainingBalance: number;
      };
    };
  }>;
  mortgage?: {
    openCosts: number;
    monthlyPayment: number;
  };
  initialCosts: number;
  totalCosts: number;
}

export function MortgageVsRent() {
  const [showGraph, setShowGraph] = useState(false);
  const [results, setResults] = useState<FinalResults | null>(null);

  const handleCalculationsComplete = (finalResults: FinalResults) => {
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
          <CashflowChart data={results} />
          {/* <ExplanationCard /> */}
        </div>
      )}
    </div>
  );
}

export default MortgageVsRent;
