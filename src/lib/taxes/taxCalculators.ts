import { FUND_TAX_CONFIG, INCOME_TAX_BRACKETS, TAXATION } from "./constants";
import { AssetType, TFRYearlyData } from "./types";

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
      if (ral === undefined) {
        throw new Error("RAL (Reddito Annuale Lordo) is required for income tax calculation.");
      }
      return getIncomeTaxRate(ral);

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
export const getCapitalGainTaxRate = (assetType: AssetType, equityRatio: number): number => {
  if (assetType === AssetType.COMPANY) {
    return getTaxRate(assetType);
  }
  const bondTax = (1 - equityRatio / 100) * TAXATION.TRESURY_WHITELISTED;
  const equityTax = (equityRatio / 100) * getTaxRate(assetType);
  return equityTax + bondTax;
};

export function getIncomeTaxRate(taxableIncome: number): number {
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (let i = 0; i < INCOME_TAX_BRACKETS.length; i++) {
    const currentBracket = INCOME_TAX_BRACKETS[i];
    const nextBracket = INCOME_TAX_BRACKETS[i + 1];

    const amountInCurrentBracket = nextBracket
      ? Math.min(remainingIncome, nextBracket.threshold - currentBracket.threshold)
      : remainingIncome;

    if (amountInCurrentBracket <= 0) {
      break;
    }

    tax += amountInCurrentBracket * (currentBracket.rate / 100);
    remainingIncome -= amountInCurrentBracket;
  }

  return tax;
}

export function getIncomeTaxPercentage(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const totalTax = getIncomeTaxRate(taxableIncome);
  return totalTax / taxableIncome * 100;
}

export function getCompanyTaxRate(history: TFRYearlyData[], year: number): number {
  const lastFiveYears = history.slice(year - 5, year).map((item) => item.ral);
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

export function getRetirementFundTaxRate(years: number): number {
  if (years < FUND_TAX_CONFIG.YEAR_REQUIRED_FOR_REDUCTION) return FUND_TAX_CONFIG.BASE_RATE;

  const reductionYears = Math.max(0, years - FUND_TAX_CONFIG.YEAR_REQUIRED_FOR_REDUCTION);
  const reduction = reductionYears * FUND_TAX_CONFIG.REDUCTION_PER_YEAR;
  const finalRate = Math.max(FUND_TAX_CONFIG.MID_RATE - reduction, FUND_TAX_CONFIG.MIN_RATE);

  return parseFloat(finalRate.toFixed(2));
}
