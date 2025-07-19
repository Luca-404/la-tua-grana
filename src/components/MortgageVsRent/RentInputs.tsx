import { UseFormReturn } from "react-hook-form";
import { Input } from "../ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface RentInputsProps {
  form: UseFormReturn<any>;
  className?: string;
}

export function RentInputs({ form, className }: RentInputsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Affitto</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="rent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affitto mensile</FormLabel>
              <FormControl>
                <Input type="number" step={50} {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rentAgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agenzia</FormLabel>
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
          control={form.control}
          name="monthDeposits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mesi di caparra</FormLabel>
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
          control={form.control}
          name="ordinaryMaintenance"
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
          name="rentRevaluation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Varaizione dell'affitto (%)</FormLabel>
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
          control={form.control}
          name="contractYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anni di contratto</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
