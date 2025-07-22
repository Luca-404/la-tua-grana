import { formatNumber } from "@/lib/utils";

interface CalculatedData {
  buyDepositValue?: number;
  mortgageAmount?: number;
  stampDutyValue?: number;
  initialPurchaseExpenses?: number;
  monthlyMortgagePayment?: number;
  totalMortgageInterestPaid?: number;
  monthlyRecurringPurchaseExpenses?: number;
  totalPurchaseExpensesOverTime?: number;
  finalHouseValue?: number;
  netWorthPurchase?: number;
  initialRentalExpenses?: number;
  initialMonthlyRentalCost?: number;
  initialPACInvestment?: number;
  averageMonthlyPACInvestment?: number;
  finalPACValue?: number;
  totalRentPaid?: number;
  netWorthRentalAndPAC?: number;
  netWorthDifference?: number;
}

interface MortageVsRentRecapProps {
  data: CalculatedData;
  mortgageYears: number;
  houseValueChangePercent: number;
  rentChangePercent: number;
  grossPACYieldPercent: number;
  PACIncomeTaxationPercent: number;
}

export function MortageVsRentRecap({
  data,
  mortgageYears,
  houseValueChangePercent,
  rentChangePercent,
  grossPACYieldPercent,
  PACIncomeTaxationPercent,
}: MortageVsRentRecapProps) {
  return (
    <div className="mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Risultati del Confronto su {mortgageYears} anni</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-blue-600">Dettagli Acquisto</h3>
          <div className="space-y-1 text-left">
            <p>Acconto versato: {formatNumber(data.buyDepositValue)} €</p>
            <p>Importo mutuo richiesto: {formatNumber(data.mortgageAmount)} €</p>
            <p>
              Spese iniziali (acconto, istruttoria, bollo/registro): {formatNumber(data.initialPurchaseExpenses)} €
            </p>
            <p>Rata mensile mutuo: {formatNumber(data.monthlyMortgagePayment, 2)} €</p>
            <p>Totale interessi pagati sul mutuo: {formatNumber(data.totalMortgageInterestPaid, 2)} €</p>
            <p>
              Spese mensili ricorrenti (condominio, manutenzione):{" "}
              {formatNumber(data.monthlyRecurringPurchaseExpenses, 2)} €
            </p>
            <p className="font-semibold">
              Costo totale esborsi (spese iniziali + interessi + spese ricorrenti):{" "}
              {formatNumber(data.totalPurchaseExpensesOverTime, 2)} €
            </p>
            <p>
              Valore finale immobile (con var. {houseValueChangePercent}% annua):{" "}
              {formatNumber(data.finalHouseValue, 2)} €
            </p>
            <p className="text-lg font-bold mt-2">
              Patrimonio Netto Finale (Acquisto): {formatNumber(data.netWorthPurchase, 2)} €
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3 text-green-600">Dettagli Affitto + Investimento</h3>
          <div className="space-y-1 text-left">
            <p>Caparra versata (e restituita a fine periodo): {formatNumber(data.initialRentalExpenses)} €</p>
            <p>
              Costo mensile iniziale affitto (canone, condominio, manutenzione):{" "}
              {formatNumber(data.initialMonthlyRentalCost, 2)} €
            </p>
            <p>Investimento iniziale nel PAC: {formatNumber(data.initialPACInvestment, 2)} €</p>
            <p>
              Investimento mensile medio nel PAC (differenza costi):{" "}
              {formatNumber(data.averageMonthlyPACInvestment, 2)} €
            </p>
            <p>
              Totale affitto e spese ricorrenti pagate in {mortgageYears} anni (con var. {rentChangePercent}%
              annua): {formatNumber(data.totalRentPaid, 2)} €
            </p>
            <p className="text-lg font-bold mt-2">
              Valore Finale PAC (rend. {grossPACYieldPercent}% lordo, tass. {PACIncomeTaxationPercent}%):{" "}
              {formatNumber(data.finalPACValue, 2)} €
            </p>
            <p className="text-lg font-bold mt-2">
              Patrimonio Netto Finale (Affitto + PAC): {formatNumber(data.netWorthRentalAndPAC, 2)} €
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-2xl font-bold">
          {data.netWorthDifference && data.netWorthDifference > 0
            ? `L'opzione ACQUISTO è più vantaggiosa di ${formatNumber(data.netWorthDifference, 2)} €`
            : data.netWorthDifference && data.netWorthDifference < 0
            ? `L'opzione AFFITTO + INVESTIMENTO è più vantaggiosa di ${formatNumber(
                Math.abs(data.netWorthDifference),
                2
              )} €`
            : "Le due opzioni hanno un risultato patrimoniale simile."}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Questo confronto considera solo gli aspetti finanziari. Valuta anche fattori personali, di stile di vita
          e di stabilità.
        </p>
      </div>
    </div>
  );
}
