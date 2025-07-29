import { formatThousands } from "@/lib/utils";
import { UseFormReturn, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mortgageYearOptions } from "./MortgageSchema";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { calculateHouseBuyTaxes } from "@/lib/taxes/taxCalculators";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";

interface BuyInputsProps {
  form: UseFormReturn<any>;
  className?: string;
}

export function BuyInputs({ form, className }: BuyInputsProps) {
  const [isAdvancedOptions, setIsAdvancedOptions] = useState(false);

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
      unregister("renovation");
      setValue("initialDeposit", undefined);
      setValue("notary", undefined);
      setValue("buyAgency", undefined);
      setValue("renovation", undefined);
    }
  }, [isMortgage, unregister, setValue]);

  useEffect(() => {
    if (!isAdvancedOptions) {
      // unregister("cadastralValue");
      unregister("houseRevaluation");
      unregister("isMortgageTaxCredit");
      unregister("renovation");
      unregister("renovationTaxCredit");
      // setValue("cadastralValue", undefined);
      setValue("houseRevaluation", undefined);
      setValue("isMortgageTaxCredit", undefined);
      setValue("renovation", undefined);
      setValue("renovrenovationTaxCreditation", undefined);
    }
  }, [isAdvancedOptions, unregister, setValue]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Acquisto</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="allMaintenance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center">Manutenzione (%)</FormLabel>
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
          name="notary"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center">Notaio</FormLabel>
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
              <FormLabel className="justify-center">Agenzia</FormLabel>
              <FormControl>
                <Input type="number" step={500} {...field} />
              </FormControl>
              <div className="h-5">
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
                <FormLabel className="justify-center">Prima casa</FormLabel>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="h-5" />
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
                <FormLabel className="justify-center">Privato o Agenzia</FormLabel>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="h-5" />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormItem>
            <FormLabel className="justify-center">Imposte</FormLabel>
            <FormControl>
              <div className="flex h-9 rounded-md border border-input bg-background text-sm items-center justify-center">
                {taxes} €
              </div>
            </FormControl>
            <div className="h-5" />
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
                  <Switch id="isMortgage" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className={`${isMortgage ? "col-span-3 grid grid-cols-3 gap-3" : "hidden"}`}>
          <FormField
            control={form.control}
            name="mortgageAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Importo del mutuo</FormLabel>
                <FormControl>
                  <Input
                    value={formatThousands(field.value)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                      field.onChange(rawValue);
                    }}
                  />
                </FormControl>
                <div className="h-5">
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
                <FormLabel className="justify-center">Tasso d'interesse (%)</FormLabel>
                <FormControl className="col-span-1">
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
            name="mortgageYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Anni di mutuo</FormLabel>
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
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-3">
          <FormItem className="flex items-center justify-center">
            <FormLabel className="h-20">Opzioni avanzate</FormLabel>
            <FormControl>
              <Switch id="isAdvancedOptions" checked={isAdvancedOptions} onCheckedChange={setIsAdvancedOptions} />
            </FormControl>
          </FormItem>
        </div>
        <div className={`col-span-3 grid grid-cols-3 gap-3 ${isAdvancedOptions ? "" : "hidden"}`}>
          <FormField
            control={form.control}
            name="cadastralValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Rendita catastale</FormLabel>
                <FormControl>
                  <Input type="number" step={100} {...field} />
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
                <FormLabel className="justify-center">Rivalutazione immobile (%)</FormLabel>
                <FormControl>
                  <Input type="number" step={0.5} {...field} />
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <div>
            <div className="h-5" />
            <FormField
              control={control}
              name="isMortgageTaxCredit"
              render={({ field }) => (
                <FormItem className="min-h-9 flex items-center justify-evenly">
                  <FormLabel className="justify-center">Detrazioni Mutuo</FormLabel>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="renovation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Ristrutturazione</FormLabel>
                <FormControl>
                  <Input type="number" step={1000} {...field} />
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="renovationTaxCredit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Detrazioni (%)</FormLabel>
                <FormControl>
                  <Input type="number" step={50} {...field} />
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
