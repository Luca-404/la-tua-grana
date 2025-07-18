import { useState } from "react";
import Disclaimer from "@/components/Disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MortgageVsRentInputs } from "@/components/MortgageVsRent/MortgageInputs";

export function MortgageVsRent() {
  const [showGraph, setShowGraph] = useState(false);
  return (
      <div className="flex flex-col flex-grow mx-auto px-4 mt-8 gap-6 w-full max-w-screen-xl ">
        <div>
          <Card className="w-full">
            <CardHeader className="w-full justify-center">
              <CardTitle className="text-xl md:text-3xl">Confronto tra affitto e mutuo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 px-6">
              <MortgageVsRentInputs />
              {/* <InputData/> */}
            </CardContent>
          </Card>
          <Disclaimer/>

          {showGraph && (
            <div className="flex flex-col gap-4 pb-6">
              {/* <ComparisonCard isAdvancedOptionOn={isAdvancedOptionOn} data={simulationResult} />
              <TableOrLineChart data={simulationResult} isAdvancedOptionOn={isAdvancedOptionOn} />
              <AdSense />
              <ExplanationCard /> */}
            </div>
          )}
        </div>
      </div>
  );
}

export default MortgageVsRent;
