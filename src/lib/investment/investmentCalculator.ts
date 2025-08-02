import { TAXATION } from "../taxes/constants";
import { calculateHouseBuyTaxes, getMortgageTax } from "../taxes/taxCalculators";
import {
  AssetType,
  InvestmentPerformance,
  LastYearData,
  RetirementSimulation,
  ValidAssetType,
  assetTaxRateMap,
} from "../taxes/types";
import { MORTGAGE, TFR } from "./constants";
import { CompoundPerformance, CompoundValueParams } from "./types";

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
  capital,
  cagr,
  years,
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

  for (let year = 1; year <= years; year++) {
    const interestEarned = currentCapital * (Math.pow(1 + r / n, n) - 1);

    if (additionalContribution > 0 && contributionFrequency > 0) {
      const contributionsPerYear = Math.min(contributionFrequency, n);
      for (let i = 0; i < contributionsPerYear; i++) {
        currentCapital += additionalContribution;
        totalContributionsMade += additionalContribution;
      }
    }

    currentCapital += interestEarned;

    let taxesPaidThisYear = 0;
    if (annualTaxRate?.capital && annualTaxRate.capital > 0) {
      taxesPaidThisYear = currentCapital * (annualTaxRate.capital / 100);
      currentCapital -= taxesPaidThisYear;
      // totalTaxesPaidAccumulated += taxesPaidThisYear;
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
  monthlyPayment = 0,
}: {
  values: {
    isMortgage: boolean;
    housePrice: number;
    cadastralValue: number;
    buyAgency: number;
    rentAgency: number;
    notary: number;
    mortgageAmount: number;
    renovation: number;
    monthDeposits: number;
    rent: number;
    years: number;
    investmentReturn?: number;
    isFirstHouse: boolean;
    isPrivateOrAgency: boolean;
  };
  monthlyPayment?: number;
}): { rentOpportunityCost: CompoundPerformance[]; mortgageOpportunityCost: CompoundPerformance[] } {
  const mortgageTaxes = getMortgageTax(values.mortgageAmount, values.isFirstHouse);
  const buyTaxes = calculateHouseBuyTaxes(values.isFirstHouse, values.isPrivateOrAgency, values.cadastralValue);
  const agencyTaxCredit = Math.min(190, values.buyAgency * (MORTGAGE.TAX.CREDIT_INTEREST / 100));
  const initialMortageCosts =
    values.notary + values.buyAgency - agencyTaxCredit + mortgageTaxes + buyTaxes + values.renovation;
  const initialRentCost = values.monthDeposits * values.rent + values.rentAgency;
  let investableCapital = values.isMortgage ? values.housePrice - values.mortgageAmount : values.housePrice;
  investableCapital += initialMortageCosts - initialRentCost;
  const investibleMonthlyPayment = values.rent - monthlyPayment;

  const commonGrowthParams = {
    years: values.years,
    cagr: values.investmentReturn || 0,
    contributionFrequency: 12,
  };

  const rentOpportunityCost: CompoundPerformance[] = calculateCompoundGrowth({
    ...commonGrowthParams,
    capital: investableCapital > 0 ? investableCapital : 0,
    additionalContribution: investibleMonthlyPayment < 0 ? -investibleMonthlyPayment : 0,
    annualTaxRate: {
      capital: TAXATION.IVAFE,
    },
  });



  const mortgageOpportunityCost: CompoundPerformance[] = calculateCompoundGrowth({
    ...commonGrowthParams,
    capital: investableCapital < 0 ? -investableCapital : 0,
    additionalContribution: investibleMonthlyPayment > 0 ? investibleMonthlyPayment : 0
  });

  return { rentOpportunityCost, mortgageOpportunityCost };
}
