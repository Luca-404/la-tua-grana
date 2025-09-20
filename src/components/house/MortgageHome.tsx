import { addCumulatives, calculatePurchaseCost, calculateRentCost } from "@/lib/investment/houseCalculator";
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
import { calculateHouseBuyTaxes } from "@/lib/taxes/taxCalculators";
import { useEffect } from "react";

interface MortgageVsRentInputsProps {
  onCalculationsComplete: (results: BuyVsRentResults) => void;
}

const MONTHS = 12;

const defaultValues: MainFormOutput = {
  capital: 150000,
  housePrice: 150000,
  years: 40,
  condoFee: 100,
  inflation: 2,
  isInvestingDifference: false,
  investmentReturn: 7,
  stockAllocation: 60,
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
  houseResellingCosts: 5,
  isMortgageTaxCredit: true,
  renovation: 0,
  renovationTaxCredit: 50,
};

export function MortgageVsRentInputs({ onCalculationsComplete }: MortgageVsRentInputsProps) {
  const form = useForm<MainFormOutput>({
    resolver: zodResolver(mainSchema),
    defaultValues: defaultValues,
  });

  const watchIsInvestingDifference = form.watch("isInvestingDifference");

  useEffect(() => {
    if (watchIsInvestingDifference) return;

    const buyAgency = form.watch("buyAgency");
    const notary = form.watch("notary");
    const isFirstHouse = form.watch("isFirstHouse");
    const isPrivateOrAgency = form.watch("isPrivateOrAgency");
    const cadastralValue = form.watch("cadastralValue");
    const housePrice = form.watch("housePrice");
    const isMortgage = form.watch("isMortgage");
    const mortgageAmount = form.watch("mortgageAmount");
    const renovation = Number(form.watch("renovation"));

    const purchaseInitialCosts =
      (buyAgency || 0) +
      (notary || 0) +
      calculateHouseBuyTaxes(isFirstHouse, isPrivateOrAgency, cadastralValue, housePrice);

    const initialEquity = isMortgage ? housePrice - (mortgageAmount || 0) : housePrice;

    const newCapital = purchaseInitialCosts + initialEquity + renovation;

    form.setValue("capital", newCapital, { shouldValidate: true });
  }, [
    watchIsInvestingDifference,
    form.watch("buyAgency"),
    form.watch("notary"),
    form.watch("isFirstHouse"),
    form.watch("isPrivateOrAgency"),
    form.watch("cadastralValue"),
    form.watch("housePrice"),
    form.watch("isMortgage"),
    form.watch("mortgageAmount"),
    form.watch("renovation"),
  ]);

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
      inflation: values.inflation,
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
      });

      rentOpportunityCost = addCumulatives(calculatedOpportunityCosts.rentOpportunityCost, ["taxes"]);
      mortgageOpportunityCost = addCumulatives(calculatedOpportunityCosts.purchaseOpportunityCost, ["taxes"]);
    }
    
    let cumulativeCondoFee = 0;

    const finalResults = {
      annualOverView: rentCost.map((rent, idx) => {
        const purchase = purchaseCosts.annualOverview[idx];
        const mortgageYear = purchaseCosts.mortgage?.annualOverview?.[idx];
        cumulativeCondoFee += condoFee[idx].capital * MONTHS;
        return {
          year: idx,
          condoFee: cumulativeCondoFee,
          rent: {
            annualRent: rent.annualRent,
            cumulativeRent: rent.cumulativeRent,
            cashflow: rent.cashflow - condoFee[idx].capital * MONTHS,
            cumulativeCosts: rent.cumulativeCosts,
            ...(rentOpportunityCost.length > 0 && {
              opportunityCost: {
                capital: rentOpportunityCost[idx].capital,
                taxes: rentOpportunityCost[idx].taxes,
                cumulativeTaxes: rentOpportunityCost[idx].cumulativeTaxes,
                contributions: rentOpportunityCost[idx].contributions,
              },
            }),
          },
          purchase: {
            cashflow: purchase.cashflow - condoFee[idx].capital * MONTHS,
            cumulativeCost: purchase.cumulativeCosts,
            cumulativeMaintenance: purchase.cumulativeMaintenance ?? 0,
            cumulativeTaxes: purchase.taxes ?? 0,
            cumulativeTaxBenefit: purchase.taxBenefit,
            ...(mortgageOpportunityCost.length > 0 && {
              opportunityCost: {
                capital: mortgageOpportunityCost[idx].capital,
                taxes: mortgageOpportunityCost[idx].taxes,
                cumulativeTaxes: mortgageOpportunityCost[idx].cumulativeTaxes,
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
                  cumulativeInterestPaid: mortgageYear.cumulativeInterestPaid,
                  remainingBalance: mortgageYear.remainingBalance,
                  taxBenefit: mortgageYear.taxBenefit,
                },
              }),
          },
        };
      }),
      initialCosts: {
        purchase: {
          agency: values.buyAgency,
          notary: values.notary,
          taxes: calculateHouseBuyTaxes(
            values.isFirstHouse,
            values.isPrivateOrAgency,
            values.cadastralValue,
            values.housePrice
          ),
          renovation: values.renovation,
        },
        rent: {
          agency: values.rentAgency,
        },
      },
      generalInfo: {
        initialInvestment: values.capital + (values.mortgageAmount ?? 0),
        initialEquity: values.capital,
        debt: values.mortgageAmount,
        inflation: values.inflation,
        stockAllocation: values.stockAllocation ?? 0,
        houseResellingCosts: values.houseResellingCosts,
        extraordinaryMaintenance: values.extraordinaryMaintenance,
      },
    };

    onCalculationsComplete(finalResults);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <GeneralInputs form={form} className="border-0 shadow-none"/>
        <div className="grid grid-cols-2 shadow-none">
          <BuyInputs form={form} className="col-span-2 md:col-span-1 border-0 shadow-none" />
          <RentInputs form={form} className="col-span-2 md:col-span-1 border-0 shadow-none" />
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
