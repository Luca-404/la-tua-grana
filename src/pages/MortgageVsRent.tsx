import { useState } from "react";
import Disclaimer from "@/components/Disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MortgageVsRentInputs } from "@/components/house/MortgageHome";

export function MortgageVsRent() {
  const [showGraph, setShowGraph] = useState(false);
  return (
    <div className="flex flex-col flex-grow mx-auto mt-8 w-full max-w-screen-xl ">
      <Card>
        <CardHeader className="w-full justify-center">
          <CardTitle className="text-xl md:text-3xl">Acquisto vs Affitto</CardTitle>
        </CardHeader>
        <CardContent>
          <MortgageVsRentInputs />
        </CardContent>
      </Card>
      <Disclaimer />

      {showGraph && (
        <div className="flex flex-col gap-4 pb-6">
          {/* <ComparisonCard isAdvancedOptionOn={isAdvancedOptionOn} data={simulationResult} />
              <TableOrLineChart data={simulationResult} isAdvancedOptionOn={isAdvancedOptionOn} />
              <ExplanationCard /> */}
        </div>
      )}
    </div>
  );
}

export default MortgageVsRent;
