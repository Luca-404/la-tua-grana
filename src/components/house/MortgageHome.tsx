import { calculatePurchaseCost, calculateRentCost } from "@/lib/investment/houseCalculator";
import { calculateBuyVsRentOpportunityCost, calculateCompoundGrowth } from "@/lib/investment/investmentCalculator";
import { CompoundPerformance } from "@/lib/investment/types";
import { calculateHouseBuyTaxes } from "@/lib/taxes/taxCalculators";
import { CalculationResults } from "@/pages/MortgageVsRent";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { BuyInputs } from "./BuyInputs";
import { GeneralInputs } from "./GeneralInputs";
import { mainSchema } from "./MortgageSchema";
import { RentInputs } from "./RentInputs";

interface MortgageVsRentInputsProps {
  onCalculationsComplete: (results: CalculationResults) => void;
}

export function MortgageVsRentInputs({ onCalculationsComplete }: MortgageVsRentInputsProps) {
  const form = useForm({
    resolver: zodResolver(mainSchema),
    defaultValues: {
      housePrice: 150000,
      years: 30,
      condoFee: 100,
      inflation: 2,
      isInvestingDifference: false,
      investmentReturn: 7,
      investmentEquity: 60,
      rent: 500,
      monthDeposits: 2,
      rentAgency: 1000,
      ordinaryMaintenance: 300,
      rentRevaluation: 1,
      contractYears: 5,
      isMortgage: false,
      mortgageAmount: 30000,
      taxRate: 2.5,
      mortgageYears: 30,
      allMaintenance: 1,
      openMortgageExpenses: 1500,
      notary: 3000,
      buyAgency: 6000,
      isFirstHouse: true,
      isPrivateOrAgency: true,
      cadastralValue: 500,
      houseRevaluation: 1,
      isMortgageTaxCredit: true,
      renovation: 0,
      renovationTaxCredit: 50,
    },
  });

  function onSubmit(values: z.infer<typeof mainSchema>) {
    const rentCost = calculateRentCost({
      years: values.years,
      rent: values.rent,
      rentAgency: values.rentAgency,
      rentRevaluation: values.rentRevaluation,
      contractYears: values.contractYears,
      // ordinaryMaintenance: values.ordinaryMaintenance,
      // inflation: values.inflation,
    });

    const purchaseCosts = calculatePurchaseCost({
      years: values.years,
      housePrice: values.housePrice,
      agency: values.buyAgency,
      notary: values.notary,
      buyTaxes: calculateHouseBuyTaxes(values.isFirstHouse, values.isPrivateOrAgency, values.cadastralValue),
      maintenancePercentage: values.allMaintenance,
      renovation: values.renovation,
      renovationTaxCreditPercent: values.renovationTaxCredit,
      ...(values.isMortgage && {
        mortgage: {
          amount: values.mortgageAmount,
          interestRate: values.taxRate,
          years: values.mortgageYears,
          isTaxCredit: values.isMortgageTaxCredit,
          isFirstHouse: values.isFirstHouse,
          amortizationType: "french",
        },
      }),
    });

    const condoFee = calculateCompoundGrowth({
      capital: values.condoFee,
      years: values.years,
      cagr: values.inflation,
    });

    const housePrice = calculateCompoundGrowth({
      capital: values.housePrice,
      years: values.years,
      cagr: values.houseRevaluation,
    });

    let rentOpportunityCost: CompoundPerformance[] = [];
    let mortgageOpportunityCost: CompoundPerformance[] = [];
    if (values.isInvestingDifference) {
      const calculatedOpportunityCosts = calculateBuyVsRentOpportunityCost({
        values: { ...values },
        monthlyPayment: purchaseCosts.mortgage?.monthlyPayment,
      });
      rentOpportunityCost = calculatedOpportunityCosts.rentOpportunityCost;
      mortgageOpportunityCost = calculatedOpportunityCosts.mortgageOpportunityCost;
    }

    const finalResults = {
      annualOverView: rentCost.map((rent, idx) => {
        const purchase = purchaseCosts.annualOverview[idx];
        const mortgageYear = purchaseCosts.mortgage?.annualOverview[idx];
        return {
          year: idx,
          condoFee: {
            capital: condoFee[idx].capital,
            totalContributions: condoFee[idx].totalContributions,
          },
          housePrice: {
            capital: housePrice[idx].capital,
            totalContributions: housePrice[idx].totalContributions,
          },
          rentCost: {
            cashflow: rent.cashflow,
            cumulativeCost: rent.cumulativeCost,
            annualRent: rent.annualRent,
            cumulativeRent: rent.cumulativeRent,
          },
          purchaseCosts: {
            cashflow: purchase.cashflow,
            cumulativeCost: purchase.cumulativeCost,
            taxBenefit: purchase.annualTaxBenefit,
            ...(mortgageYear && {
              mortgage: {
                housePaid: mortgageYear.housePaid,
                interestPaid: mortgageYear.interestPaid,
                remainingBalance: mortgageYear.remainingBalance,
              },
            }),
          },
        };
      }),
      ...(purchaseCosts.mortgage && {
        mortgage: {
          openCosts: purchaseCosts.mortgage.openCosts,
          monthlyPayment: purchaseCosts.mortgage.monthlyPayment,
        },
      }),
      ...(values.isInvestingDifference && {
        rentOpportunityCost,
        mortgageOpportunityCost,
      }),
      initialCosts: purchaseCosts.initialCosts,
      totalCosts: purchaseCosts.totalCumulativeCost,
    };

    onCalculationsComplete(finalResults);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <GeneralInputs form={form} className="border-0 pb-0" />
        <div className="grid grid-cols-2">
          <BuyInputs form={form} className="border-0" />
          <RentInputs form={form} className="border-0" />
        </div>
        <div className="flex justify-center">
          <Button className="text-white" type="submit">
            Calcola
          </Button>
        </div>
      </form>
    </Form>
  );
}
