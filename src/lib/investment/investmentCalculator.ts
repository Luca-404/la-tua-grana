import { TAXATION } from "../taxes/constants";
import { getCapitalGainTaxRate } from "../taxes/taxCalculators";
import {
  AssetType,
  InvestmentPerformance,
  LastYearData,
  RetirementSimulation,
  ValidAssetType,
  assetTaxRateMap,
} from "../taxes/types";
import { TFR } from "./constants";
import { CompoundPerformance, CompoundValueParams, GrowthMetrics, PurchaseCosts, RentCost } from "./types";

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
 * Calculates the total net gain as net of the deposited capital + net over capital gain taxed
 * @param asset - The type of asset for which the tax is being calculated.
 * @param data - An array of yearly Assets data.
 * @param year - The year for which the tax rate is required.
 * @returns The toal gain at the specified year.
 */
export const getNetTaxRetirementValue = ({
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

export const getNetCapitalGain = ({
  assetType,
  deposited,
  finalCapital,
  equityRate = 0,
}: {
  assetType: AssetType;
  deposited: number;
  finalCapital: number;
  equityRate: number;
}): number => {
  const capitalGain = finalCapital - deposited;
  const capitalGainTaxRate = getCapitalGainTaxRate(assetType, equityRate);
  return Math.max(0, deposited + capitalGain * (1 - capitalGainTaxRate / 100));
};

export const getNetInflationValue = ({
  capital,
  inflationRate,
  years,
}: {
  capital: number;
  inflationRate: number | number[];
  years: number;
}): number[] => {
  const realCapitalByYear: number[] = [];
  for (let i = 1; i <= years; i++) {
    const currentInflationRate: number = Array.isArray(inflationRate)
      ? Number(inflationRate[i - 1]) || 0
      : Number(inflationRate);

    const realValue = capital / Math.pow(1 + currentInflationRate / 100, i);
    realCapitalByYear.push(realValue);
  }

  return realCapitalByYear;
};

export function calculateGrowthMetrics({
  initial,
  finalValue,
  years,
  equityInvested,
  additionalEquity = 0,
}: {
  initial: number;
  finalValue: number;
  years: number;
  equityInvested: number;
  additionalEquity?: number;
}): GrowthMetrics {
  if (initial <= 0 || years <= 0) {
    throw new Error("Initial value and years must be greater than zero.");
  }
  if (equityInvested <= 0) {
    throw new Error("Equity invested must be greater than zero.");
  }

  const cagr = finalValue > 0 ? Math.pow(finalValue / initial, 1 / years) - 1 : null;
  const totalChangePct = (finalValue - initial) / initial;
  const apr = totalChangePct / years;

  const totalEquity = equityInvested + additionalEquity;
  const roe = totalEquity > 0 ? (finalValue - totalEquity) / totalEquity : null;

  return {
    cagr: cagr,
    apr: apr,
    roi: totalChangePct,
    roe: roe,
  };
}

export function calculateCompoundGrowth({
  apr,
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
  const r = apr / 100;
  const n = compoundingFrequency;

  let currentCapital = capital;
  let totalContributions = capital;
  const contributionsArray = Array.isArray(additionalContribution)
    ? additionalContribution
    : Array(years).fill(additionalContribution);

  for (let year = 1; year <= years; year++) {
    const currentAnnualContribution = contributionsArray[year - 1] || 0;

    if (currentAnnualContribution > 0 && contributionFrequency > 0) {
      const monthlyContribution = currentAnnualContribution / contributionFrequency;
      for (let i = 0; i < contributionFrequency; i++) {
        currentCapital += monthlyContribution;
        totalContributions += monthlyContribution;
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
      contributions: totalContributions,
    });
  }

  return compoundPerformance;
}

export function calculateBuyVsRentOpportunityCost({
  values,
  purchaseCosts,
  rentCosts,
}: {
  values: { years: number; investmentReturn?: number; rent: number; condoFee: number; monthDeposits: number };
  purchaseCosts: PurchaseCosts;
  rentCosts: RentCost[];
}): { rentOpportunityCost: CompoundPerformance[]; purchaseOpportunityCost: CompoundPerformance[] } {
  const annualDifference = purchaseCosts.annualOverview.map((item, index) => {
    return item.cashflow - rentCosts[index].cashflow;
  });

  const commonGrowthParams = {
    years: values.years,
    apr: values.investmentReturn || 0,
    contributionFrequency: 12,
  };

  const rentOpportunityCost: CompoundPerformance[] = calculateCompoundGrowth({
    ...commonGrowthParams,
    additionalContribution: annualDifference.map((val) => {
      return val > 0 ? 0 : -val - values.condoFee;
    }),
    annualTaxRate: {
      capital: TAXATION.IVAFE,
    },
  });

  const purchaseOpportunityCost: CompoundPerformance[] = calculateCompoundGrowth({
    ...commonGrowthParams,
    additionalContribution: annualDifference.map((val) => {
      return val > 0 ? val - values.condoFee : 0;
    }),
    annualTaxRate: {
      capital: TAXATION.IVAFE,
    },
  });

  return { rentOpportunityCost, purchaseOpportunityCost };
}
