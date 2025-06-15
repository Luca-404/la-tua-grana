export type TFR_PL = {
  grossTFR: number;
  netTFR: number;
  gain: number;
  cost: number;
  minus?: { amount: number; year: number; }[];
};

export type CompoundInterestPL = {
  income?: number;
  endYearCapital: number;
  depositedCapital: number;
  cost: number;
};

export type TFRYearlyData = {
  ral: number;
  tfr: number;
  inflation: number;
  fund: TFR_PL;
  company: TFR_PL;
  fundWithAddition?: TFR_PL;
  opportunityCost?: CompoundInterestPL;
};

export type LastYearData = {
  newDeposit: number;
  netCapital?: number;
  gain?: number;
  cost?: number;
  minus?: { amount: number; year: number; }[];
};

export enum AssetType {
  FUND = "fund",
  EQUITY = "equity",
  BOND = "bond",
  COMPANY = "company",
  INCOME = "income",
  NO_TAXATION = "no_taxation"
}
