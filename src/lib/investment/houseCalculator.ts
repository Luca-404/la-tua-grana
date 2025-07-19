interface RentCalculationParams {
  years: number;
  housePrice: number;
  rent: number;
  rentAgency: number;
  ordinaryMaintenance: number;
  rentRevaluation: number;
  contractYears: number;
}

interface RentCost {
  year: number;
  annualCost: number;
  cumulativeCost: number;
}

function calculateRentCost({
  years,
  housePrice,
  rent,
  rentAgency,
  ordinaryMaintenance,
  rentRevaluation,
  contractYears,
}: RentCalculationParams): RentCost[] {
  const annualCosts: RentCost[] = [];
  let currentRent = rent;
  let totalCumulativeCost = 0;
  let currentAnnualCost = rentAgency; //TODO check is correct
  const compoundRevaluationFactor = Math.pow(1 + rentRevaluation / 100, contractYears);

  for (let i = 1; i <= years; i++) {
    currentAnnualCost += currentRent * 12;
    currentAnnualCost += housePrice * (ordinaryMaintenance / 100);

    if (i > 0 && i % contractYears === 0 && i < years) {
      currentRent *= compoundRevaluationFactor;
    }

    totalCumulativeCost += currentAnnualCost;

    annualCosts.push({
      year: i,
      annualCost: currentAnnualCost,
      cumulativeCost: totalCumulativeCost,
    });
  }

  return annualCosts;
}

// const rentCalculationResults = calculateRentCost({
//   years: 40,
//   housePrice: 200000, // Esempio di valore per housePrice
//   rent: 500,
//   rentAgency: 1000,
//   ordinaryMaintenance: 0.2, // 0.2%
//   rentRevaluation: 1, // 1%
//   contractYears: 5,
// });

interface PurchaseCost {
  year: number;
  annualCost: number;
  cumulativeCost: number;
  mortgagePrincipalPaid: number;
  mortgageInterestPaid: number;
  remainingMortgageBalance: number;
}

interface PurchaseCalculationParams {
  years: number;
  housePrice: number;
  notaryFees: number;
  agencyFees: number;
  restructuring?: number;
  taxes: number;
  maintenancePercentage: number;
  // revaluationPercentage: number; // This is for asset value revaluation, not a cost. Will not be used in cost calculation.
  initialDeposit: number;
  interestRatePercentage: number;
  mortgageYears: number;
  hasMortgage: boolean;
}

