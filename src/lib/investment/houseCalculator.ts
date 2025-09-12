import { calculateHouseBuyTaxes, calculateIMU, getMortgageTax } from "../taxes/taxCalculators";
import { HOUSE, MORTGAGE } from "./constants";
import {
  AnnualBaseCost,
  MortgageAnnualOverview,
  MortgageDetails,
  MortgageParams,
  PurchaseCalculationParams,
  PurchaseCosts,
  RentCalculationParams,
  RentCost,
} from "./types";

export function addCumulatives<T extends Record<string, any>>(
  annualData: T[],
  fields: (keyof T)[]
): Array<T & Record<string, number>> {
  const cumulatives: Record<string, number> = {};

  return annualData.map((item) => {
    const enriched: any = { ...item };

    for (const key of fields) {
      const k = String(key);
      // assicurati di convertire a number (se non è number, lo trattiamo come 0)
      const value = typeof item[k] === "number" ? item[k] : Number(item[k]) || 0;
      cumulatives[k] = (cumulatives[k] ?? 0) + value;
      const cumKey = `cumulative${k.charAt(0).toUpperCase()}${k.slice(1)}`;
      enriched[cumKey] = cumulatives[k];
    }

    return enriched as T & Record<string, number>;
  });
}

export function calculateRentCost({
  years,
  rent,
  rentAgency,
  rentRevaluation,
  contractYears,
}: RentCalculationParams): RentCost[] {
  const annualCosts: RentCost[] = [];
  let currentRent = rent;
  let totalCumulativeRent = 0;
  let totalCumulativeCost = 0;
  const compoundRevaluationFactor = Math.pow(1 + rentRevaluation / 100, contractYears);

  for (let i = 1; i <= years; i++) {
    let currentAnnualRent = 0;
    let currentAnnualCost = 0;
    currentAnnualRent += currentRent * 12;
    // currentAnnualCost += ordinaryMaintenance * Math.pow(1 + inflation / 100, i);

    if (i === 1) currentAnnualCost += rentAgency;
    if (i > 0 && i % contractYears === 0 && i < years) {
      currentRent *= compoundRevaluationFactor;
    }

    totalCumulativeRent += currentAnnualRent;
    totalCumulativeCost += currentAnnualCost;

    annualCosts.push({
      year: i,
      annualRent: currentAnnualRent,
      cashflow: -(currentAnnualCost + currentAnnualRent),
      cumulativeRent: totalCumulativeRent,
      cumulativeCosts: totalCumulativeCost,
    });
  }

  return annualCosts;
}

export function calculateMortgage({
  amount: mortgageAmount,
  interestRate: interestRatePercentage,
  years: mortgageYears,
  isTaxCredit = true,
  isFirstHouse = true,
  amortizationType = "french",
}: MortgageParams): MortgageDetails {
  const monthlyInterestRate = interestRatePercentage / 100 / 12;
  const numberOfMortgagePayments = mortgageYears * 12;

  let monthlyMortgagePayment = 0;
  const annualOverview: MortgageAnnualOverview[] = [];
  let currentRemainingBalance = mortgageAmount;

  if (mortgageAmount <= 0 || numberOfMortgagePayments <= 0) {
    return {
      openCosts: 0,
      monthlyPayment: 0,
      annualOverview: [],
    };
  }

  // --- 1. Calcolo della Rata Mensile (se fissa) o della prima rata (se decrescente) ---
  if (amortizationType === "french") {
    if (monthlyInterestRate > 0) {
      monthlyMortgagePayment =
        (mortgageAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMortgagePayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfMortgagePayments) - 1);
    } else {
      monthlyMortgagePayment = mortgageAmount / numberOfMortgagePayments;
    }
  } else if (amortizationType === "italian") {
    const monthlyPrincipalPayment = mortgageAmount / numberOfMortgagePayments;
    monthlyMortgagePayment = monthlyPrincipalPayment + mortgageAmount * monthlyInterestRate;
  }

  let monthlyPayment = 0;
  for (let year = 0; year < mortgageYears; year++) {
    let taxBenefitThisYear = 0;
    let annualInterestForYear = 0;
    let annualPrincipalForYear = 0;

    for (let month = 0; month < 12; month++) {
      if (currentRemainingBalance <= 0) break;

      const interestThisMonth = currentRemainingBalance * monthlyInterestRate;
      let principalThisMonth: number;

      if (amortizationType === "french") {
        principalThisMonth = monthlyMortgagePayment - interestThisMonth;
        monthlyPayment = monthlyMortgagePayment;
      } else {
        principalThisMonth = mortgageAmount / numberOfMortgagePayments; // Quota capitale fissa
        monthlyPayment = principalThisMonth + interestThisMonth; // La rata totale decresce
      }

      // Adatta il capitale rimborsato per l'ultimo pagamento se il saldo rimanente è minore
      // per evitare di andare sotto zero o di rimborsare più del dovuto.
      const adjustedPrincipalThisMonth = Math.min(principalThisMonth, currentRemainingBalance);
      annualInterestForYear += interestThisMonth;
      annualPrincipalForYear += adjustedPrincipalThisMonth;
      currentRemainingBalance -= adjustedPrincipalThisMonth;

      // Aggiorna la rata per il mutuo italiano per il prossimo mese (utile se volessi tracciare ogni rata mensile)
      // if (amortizationType === "italian") {
      //   monthlyMortgagePayment = (mortgageAmount / numberOfMortgagePayments) + (currentRemainingBalance * monthlyInterestRate);
      // }
    }

    if (isTaxCredit && MORTGAGE && MORTGAGE.TAX) {
      const detraibileInterest = Math.min(annualInterestForYear, MORTGAGE.TAX.CREDIT_LIMIT);
      taxBenefitThisYear += detraibileInterest * (MORTGAGE.TAX.CREDIT_INTEREST / 100);
    }

    annualOverview.push({
      year: year,
      housePaid: annualPrincipalForYear,
      interestPaid: annualInterestForYear,
      remainingBalance: Math.max(0, currentRemainingBalance),
      taxBenefit: taxBenefitThisYear,
    });
  }

  return {
    openCosts: getMortgageTax(mortgageAmount, isFirstHouse),
    monthlyPayment: monthlyPayment,
    annualOverview: annualOverview,
  };
}

