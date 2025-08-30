import { TAXATION } from "../taxes/constants";
import {
  AssetType,
  InvestmentPerformance,
  LastYearData,
  RetirementSimulation,
  ValidAssetType,
  assetTaxRateMap,
} from "../taxes/types";
import { TFR } from "./constants";
import { CompoundPerformance, CompoundValueParams, PurchaseCosts, RentCost } from "./types";

export const calculateNextYearInvestment = ({
  lastYearData,
  cagr,
  assetType,
  year = 0,
  equityRatio = 0,
  taxFree = false,
}: {
  lastYearData: LastYearData;
  cagr: number;
  assetType: AssetType;
  year?: number;
  equityRatio?: number;
  taxFree?: boolean;
}): InvestmentPerformance => {
  if (
    lastYearData.netCapital === undefined ||
    lastYearData.gain === undefined ||
    lastYearData.cost === undefined
  ) {
    throw new Error("Last year data is required for TFR calculation");
  }
  const assetMetadata = assetTaxRateMap[assetType as ValidAssetType];
  if (!assetMetadata) {
    throw new Error(`AssetType ${assetType} not found in assetMetadataMapTest.`);
  }

  let taxRate: number;
  if (typeof assetMetadata.capitalGainTaxRate === "function") {
    taxRate = assetMetadata.capitalGainTaxRate({ equityRatio, taxFree });
  } else {
    taxRate = assetMetadata.capitalGainTaxRate;
  }

  const grossGain = lastYearData.netCapital * (cagr / 100);
  let taxes = 0;

  if (grossGain < 0) {
    lastYearData.capitalLosses?.push({ amount: -grossGain, year: year });
  } else {
    taxes = grossGain * (taxRate / 100);
    for (const element of lastYearData.capitalLosses ?? []) {
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

  const totalGross = lastYearData.netCapital + lastYearData.newDeposit + grossGain;
  const totalNet = totalGross - taxes;

  return <InvestmentPerformance>{
    grossValue: totalGross,
    netValue: totalNet,
    gain: lastYearData.gain + grossGain - taxes,
    cost: lastYearData.cost + taxes,
    capitalLosses: lastYearData.capitalLosses,
  };
};

/**
 * Calculates the Compound Annual Growth Rate (CAGR) of an investment.
 *
 * @param finalValue The current value of the investment.
 * @param initialValue The total amount invested.
 * @param years The number of years the investment has been held.
 * @returns The annualized return as a decimal number.
 */
export function calculateCAGR(deposited: number, finalValue: number, years: number): number {
  if (deposited <= 0 || years <= 0) {
    throw new Error("Initial value and years must be greater than zero.");
  }

  const cagr = Math.pow(finalValue / deposited, 1 / years) - 1;
  return cagr;
}

/**
 * Calculates the total net gain as net of the deposited capital + net over capital gain taxed
 * @param asset - The type of asset for which the tax is being calculated.
 * @param data - An array of yearly Assets data.
 * @param year - The year for which the tax rate is required.
 * @returns The toal gain at the specified year.
 */
export const getTotalNetValue = ({
  asset,
  data,
  year,
}: {
  asset: AssetType;
  data: RetirementSimulation[];
  year: number;
}): number => {
  const assetMetadata = assetTaxRateMap[asset as ValidAssetType];
  if (!assetMetadata) {
    throw new Error(`AssetType ${asset} not found in assetMetadataMapTest.`);
  }

  let assetDepositTaxRate: number;
  if (typeof assetMetadata.assetTaxRate === "function") {
    assetDepositTaxRate = assetMetadata.assetTaxRate({ data, year });
  } else {
    assetDepositTaxRate = assetMetadata.assetTaxRate;
  }

  const lastYear = data[year - 1];
  let allDeposit = lastYear.despoited.baseAmount;
  if (asset === AssetType.ENHANCED_RETIREMENT_FUND) {
    allDeposit += (lastYear.despoited.personalAddition ?? 0) + (lastYear.despoited.employerAddition ?? 0);
  }
  const netAssets = allDeposit * (1 - assetDepositTaxRate / 100);
  const assetPerformance = lastYear[assetMetadata.key] as InvestmentPerformance;
  return netAssets + assetPerformance.gain;
};

export function calculateCompoundGrowth({
  cagr,
  years,
  capital = 0,
  compoundingFrequency = 12,
  additionalContribution = 0,
  contributionFrequency = 0,
  annualTaxRate = {
    capital: 0,
    gain: 0,
  },
}: CompoundValueParams): CompoundPerformance[] {
  const compoundPerformance: CompoundPerformance[] = [];
  const r = cagr / 100;
  const n = compoundingFrequency;

  let currentCapital = capital;
  let totalContributionsMade = capital;
  const contributionsArray = Array.isArray(additionalContribution)
    ? additionalContribution
    : Array(years).fill(additionalContribution);

  for (let year = 1; year <= years; year++) {
    const currentAnnualContribution = contributionsArray[year - 1] || 0;

    if (currentAnnualContribution > 0 && contributionFrequency > 0) {
      const monthlyContribution = currentAnnualContribution / contributionFrequency;
      for (let i = 0; i < contributionFrequency; i++) {
        currentCapital += monthlyContribution;
        totalContributionsMade += monthlyContribution;
      }
    }

    const interestEarned = currentCapital * (Math.pow(1 + r / n, n) - 1);
    currentCapital += interestEarned;

    let taxesPaidThisYear = 0;
    if (annualTaxRate?.gain && annualTaxRate.gain > 0) {
      taxesPaidThisYear += interestEarned * (annualTaxRate.gain / 100);
      currentCapital -= taxesPaidThisYear;
    }
    if (annualTaxRate?.capital && annualTaxRate.capital > 0) {
      taxesPaidThisYear += currentCapital * (annualTaxRate.capital / 100);
      currentCapital -= taxesPaidThisYear;
    }

    compoundPerformance.push({
      period: year,
      capital: currentCapital,
      taxes: taxesPaidThisYear,
      totalContributions: totalContributionsMade,
    });
  }

  return compoundPerformance;
}

export function calculateBuyVsRentOpportunityCost({
  values,
  purchaseCosts,
  rentCosts,
}: {
  values: { years: number; investmentReturn?: number; rent: number; condoFee: number, monthDeposits: number };
  purchaseCosts: PurchaseCosts;
  rentCosts: RentCost[];
}): { rentOpportunityCost: CompoundPerformance[]; purchaseOpportunityCost: CompoundPerformance[] } {
  const annualDifference = purchaseCosts.annualOverview.map((item, index) => {
    return item.cashflow - rentCosts[index].cashflow;
  });

  // annualDifference[0] -= values.rent * values.monthDeposits;

  const commonGrowthParams = {
    years: values.years,
    cagr: values.investmentReturn || 0,
    contributionFrequency: 12,
  };

  const rentOpportunityCost: CompoundPerformance[] = calculateCompoundGrowth({
    ...commonGrowthParams,
    // capital: investableCapital > 0 ? investableCapital : 0,
    additionalContribution: annualDifference.map((val) => {
      return val > 0 ? 0 : -val - values.condoFee;
    }),
    annualTaxRate: {
      capital: TAXATION.IVAFE,
    },
  });

  const purchaseOpportunityCost: CompoundPerformance[] = calculateCompoundGrowth({
    ...commonGrowthParams,
    // capital: investableCapital < 0 ? -investableCapital : 0,
    additionalContribution: annualDifference.map((val) => {
      return val > 0 ? val - values.condoFee : 0;
    }),
  });

  return { rentOpportunityCost, purchaseOpportunityCost };
}
