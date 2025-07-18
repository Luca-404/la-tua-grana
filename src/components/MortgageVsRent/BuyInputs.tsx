import { formatThousands } from "@/lib/utils";
import { UseFormReturn, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mortgageYearOptions } from "./MortgageSchema";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo } from "react";
import { calculateHouseBuyTaxes } from "@/lib/taxes/taxCalculators";

interface BuyInputsProps {
  form: UseFormReturn<any>;
}


export function BuyInputs({ form }: BuyInputsProps) {
  const { control, unregister, setValue } = form;

  const housePrice = useWatch({ control, name: "housePrice" });
  const cadastralValue = useWatch({ control, name: "cadastralValue" });
  const isFirstHouse = useWatch({ control, name: "isFirstHouse", defaultValue: true });
  const isPrivateOrAgency = useWatch({ control, name: "isPrivateOrAgency", defaultValue: true });
  const isMortgage = useWatch({ control, name: "isMortgage", defaultValue: false });

  const taxes = useMemo(() => {
    return calculateHouseBuyTaxes(
      isFirstHouse,
      isPrivateOrAgency,
      cadastralValue || 0, // Provide fallback for undefined/null if form not fully initialized
      housePrice || 0
    );
  }, [isFirstHouse, isPrivateOrAgency, cadastralValue, housePrice]);

  useEffect(() => {
    if (!isMortgage) {
      unregister("initialDeposit");
      unregister("notary");
      unregister("buyAgency");
      unregister("restructuringExpenses");
      setValue("initialDeposit", undefined);
      setValue("notary", undefined);
      setValue("buyAgency", undefined);
      setValue("restructuringExpenses", undefined);
    }
  }, [isMortgage, unregister, setValue]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <FormField
        control={form.control}
        name="allMaintenance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manutenzione (%)</FormLabel>
            <FormControl>
              <Input type="number" step={0.1} {...field} />
            </FormControl>
            <div className="h-5">
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="houseRevaluation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rivalutazione (%)</FormLabel>
            <FormControl>
              <Input type="number" step={0.5} {...field} />
            </FormControl>
            <div className="h-5">
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="notary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notaio</FormLabel>
            <FormControl>
              <Input type="number" step={500} {...field} />
            </FormControl>
            <div className="h-5">
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="buyAgency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agenzia</FormLabel>
            <FormControl>
              <Input type="number" step={500} {...field} />
            </FormControl>
            <div className="h-7">
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="restructuringExpenses"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ristrutturazione</FormLabel>
            <FormControl>
              <Input type="number" step={1000} {...field} />
            </FormControl>
            <div className="h-7">
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cadastralValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rendita catastale</FormLabel>
            <FormControl>
              <Input type="number" step={100} {...field} />
            </FormControl>
            <div className="h-7">
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <div>
        <div className="h-5" />
        <FormField
          control={control}
          name="isFirstHouse"
          render={({ field }) => (
            <FormItem className="min-h-9 flex items-center justify-evenly">
              <FormLabel>Prima casa</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div>
        <div className="h-5" />
        <FormField
          control={control}
          name="isPrivateOrAgency"
          render={({ field }) => (
            <FormItem className="min-h-9 flex items-center justify-evenly">
              <FormLabel>Privato/Agenzia</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormItem>
          <FormLabel className="text-center w-full">Imposte</FormLabel>
          <FormControl>
            <div className="flex h-9 rounded-md border border-input bg-background text-sm items-center justify-center">
              {taxes} €
            </div>
          </FormControl>
        </FormItem>
      </div>
      <div className="col-span-3">
        <FormField
          control={control}
          name="isMortgage"
          render={({ field }) => (
            <FormItem className="flex items-center justify-center">
              <FormLabel className="h-12">Mutuo</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div className={`${isMortgage ? "col-span-3 grid grid-cols-3 gap-3" : "hidden"}`}>
        <FormField
          control={form.control}
          name="initialDeposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deposito iniziale</FormLabel>
              <FormControl>
                <Input
                  value={formatThousands(field.value)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                    field.onChange(rawValue);
                  }}
                />
              </FormControl>
              <div className="h-7">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tasso d'interesse (%)</FormLabel>
              <FormControl className="col-span-1">
                <Input type="number" step={0.1} {...field} />
              </FormControl>
              <div className="h-7">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mortgageYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anni di mutuo</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                <FormControl className="col-span-1 w-auto">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona gli anni" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mortgageYearOptions.map((year: number) => (
                    <SelectItem key={year} value={String(year)}>
                      {year} anni
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-7">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