export function calculatePurchaseCost({
  years,
  housePrice,
  agency,
  notary,
  cadastralValue,
  isFirstHouse,
  isPrivateOrAgency,
  maintenancePercentage,
  renovation,
  renovationTaxCreditPercent,
  mortgage,
}: PurchaseCalculationParams): PurchaseCosts {
  const annualCosts: AnnualBaseCost[] = [];

  let mortgageDetails: MortgageDetails = {
    openCosts: 0,
    monthlyPayment: 0,
    annualOverview: [],
  };

  const buyTaxes = calculateHouseBuyTaxes(isFirstHouse, isPrivateOrAgency, cadastralValue, housePrice);
  const houseTax = calculateIMU(cadastralValue, isFirstHouse);
  const initialOneTimeCosts = agency + notary + buyTaxes;

  if (mortgage) {
    mortgageDetails = calculateMortgage({
      amount: mortgage.amount || 0,
      interestRate: mortgage.interestRate || 0,
      years: mortgage.years || 0,
      isTaxCredit: mortgage.isTaxCredit,
      isFirstHouse,
      amortizationType: mortgage.amortizationType,
    });
  }

  let annualRenovationTaxCredit = 0;
  if (renovation && renovationTaxCreditPercent && renovation > 0 && renovationTaxCreditPercent > 0) {
    const effectiveRenovationCost = Math.min(renovation, HOUSE.RENOVATION.TAX_CREDIT_LIMIT);
    annualRenovationTaxCredit =
      (effectiveRenovationCost * (renovationTaxCreditPercent / 100)) / HOUSE.RENOVATION.TAX_CREDIT_YEARS;
  }

  let cumulativeCosts = 0;
  let cumulativeTaxes = 0;
  let cumulativeTaxBenefit = 0;

  for (let i = 1; i <= years; i++) {
    const yearIndex = i - 1;
    let cashflow = 0;
    let costs = 0;
    let taxBenefit = 0;

    const annualInterestPaid = i <= (mortgage?.years || 0)
      ? (mortgageDetails.annualOverview?.[yearIndex]?.interestPaid || 0)
      : 0;
    costs += annualInterestPaid;

    if (mortgage?.isTaxCredit) {
      const annualMortgageTaxBenefit = mortgageDetails.annualOverview?.[yearIndex]?.taxBenefit || 0;
      taxBenefit += annualMortgageTaxBenefit;
    }

    if (annualRenovationTaxCredit > 0 && i <= HOUSE.RENOVATION.TAX_CREDIT_YEARS) {
      taxBenefit += annualRenovationTaxCredit;
    }

    // recurrent costs (maintenance + IMU)
    const annualMaintenanceCost = housePrice * (maintenancePercentage / 100);
    costs += annualMaintenanceCost;
    cumulativeTaxes += houseTax;

    if (i === 1) {
      // not including house capital repaid
      const initialOneTimeAndMortgageCosts = initialOneTimeCosts + (mortgageDetails.openCosts ?? 0);
      costs += initialOneTimeAndMortgageCosts;

      cashflow = -(initialOneTimeAndMortgageCosts + annualInterestPaid + annualMaintenanceCost + houseTax) + taxBenefit;
      const agencyTaxCredit = Math.min(HOUSE.AGENCY_CREDIT_LIMIT, agency * (MORTGAGE.TAX.CREDIT_INTEREST / 100));
      taxBenefit += agencyTaxCredit;
    } else {
      cashflow = -(annualInterestPaid + annualMaintenanceCost + houseTax) + taxBenefit;
    }

    cumulativeCosts += costs;
    cumulativeTaxBenefit += taxBenefit;

    annualCosts.push({
      year: i,
      cashflow: cashflow,
      cumulativeCosts: cumulativeCosts,
      taxes: cumulativeTaxes,
      taxBenefit: cumulativeTaxBenefit,
    });
  }

  const mortgageWithCumulatives: MortgageDetails = {
    ...mortgageDetails,
    annualOverview: addCumulatives(mortgageDetails.annualOverview ?? [], ["interestPaid", "taxBenefit"]),
  };

  return {
    initialCosts: initialOneTimeCosts + (mortgageDetails.openCosts ?? 0),
    annualOverview: annualCosts,
    ...(mortgage && { mortgage: mortgageWithCumulatives }),
  };
}

