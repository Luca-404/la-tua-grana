import { MORTGAGE } from "../investment/constants";
import { FUND_TAX_CONFIG, INCOME_TAX_BRACKETS, TAXATION } from "./constants";
import { AssetType, RetirementSimulation } from "./types";

export const getTaxRate = (assetType: AssetType, ral?: number): number => {
  switch (assetType) {
    case AssetType.BOND:
      return TAXATION.TRESURY_WHITELISTED;

    case AssetType.RETIREMENT_FUND || AssetType.ENHANCED_RETIREMENT_FUND:
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

function getIncomeTaxRate(taxableIncome: number): number {
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

function getIncomeTaxAmount(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const totalTax = getIncomeTaxRate(taxableIncome);
  return (totalTax / taxableIncome) * 100;
}

export function getCompanyTaxRate(history: RetirementSimulation[], year: number): number {
  const lastFiveYears = history.slice(year - 5, year).map((item) => item.grossSalary);
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

/**
 * Calculate weighted tax rate based on equity percentage
 * @param assetType - Type of asset
 * @param equityPercentage - Percentage of equity in the asset (0-100)
 * @returns Weighted tax rate percentage
 */
export const getCapitalGainTaxRate = (assetType: AssetType, equityRatio: number, taxFree: boolean = false): number => {
  if (taxFree) {
    assetType = AssetType.NO_TAXATION;
  }
  if (assetType === AssetType.RETIREMENT_FUND || assetType === AssetType.ENHANCED_RETIREMENT_FUND || assetType === AssetType.MIXED) {
    const bondTax = (1 - equityRatio / 100) * TAXATION.TRESURY_WHITELISTED;
    const equityTax = (equityRatio / 100) * getTaxRate(assetType);
    return equityTax + bondTax;
  }
  return getTaxRate(assetType);
};

/**
 * Calculates the applicable tax rate for capital deposited based on the asset type and year.
 * @param asset - The type of asset for which the tax is being calculated.
 * @param data - An array of yearly Assets.
 * @param year - The year for which the tax rate is required.
 * @returns The tax rate as a number (percentage) for the specified asset and year.
 */
export function getAssetTaxRate({asset, data, year}: {asset: AssetType, data: RetirementSimulation[], year: number}): number{
  let taxRate = 0;
  switch (asset) {
    case AssetType.COMPANY:
      taxRate = getCompanyTaxRate(data, year);
      break;
    case AssetType.RETIREMENT_FUND || AssetType.ENHANCED_RETIREMENT_FUND:
      taxRate = getRetirementFundTaxRate(year);
      break;
    default:
      taxRate = getIncomeTaxAmount(data[year - 1].despoited.baseAmount);
      break;
  }

  return taxRate;
}

export function calculateHouseBuyTaxes(
  isFirsthouse: boolean,
  isPrivateOrAgency: boolean,
  cadastralValue: number = 500,
  housePrice: number = 0
): number {
  let cadastralTax = 200;
  let ipotecaryTax = 200;
  let registryTax = 200;
  let IVA = 0;

  if (isPrivateOrAgency) {
    cadastralTax = cadastralValue * 126 * 0.09;
    if (isFirsthouse) {
      cadastralTax = cadastralValue * 115.5 * 0.02;
      ipotecaryTax = 50;
      registryTax = 50;
    }
  } else {
    if (isFirsthouse) {
      IVA = housePrice * 0.04;
    } else {
      IVA = housePrice * 0.09;
    }
  }
  return cadastralTax + ipotecaryTax + registryTax + IVA;
}

export function getMortgageTax(mortgageAmount: number, isFirstHouse: boolean) {
  const AVG_OTHER_COSTS = 1.2;
  const tax = isFirstHouse ? MORTGAGE.TAX.FIRST_HOUSE_SUBSTITUTE : MORTGAGE.TAX.SECOND_HOUSE_SUBSTITUTE;
  return mortgageAmount * ((AVG_OTHER_COSTS + tax) / 100);
}