export const TAXATION = {
  CAPITAL_GAIN: 26,
  TRESURY_WHITELISTED: 12.5,
  FUND_CAPITAL_GAIN: 20,
  COMPANY_REVALUATION: 17,
  NO_TAXATION: 0,
  IVAFE: 0.2,
};

export type TFR_PL = {
  grossTFR: number;
  netTFR: number;
  gain: number;
  cost: number;
};

export type CompoundInterestPL = {
  income?: number;
  endYearCapital: number;
  depositedCapital: number;
  cost: number;
};

export type TFRYearlyData = {
  ral: number;
  tfr: number;
  fund: TFR_PL;
  company: TFR_PL;
  fundWithAddition?: TFR_PL;
  opportunityCost?: CompoundInterestPL;
};

export type LastYearData = {
  grossCapital: number;
  netCapital?: number;
  gain?: number;
  cost?: number;
};

export enum AssetType {
  FUND = "fund",
  EQUITY = "equity",
  BOND = "bond",
  COMPANY = "company",
  INCOME = "income",
  NO_TAXATION = "no_taxation",
}

export const getTaxRate = (assetType: AssetType, ral?: number): number => {
  switch (assetType) {
    case AssetType.EQUITY:
      return TAXATION.CAPITAL_GAIN;

    case AssetType.BOND:
      return TAXATION.TRESURY_WHITELISTED;

    case AssetType.FUND:
      return TAXATION.FUND_CAPITAL_GAIN;

    case AssetType.COMPANY:
      return TAXATION.COMPANY_REVALUATION;

    case AssetType.NO_TAXATION:
      return TAXATION.NO_TAXATION;

    case AssetType.INCOME:
      if(ral === undefined) {
        throw new Error("RAL is required for income tax calculation");
      }
      if (ral <= 28000) return 23;
      else if (ral <= 50000) return 35;
      else return 43;
      
    default:
      return TAXATION.CAPITAL_GAIN;
  }
};

/**
 * Calculate weighted tax rate based on equity percentage
 * @param assetType - Type of asset
 * @param equityPercentage - Percentage of equity in the asset (0-100)
 * @returns Weighted tax rate percentage
 */
export const getCapitalGainTaxRate = (
  assetType: AssetType,
  equityRatio: number
): number => {
  if (equityRatio > 0) {
    const bondTax = (1 - (equityRatio / 100)) * TAXATION.TRESURY_WHITELISTED;
    const equityTax = (equityRatio / 100) * getTaxRate(assetType);
    return equityTax + bondTax;
  }
  return getTaxRate(assetType);
};

export const getCompoundNetValue = (
  tax: number,
  opportunityCost?: CompoundInterestPL
): number => {
  if (opportunityCost === undefined) return 0;
  const capitalGain =
    opportunityCost.endYearCapital - opportunityCost.depositedCapital;
  const taxes = (capitalGain * tax) / 100;
  return opportunityCost.endYearCapital - taxes;
};

export const calculateCompoundInterest = (
  compoundInterestPL: CompoundInterestPL | undefined,
  income: number,
  cagr: number,
  ral: number,
  assetType: AssetType,
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
  const endYearCapital = (compoundInterestPL.endYearCapital + currentNetIncome) * (1 + (cagr / 100));
  return {
    endYearCapital: endYearCapital,
    depositedCapital: compoundInterestPL.depositedCapital + currentNetIncome,
    cost: totalCost,
  }
}

export const calculateRevaluationTFR = (
  lastYearData: LastYearData,
  cagr: number,
  assetType: AssetType,
  equityRatio: number = 0
): TFR_PL => {
  const taxRate = getCapitalGainTaxRate(assetType, equityRatio);
  const grossGain = lastYearData.netCapital * (cagr / 100);
  const taxes = grossGain * (taxRate / 100);
  const totalGrossTFR = lastYearData.netCapital + lastYearData.grossCapital + grossGain;
  const totalNetTFR = totalGrossTFR - taxes;
  return {
    grossTFR: totalGrossTFR,
    netTFR: totalNetTFR,
    gain: lastYearData.gain + grossGain - taxes,
    cost: lastYearData.cost + taxes,
  };
};

export function getIncomeTaxRate(taxableIncome: number) {
  let tax = 0;
  if (taxableIncome <= 28000) {
    tax = taxableIncome * 0.23;
  } else if (taxableIncome <= 50000) {
    tax = 28000 * 0.23 + (taxableIncome - 28000) * 0.35;
  } else {
    tax =
      28000 * 0.23 + (50000 - 28000) * 0.35 + (taxableIncome - 50000) * 0.43;
  }
  return tax;
}

export function getCompanyTaxRate(history: TFRYearlyData[]): number {
  const lastFiveYears = history.slice(-5).map((item) => item.ral);

  const { totalIncome, totalTax } = lastFiveYears.reduce(
    (acc, income) => {
      const tax = getIncomeTaxRate(income);
      acc.totalIncome += income;
      acc.totalTax += tax;
      return acc;
    },
    { totalIncome: 0, totalTax: 0 }
  );

  const averageRate = (totalTax / totalIncome) * 100;
  return parseFloat(averageRate.toFixed(2));
}

export function getFundTaxRate(years: number): number {
  const baseRate = 15;
  const minRate = 9;
  const reductionPerYear = 0.3;

  if (years <= 15)
    return 23;

  const reductionYears = Math.max(0, years - 15);
  const reduction = reductionYears * reductionPerYear;

  let finalRate = baseRate - reduction;

  finalRate = Math.max(finalRate, minRate);

  return parseFloat(finalRate.toFixed(2));
}
