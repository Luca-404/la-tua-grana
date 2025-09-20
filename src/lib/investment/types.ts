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

export interface TaxRate {
  capital?: number;
  gain?: number;
}

export type GrowthMetrics = {
  apr: number;
  roi: number;
  cagr: number | null;
  roe: number | null;
};

export interface CompoundValueParams {
  apr: number;
  years: number;
  compoundingFrequency?: number;
  capital?: number;
  additionalContribution?: number | number[];
  contributionFrequency?: number;
  annualTaxRate?: TaxRate;
}

export interface CompoundPerformance {
  capital: number;
  contributions: number;
  period?: number;
  taxes?: number;
  cumulativeTaxes?: number;
}

export interface RentCalculationParams {
  years: number;
  rent: number;
  rentAgency: number;
  rentRevaluation: number;
  contractYears: number;
}

export interface AnnualBaseCost {
  year: number;
  cashflow: number;
  cumulativeCosts: number;
  cumulativeMaintenance?: number;
  taxes?: number;
  taxBenefit?: number;
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
  inflation: number;
  agency: number;
  notary: number;
  cadastralValue: number;
  isFirstHouse: boolean;
  isPrivateOrAgency: boolean;
  maintenancePercentage: number;
  renovation?: number;
  renovationTaxCreditPercent?: number;
  mortgage?: MortgageParams;
}

export interface MortgageAnnualOverview {
  year?: number;
  housePaid: number;
  interestPaid: number;
  cumulativeInterestPaid?: number;
  remainingBalance: number;
  taxBenefit?: number;
  cumulativeTaxBenefit?: number;
}

export interface MortgageDetails {
  openCosts: number;
  monthlyPayment: number;
  annualOverview?: MortgageAnnualOverview[];
}

export interface PurchaseCosts {
  annualOverview: AnnualBaseCost[];
  mortgage?: MortgageDetails;
}

export interface AnnualOverViewItem {
  year: number;
  condoFee: number;
  rent: Omit<RentCost, "year"> & { opportunityCost?: Omit<CompoundPerformance, "period"> };
  purchase: {
    cashflow: number;
    cumulativeCost: number;
    cumulativeMaintenance: number;
    cumulativeTaxes: number;
    cumulativeTaxBenefit?: number;
    housePrice: Omit<CompoundPerformance, "period">;
    opportunityCost?: Omit<CompoundPerformance, "period">;
    mortgage?: Omit<MortgageAnnualOverview, "year"> & {
      openCosts: number;
      monthlyPayment: number;
    };
  };
}

export interface BuyVsRentResults {
  annualOverView: AnnualOverViewItem[];
  generalInfo: {
    initialInvestment: number;
    initialEquity: number;
    debt: number;
    inflation: number;
    stockAllocation: number;
    houseResellingCosts: number;
    extraordinaryMaintenance: number;
  };
  initialCosts: {
    purchase: {
      agency: number;
      notary: number;
      taxes: number;
      renovation: number;
    };
    rent: {
      agency: number;
    };
  };
}
