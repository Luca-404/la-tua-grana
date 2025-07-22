import { FundData } from "./types";

export const TFR = {
  MULTIPLIER: 0.0691,
  REVALUATION_FIXED_RATE: 1.5,
  INFALTION_MULTIPLIER: 0.75,
  MAX_DEDUCTION: 5164.57,
  MINUS_PRESCRIPTION_YEARS: 4,
};

export const CCNLFund: Record<string, FundData> = {
  "COMETA": {
    name: "FONDO PENSIONE COMETA",
    CCNL: "Industria Metalmeccanica privata e dell'Installazione di Impianti, aziende industriali orafe-argentiere",
    min_employee_contribution: 1.2,
    employer_contribution: 2,
  },
  "FONTE": {
    name: "FONDO PENSIONE FON.TE.",
    CCNL: "Terziario (Commercio, Turismo, Servizi), Cooperative",
    min_employee_contribution: 0.55,
    employer_contribution: 1.55,
  },
  "PREVEDI": {
    name: "FONDO PENSIONE PREVEDI",
    CCNL: "Edilizia (Lavoratori dipendenti del settore edile e affini)",
    min_employee_contribution: 1.0,
    employer_contribution: 1.0,
  },
  "FONCHIM": {
    name: "FONDO PENSIONE FONCHIM",
    CCNL: "Industria Chimica, Farmaceutica, Fibre Tessili, Gomma Plastica, Vetro, Lampade e Cinescopi, Abrasivi, Ceramica, Laterizi e affini, Minero-metallurgici",
    min_employee_contribution: 0.70,
    employer_contribution: 2.00, // Nota: Il contributo datoriale Fonchim è tipicamente 2.0%, ma può variare.
  },
  "FOPEN": {
    name: "FONDO PENSIONE FOPEN",
    CCNL: "Dipendenti del Gruppo Poste Italiane",
    min_employee_contribution: 1.0,
    employer_contribution: 1.0, // Nota: Contributo datoriale Fopen è 2.3% della retribuzione utile al TFR, non 1.0%. Da verificare.
  },
  "LABORFONDS": {
    name: "FONDO PENSIONE LABORFONDS",
    CCNL: "Lavoratori del Trentino-Alto Adige (intersettoriale)",
    min_employee_contribution: 1.0,
    employer_contribution: 1.0, // Nota: Anche qui, il contributo datoriale può essere più alto. Da verificare.
  },
  "ESPERO": {
    name: "FONDO PENSIONE FONDO SCUOLA ESPERO",
    CCNL: "Personale della Scuola (Comparto Scuola)",
    min_employee_contribution: 1.0,
    employer_contribution: 1.0,
  },
  "PERSEO SIRIO": {
    name: "FONDO PERSEO SIRIO",
    CCNL: "Dipendenti della Pubblica Amministrazione (Ministeri, Regioni, Autonomie Locali, Sanità, ecc.)",
    min_employee_contribution: 1.0,
    employer_contribution: 1.0, // Nota: Il contributo datoriale Perseo Sirio è tipicamente 1.5%, ma può variare.
  },
  "PRIAMO": {
    name: "FONDO PENSIONE PRIAMO",
    CCNL: "Trasporto Pubblico Locale e settori affini (es. Autoferrotranvieri)",
    min_employee_contribution: 1.0, // Valori tipici (a volte 2%)
    employer_contribution: 1.0,     // Valori tipici (a volte 2%)
  },
  "BYBLOS": {
    name: "FONDO PENSIONE BYBLOS",
    CCNL: "Industria Carta e Cartone, aziende grafiche editoriali e affini, comunicazione e spettacolo, sport e tempo libero",
    min_employee_contribution: 1.0,
    employer_contribution: 1.0, // Nota: Il contributo datoriale Byblos è tipicamente 1.2%. Da verificare.
  },
  "OTHER": {
    name: "",
    CCNL: "Non specificato o non presente in elenco",
    min_employee_contribution: 0,
    employer_contribution: 0,
  },
};

export const MORTGAGE = {
  TAX: {
    FIRST_HOUSE_SUBSTITUTE: 0.25,
    SECOND_HOUSE_SUBSTITUTE: 2,
    CREDIT_LIMIT: 4000,
    CREDIT_INTEREST: 19,
  },
  OPEN_COSTS: 1.5,
  RENOVATION: {
    TAX_CREDIT_YEARS: 10,
    TAX_CREDIT_LIMIT: 96000
  }
}
