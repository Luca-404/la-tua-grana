import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { BuyInputs } from "./BuyInputs";
import { mainSchema } from "./MortgageSchema";
import { RentInputs } from "./RentInputs";
import { GeneralInputs } from "./GeneralInputs";
import { calculatePurchaseCost, calculateRentCost } from "@/lib/investment/houseCalculator";
import { calculateCompoundGrowth, calculateMortgageOpportunityCosts } from "@/lib/investment/investmentCalculator";

export function MortgageVsRentInputs() {
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
      initialDeposit: 30000,
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
      intialCosts: values.condoFee,
      taxes: values.cadastralValue,
      maintenancePercentage: values.allMaintenance,
      initialDeposit: values.initialDeposit,
      interestRatePercentage: values.taxRate,
      mortgageYears: values.mortgageYears,
      isMortgageTaxCredit: values.isMortgageTaxCredit,
      isFirstHouse: values.isFirstHouse,
      renovation: values.renovation,
      renovationTaxCreditPercent: values.renovationTaxCredit,
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

    if (values.isInvestingDifference) {
      const { rentOpportunityCost, mortgageOpportunityCost } = calculateMortgageOpportunityCosts({
        values: {...values},
        monthlyPayment: purchaseCosts.mortgageDetails.monthlyPayment,
      });
      console.log("Rent Opportunity Cost:", rentOpportunityCost);
      console.log("Mortgage Opportunity Cost:", mortgageOpportunityCost);
    }

    console.log("Rent Cost:", rentCost);
    console.log("Mortgage Costs:", purchaseCosts);
    console.log("Condo Fee:", condoFee);
    console.log("House Price:", housePrice);
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
