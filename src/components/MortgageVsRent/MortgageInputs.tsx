import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { BuyInputs } from "./BuyInputs";
import { mainSchema } from "./MortgageSchema";
import { RentInputs } from "./RentInputs";
import { GeneralInputs } from "./GeneralInputs";

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
      ordinaryMaintenance: 0.2,
      rentRevaluation: 1,
      contractYears: 5,
      isMortgage: false,
      initialDeposit: 30000,
      taxRate: 2.5,
      mortgageYears: 10,
      cadastralValue: 500,
      allMaintenance: 1,
      houseRevaluation: 1,
      openMortgageExpenses: 1500,
      notary: 3000,
      buyAgency: 6000,
      restructuringExpenses: 0,
      isFirstHouse: true,
      isPrivateOrAgency: true,
    },
  });

  function onSubmit(values: z.infer<typeof mainSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <GeneralInputs form={form} className="border-0" />
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
