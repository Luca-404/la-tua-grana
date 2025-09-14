import { useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { MainFormInput } from "./MortgageSchema";
import { HoverQuestionMark } from "@/components/ui/custom/question-mark";

interface RentInputsProps {
  form: UseFormReturn<MainFormInput>;
  className?: string;
}

export function RentInputs({ form, className }: RentInputsProps) {
  const [isAdvancedOptions, setIsAdvancedOptions] = useState(false);
  const { control } = form;
  const isInvestingDifference = useWatch({ control, name: "isInvestingDifference" });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Affitto</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-3">
        <FormField
          control={control}
          name="rent"
          render={({ field }) => (
            <FormItem className="col-span-3 md:col-span-2">
              <FormLabel className="justify-center text-sm">Affitto mensile</FormLabel>
              <FormControl>
                <Input type="number" step={50} {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        {/* <FormField
          control={control}
          name="ordinaryMaintenance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center text-sm">Manutenzione annuale</FormLabel>
              <FormControl>
                <Input type="number" step={50} {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        /> */}
        <FormField
          control={control}
          name="rentAgency"
          render={({ field }) => (
            <FormItem className="col-span-3 md:col-span-2">
              <FormLabel className="justify-center text-sm">Agenzia</FormLabel>
              <FormControl>
                <Input type="number" step={form.getValues("rent")} {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="monthDeposits"
          render={({ field }) => (
            <FormItem className={`col-span-3 md:col-span-2 ${isInvestingDifference ? "" : "hidden"}`}>
              <FormLabel className="justify-center text-sm">
                Mesi di caparra
                <HoverQuestionMark>Utilizzato nel calcolo del costo opportunità dell'affitto</HoverQuestionMark>
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormItem className="col-span-6 flex items-center justify-center">
          <FormLabel className="h-21">Opzioni avanzate</FormLabel>
          <FormControl>
            <Switch id="isAdvancedOptions" checked={isAdvancedOptions} onCheckedChange={setIsAdvancedOptions} />
          </FormControl>
        </FormItem>
        <div className={`col-span-6 grid grid-cols-6 gap-3 ${isAdvancedOptions ? "" : "hidden"}`}>
          <FormField
            control={control}
            name="rentRevaluation"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">Variazione affitto (%)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="contractYears"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">
                  Anni di contratto
                  <HoverQuestionMark>
                    Ogni quanti anni viene applicato l'incremento dell'affitto basato sull'inflazione
                  </HoverQuestionMark>
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
