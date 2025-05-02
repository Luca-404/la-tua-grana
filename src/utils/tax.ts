export const TAXATION = {
  CAPITAL_GAIN: 26,
  TRESURY_WHITELISTED: 12.5,
  FOUND_CAPITAL_GAIN: 20,
  COMPANY_REVALUATION: 17,
  IVAFE: 0.2,
};

export type TFR_PL = {
  grossTFR: number;
  netTFR: number;
  gain: number;
  cost: number;
};

export type TFRYearlyData = {
  ral: number;
  tfr: number;
  fund: TFR_PL;
  company: TFR_PL;
};

export type LastYearData = {
  tfr: number;
  netTFR: number;
  gain: number;
  cost: number;
};

export enum AssetType {
  FUND = "fund",
  EQUITY = "equity",
  BOND = "bond",
  COMPANY = "company",
  // INCOME = 'income'
}

export const getTaxRate = (assetType: AssetType): number => {
  switch (assetType) {
    case AssetType.EQUITY:
      return TAXATION.CAPITAL_GAIN;

    case AssetType.BOND:
      return TAXATION.TRESURY_WHITELISTED;

    case AssetType.FUND:
      return TAXATION.FOUND_CAPITAL_GAIN;

    case AssetType.COMPANY:
      return TAXATION.COMPANY_REVALUATION;

    // case AssetType.INCOME:
    //     if (ral < 28000) {
    //         return 23;
    //     } else if (ral >= 28000 && ral <= 50000) {
    //         return 35;
    //     }
    //     else {
    //         return 43;
    //     }

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
const determineTaxRate = (
  assetType: AssetType,
  equityRatio: number
): number => {
  if (assetType === AssetType.FUND) {
    const equityTax = (equityRatio / 100) * TAXATION.CAPITAL_GAIN;
    const bondTax = (1 - (equityRatio / 100)) * TAXATION.TRESURY_WHITELISTED;
    return equityTax + bondTax;
  }

  return getTaxRate(assetType);
};

export const calculateTFR = (
  lastYearData: LastYearData,
  cagr: number,
  assetType: AssetType,
  equityRatio: number = 0
): TFR_PL => {
  const taxRate: number = determineTaxRate(assetType, equityRatio);
  const grossGain: number = lastYearData.netTFR * (cagr / 100);
  const taxes: number = grossGain * (taxRate / 100);
  const totalGrossTFR: number = lastYearData.netTFR + lastYearData.tfr + grossGain;
  const totalNetTFR: number = totalGrossTFR - taxes;
  // console.log("ALL", {
  //   taxRate: taxRate,
  //   grossGain: grossGain,
  //   taxes: taxes,
  //   totalGrossTFR: totalGrossTFR,
  //   totalNetTFR: totalNetTFR,
  // });
  return {
    grossTFR: totalGrossTFR,
    netTFR: totalNetTFR,
    gain: lastYearData.gain + grossGain - taxes,
    cost: lastYearData.cost + taxes,
  };
};

function calculateDepositTaxRate(taxableIncome: number) {
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
      const tax = calculateDepositTaxRate(income);
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
