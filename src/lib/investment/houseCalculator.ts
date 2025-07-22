import { getMortgageTax } from "../taxes/taxCalculators";
import { MORTGAGE } from "./constants";
import { MortgageCalculationParams, MortgageCosts, MortgageDetails, PurchaseCalculationParams, PurchaseCost, RentCalculationParams, RentCost } from "./types";

export function calculateRentCost({
  years,
  rent,
  rentAgency,
  rentRevaluation,
  contractYears,
  // ordinaryMaintenance,
  // inflation,
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
      annualCost: currentAnnualCost,
      cumulativeRent: totalCumulativeRent,
      cumulativeCost: totalCumulativeCost,
    });
  }

  return annualCosts;
}

export function calculateMortgage({
  mortgageAmount,
  interestRatePercentage,
  mortgageYears,
  isFirstHouse,
  amortizationType,
}: MortgageCalculationParams): MortgageDetails {
  const monthlyInterestRate = interestRatePercentage / 100 / 12;
  const numberOfMortgagePayments = mortgageYears * 12;

  let monthlyMortgagePayment = 0;
  let totalCumulativeInterests = 0;
  const annualPrincipalPaid: number[] = new Array(mortgageYears).fill(0);
  const annualInterestPaid: number[] = new Array(mortgageYears).fill(0);
  const remainingBalanceEachYear: number[] = new Array(mortgageYears).fill(0);

  let currentRemainingBalance = mortgageAmount;

  if (mortgageAmount <= 0 || numberOfMortgagePayments <= 0) {
    return {
      openCosts: 0,
      monthlyPayment: 0,
      totalCumulativeInterests: 0,
      annualPrincipalPaid: annualPrincipalPaid,
      annualInterestPaid: annualInterestPaid,
      remainingBalanceEachYear: remainingBalanceEachYear,
    };
  }

  if (amortizationType === 'french') {
    if (monthlyInterestRate > 0) {
      monthlyMortgagePayment =
        (mortgageAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMortgagePayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfMortgagePayments) - 1);
    } else {
      monthlyMortgagePayment = mortgageAmount / numberOfMortgagePayments;
    }

    for (let year = 0; year < mortgageYears; year++) {
      let annualInterestForYear = 0;
      let annualPrincipalForYear = 0;

      for (let month = 0; month < 12; month++) {
        if (currentRemainingBalance <= 0) break;

        const interestThisMonth = currentRemainingBalance * monthlyInterestRate;
        const principalThisMonth = monthlyMortgagePayment - interestThisMonth;

        annualInterestForYear += interestThisMonth;
        annualPrincipalForYear += principalThisMonth;
        currentRemainingBalance -= principalThisMonth;
      }
      totalCumulativeInterests += annualInterestForYear;
      annualPrincipalPaid[year] = annualPrincipalForYear;
      annualInterestPaid[year] = annualInterestForYear;
      remainingBalanceEachYear[year] = Math.max(0, currentRemainingBalance);
    }
  } else if (amortizationType === 'italian') {
    const monthlyPrincipalPayment = mortgageAmount / numberOfMortgagePayments;

    for (let year = 0; year < mortgageYears; year++) {
      let annualInterestForYear = 0;
      let annualPrincipalForYear = 0;

      for (let month = 0; month < 12; month++) {
        if (currentRemainingBalance <= 0) break;

        const interestThisMonth = currentRemainingBalance * monthlyInterestRate;
        const principalThisMonth = monthlyPrincipalPayment; 

        annualInterestForYear += interestThisMonth;
        annualPrincipalForYear += principalThisMonth;
        currentRemainingBalance -= principalThisMonth;
      }
      totalCumulativeInterests += annualInterestForYear;
      annualPrincipalPaid[year] = annualPrincipalForYear;
      annualInterestPaid[year] = annualInterestForYear;
      remainingBalanceEachYear[year] = Math.max(0, currentRemainingBalance);
    }
    if (mortgageAmount > 0) {
      monthlyMortgagePayment = monthlyPrincipalPayment + (mortgageAmount * monthlyInterestRate);
    }
  }

  return {
    openCosts: getMortgageTax(mortgageAmount, isFirstHouse),
    monthlyPayment: monthlyMortgagePayment,
    totalCumulativeInterests: totalCumulativeInterests,
    annualPrincipalPaid: annualPrincipalPaid,
    annualInterestPaid: annualInterestPaid,
    remainingBalanceEachYear: remainingBalanceEachYear,
  };
}

