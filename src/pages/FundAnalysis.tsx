import { useState, useRef, useEffect } from "react";
import { ExplanationCard } from "@/components/RetirementFund/ExplanationCard";
import { Filter } from "@/components/RetirementFund/Filter";
import { ComparisonCard } from "@/components/RetirementFund/charts/ComparisonCard";
import { TableOrLineChart } from "@/components/RetirementFund/charts/TableOrLineChart";
import { FormDataProvider } from "@/components/provider/FormDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetType, TFR, TFRYearlyData, calculateCompoundInterest, calculateRevaluationTFR } from "@/lib/tax";
import { RetirementFundFormData } from "@/lib/types";
import { getRandomizedReturn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function FundAnalysis() {
  const [showGraph, setShowGraph] = useState(false);
  const [simulationResult, setSimulationResult] = useState([] as TFRYearlyData[]);
  const [isAdvancedOptionOn, setIsAdvancedOptionOn] = useState(false);
  const [formData, setFormData] = useState<RetirementFundFormData>({
    years: 40,
    ral: 30000,
    personalExtraContribution: 0,
    employerExtraContribution: 0,
    netFundReturn: 0,
    fundReturn: 3,
    fundEquity: 0,
    fundReturnRange: 0,
    opportunityCostReturn: 3,
    opportunityCostEquity: 0,
    opportunityCostRange: 0,
    salaryGrowth: 0,
    inflation: 2,
    inflationRange: 0,
  });

  const simulateBasicTFR = () => {
    const salaryGrowth = formData.salaryGrowth / 100;
    let currentRAL = formData.ral;
    const additionalDeposit = currentRAL * (formData.personalExtraContribution / 100);
    const employerAdditionalDeposit = currentRAL * (formData.employerExtraContribution / 100);
    const addition = additionalDeposit + employerAdditionalDeposit;
    let totalTFR = 0;

    // if (addition > TFR.MAX_DEDUCTION) {
    //   const excess = addition - TFR.MAX_DEDUCTION;
    //   addition -= excess * (getTaxRate(AssetType.INCOME, currentRAL) / 100);
    // }
    const history: TFRYearlyData[] = [
      {
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: 0,
        inflation: 1 - (formData.inflation / 100),
        fund: { netTFR: 0, grossTFR: 0, gain: 0, cost: 0 },
        fundWithAddition: { netTFR: 0, grossTFR: 0, gain: 0, cost: 0 },
        company: { netTFR: 0, grossTFR: 0, gain: 0, cost: 0 },
      },
    ];

    for (let year = 1; year <= formData.years; year++) {
      const tfrIndexation = TFR.REVALUATION_FIXED_RATE + TFR.INFALTION_MULTIPLIER * formData.inflation;
      const annualTFR = currentRAL * TFR.MULTIPLIER;
      const lastYear = history[year - 1];
      const totalNetFundTFR = lastYear?.fund.netTFR;
      const totalNetCompanyTFR = lastYear?.company.netTFR;
      totalTFR += annualTFR;

      history.push({
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: parseFloat(totalTFR.toFixed(0)),
        inflation: lastYear.inflation * (1 - formData.inflation / 100),
        fund: calculateRevaluationTFR(
          {
            newDeposit: annualTFR,
            netCapital: totalNetFundTFR,
            gain: lastYear?.fund.gain,
            cost: lastYear?.fund.cost,
          },
          formData.netFundReturn,
          AssetType.NO_TAXATION,
          formData.fundEquity
        ),
        company: calculateRevaluationTFR(
          {
            newDeposit: annualTFR,
            netCapital: totalNetCompanyTFR,
            gain: lastYear?.company.gain,
            cost: lastYear?.company.cost,
          },
          tfrIndexation,
          AssetType.COMPANY
        ),
      });
      if (formData.personalExtraContribution > 0) {
        const fundWithAddition = calculateRevaluationTFR(
          {
            newDeposit: annualTFR + addition,
            netCapital: lastYear?.fundWithAddition?.netTFR,
            gain: lastYear?.fundWithAddition?.gain,
            cost: lastYear?.fundWithAddition?.cost,
          },
          formData.netFundReturn,
          AssetType.NO_TAXATION,
          formData.fundEquity
        );

        history[history.length - 1].fundWithAddition = fundWithAddition;
      }
      currentRAL *= 1 + salaryGrowth;
    }
    setSimulationResult(history.slice(1));
  };

  const simulateAdvancedTFR = () => {
    const salaryGrowth = formData.salaryGrowth / 100;
    let currentRAL = formData.ral;
    const additionalDeposit = currentRAL * (formData.personalExtraContribution / 100);
    const employerAdditionalDeposit = currentRAL * (formData.employerExtraContribution / 100);
    const addition = additionalDeposit + employerAdditionalDeposit;
    let totalTFR = 0;

    // if (addition > TFR.MAX_DEDUCTION) {
    //   const excess = addition - TFR.MAX_DEDUCTION;
    //   addition -= excess * (getTaxRate(AssetType.INCOME, currentRAL) / 100);
    // }

    const history: TFRYearlyData[] = [
      {
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: 0,
        inflation: 1 - (formData.inflation / 100),
        fund: { netTFR: 0, grossTFR: 0, gain: 0, cost: 0, minus: [{ amount: 0, year: 0 }] },
        company: { netTFR: 0, grossTFR: 0, gain: 0, cost: 0, minus: [{ amount: 0, year: 0 }] },
      },
    ];

    if (formData.personalExtraContribution > 0) {
      history[0].fundWithAddition = { netTFR: 0, grossTFR: 0, gain: 0, cost: 0, minus: [{ amount: 0, year: 0 }] };
      history[0].opportunityCost = { endYearCapital: 0, depositedCapital: 0, cost: 0 };
    }

    for (let year = 1; year <= formData.years; year++) {
      const inflation = formData.inflation + getRandomizedReturn(formData.inflationRange);
      const tfrIndexation = TFR.REVALUATION_FIXED_RATE + TFR.INFALTION_MULTIPLIER * inflation;
      const fundReturn = formData.fundReturn + getRandomizedReturn(formData.fundReturnRange);
      const opportunityCostReturn =
        formData.opportunityCostReturn + getRandomizedReturn(formData.opportunityCostRange);
      const annualTFR = currentRAL * TFR.MULTIPLIER;
      const lastYear = history[year - 1];
      const totalNetFundTFR = lastYear?.fund.netTFR;
      const totalNetCompanyTFR = lastYear?.company.netTFR;
      totalTFR += annualTFR;

      history.push({
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: parseFloat(totalTFR.toFixed(0)),
        inflation: lastYear.inflation * (1 - inflation / 100),
        fund: calculateRevaluationTFR(
          {
            newDeposit: annualTFR,
            netCapital: totalNetFundTFR,
            gain: lastYear?.fund.gain,
            cost: lastYear?.fund.cost,
            minus: lastYear?.fund.minus,
          },
          fundReturn,
          AssetType.FUND,
          year,
          formData.fundEquity
        ),
        company: calculateRevaluationTFR(
          {
            newDeposit: annualTFR,
            netCapital: totalNetCompanyTFR,
            gain: lastYear?.company.gain,
            cost: lastYear?.company.cost,
          },
          tfrIndexation,
          AssetType.COMPANY,
          year
        ),
      });

      if (formData.personalExtraContribution > 0) {
        const fundWithAddition = calculateRevaluationTFR(
          {
            newDeposit: annualTFR + addition,
            netCapital: lastYear?.fundWithAddition?.netTFR,
            gain: lastYear?.fundWithAddition?.gain,
            cost: lastYear?.fundWithAddition?.cost,
            minus: lastYear?.fundWithAddition?.minus,
          },
          fundReturn,
          AssetType.FUND,
          year,
          formData.fundEquity
        );

        const opportunityCost = calculateCompoundInterest(
          lastYear?.opportunityCost,
          additionalDeposit,
          opportunityCostReturn,
          currentRAL,
          AssetType.NO_TAXATION
        );
        history[history.length - 1].fundWithAddition = fundWithAddition;
        history[history.length - 1].opportunityCost = opportunityCost;
      }
      currentRAL *= 1 + salaryGrowth;
    }
    setSimulationResult(history.slice(1));
  };

  const simulateTFR = () => {
    setShowGraph(true);
    if (isAdvancedOptionOn) {
      simulateAdvancedTFR();
    } else {
      simulateBasicTFR();
    }
  };

  function AdSense() {
    const adRef = useRef(null);
    const pushedRef = useRef(false);
    useEffect(() => {
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      if (adRef.current && !pushedRef.current) {
        window.adsbygoogle.push({});
        pushedRef.current = true;
      }
    }, []);
    return (
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9449962329133648"
        data-ad-slot="9817314065"
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={adRef}
      ></ins>
    );
  }

  return (
    <FormDataProvider value={formData}>
      <div className="flex flex-col flex-grow mx-auto px-4 mt-8 gap-6 w-full max-w-screen-xl ">
        <div>
          <Card className="w-full">
            <CardHeader className="w-full justify-center">
              <CardTitle className="text-xl md:text-3xl">Simulazione della previdenza integrativa</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 px-6">
              <Filter
                formData={formData}
                setFormData={setFormData}
                isAdvancedOptionOn={isAdvancedOptionOn}
                toggleInputs={() => setIsAdvancedOptionOn((prev) => !prev)}
                simulateTFR={simulateTFR}
              />
            </CardContent>
          </Card>
          {/* Disclaimer Card */}
          <Card className="w-full my-4">
            <CardContent className="flex items-center justify-center p-6">
              <span className="text-center text-muted-foreground">
                Questa simulazione ha esclusivamente finalità informative e potrebbe non riflettere con precisione
                la realtà.
                <br /> Non rappresenta, né intende costituire in alcun modo una consulenza finanziaria .
              </span>
            </CardContent>
          </Card>
          {showGraph && (
            <div className="flex flex-col gap-4 pb-6">
              <ComparisonCard isAdvancedOptionOn={isAdvancedOptionOn} data={simulationResult} />
              <TableOrLineChart data={simulationResult} isAdvancedOptionOn={isAdvancedOptionOn} />
              <AdSense />
              <ExplanationCard />
            </div>
          )}
        </div>
      </div>
    </FormDataProvider>
  );
}

export default FundAnalysis;
