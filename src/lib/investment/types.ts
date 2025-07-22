export type RetirementFundFormData = {
  years: number;
  ral: number;
  personalExtraContribution: number;
  employerExtraContribution: number;
  netFundReturn: number;
  fundReturn: number;
  fundEquity: number;
  fundReturnRange: number;
  opportunityCostReturn: number;
  opportunityCostEquity: number;
  opportunityCostRange: number;
  salaryGrowth: number;
  inflation: number;
  inflationRange: number;
};

export type Compartment = {
  name: string;
  return: number;
  period: number;
};

export type Fund = {
  [name: string]: {
    type: "closed" | "open";
    compartments: Compartment[];
  };
};

export interface FundData {
  name: string;
  CCNL: string;
  min_employee_contribution: number;
  employer_contribution: number;
}

export interface CompoundValueDetail {
  capital: number;
  cagr: number;
  years: number;
  compoundingFrequency?: number;
  additionalContribution?: number;
  contributionFrequency?: number;
}

export interface CompoundPerformance {
  period: number;
  value: number;
  totalContributions: number;
}

export interface RentCalculationParams {
  years: number;
  rent: number;
  rentAgency: number;
  rentRevaluation: number;
  contractYears: number;
  // ordinaryMaintenance: number;
  // inflation: number;
}

export interface RentCost {
  year: number;
  annualRent: number;
  annualCost: number;
  cumulativeRent: number;
  cumulativeCost: number;
}

export interface PurchaseCost {
  year: number;
  annualCost: number;
  cumulativeCost: number;
  mortgagePrincipalPaid: number;
  mortgageInterestPaid: number;
  remainingMortgageBalance: number;
  annualTaxBenefit: number;
}

export interface PurchaseCalculationParams {
  years: number;
  housePrice: number;
  intialCosts: number;
  taxes: number;
  maintenancePercentage: number;
  initialDeposit: number;
  interestRatePercentage: number;
  mortgageYears: number;
  isFirstHouse: boolean;
  isMortgageTaxCredit: boolean;
  renovation: number;
  renovationTaxCreditPercent: number;
}

export interface MortgageCalculationParams {
  mortgageAmount: number;
  interestRatePercentage: number;
  mortgageYears: number;
  isFirstHouse: boolean;
  amortizationType: 'french' | 'italian';
}

export interface MortgageDetails {
  openCosts: number;
  monthlyPayment: number;
  totalCumulativeInterests: number;
  annualPrincipalPaid: number[];
  annualInterestPaid: number[];
  remainingBalanceEachYear: number[];
}

export interface MortgageCosts {
  intialCosts: number;
  mortgageDetails: MortgageDetails;
  annualCosts: PurchaseCost[];
  totalCumulativeCost: number;
}


