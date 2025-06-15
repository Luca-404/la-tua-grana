import { getTaxRate, getCapitalGainTaxRate } from "../taxes/taxCalculators";
import { CompoundInterestPL, AssetType, LastYearData, TFR_PL, TFRYearlyData } from "../taxes/types";
import { TFR } from "./constants";


export const getCompoundNetValue = (tax: number, opportunityCost?: CompoundInterestPL): number => {
  if (opportunityCost === undefined) return 0;
  const capitalGain = opportunityCost.endYearCapital - opportunityCost.depositedCapital;
  const taxes = (capitalGain * tax) / 100;
  return opportunityCost.endYearCapital - taxes;
};

export const calculateCompoundInterest = (
  compoundInterestPL: CompoundInterestPL | undefined,
  income: number,
  cagr: number,
  ral: number,
  assetType: AssetType
): CompoundInterestPL => {
  if (!compoundInterestPL) {
    return {
      endYearCapital: 0,
      depositedCapital: 0,
      cost: 0,
    };
  }
  const taxRate = getTaxRate(assetType, ral);
  const currentNetIncome = income * (1 - taxRate / 100);
  const totalCost = compoundInterestPL.cost + income * (taxRate / 100);
  const endYearCapital = (compoundInterestPL.endYearCapital + currentNetIncome) * (1 + cagr / 100);
  return {
    endYearCapital: endYearCapital,
    depositedCapital: compoundInterestPL.depositedCapital + currentNetIncome,
    cost: totalCost,
  };
};

export const calculateRevaluationTFR = (
  lastYearData: LastYearData,
  cagr: number,
  assetType: AssetType,
  year: number = 0,
  equityRatio: number = 0
): TFR_PL => {
  if (lastYearData.netCapital === undefined ||
    lastYearData.gain === undefined ||
    lastYearData.cost === undefined) {
    throw new Error("Last year data is required for TFR calculation");
  }
  const taxRate = getCapitalGainTaxRate(assetType, equityRatio);
  const grossGain = lastYearData.netCapital * (cagr / 100);
  let taxableGain = 0;
  let taxes = 0;

  if (grossGain < 0) {
    lastYearData.minus?.push({ amount: -grossGain, year: year });
  } else {
    taxableGain = grossGain;
    taxes = taxableGain * (taxRate / 100);
    for (const element of lastYearData.minus ?? []) {
      if (element.year >= year - TFR.MINUS_PRESCRIPTION_YEARS && element.amount > 0) {
        const remain = taxes - element.amount;
        if (remain > 0) {
          taxes = remain;
          element.amount = 0;
        } else {
          // all taxes are covered
          taxes = 0;
          element.amount = -remain;
          break;
        }
      }
    }
  }

  const totalGrossTFR = lastYearData.netCapital + lastYearData.newDeposit + grossGain;
  const totalNetTFR = totalGrossTFR - taxes;

  return {
    grossTFR: totalGrossTFR,
    netTFR: totalNetTFR,
    gain: lastYearData.gain + grossGain - taxes,
    cost: lastYearData.cost + taxes,
    minus: lastYearData.minus,
  };
};

export const getTotalNetTFR = (data: TFRYearlyData, allNetTFR?: number, tax?: number): number => {
  if (!allNetTFR || !tax) return 0;
  const depositedNetTFR = data.tfr * (1 - tax / 100);
  const gain = allNetTFR - data.tfr;
  return depositedNetTFR + gain;
};
