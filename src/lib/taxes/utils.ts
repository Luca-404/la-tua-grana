export function getIncomeTaxRate(taxableIncome: number) {
  let tax = 0;
  if (taxableIncome <= 28000) {
    tax = taxableIncome * 0.23;
  } else if (taxableIncome <= 50000) {
    tax = 28000 * 0.23 + (taxableIncome - 28000) * 0.35;
  } else {
    tax = 28000 * 0.23 + (50000 - 28000) * 0.35 + (taxableIncome - 50000) * 0.43;
  }
  return tax;
}

export function getCompanyTaxRate(history: any[], year: number): number {
  const lastFiveYears = history.slice(year - 5, year).map((item) => item.ral);
  const { totalIncome, totalTax } = lastFiveYears.reduce(
    (acc, income) => {
      const tax = getIncomeTaxRate(income);
      acc.totalIncome += income;
      acc.totalTax += tax;
      return acc;
    },
    { totalIncome: 0, totalTax: 0 }
  );

  const averageRate = (totalTax / totalIncome) * 100;
  return parseFloat(averageRate.toFixed(2));
}

export function getFundTaxRate(years: number): number {
  const baseRate = 15;
  const minRate = 9;
  const reductionPerYear = 0.3;

  if (years < 15) return 23;

  const reductionYears = Math.max(0, years - 15);
  const reduction = reductionYears * reductionPerYear;

  let finalRate = baseRate - reduction;

  finalRate = Math.max(finalRate, minRate);

  return parseFloat(finalRate.toFixed(2));
}