import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "@/components/ui/button";
import { InputWithSuffix } from "@/components/ui/custom/input-icon";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComparisonChart } from "@/components/charts/ComparisonChart.tsx";
import { CapitalChart } from "@/components/charts/CapitalChart.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { AssetType, TFRYearlyData, calculateTFR } from "@/utils/tax";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import { ChevronsUpDown } from "lucide-react";

function FundAnalysis() {
  const [simulationResult, setSimulationResult] = useState(
    [] as TFRYearlyData[]
  );
  const [formData, setFormData] = useState({
    years: 40,
    ral: 30000,
    personalExtraContribution: 0,
    employerExtraContribution: 0,
    fundEquity: 0,
    fundReturn: 3,
    salaryGrowth: 0,
    inflation: 2,
  });
  const [showInputs, setShowInputs] = useState(false);

  const toggleInputs = () => {
    setShowInputs((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: Number(value),
    }));
  };

  const simulateTFRWithInflation = () => {
    const salaryGrowth = formData.salaryGrowth / 100;
    const fundReturn = formData.fundReturn;
    const tfrIndexation = 1.5 + 0.75 * formData.inflation;
    let currentRAL = formData.ral;
    const additionalDeposit =
      currentRAL * (formData.personalExtraContribution / 100);
    if (formData.employerExtraContribution > 0) {
      currentRAL = currentRAL * (formData.employerExtraContribution / 100);
    }
    let totalTFR = 0;

    const history: TFRYearlyData[] = [
      {
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: 0,
        fund: {
          netTFR: 0,
          grossTFR: 0,
          gain: 0,
          cost: 0,
        },
        company: {
          netTFR: 0,
          grossTFR: 0,
          gain: 0,
          cost: 0,
        },
      },
    ];

    for (let year = 1; year <= formData.years; year++) {
      const annualTFR = currentRAL * 0.0691 + additionalDeposit;
      const lastYear = history[year - 1];
      const totalNetFundTFR = lastYear?.fund.netTFR;
      const totalNetCompanyTFR = lastYear?.company.netTFR;
      totalTFR += annualTFR;
      history.push({
        ral: parseFloat(currentRAL.toFixed(0)),
        tfr: parseFloat(totalTFR.toFixed(0)),
        fund: calculateTFR(
          {
            tfr: annualTFR,
            netTFR: totalNetFundTFR,
            gain: lastYear?.fund.gain,
            cost: lastYear?.fund.cost,
          },
          fundReturn,
          AssetType.FUND,
          formData.fundEquity
        ),
        company: calculateTFR(
          {
            tfr: annualTFR,
            netTFR: totalNetCompanyTFR,
            gain: lastYear?.company.gain,
            cost: lastYear?.company.gain,
          },
          tfrIndexation,
          AssetType.COMPANY
        ),
      });
      currentRAL *= 1 + salaryGrowth;
    }
    setSimulationResult(history.slice(1));
    console.log(history.slice(1));
  };

  return (
    <div className="flex flex-col mx-auto px-4 mt-8 gap-6 w-full max-w-screen-xl ">
      <div>
        <Card className="w-full">
          <CardHeader className="w-full justify-center">
            <CardTitle className="text-3xl">
              Simulazione della previdenza integrativa
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
            <div
              className={`w-full gap-6 grid ${
                showInputs
                  ? "grid-cols-7 grid-rows-2 grid-flow-col"
                  : "grid-cols-2 grid-rows-2 grid-flow-col"
              }`}
            >
              <div className="col-span-1">
                <label htmlFor="years">Anni</label>
                <Input
                  id="years"
                  type="number"
                  inputMode="numeric"
                  placeholder="Anni"
                  value={formData.years}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="inflation">Inflazione</label>
                <InputWithSuffix
                  id="inflation"
                  type="number"
                  suffix="%"
                  inputMode="numeric"
                  placeholder="Inflazione"
                  value={formData.inflation}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="ral">RAL</label>
                <InputWithSuffix
                  id="ral"
                  type="number"
                  suffix="€"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  placeholder="RAL"
                  value={formData.ral}
                  onChange={handleChange}
                />
              </div>
              <div
                className={`col-span-2 grid grid-cols-2 gap-4 ${
                  showInputs ? "block" : "hidden"
                }`}
              >
                <div>
                  <label htmlFor="salaryGrowth">Incremento salariale</label>
                  <InputWithSuffix
                    id="salaryGrowth"
                    type="number"
                    suffix="%"
                    inputMode="numeric"
                    placeholder="Aumenti"
                    value={formData.salaryGrowth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="personalExtraContribution"
                    className="whitespace-nowrap"
                  >
                    Versamento aggiuntivo
                  </label>
                  <InputWithSuffix
                    id="personalExtraContribution"
                    type="number"
                    suffix="%"
                    inputMode="numeric"
                    placeholder="Versamento"
                    value={formData.personalExtraContribution}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label htmlFor="fundReturn">Ritorno del fond</label>
                <InputWithSuffix
                  id="fundReturn"
                  type="number"
                  suffix="%"
                  inputMode="numeric"
                  placeholder="Ritorno del fondo"
                  value={formData.fundReturn}
                  onChange={handleChange}
                />
              </div>
              <div
                className={`col-span-2 gap-4 ${
                  showInputs ? "block" : "hidden"
                }`}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fundEquity">Azionario</label>
                    <InputWithSuffix
                      id="fundEquity"
                      type="number"
                      suffix="%"
                      inputMode="numeric"
                      max={100}
                      min={0}
                      step={1}
                      placeholder="Azionario"
                      value={formData.fundEquity}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="fundBonds">Obbligazionario</label>
                    <InputWithSuffix
                      id="fundBonds"
                      type="number"
                      suffix="%"
                      inputMode="numeric"
                      placeholder="Obbligazionario"
                      value={100 - formData.fundEquity}
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div
                className={`col-span-2 gap-4 ${
                  showInputs ? "block" : "hidden"
                }`}
              >
                <label htmlFor="opportunityCost">Costo opportunità</label>
                <InputWithSuffix
                  id="opportunityCost"
                  type="number"
                  suffix="%"
                  inputMode="numeric"
                  placeholder="Ritorno del fondo"
                  value={formData.fundReturn}
                  onChange={handleChange}
                />
              </div>
              <div
                className={`col-span-2 gap-4 ${
                  showInputs ? "block" : "hidden"
                }`}
              >
                <div className=" grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="opportunityEquity">Azionario</label>
                    <InputWithSuffix
                      id="opportunityEquity"
                      type="number"
                      suffix="%"
                      inputMode="numeric"
                      placeholder="Azionario"
                      value={formData.fundEquity}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="opportunityBonds">Obbligazionario</label>
                    <InputWithSuffix
                      id="opportunityBonds"
                      type="number"
                      suffix="%"
                      inputMode="numeric"
                      placeholder="Obbligazionario"
                      value={100 - formData.fundEquity}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-around gap-4 mt-4">
              <Button onClick={toggleInputs}>
                {showInputs ? "Nascondi" : "Mostra"} opzioni avanzate
              </Button>
              <Button onClick={() => simulateTFRWithInflation()}>
                Calcola
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="grid grid-flow-row grid-cols-4 gap-4 pt-2">
          <div className="col-span-2">
            <CapitalChart data={simulationResult} />
          </div>
          <div className="col-span-2">
            <ComparisonChart data={simulationResult} />
          </div>
          </CardContent>
          </Card>
        <div className="grid grid-flow-row grid-cols-4 gap-4 pt-2">
          {/* <div className="col-span-2">
            <CapitalChart data={simulationResult} />
          </div>
          <div className="col-span-2">
            <ComparisonChart data={simulationResult} />
          </div> */}

          <Card className="col-span-4">
            {simulationResult.length > 0 && (
              <div className="mt-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Anno</TableCell>
                      <TableCell>RAL (€)</TableCell>
                      <TableCell>TFR Versato (€)</TableCell>
                      <TableCell>TFR Fondo (€)</TableCell>
                      <TableCell>TFR Azienda (€)</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simulationResult.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index}</TableCell>
                        <TableCell>{item.ral}</TableCell>
                        <TableCell>{parseFloat(item.tfr.toFixed(0))}</TableCell>
                        <TableCell>
                          {parseFloat(item.fund.netTFR.toFixed(0))}
                        </TableCell>
                        <TableCell>
                          {parseFloat(item.company.netTFR.toFixed(0))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FundAnalysis;
