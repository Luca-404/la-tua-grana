import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  AssetType,
  TFRYearlyData,
  calculateCompoundInterest,
  calculateRevaluationTFR,
  getTaxRate,
} from "@/lib/tax";
import { ComparisonCard } from "@/components/charts/ComparisonCard";
import { SimulationTable } from "@/components/RetirementFund/SimulationTable";
import { Filter } from "@/components/RetirementFund/Filter";

function FundAnalysis() {
  const [simulationResult, setSimulationResult] = useState(
    [] as TFRYearlyData[]
  );
  const [isAdvancedOptionOn, setIsAdvancedOptionOn] = useState(false);
  const [formData, setFormData] = useState({
    years: 40,
    ral: 30000,
    personalExtraContribution: 0,
    employerExtraContribution: 0,
    fundReturn: 3,
    fundEquity: 0,
    opportunityCostReturn: 3,
    opportunityCostEquity: 0,
    salaryGrowth: 0,
    inflation: 2,
  });
  const [resetKey, setResetKey] = useState(0);

  const simulateTFR = () => {
    const salaryGrowth = formData.salaryGrowth / 100;
    const fundReturn = formData.fundReturn;
    const tfrIndexation = 1.5 + 0.75 * formData.inflation;
    let currentRAL = formData.ral;
    const additionalDeposit =
      currentRAL * (formData.personalExtraContribution / 100);
    const employerAdditionalDeposit =
      currentRAL * (formData.employerExtraContribution / 100);
    let addition = additionalDeposit + employerAdditionalDeposit;
    let totalTFR = 0;

    if (addition > 5164) {
      const excess = addition - 5164;
      addition += excess * (getTaxRate(AssetType.INCOME, currentRAL) / 100);
    }

    const history: TFRYearlyData[] = [
      {
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: 0,
        fund: {
          netTFR: 0,
          grossTFR: 0,
          gain: 0,
          cost: 0,
        },
        company: {
          netTFR: 0,
          grossTFR: 0,
          gain: 0,
          cost: 0,
        },
      },
    ];

    if (formData.personalExtraContribution > 0) {
      history[0].fundWithAddition = {
        netTFR: 0,
        grossTFR: 0,
        gain: 0,
        cost: 0,
      };
      history[0].opportunityCost = {
        endYearCapital: 0,
        depositedCapital: 0,
        cost: 0,
      };
    }

    // this way the whole year deposits are made at the start of the year
    // but interest should be calculated during the year
    for (let year = 1; year <= formData.years; year++) {
      const annualTFR = currentRAL * 0.0691;
      const lastYear = history[year - 1];
      const totalNetFundTFR = lastYear?.fund.netTFR;
      const totalNetCompanyTFR = lastYear?.company.netTFR;
      totalTFR += annualTFR;

      history.push({
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: parseFloat(totalTFR.toFixed(0)),
        fund: calculateRevaluationTFR(
          {
            grossCapital: annualTFR,
            netCapital: totalNetFundTFR,
            gain: lastYear?.fund.gain,
            cost: lastYear?.fund.cost,
          },
          fundReturn,
          isAdvancedOptionOn ? AssetType.FUND : AssetType.NO_TAXATION, // preselect fund returns are net
          formData.fundEquity
        ),
        company: calculateRevaluationTFR(
          {
            grossCapital: annualTFR,
            netCapital: totalNetCompanyTFR,
            gain: lastYear?.company.gain,
            cost: lastYear?.company.gain,
          },
          tfrIndexation,
          AssetType.COMPANY
        ),
      });

      if (formData.personalExtraContribution > 0) {
        const fundWithAddition = calculateRevaluationTFR(
          {
            grossCapital: annualTFR + addition,
            netCapital: lastYear?.fundWithAddition?.netTFR,
            gain: lastYear?.fundWithAddition?.gain,
            cost: lastYear?.fundWithAddition?.cost,
          },
          fundReturn,
          AssetType.FUND,
          formData.fundEquity
        );

        const opportunityCost = calculateCompoundInterest(
          lastYear?.opportunityCost,
          additionalDeposit,
          formData.opportunityCostReturn,
          currentRAL,
          AssetType.INCOME
        );
        history[history.length - 1].fundWithAddition = fundWithAddition;
        history[history.length - 1].opportunityCost = opportunityCost;
      }
      currentRAL *= 1 + salaryGrowth;
    }
    setSimulationResult(history.slice(1));
    setResetKey((prev) => prev + 1); // increment resetKey on each simulation
    console.log("history slice", history.slice(1));
  };

  return (
    <div className="flex flex-col mx-auto px-4 mt-8 gap-6 w-full max-w-screen-xl ">
      <div>
        <Card className="w-full">
          <CardHeader className="w-full justify-center">
            <CardTitle className="text-3xl">
              Simulazione della previdenza integrativa
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
            <Filter
              formData={formData}
              setFormData={setFormData}
              isAdvancedOptionOn={isAdvancedOptionOn}
              toggleInputs={() => setIsAdvancedOptionOn((prev) => !prev)}
              simulateTFR={simulateTFR}
            />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4 pt-2">
          <ComparisonCard
            isAdvancedOptionOn={isAdvancedOptionOn}
            data={simulationResult}
          />
          <SimulationTable data={simulationResult} />
        </div>
      </div>
    </div>
  );
}

export default FundAnalysis;