import { UseFormReturn, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { formatThousands } from "@/lib/utils";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";

// interface GeneralInputsFormValues {
//   housePrice: number | string;
//   years: number;
//   condoFee: number;
//   inflation: number;
//   isInvestingDifference: boolean;
//   investmentReturn?: number;
//   investmentEquity?: number;
// }

interface GeneralInputsProps {
  form: UseFormReturn<any>;
  className?: string;
}

export function GeneralInputs({ form, className }: GeneralInputsProps) {
  const { control, unregister, setValue } = form;
  const isInvestingDifference = useWatch({ control, name: "isInvestingDifference", defaultValue: false });
  const equity = useWatch({ control, name: "investmentEquity", defaultValue: 60 });
  const displayEquity = equity ?? 60;

  useEffect(() => {
    if (!isInvestingDifference) {
      unregister("investmentReturn");
      unregister("investmentEquity");
      setValue("investmentReturn", undefined);
      setValue("investmentEquity", undefined);
    }
  }, [isInvestingDifference, unregister, setValue]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Dettagli generali</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-3">
        <FormField
          control={form.control}
          name="housePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center">Prezzo dell'immobile</FormLabel>
              <FormControl className="text-center">
                <Input
                  type="text"
                  placeholder="€"
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
          name="years"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center">Anni simulazione</FormLabel>
              <FormControl className="text-center">
                <Input type="number" {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condoFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center">Spese condominiali mensili</FormLabel>
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
          control={form.control}
          name="inflation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-center">Inflazione (%)</FormLabel>
              <FormControl className="text-center">
                <Input type="number" placeholder="€" {...field} />
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
            control={form.control}
            name="isInvestingDifference"
            render={({ field }) => (
              <FormItem className="min-h-9 flex items-center justify-evenly">
                <FormLabel className="justify-center">Investi la differenza ?</FormLabel>
                <FormControl>
                  <Switch id="isInvestingDifference" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className={`col-span-3 grid grid-cols-3 gap-3 ${isInvestingDifference ? "" : "invisible"}`}>
          <FormField
            control={form.control}
            name="investmentReturn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Rendimento (%)</FormLabel>
                <FormControl className="col-span-1">
                  <Input type="number" step={0.5} {...field} />
                </FormControl>
                <div className="h-7">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="investmentEquity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="justify-center">Azionario (%)</FormLabel>
                <FormControl className="col-span-1">
                  <Input type="number" step={1} min={0} max={100} {...field} />
                </FormControl>
                <div className="h-7">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <div>
            <FormItem>
              <FormLabel className="justify-center">Obbligazionario</FormLabel>
              <FormControl>
                <div className="flex h-9 rounded-md border border-input bg-background text-sm items-center justify-center">
                  {100 - displayEquity} %
                </div>
              </FormControl>
              <div className="h-5"></div>
            </FormItem>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
