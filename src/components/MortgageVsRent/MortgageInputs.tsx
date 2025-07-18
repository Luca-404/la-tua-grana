import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { BuyInputs } from "./BuyInputs";
import { mainSchema } from "./MortgageSchema";
import { RentInputs } from "./RentInputs";
import { GeneralInputs } from "./GeneralInputs";

// interface MortgageVsRentInputsProps {
//   formData: FormData;
//   onFieldChange: (id: keyof FormData, value: string | number) => void;
//   onSelectChange: (id: keyof FormData, value: string) => void;
// }

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
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center pb-2">Dettagli generali</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <GeneralInputs form={form} />
          <div className="grid grid-cols-2 ">
            <div className="border-r pr-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Acquisto</h3>
              <BuyInputs form={form} />
            </div>
            <div className="pl-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Affitto</h3>
              <RentInputs form={form} />
            </div>
          </div>
          <div className="flex justify-center">
            <Button className="text-white" type="submit">
              Calcola
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
