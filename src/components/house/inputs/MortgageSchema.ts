import { z } from "zod";

export const mortgageYearOptions = [10, 15, 20, 25, 30];

const MESSAGES = {
  positive: "Non può essere negativo",
  min: "Deve essere almeno",
  max: "Deve essere al massimo"
}

export const buySchema = z.object({
  isMortgage: z.coerce.boolean<boolean>(),
  mortgageAmount: z.coerce.number<number>()
    .nonnegative({ message: MESSAGES.positive }),
  taxRate: z.coerce.number<number>()
    .nonnegative({ message: MESSAGES.positive })
    .lte(25, { message: MESSAGES.max + " 25%" }),
  mortgageYears: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(25), z.literal(30)], {
    message: "Selezionare un numero di anni valido tra " + mortgageYearOptions,
  }),
  extraordinaryMaintenance: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  openMortgageExpenses: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  notary: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  buyAgency: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  isFirstHouse: z.coerce.boolean<boolean>(),
  isPrivateOrAgency: z.coerce.boolean<boolean>(),
  cadastralValue: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  houseRevaluation: z.coerce.number<number>(),
  isMortgageTaxCredit: z.coerce.boolean<boolean>(),
  renovation: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  renovationTaxCredit: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
});

export const rentSchema = z.object({
  rent: z.coerce.number<number>().gte(1, {
    message: MESSAGES.positive,
  }),
  monthDeposits: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  ordinaryMaintenance: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  rentAgency: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  rentRevaluation: z.coerce.number<number>(),
  contractYears: z.coerce.number<number>().gte(1, {
    message: MESSAGES.min + " 1"
  }),
});

export const generalSchema = z.object({
  housePrice: z.coerce.number<number>()
    .gte(1, { message: MESSAGES.min + " 1 €" }),
  years: z.coerce.number<number>()
    .gte(2, { message: MESSAGES.min + " 2 anni" })
    .lte(100, { message: MESSAGES.max + " 100." }),
  condoFee: z.coerce.number<number>().nonnegative({
    message: MESSAGES.positive,
  }),
  inflation: z.coerce.number<number>(),
  isInvestingDifference: z.coerce.boolean<boolean>(),
  investmentReturn: z.coerce.number<number>().optional(),
  investmentEquity: z.coerce.number<number>()
    .nonnegative({ message: MESSAGES.positive })
    .lte(100, { message: MESSAGES.max + " 100%" })
    .optional(),
});

export const mainSchema = z.object({
  ...generalSchema.shape,
  ...rentSchema.shape,
  ...buySchema.shape,
});

// export type MainFormData = z.infer<typeof mainSchema>;
export type MainFormInput = z.input<typeof mainSchema>;
export type MainFormOutput = z.output<typeof mainSchema>;
