import { RetirementSimulation } from "@/lib/taxes/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

type SimulationTableProps = {
  data: RetirementSimulation[];
};

export function SimulationTable({ data }: SimulationTableProps) {
  return (
    <>
      {data.length > 0 && (
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow className="text-center">
                <TableCell className="w-1/8">Anno</TableCell>
                <TableCell className="w-1/6">RAL</TableCell>
                <TableCell className="w-1/6">TFR Versato</TableCell>
                <TableCell className="w-1/6">TFR Fondo</TableCell>
                {data[0].opportunityCost && <TableCell className="w-1/6">Costo opportunità</TableCell>}
                <TableCell className="w-1/6">TFR Azienda</TableCell>
                {data[0].enhancedRetirementFund && <TableCell className="w-1/6">Contributo aggiuntivo</TableCell>}
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {data.map((item, index) => {
                const values = [
                  item.retirementFund.netValue,
                  item.companyFund.netValue,
                  item.enhancedRetirementFund?.netValue,
                  // item.opportunityCost?.endYearCapital,
                ].filter((v) => v !== undefined && v !== null) as number[];
                const max = Math.max(...values);
                const min = Math.min(...values);
                const getColor = (val: number | undefined) => {
                  if (index === 0) return "";
                  if (val === undefined) return "";
                  if (val === max) return "text-green-500 font-bold";
                  if (val === min) return "text-red-500 font-bold";
                  return "";
                };
                return (
                  <TableRow key={index}>
                    <TableCell>{index}</TableCell>
                    <TableCell className={getColor(item.grossSalary)}>{item.grossSalary} €</TableCell>
                    <TableCell className={getColor(item.despoited.baseAmount)}>{parseFloat(item.despoited.baseAmount.toFixed(0))} €</TableCell>
                    <TableCell className={getColor(item.retirementFund.netValue)}>
                      {parseFloat(item.retirementFund.netValue.toFixed(0))} €
                    </TableCell>
                    {item.opportunityCost && (
                      <TableCell className={getColor(item.opportunityCost.netValue)}>
                        {parseFloat(item.opportunityCost.netValue.toFixed(0))} €
                      </TableCell>
                    )}
                    <TableCell className={getColor(item.companyFund.netValue)}>
                      {parseFloat(item.companyFund.netValue.toFixed(0))} €
                    </TableCell>
                    {item.enhancedRetirementFund && (
                      <TableCell className={getColor(item.enhancedRetirementFund.netValue)}>
                        {parseFloat(item.enhancedRetirementFund.netValue.toFixed(0))} €
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
