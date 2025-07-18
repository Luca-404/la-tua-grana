import { z } from "zod";

export const mortgageYearOptions = [10, 15, 20, 25, 30];

export const buySchema = z.object({
  initialDeposit: z.preprocess((val) => {
    const cleaned = String(val).replace(/\./g, "");
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  }, z.number().gte(1, { message: "La casa deve costare almeno 1 €" })),
  taxRate: z.coerce
    .number()
    .gte(0.01, {
      message: "Il tasso annuale deve essere almeno 0,01%",
    })
    .lte(25, {
      message: "Il tasso annuale deve essere al massimo 25%",
    }),
  mortgageYears: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(25), z.literal(30)], {
    message: "Selezionare un numero di anni valido (10, 15, 20, 25, 30).",
  }),
  allMaintenance: z.coerce.number().gte(0, {
    message: "I costi di mantenimento non possono essere negativi",
  }),
  cadastralValue: z.coerce.number().gte(0, {
    message: "La rendita catastale non può essere negativa",
  }),
  openMortgageExpenses: z.coerce.number().gte(0, {
    message: "Il costo dell'apertura del mutuo non può essere negativo",
  }),
  notary: z.coerce.number().gte(0, {
    message: "Il costo del notaio non può essere negativo",
  }),
  buyAgency: z.coerce.number().gte(0, {
    message: "Il costo dell'agenzia non può essere negativo",
  }),
  restructuringExpenses: z.coerce.number().gte(0, {
    message: "Il costo della ristrutturazione non può essere negativo",
  }),
  houseRevaluation: z.coerce.number(),
  isFirstHouse: z.boolean().default(true),
  isPrivateOrAgency: z.boolean().default(true),
  isMortgage: z.boolean().default(true),
});

export const rentSchema = z.object({
  rent: z.coerce.number().gte(1, {
    message: "L'affitto non può essere negativo",
  }),
  monthDeposits: z.coerce.number().gte(0, {
    message: "La caparra non può essere negativa",
  }),
  ordinaryMaintenance: z.coerce.number().gte(0, {
    message: "I costi di mantenimento non possono essere negativi",
  }),
  rentAgency: z.coerce.number().gte(0, {
    message: "Il costo dell'agenzia non può essere negativo",
  }),
  rentRevaluation: z.coerce.number(),
  contractYears: z.coerce.number(),
});

const generalSchema = z.object({
  housePrice: z.preprocess((val) => {
    const cleaned = String(val).replace(/\./g, "");
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  }, z.number().gte(1, { message: "La casa deve costare almeno 1 €" })),
  years: z.coerce
    .number()
    .gte(2, {
      message: "La comparazione necessita di almeno 2 anni.",
    })
    .lte(100, {
      message: "Il numero di anni non può superare 100.",
    }),
  condoFee: z.coerce.number().gte(0, {
    message: "Le spese condominiali non possono essere negative.",
  }),
  inflation: z.coerce.number(),
  isInvestingDifference: z.coerce.boolean(),
  investmentReturn: z.coerce.number().optional(),
  investmentEquity: z.coerce.number()
    .gte(0, {
      message: "L'azionario non può essere negativo",
    })
    .lte(100, {
      message: "La % di azionario non può superare il 100%",
    })
    .optional(),
});

export const mainSchema = z.object({}).merge(buySchema).merge(rentSchema).merge(generalSchema);

export type MainFormData = z.infer<typeof mainSchema>;
