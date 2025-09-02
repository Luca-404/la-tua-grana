import { calculatePurchaseCost, calculateRentCost } from "@/lib/investment/houseCalculator";
import { calculateBuyVsRentOpportunityCost, calculateCompoundGrowth } from "@/lib/investment/investmentCalculator";
import { BuyVsRentResults, CompoundPerformance } from "@/lib/investment/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { BuyInputs } from "./inputs/BuyInputs";
import { GeneralInputs } from "./inputs/GeneralInputs";
import { MainFormOutput, mainSchema } from "./inputs/MortgageSchema";
import { RentInputs } from "./inputs/RentInputs";

interface MortgageVsRentInputsProps {
  onCalculationsComplete: (results: BuyVsRentResults) => void;
}

const defaultValues: MainFormOutput = {
  housePrice: 150000,
  years: 40,
  condoFee: 100,
  inflation: 2,
  isInvestingDifference: false,
  investmentReturn: 7,
  investmentEquity: 60,
  rent: 500,
  monthDeposits: 2,
  ordinaryMaintenance: 300,
  rentAgency: 1000,
  rentRevaluation: 1,
  contractYears: 5,
  isMortgage: false,
  mortgageAmount: 30000,
  taxRate: 2.5,
  mortgageYears: 30,
  extraordinaryMaintenance: 1,
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
};

export function MortgageVsRentInputs({ onCalculationsComplete }: MortgageVsRentInputsProps) {
  const form = useForm<MainFormOutput>({
    resolver: zodResolver(mainSchema),
    defaultValues: defaultValues,
  });

  function onSubmit(values: MainFormOutput) {
    const rentCost = calculateRentCost({
      years: values.years,
      rent: values.rent,
      rentAgency: values.rentAgency,
      rentRevaluation: values.rentRevaluation,
      contractYears: values.contractYears,
    });

    const purchaseCosts = calculatePurchaseCost({
      years: values.years,
      housePrice: values.housePrice,
      agency: values.buyAgency,
      notary: values.notary,
      cadastralValue: values.cadastralValue,
      isFirstHouse: values.isFirstHouse,
      isPrivateOrAgency: values.isPrivateOrAgency,
      maintenancePercentage: values.extraordinaryMaintenance,
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
      apr: values.inflation,
    });

    const housePrice = calculateCompoundGrowth({
      capital: values.housePrice,
      years: values.years,
      apr: values.houseRevaluation,
    });

    let rentOpportunityCost: CompoundPerformance[] = [];
    let mortgageOpportunityCost: CompoundPerformance[] = [];
    if (values.isInvestingDifference) {
      const calculatedOpportunityCosts = calculateBuyVsRentOpportunityCost({
        values: { ...values },
        purchaseCosts: purchaseCosts,
        rentCosts: rentCost,
        // monthlyPayment: purchaseCosts.mortgage?.monthlyPayment,
      });
      rentOpportunityCost = calculatedOpportunityCosts.rentOpportunityCost;
      mortgageOpportunityCost = calculatedOpportunityCosts.purchaseOpportunityCost;
    }

    const initialCapital = values.isMortgage ? values.housePrice - values.mortgageAmount : values.housePrice;

    const finalResults = {
      annualOverView: rentCost.map((rent, idx) => {
        const purchase = purchaseCosts.annualOverview[idx];
        const mortgageYear = purchaseCosts.mortgage?.annualOverview?.[idx];
        return {
          year: idx,
          condoFee: {
            capital: condoFee[idx].capital,
            taxes: condoFee[idx].taxes,
            contributions: condoFee[idx].contributions,
          },
          rent: {
            annualRent: rent.annualRent,
            cumulativeRent: rent.cumulativeRent,
            cashflow: rent.cashflow,
            cumulativeCost: rent.cumulativeCost,
            annualTaxBenefit: 0,
            ...(rentOpportunityCost.length > 0 && {
              opportunityCost: {
                capital: rentOpportunityCost[idx].capital,
                taxes: rentOpportunityCost[idx].taxes,
                contributions: rentOpportunityCost[idx].contributions,
              },
            }),
          },
          purchase: {
            cashflow: purchase.cashflow,
            cumulativeCost: purchase.cumulativeCost,
            annualTaxBenefit: purchase.annualTaxBenefit,
            ...(mortgageOpportunityCost.length > 0 && {
              opportunityCost: {
                capital: mortgageOpportunityCost[idx].capital,
                taxes: mortgageOpportunityCost[idx].taxes,
                contributions: mortgageOpportunityCost[idx].contributions,
              },
            }),
            housePrice: {
              capital: housePrice[idx].capital,
              taxes: housePrice[idx].taxes,
              contributions: housePrice[idx].contributions,
            },
            ...(mortgageYear &&
              purchaseCosts.mortgage && {
                mortgage: {
                  openCosts: purchaseCosts.mortgage.openCosts,
                  monthlyPayment: purchaseCosts.mortgage.monthlyPayment,
                  housePaid: mortgageYear.housePaid,
                  interestPaid: mortgageYear.interestPaid,
                  remainingBalance: mortgageYear.remainingBalance,
                  taxBenefit: 0,
                },
              }),
          },
        };
      }),
      initialPurchaseCosts: purchaseCosts.initialCosts,
      initialCapital: purchaseCosts.initialCosts + initialCapital,
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
