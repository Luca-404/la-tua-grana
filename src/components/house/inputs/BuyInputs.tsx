import { HoverQuestionMark } from "@/components/ui/custom/question-mark";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { calculateHouseBuyTaxes } from "@/lib/taxes/taxCalculators";
import { formatThousands, handleOnChangeFormatThousands } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { MainFormInput, mortgageYearOptions } from "./MortgageSchema";

interface BuyInputsProps {
  form: UseFormReturn<MainFormInput>;
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
    return calculateHouseBuyTaxes(isFirstHouse, isPrivateOrAgency, cadastralValue || 0, housePrice || 0);
  }, [isFirstHouse, isPrivateOrAgency, cadastralValue, housePrice]);

  useEffect(() => {
    if (!isMortgage) {
      unregister("mortgageAmount");
      setValue("mortgageAmount", 0);
    } else if (isMortgage) {
      unregister("mortgageAmount");
      setValue("mortgageAmount", 50000);
    }
  }, [isMortgage, unregister, setValue]);

  useEffect(() => {
    if (!isAdvancedOptions) {
      unregister("cadastralValue");
      unregister("houseRevaluation");
      unregister("isMortgageTaxCredit");
      unregister("renovation");
      unregister("renovationTaxCredit");
      setValue("cadastralValue", 500);
      setValue("houseRevaluation", 1);
      setValue("isMortgageTaxCredit", true);
      setValue("renovation", 0);
      setValue("renovationTaxCredit", 0);
    }
  }, [isAdvancedOptions, unregister, setValue]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Acquisto</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-3">
        <FormField
          control={control}
          name="extraordinaryMaintenance"
          render={({ field }) => (
            <FormItem className="col-span-3 md:col-span-2">
              <FormLabel className="justify-center text-sm">Manutenzione</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon>
                    <HoverQuestionMark>
                      Manutenzione straordinaria, calcolate in % sul del valore dell'immobile <br />
                      N.B. questo valore serve a dare un punto di partenza, in seguito la manutenzione viene
                      rivalutata in base all'inflazione
                    </HoverQuestionMark>
                  </InputGroupAddon>
                  <InputGroupInput type="number" step={0.1} {...field} />
                  <InputGroupAddon align="inline-end">%</InputGroupAddon>
                </InputGroup>
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="notary"
          render={({ field }) => (
            <FormItem className="col-span-3 md:col-span-2">
              <FormLabel className="justify-center text-sm">Notaio</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput type="number" step={500} {...field} />
                  <InputGroupAddon align="inline-end">€</InputGroupAddon>
                </InputGroup>
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="buyAgency"
          render={({ field }) => (
            <FormItem className="col-span-3 md:col-span-2">
              <FormLabel className="justify-center text-sm">Agenzia</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon>
                    <HoverQuestionMark>
                      L'agenzia beneficia di un massimo di 190€ di detrazioni
                    </HoverQuestionMark>
                  </InputGroupAddon>
                  <InputGroupInput type="number" step={500} {...field} />
                  <InputGroupAddon align="inline-end">€</InputGroupAddon>
                </InputGroup>
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="isFirstHouse"
          render={({ field }) => (
            <FormItem className="h-21 col-span-3 md:col-span-2 flex items-center justify-evenly">
              <FormLabel className="justify-center text-sm">Prima casa</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="isPrivateOrAgency"
          render={({ field }) => (
            <FormItem className="h-21 col-span-3 md:col-span-2 flex items-center justify-evenly">
              <FormLabel className="justify-center text-sm">Privato o Agenzia</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormItem className="h-9 col-span-3 md:col-span-2">
          <FormLabel className="justify-center text-sm">Imposte</FormLabel>
          <FormControl>
            <div className="rounded-lg min-h-9 flex items-center justify-center bg-background relative">
              <span className="flex-1 text-center">{taxes}</span>
              <span className="absolute right-4">€</span>
            </div>
          </FormControl>
        </FormItem>
        <FormField
          control={control}
          name="isMortgage"
          render={({ field }) => (
            <FormItem className="h-21 col-span-6 flex items-center justify-center">
              <FormLabel>
                <Popover>
                  <PopoverTrigger>
                    <TriangleAlert className="w-5 h-5 shrink-0 text-yellow-400" />
                  </PopoverTrigger>
                  <PopoverContent>
                    Se l'impostazione di investire è attivata non verrà modificato il capitale
                  </PopoverContent>
                </Popover>
                Mutuo
              </FormLabel>
              <FormControl>
                <Switch id="isMortgage" checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className={`${isMortgage ? "col-span-6 grid grid-cols-6 gap-3" : "hidden"}`}>
          <FormField
            control={control}
            name="mortgageAmount"
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-2">
                <FormLabel className="justify-center text-sm">Importo del mutuo</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      type="text"
                      inputMode="numeric"
                      placeholder="€"
                      value={formatThousands(field.value)}
                      onChange={(e) => {
                        handleOnChangeFormatThousands(field, e.target.value);
                      }}
                    />
                    <InputGroupAddon align="inline-end">€</InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="taxRate"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">Tasso d'interesse</FormLabel>
                <FormControl className="col-span-1">
                  <InputGroup>
                    <InputGroupInput type="number" step={0.1} {...field} />
                    <InputGroupAddon align="inline-end">%</InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="mortgageYears"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">Anni di mutuo</FormLabel>
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
        <FormItem className="col-span-6 flex items-center justify-center">
          <FormLabel className="h-20">Opzioni avanzate</FormLabel>
          <FormControl>
            <Switch id="isAdvancedOptions" checked={isAdvancedOptions} onCheckedChange={setIsAdvancedOptions} />
          </FormControl>
        </FormItem>
        <div className={`col-span-6 grid grid-cols-6 gap-3 ${isAdvancedOptions ? "" : "hidden"}`}>
          <FormField
            control={control}
            name="cadastralValue"
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-2">
                <FormLabel className="justify-center text-sm">Rendita catastale</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon>
                      <HoverQuestionMark>
                        Utilizzata per il calcolo delle imposte sull'aquisto dell'immobile
                      </HoverQuestionMark>
                    </InputGroupAddon>
                    <InputGroupInput type="number" step={100} {...field} />
                    <InputGroupAddon align="inline-end">€</InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="houseRevaluation"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">Variazione immobile</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput type="number" step={0.5} {...field} />
                    <InputGroupAddon align="inline-end">%</InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="houseResellingCosts"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">Spese rivendita</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon>
                      <HoverQuestionMark>
                        Stima di costi di rivendita dell'immobile, utile per calcolare il valore netto
                      </HoverQuestionMark>
                    </InputGroupAddon>
                    <InputGroupInput type="number" step={0.5} {...field} />
                    <InputGroupAddon align="inline-end">%</InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="isMortgageTaxCredit"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2 h-21 flex items-center justify-evenly">
                <FormLabel className="justify-center text-sm">Detrazioni Mutuo</FormLabel>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="renovation"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">Ristrutturazione</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      type="text"
                      inputMode="numeric"
                      placeholder="€"
                      value={formatThousands(field.value)}
                      onChange={(e) => {
                        handleOnChangeFormatThousands(field, e.target.value);
                      }}
                    />
                    <InputGroupAddon align="inline-end">€</InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <div className="h-5">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="renovationTaxCredit"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-2">
                <FormLabel className="justify-center text-sm">Detrazioni</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon>
                      <HoverQuestionMark>Detrazioni sui costi di ristrutturazione</HoverQuestionMark>
                    </InputGroupAddon>
                    <InputGroupInput type="number" step={5} min={0} max={100} {...field} />
                    <InputGroupAddon align="inline-end">%</InputGroupAddon>
                  </InputGroup>
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
