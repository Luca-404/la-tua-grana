import Disclaimer from "@/components/Disclaimer";
import { ExplanationCard } from "@/components/RetirementFund/ExplanationCard";
import { Filter } from "@/components/RetirementFund/Filter";
import { ComparisonCard } from "@/components/RetirementFund/charts/ComparisonCard";
import { TableOrLineChart } from "@/components/RetirementFund/charts/TableOrLineChart";
import { FormDataProvider } from "@/components/provider/FormDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TFR } from "@/lib/investment/constants";
import { calculateNextYearInvestment } from "@/lib/investment/investmentCalculator";
import { RetirementFundFormData } from "@/lib/investment/types";
import { AssetType, RetirementSimulation } from "@/lib/taxes/types";
import { getRandomizedReturn } from "@/lib/utils";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function RetirementFund() {
  const [showGraph, setShowGraph] = useState(false);
  const [simulationResult, setSimulationResult] = useState([] as RetirementSimulation[]);
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

  useEffect(() => {
    if (showGraph && simulationResult.length > 0) {
      const disclaimerElement = document.getElementById("disclaimerSection");
      const navBarElement = document.getElementById("navBar");
      if (disclaimerElement) {
        const elementRect = disclaimerElement.getBoundingClientRect();
        const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        const offset = navBarElement?.getBoundingClientRect().height ?? 100;
        const targetScrollPosition = elementRect.top + currentScrollPosition - offset;

        window.scrollTo({ top: targetScrollPosition, behavior: "smooth" });
      } else {
        console.warn("Elemento 'disclaimerSection' non trovato per lo scroll.");
      }
    }
  }, [showGraph, simulationResult]);

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
    const history: RetirementSimulation[] = [
      {
        grossSalary: parseFloat(currentRAL.toFixed(0)),
        despoited: { baseAmount: 0 },
        inflationRate: 1 - formData.inflation / 100,
        retirementFund: { netValue: 0, grossValue: 0, gain: 0, cost: 0 },
        enhancedRetirementFund: { netValue: 0, grossValue: 0, gain: 0, cost: 0 },
        companyFund: { netValue: 0, grossValue: 0, gain: 0, cost: 0 },
      },
    ];

    for (let year = 1; year <= formData.years; year++) {
      const tfrIndexation = TFR.REVALUATION_FIXED_RATE + TFR.INFALTION_MULTIPLIER * formData.inflation;
      const annualTFR = currentRAL * TFR.MULTIPLIER;
      const lastYear = history[year - 1];
      const totalNetFundTFR = lastYear?.retirementFund.netValue;
      const totalNetCompanyTFR = lastYear?.companyFund.netValue;
      totalTFR += annualTFR;

      history.push({
        grossSalary: parseFloat(currentRAL.toFixed(0)),
        despoited: { baseAmount: parseFloat(totalTFR.toFixed(0)), personalAddition: additionalDeposit, employerAddition: employerAdditionalDeposit },
        inflationRate: lastYear.inflationRate * (1 - formData.inflation / 100),
        retirementFund: calculateNextYearInvestment({
          lastYearData: {
            newDeposit: annualTFR,
            netCapital: totalNetFundTFR,
            gain: lastYear?.retirementFund.gain,
            cost: lastYear?.retirementFund.cost,
          },
          cagr: formData.netFundReturn,
          assetType: AssetType.RETIREMENT_FUND,
          taxFree: true
        }),
        companyFund: calculateNextYearInvestment({
          lastYearData: {
            newDeposit: annualTFR,
            netCapital: totalNetCompanyTFR,
            gain: lastYear?.companyFund.gain,
            cost: lastYear?.companyFund.cost,
          },
          cagr: tfrIndexation,
          assetType: AssetType.COMPANY,
        }),
      });
      if (formData.personalExtraContribution > 0) {
        const fundWithAddition = calculateNextYearInvestment({
          lastYearData: {
            newDeposit: annualTFR + addition,
            netCapital: lastYear?.enhancedRetirementFund?.netValue,
            gain: lastYear?.enhancedRetirementFund?.gain,
            cost: lastYear?.enhancedRetirementFund?.cost,
          },
          cagr: formData.netFundReturn,
          assetType: AssetType.ENHANCED_RETIREMENT_FUND,
          taxFree: true
        });

        history[history.length - 1].enhancedRetirementFund = fundWithAddition;
      }
      currentRAL *= 1 + salaryGrowth;
    }
    setSimulationResult(history.slice(1));
  };

  const simulateAdvancedTFR = () => {
    const salaryGrowth = formData.salaryGrowth / 100;
    let currentRAL = formData.ral;
    let totalTFR = 0;

    // if (addition > TFR.MAX_DEDUCTION) {
    //   const excess = addition - TFR.MAX_DEDUCTION;
    //   addition -= excess * (getTaxRate(AssetType.INCOME, currentRAL) / 100);
    // }

    const history: RetirementSimulation[] = [
      {
        grossSalary: parseFloat(currentRAL.toFixed(0)),
        despoited: { baseAmount: 0 },
        inflationRate: 1 - formData.inflation / 100,
        retirementFund: { netValue: 0, grossValue: 0, gain: 0, cost: 0, capitalLosses: [{ amount: 0, year: 0 }] },
        companyFund: { netValue: 0, grossValue: 0, gain: 0, cost: 0, capitalLosses: [{ amount: 0, year: 0 }] },
      },
    ];

    if (formData.personalExtraContribution > 0) {
      history[0].enhancedRetirementFund = { netValue: 0, grossValue: 0, gain: 0, cost: 0, capitalLosses: [{ amount: 0, year: 0 }] };
      history[0].opportunityCost = { netValue: 0, grossValue: 0, gain: 0, cost: 0, capitalLosses: [{ amount: 0, year: 0 }]  };
    }

    for (let year = 1; year <= formData.years; year++) {
      const inflation = formData.inflation + getRandomizedReturn(formData.inflationRange);
      const tfrIndexation = TFR.REVALUATION_FIXED_RATE + TFR.INFALTION_MULTIPLIER * inflation;
      const fundReturn = formData.fundReturn + getRandomizedReturn(formData.fundReturnRange);
      const opportunityCostReturn =
        formData.opportunityCostReturn + getRandomizedReturn(formData.opportunityCostRange);
      const annualTFR = currentRAL * TFR.MULTIPLIER;
      const lastYear = history[year - 1];
      const totalNetFundTFR = lastYear?.retirementFund.netValue;
      const totalNetCompanyTFR = lastYear?.companyFund.netValue;
      const additionalDeposit = currentRAL * (formData.personalExtraContribution / 100);
      const employerAdditionalDeposit = currentRAL * (formData.employerExtraContribution / 100);
      const addition = additionalDeposit + employerAdditionalDeposit;
      totalTFR += annualTFR;

      history.push({
        grossSalary: parseFloat(currentRAL.toFixed(0)),
        despoited: { 
          baseAmount: parseFloat(totalTFR.toFixed(0)), 
          personalAddition: additionalDeposit + (lastYear.despoited.personalAddition ?? 0), 
          employerAddition: employerAdditionalDeposit + (lastYear.despoited.employerAddition ?? 0)
        },
        inflationRate: lastYear.inflationRate * (1 - inflation / 100),
        retirementFund: calculateNextYearInvestment({
          lastYearData: {
            newDeposit: annualTFR,
            netCapital: totalNetFundTFR,
            gain: lastYear?.retirementFund.gain,
            cost: lastYear?.retirementFund.cost,
            capitalLosses: lastYear?.retirementFund.capitalLosses,
          },
          cagr: fundReturn,
          assetType: AssetType.RETIREMENT_FUND,
          year: year,
          equityRatio: formData.fundEquity,
        }),
        companyFund: calculateNextYearInvestment({
          lastYearData: {
            newDeposit: annualTFR,
            netCapital: totalNetCompanyTFR,
            gain: lastYear?.companyFund.gain,
            cost: lastYear?.companyFund.cost,
          },
          cagr: tfrIndexation,
          assetType: AssetType.COMPANY,
          year: year,
        }),
      });

      if (formData.personalExtraContribution > 0) {
        const fundWithAddition = calculateNextYearInvestment({
          lastYearData: {
            newDeposit: annualTFR + addition,
            netCapital: lastYear?.enhancedRetirementFund?.netValue,
            gain: lastYear?.enhancedRetirementFund?.gain,
            cost: lastYear?.enhancedRetirementFund?.cost,
            capitalLosses: lastYear?.enhancedRetirementFund?.capitalLosses,
          },
          cagr: fundReturn,
          assetType: AssetType.ENHANCED_RETIREMENT_FUND,
          year: year,
          equityRatio: formData.fundEquity,
        });

        const opportunityCost = calculateNextYearInvestment({
          lastYearData: {
            newDeposit: additionalDeposit,
            netCapital: lastYear?.opportunityCost?.netValue,
            gain: lastYear?.opportunityCost?.gain,
            cost: lastYear?.opportunityCost?.cost,
            capitalLosses: lastYear?.opportunityCost?.capitalLosses,
          },
          cagr: opportunityCostReturn,
          assetType: AssetType.OPPORTUNITY_COST,
          equityRatio: formData.opportunityCostEquity
        });

        history[history.length - 1].enhancedRetirementFund = fundWithAddition;
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

  // function AdSense() {
  //   const adRef = useRef(null);
  //   const pushedRef = useRef(false);
  //   useEffect(() => {
  //     if (!window.adsbygoogle) {
  //       window.adsbygoogle = [];
  //     }
  //     if (adRef.current && !pushedRef.current) {
  //       window.adsbygoogle.push({});
  //       pushedRef.current = true;
  //     }
  //   }, []);
  //   return (
  //     <ins
  //       className="adsbygoogle"
  //       style={{ display: "block" }}
  //       data-ad-client="ca-pub-9449962329133648"
  //       data-ad-slot="9817314065"
  //       data-ad-format="auto"
  //       data-full-width-responsive="true"
  //       ref={adRef}
  //     ></ins>
  //   );
  // }

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
          <Disclaimer />
          {showGraph && (
            <div className="flex flex-col gap-4 pb-6">
              <ComparisonCard isAdvancedOptionOn={isAdvancedOptionOn} data={simulationResult} />
              <TableOrLineChart data={simulationResult} isAdvancedOptionOn={isAdvancedOptionOn} />
              <ExplanationCard />
            </div>
          )}
        </div>
      </div>
    </FormDataProvider>
  );
}

export default RetirementFund;
