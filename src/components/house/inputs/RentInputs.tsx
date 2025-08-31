import { useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { MainFormInput } from "./MortgageSchema";

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
      <CardContent className="grid grid-cols-3 gap-3">
        <FormField
          control={control}
          name="rent"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center">Affitto mensile</FormLabel>
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
              <FormLabel className="justify-center">Manutenzione annuale</FormLabel>
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
            <FormItem>
              <FormLabel className="justify-center">Agenzia</FormLabel>
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
            <FormItem className={`${isInvestingDifference ? "" : "hidden"}`}>
              <FormLabel className="justify-center">Mesi di caparra</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <div className="col-span-3">
          <FormItem className="flex items-center justify-center">
            <FormLabel className="h-20">Opzioni avanzate</FormLabel>
            <FormControl>
              <Switch id="isAdvancedOptions" checked={isAdvancedOptions} onCheckedChange={setIsAdvancedOptions} />
            </FormControl>
          </FormItem>
        </div>
        <div className={`col-span-3 grid grid-cols-3 gap-3 ${isAdvancedOptions ? "" : "invisible"}`}>
          <FormField
            control={control}
            name="rentRevaluation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Variazione dell'affitto (%)</FormLabel>
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
              <FormItem>
                <FormLabel className="justify-center">Anni di contratto</FormLabel>
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
