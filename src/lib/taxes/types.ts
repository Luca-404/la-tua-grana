import { TAXATION } from "./constants";
import { getCapitalGainTaxRate, getAssetTaxRate } from "./taxCalculators";

export type RetirementSimulation = {
  grossSalary: number;
  despoited: DepositedCapital;
  inflationRate: number;
  retirementFund: InvestmentPerformance;
  companyFund: InvestmentPerformance;
  enhancedRetirementFund?: InvestmentPerformance;
  opportunityCost?: InvestmentPerformance;
};

type DepositedCapital = {
  baseAmount: number;
  personalAddition?: number;
  employerAddition?: number;
}

export type InvestmentPerformance = {
  grossValue: number;
  netValue: number;
  gain: number;
  cost: number;
  capitalLosses?: CapitalLoss[];
};

export type LastYearData = {
  newDeposit: number;
  netCapital?: number;
  gain?: number;
  cost?: number;
  capitalLosses?: CapitalLoss[];
};

type CapitalLoss = {
  amount: number;
  year: number;
};

export enum AssetType {
  RETIREMENT_FUND = "fund",
  ENHANCED_RETIREMENT_FUND = "enhancedRetirementFund",
  OPPORTUNITY_COST = "opportunityCost",
  COMPANY = "company",
  MIXED = "mixed",
  EQUITY = "equity",
  BOND = "bond",
  INCOME = "income",
  NO_TAXATION = "no_taxation",
}

type AssetMetadata = {
  key: keyof RetirementSimulation;
  capitalGainTaxRate: number | ((params: { equityRatio: number, taxFree: boolean }) => number);
  assetTaxRate: number | ((params: { data: RetirementSimulation[]; year: number }) => number);
};

export type ValidAssetType = AssetType.RETIREMENT_FUND | AssetType.COMPANY | AssetType.ENHANCED_RETIREMENT_FUND | AssetType.OPPORTUNITY_COST;

export const assetTaxRateMap: Record<ValidAssetType, AssetMetadata> = {
  [AssetType.RETIREMENT_FUND]: {
    key: "retirementFund",
    capitalGainTaxRate: ({ equityRatio, taxFree }: { equityRatio: number; taxFree: boolean }) =>
      getCapitalGainTaxRate(AssetType.RETIREMENT_FUND, equityRatio, taxFree),
    assetTaxRate: ({ data, year }: { data: RetirementSimulation[]; year: number }) =>
      getAssetTaxRate({ asset: AssetType.RETIREMENT_FUND, data: data, year: year }),
  },
  [AssetType.ENHANCED_RETIREMENT_FUND]: {
    key: "enhancedRetirementFund",
    capitalGainTaxRate: ({ equityRatio, taxFree }: { equityRatio: number; taxFree: boolean }) =>
      getCapitalGainTaxRate(AssetType.RETIREMENT_FUND, equityRatio, taxFree),
    assetTaxRate: ({ data, year }: { data: RetirementSimulation[]; year: number }) =>
      getAssetTaxRate({ asset: AssetType.RETIREMENT_FUND, data: data, year: year }),
  },
  [AssetType.COMPANY]: {
    key: "companyFund",
    capitalGainTaxRate: TAXATION.COMPANY_REVALUATION,
    assetTaxRate: ({ data, year }: { data: RetirementSimulation[]; year: number }) =>
      getAssetTaxRate({ asset: AssetType.COMPANY, data: data, year: year }),
  },
  [AssetType.OPPORTUNITY_COST]: {
    key: "opportunityCost",
    capitalGainTaxRate: TAXATION.NO_TAXATION,
    assetTaxRate: TAXATION.NO_TAXATION,
  },
};
