import { HoverQuestionMark } from "@/components/ui/custom/question-mark";
import { formatThousands, handleOnChangeFormatThousands } from "@/lib/utils";
import { useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { MainFormInput } from "./MortgageSchema";

interface GeneralInputsProps {
  form: UseFormReturn<MainFormInput>;
  className?: string;
}

export function GeneralInputs({ form, className }: GeneralInputsProps) {
  const { control, unregister, setValue } = form;
  const isInvestingDifference = useWatch({ control, name: "isInvestingDifference", defaultValue: false });
  const equity = useWatch({ control, name: "stockAllocation", defaultValue: 60 });
  const displayEquity = equity ?? 60;

  useEffect(() => {
    if (!isInvestingDifference) {
      unregister("investmentReturn");
      unregister("stockAllocation");
      setValue("investmentReturn", undefined);
      setValue("stockAllocation", undefined);
    }
  }, [isInvestingDifference, unregister, setValue]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Dettagli generali</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-3">
        <FormField
          control={control}
          name="capital"
          render={({ field }) => (
            <FormItem className="col-span-2 md:col-span-1">
              <FormLabel className="flex justify-center text-sm">
                Capitale
                <HoverQuestionMark>
                  Se le opzioni avanzate sono disattivate viene calcolato come la somma di:
                  <br /> prezzo dell'immoble - mutuo, agenzia, notaio, imposte.<br/>
                  <strong>Altrimenti è il capitale iniziale disponibile (a prescindere da altri fattori come il mutuo)</strong>
                </HoverQuestionMark>
              </FormLabel>
              <FormControl className="text-center">
                <Input
                  type="text"
                  placeholder="€"
                  value={formatThousands(field.value)}
                  disabled={!isInvestingDifference}
                  onChange={(e) => {
                    handleOnChangeFormatThousands(field, e.target.value);
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
          control={control}
          name="housePrice"
          render={({ field }) => (
            <FormItem className="col-span-2 md:col-span-1">
              <FormLabel className="justify-center text-sm">Immobile</FormLabel>
              <FormControl className="text-center">
                <Input
                  type="text"
                  placeholder="€"
                  value={formatThousands(field.value)}
                  onChange={(e) => {
                    handleOnChangeFormatThousands(field, e.target.value);
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
          control={control}
          name="years"
          render={({ field }) => (
            <FormItem className="col-span-2 md:col-span-1">
              <FormLabel className="justify-center text-sm">Anni simulazione</FormLabel>
              <FormControl className="text-center">
                <Input type="number" step={5} {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="condoFee"
          render={({ field }) => (
            <FormItem className="col-span-2 md:col-span-1">
              <FormLabel className="justify-center text-sm">Spese condominiali mensili</FormLabel>
              <FormControl className="text-center">
                <Input type="number" step={25} placeholder="€" {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="isInvestingDifference"
          render={({ field }) => (
            <FormItem className="mb-3 flex items-center justify-center col-span-4">
              <FormLabel className="justify-center text-sm">Investi la differenza ?</FormLabel>
              <FormControl className="text-center">
                <Switch
                  id="isInvestingDifference"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div
          className={`col-span-4 md:col-span-4 grid grid-cols-4 gap-3 ${isInvestingDifference ? "" : "hidden"}`}
        >
          <FormField
            control={control}
            name="inflation"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel className="justify-center text-sm">Inflazione (%)</FormLabel>
                <FormControl className="text-center">
                  <Input type="number" placeholder="€" {...field} />
                </FormControl>
                <div className="h-7">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="investmentReturn"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel className="justify-center text-sm">Rendimento lordo (%)</FormLabel>
                <FormControl className="text-center">
                  <Input type="number" step={0.5} {...field} />
                </FormControl>
                <div className="h-7">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="stockAllocation"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel className="justify-center text-sm">
                  Azionario (%)
                  <HoverQuestionMark>
                    La % di azionario e obbligazionario servono solo al fine del calcolo delle imposte
                  </HoverQuestionMark>
                </FormLabel>
                <FormControl className="text-center">
                  <Input type="number" step={1} min={0} max={100} {...field} />
                </FormControl>
                <div className="h-7">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormItem className="h-9 col-span-2 md:col-span-1">
            <FormLabel className="justify-center text-sm">Obbligazionario (%)</FormLabel>
            <FormControl>
              <div className="h-9 flex rounded-md border border-input bg-background text-sm items-center justify-center">
                {100 - displayEquity}
              </div>
            </FormControl>
          </FormItem>
        </div>
      </CardContent>
    </Card>
  );
}
