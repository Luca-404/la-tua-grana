import { z } from "zod";

export const mortgageYearOptions = [10, 15, 20, 25, 30];

const MESSAGES = {
  positive: "Non può essere negativo",
  min: "Deve essere almeno",
  max: "Deve essere al massimo"
}

export const buySchema = z.object({
  isMortgage: z.coerce.boolean(),
  mortgageAmount: z.coerce.number()
    .gte(0, { message: MESSAGES.positive }),
  taxRate: z.coerce.number()
    .gte(0, { message: MESSAGES.positive })
    .lte(25, { message: MESSAGES.max + " 25%" }),
  mortgageYears: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(25), z.literal(30)], {
    message: "Selezionare un numero di anni valido tra " + mortgageYearOptions,
  }),
  allMaintenance: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  openMortgageExpenses: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  notary: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  buyAgency: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  isFirstHouse: z.coerce.boolean(),
  isPrivateOrAgency: z.coerce.boolean(),
  cadastralValue: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  houseRevaluation: z.coerce.number(),
  isMortgageTaxCredit: z.coerce.boolean(),
  renovation: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  renovationTaxCredit: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
});

export const rentSchema = z.object({
  rent: z.coerce.number().gte(1, {
    message: MESSAGES.positive,
  }),
  monthDeposits: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  ordinaryMaintenance: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  rentAgency: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  rentRevaluation: z.coerce.number(),
  contractYears: z.coerce.number().gte(1, {
    message: MESSAGES.min + " 1"
  }),
});

export const generalSchema = z.object({
  housePrice: z.coerce.number()
    .gte(1, { message: MESSAGES.min + " 1 €" }),
  years: z.coerce
    .number()
    .gte(2, { message: MESSAGES.min + " 2 anni" })
    .lte(100, { message: MESSAGES.max + " 100." }),
  condoFee: z.coerce.number().gte(0, {
    message: MESSAGES.positive,
  }),
  inflation: z.coerce.number(),
  isInvestingDifference: z.coerce.boolean(),
  investmentReturn: z.coerce.number().optional(),
  investmentEquity: z.coerce.number()
    .gte(0, { message: MESSAGES.positive })
    .lte(100, { message: MESSAGES.max + " 100%" })
    .optional(),
});

export const mainSchema = z.object({}).merge(buySchema).merge(rentSchema).merge(generalSchema);
export type MainFormData = z.infer<typeof mainSchema>;
