"use client";

import { Card } from "@/components/ui/card";
import { TFRYearlyData } from "@/lib/tax";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

type SimulationTableProps = {
  data: TFRYearlyData[];
};

export function SimulationTable({ data }: SimulationTableProps) {
  return (
    <Card className="col-span-4">
      {data.length > 0 && (
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow className="text-center">
                <TableCell className="w-1/8">Anno</TableCell>
                <TableCell className="w-1/6">RAL</TableCell>
                <TableCell className="w-1/6">TFR Versato</TableCell>
                <TableCell className="w-1/6">TFR Fondo</TableCell>
                <TableCell className="w-1/6">TFR Azienda</TableCell>
                {data[0].fundWithAddition && (
                  <TableCell className="w-1/6">Contributo aggiuntivo</TableCell>
                )}
                {data[0].opportunityCost && (
                  <TableCell className="w-1/6">Costo opportunità</TableCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index}</TableCell>
                  <TableCell>{item.ral} €</TableCell>
                  <TableCell>{parseFloat(item.tfr.toFixed(0))} €</TableCell>
                  <TableCell>
                    {parseFloat(item.fund.netTFR.toFixed(0))} €
                  </TableCell>
                  <TableCell>
                    {parseFloat(item.company.netTFR.toFixed(0))} €
                  </TableCell>
                  {item.fundWithAddition && (
                    <TableCell>
                      {parseFloat(item.fundWithAddition.netTFR.toFixed(0))} €
                    </TableCell>
                  )}
                  {item.opportunityCost && (
                    <TableCell>
                      {parseFloat(item.opportunityCost.endYearCapital.toFixed(0))} €
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
