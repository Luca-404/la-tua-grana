import { TFRYearlyData } from "@/lib/tax";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

type SimulationTableProps = {
  data: TFRYearlyData[];
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
                {data[0].fundWithAddition && <TableCell className="w-1/6">Contributo aggiuntivo</TableCell>}
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {data.map((item, index) => {
                const values = [
                  item.fund.netTFR,
                  item.company.netTFR,
                  item.fundWithAddition?.netTFR,
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
                    <TableCell className={getColor(item.ral)}>{item.ral} €</TableCell>
                    <TableCell className={getColor(item.tfr)}>{parseFloat(item.tfr.toFixed(0))} €</TableCell>
                    <TableCell className={getColor(item.fund.netTFR)}>
                      {parseFloat(item.fund.netTFR.toFixed(0))} €
                    </TableCell>
                    {item.opportunityCost && (
                      <TableCell className={getColor(item.opportunityCost.endYearCapital)}>
                        {parseFloat(item.opportunityCost.endYearCapital.toFixed(0))} €
                      </TableCell>
                    )}
                    <TableCell className={getColor(item.company.netTFR)}>
                      {parseFloat(item.company.netTFR.toFixed(0))} €
                    </TableCell>
                    {item.fundWithAddition && (
                      <TableCell className={getColor(item.fundWithAddition.netTFR)}>
                        {parseFloat(item.fundWithAddition.netTFR.toFixed(0))} €
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
