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

export interface CompoundValueParams {
  capital: number;
  cagr: number;
  years: number;
  compoundingFrequency?: number;
  additionalContribution?: number;
  contributionFrequency?: number;
}

export interface CompoundPerformance {
  period?: number;
  capital: number;
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

export interface AnnualBaseCost {
  year: number;
  cashflow: number;
  cumulativeCost: number;
  annualTaxBenefit?: number;
}

export interface RentCost extends AnnualBaseCost {
  annualRent: number;
  cumulativeRent: number;
}

export interface MortgageParams {
  amount: number;
  interestRate: number;
  years: number;
  isTaxCredit?: boolean;
  isFirstHouse?: boolean;
  amortizationType?: "french" | "italian";
}

export interface PurchaseCalculationParams {
  years: number;
  housePrice: number;
  agency: number;
  notary: number;
  buyTaxes: number;
  maintenancePercentage: number;
  renovation?: number;
  renovationTaxCreditPercent?: number;
  mortgage?: MortgageParams;
}

export interface MortgageAnnualOverview {
  year?: number;
  housePaid: number;
  interestPaid: number;
  remainingBalance: number;
  taxBenefit?: number;
}

export interface MortgageDetails {
  openCosts: number;
  monthlyPayment: number;
  annualOverview: MortgageAnnualOverview[];
}

export interface PurchaseCosts {
  initialCosts: number;
  annualOverview: AnnualBaseCost[];
  mortgage?: MortgageDetails;
  totalCumulativeCost: number;
}