export function calculatePurchaseCost({
  years,
  housePrice,
  intialCosts,
  taxes,
  maintenancePercentage,
  initialDeposit,
  interestRatePercentage,
  mortgageYears,
  isFirstHouse,
  isMortgageTaxCredit,
  renovation,
  renovationTaxCreditPercent,
  amortizationType = 'french',
}: PurchaseCalculationParams & { amortizationType?: 'french' | 'italian' }): MortgageCosts {
  const annualCosts: PurchaseCost[] = [];
  let totalCumulativeCost = 0;

  let mortgageAmount = housePrice - initialDeposit;
  if (mortgageAmount < 0) {
    mortgageAmount = 0;
  }

  const mortgageDetails = calculateMortgage({
      mortgageAmount,
      interestRatePercentage,
      mortgageYears,
      isFirstHouse,
      amortizationType,
    });
  
  const initialOneTimeCosts = intialCosts + mortgageDetails.openCosts + taxes + initialDeposit;

  let annualRenovationTaxCredit = 0;
  if (renovation > 0 && renovationTaxCreditPercent > 0 && MORTGAGE.RENOVATION.TAX_CREDIT_YEARS > 0) {
    const effectiveRenovationCost = Math.min(renovation, MORTGAGE.RENOVATION.TAX_CREDIT_LIMIT);
    annualRenovationTaxCredit = (effectiveRenovationCost * (renovationTaxCreditPercent / 100)) / MORTGAGE.RENOVATION.TAX_CREDIT_YEARS;
  }

  for (let i = 1; i <= years; i++) {
    let currentAnnualCost = 0;
    let annualMortgagePrincipal = 0;
    let annualMortgageInterest = 0;
    let currentRemainingMortgageBalance = 0;
    let annualTaxBenefit = 0;

    if (i === 1) currentAnnualCost += initialOneTimeCosts;

    currentAnnualCost += housePrice * (maintenancePercentage / 100);

    if (mortgageDetails.openCosts > 0 && i <= mortgageYears) {
      const yearIndex = i - 1;
      annualMortgagePrincipal = mortgageDetails.annualPrincipalPaid[yearIndex] || 0;
      annualMortgageInterest = mortgageDetails.annualInterestPaid[yearIndex] || 0;
      currentRemainingMortgageBalance = mortgageDetails.remainingBalanceEachYear[yearIndex] || 0;
      currentAnnualCost += annualMortgagePrincipal + annualMortgageInterest;
    }

    // --- Calcolo delle Detrazioni Fiscali ---
    if (isMortgageTaxCredit) {
      const detraibileInterest = Math.min(annualMortgageInterest, MORTGAGE.TAX.CREDIT_LIMIT);
      const mortgageBenefit = detraibileInterest * (MORTGAGE.TAX.CREDIT_INTEREST / 100);
      const agencyTaxCredit = 1000 * (MORTGAGE.TAX.CREDIT_INTEREST / 100) //TODO use agency price (19%, max 190)
      annualTaxBenefit += mortgageBenefit + agencyTaxCredit;
    }

    if (annualRenovationTaxCredit > 0 && i <= MORTGAGE.RENOVATION.TAX_CREDIT_YEARS) {
      annualTaxBenefit += annualRenovationTaxCredit;
    }

    currentAnnualCost -= annualTaxBenefit;
    currentAnnualCost = Math.max(0, currentAnnualCost);

    totalCumulativeCost += currentAnnualCost;

    annualCosts.push({
      year: i,
      annualCost: currentAnnualCost,
      cumulativeCost: totalCumulativeCost,
      mortgagePrincipalPaid: annualMortgagePrincipal,
      mortgageInterestPaid: annualMortgageInterest,
      remainingMortgageBalance: currentRemainingMortgageBalance,
      annualTaxBenefit: annualTaxBenefit,
    });
  }

  return {
    intialCosts: intialCosts,
    mortgageDetails: mortgageDetails,
    annualCosts: annualCosts,
    totalCumulativeCost: totalCumulativeCost,
  };
}