function calculatePurchaseCost({
  years,
  housePrice,
  notaryFees,
  agencyFees,
  restructuring = 0,
  taxes,
  maintenancePercentage,
  initialDeposit,
  interestRatePercentage,
  mortgageYears,
  hasMortgage,
}: PurchaseCalculationParams): PurchaseCost[] {
  const annualCosts: PurchaseCost[] = [];
  let totalCumulativeCost = 0;

  let mortgageAmount = housePrice - initialDeposit;
  if (!hasMortgage || mortgageAmount <= 0) {
    mortgageAmount = 0;
  }

  const monthlyInterestRate = interestRatePercentage / 100 / 12;
  const numberOfMortgagePayments = mortgageYears * 12;

  let monthlyMortgagePayment = 0;
  if (mortgageAmount > 0 && monthlyInterestRate > 0 && numberOfMortgagePayments > 0) {
    // Formula for fixed-rate mortgage payment (French amortization)
    monthlyMortgagePayment =
      (mortgageAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMortgagePayments))) /
      (Math.pow(1 + monthlyInterestRate, numberOfMortgagePayments) - 1);
  } else if (mortgageAmount > 0 && monthlyInterestRate === 0 && numberOfMortgagePayments > 0) {
    // Case for 0% interest rate
    monthlyMortgagePayment = mortgageAmount / numberOfMortgagePayments;
  }

  const annualMortgagePayment = monthlyMortgagePayment * 12;
  const openMortgage = hasMortgage ? mortgageAmount * 0.015 : 0;
  let remainingMortgageBalance = mortgageAmount;
  const initialOneTimeCosts = restructuring + openMortgage + notaryFees + agencyFees + taxes + initialDeposit;

  for (let i = 1; i <= years; i++) {
    let currentAnnualCost = 0;
    let annualMortgagePrincipal = 0;
    let annualMortgageInterest = 0;

    if (i === 1) {
      currentAnnualCost += initialOneTimeCosts;
    }

    currentAnnualCost += housePrice * (maintenancePercentage / 100);

    const isMortgageStillOpen = hasMortgage && i <= mortgageYears && remainingMortgageBalance > 0;
    if (isMortgageStillOpen) {
      currentAnnualCost += annualMortgagePayment;

      // Calculate principal and interest paid for the year
      // This is a simplified calculation, a more accurate one would iterate monthly
      // For simplicity, we assume the annual payment is distributed over the year
      let annualInterestForYear = 0;
      let annualPrincipalForYear = 0;
      let tempRemainingBalance = remainingMortgageBalance; // Use a temp var for this year's calculation

      for (let month = 1; month <= 12; month++) {
        if (tempRemainingBalance <= 0) break; // Stop if mortgage is paid off mid-year

        const interestThisMonth = tempRemainingBalance * monthlyInterestRate;
        const principalThisMonth = monthlyMortgagePayment - interestThisMonth;

        annualInterestForYear += interestThisMonth;
        annualPrincipalForYear += principalThisMonth;
        tempRemainingBalance -= principalThisMonth;
      }

      annualMortgageInterest = annualInterestForYear;
      annualMortgagePrincipal = annualPrincipalForYear;

      // Update the actual remaining balance for the next year
      // Ensure remainingBalance doesn't go below zero due to floating point inaccuracies or final payment
      remainingMortgageBalance = Math.max(0, remainingMortgageBalance - annualPrincipalForYear);
    } else {
      remainingMortgageBalance = 0;
    }

    totalCumulativeCost += currentAnnualCost;

    annualCosts.push({
      year: i,
      annualCost: currentAnnualCost,
      cumulativeCost: totalCumulativeCost,
      mortgagePrincipalPaid: annualMortgagePrincipal,
      mortgageInterestPaid: annualMortgageInterest,
      remainingMortgageBalance: remainingMortgageBalance,
    });
  }

  return annualCosts;
}

// Example usage with values from the image and an assumed house price
const housePriceExample = 250000; // Example: Assuming a house price for calculations

const purchaseCostDetails = calculatePurchaseCost({
  years: 30, // Calculate costs for 30 years to see full mortgage amortization
  housePrice: housePriceExample,
  notaryFees: 3000,
  agencyFees: 6000,
  taxes: 1255,
  maintenancePercentage: 1, // 1%
  initialDeposit: 30000,
  interestRatePercentage: 2.5, // 2.5%
  mortgageYears: 10, // Mortgage duration
  hasMortgage: true, // Example value
});

console.log(purchaseCostDetails);

// To check total cost and total interest paid:
const totalPurchaseCost = purchaseCostDetails[purchaseCostDetails.length - 1]?.cumulativeCost;
const totalMortgageInterestPaid = purchaseCostDetails.reduce((sum, item) => sum + item.mortgageInterestPaid, 0);

console.log(`\nTotal purchase cost over the calculated years: ${totalPurchaseCost?.toFixed(2)} €`);
console.log(`Total mortgage interest paid over the mortgage term: ${totalMortgageInterestPaid.toFixed(2)} €`);
console.log(`Mortgage amount: ${housePriceExample - 30000} €`);
console.log(
  `Monthly mortgage payment: ${
    purchaseCostDetails.length > 0 &&
    purchaseCostDetails[0].mortgagePrincipalPaid + purchaseCostDetails[0].mortgageInterestPaid > 0
      ? (
          (purchaseCostDetails[0].mortgagePrincipalPaid + purchaseCostDetails[0].mortgageInterestPaid) /
          12
        ).toFixed(2)
      : 0
  } €`
);
