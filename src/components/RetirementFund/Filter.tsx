"use client";

import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getFundReturn } from "../../lib/readCsv";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

type FilterProps = {
  formData: {
    years: number;
    ral: number;
    personalExtraContribution: number;
    employerExtraContribution: number;
    fundReturn: number;
    fundEquity: number;
    opportunityCostReturn: number;
    opportunityCostEquity: number;
    salaryGrowth: number;
    inflation: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<FilterProps["formData"]>>;
  isAdvancedOptionOn: boolean;
  toggleInputs: () => void;
  simulateTFR: () => void;
};

type FundRecord = {
  compartment: string;
  return: number;
  period: number;
};

type FundData = {
  [fund: string]: FundRecord[];
};

export function Filter({
  formData,
  setFormData,
  isAdvancedOptionOn: advancedOption,
  toggleInputs,
  simulateTFR,
}: FilterProps) {
  const [fundData, setFundData] = useState<FundData>({});
  const [fund, setFund] = useState("");
  const [compartment, setCompartment] = useState("");

  useEffect(() => {
    async function fetchFundData() {
      const data = await getFundReturn();
      setFundData(data);
    }
    fetchFundData();
  }, []);

  const changeCompartment = (compartment: string) => {
    setCompartment(compartment);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: Number(value),
    }));
  };

  const comportments = fund ? fundData[fund] || [] : [];
  const compartmentSelect = comportments.find((c) => c.compartment === compartment);

  useEffect(() => {
    console.log("Compartment selected:", compartmentSelect?.return.toFixed(2));
    handleChange({
      target: {
        id: "fundReturn",
        value: compartmentSelect?.return?.toFixed(2) ?? "0",
      },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [compartmentSelect]);

  return (
    <div className="w-full max-w-screen-lg mx-auto">
      <div
        className={`w-full gap-6 grid max-w-screen-lg mx-auto grid-cols-6 grid-flow-row
          ${advancedOption ? "grid-rows-1" : "grid-rows-2"}`}
      >
        <div className="col-span-2">
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
        <div className="col-span-2">
          <label htmlFor="ral">RAL</label>
          <Input
            id="ral"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            placeholder="RAL"
            value={formData.ral}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="inflation">Inflazione</label>
          <Input
            id="inflation"
            type="number"
            inputMode="numeric"
            placeholder="Inflazione"
            value={formData.inflation}
            onChange={handleChange}
          />
        </div>
        <div
          className={`col-span-3 flex flex-col ${
            !advancedOption ? "block" : "hidden"
          }`}
        >
          {/* Combobox: Fondo */}
          <label className="text-sm font-medium">Fondo Pensione</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {fund || "Seleziona un fondo"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Cerca fondo..." />
                <CommandEmpty>Nessun fondo trovato.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {Object.keys(fundData).map((f) => (
                    <CommandItem
                      key={f}
                      onSelect={() => {
                        setFund(f);
                        setCompartment("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          fund === f ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {f}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div
          className={`col-span-1 flex flex-col ${
            !advancedOption ? "block" : "hidden"
          }`}
        >
          {/* Comparto - Select */}
          {fund && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Comparto</label>
              <Select
                value={compartment}
                onValueChange={(value) => changeCompartment(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un comparto" />
                </SelectTrigger>
                <SelectContent>
                  {comportments.map((c) => (
                    <SelectItem key={c.compartment} value={c.compartment}>
                      {c.compartment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div
          className={`col-span-2 flex flex-col ${
            !advancedOption ? "block" : "collapse"
          }`}
        >
          {compartmentSelect && (
            <div className="border rounded-lg p-1.5 mt-auto">
              <strong>Rendimento:</strong> {compartmentSelect.return.toFixed(2)}%{" "}
              <strong>Periodo:</strong> {compartmentSelect.period} years
            </div>
          )}
        </div>
      </div>
      <Accordion type="single" collapsible className="items-center gap-4 mt-4">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-xl" onClick={toggleInputs}>
            Opzioni avanzate
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="salaryGrowth">Incremento salariale (%)</label>
              <Input
                id="salaryGrowth"
                type="number"
                // suffix="%"
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
                Versamento aggiuntivo (%)
              </label>
              <Input
                id="personalExtraContribution"
                type="number"
                // suffix="%"
                inputMode="numeric"
                placeholder="€"
                value={formData.personalExtraContribution}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="employerExtraContribution"
                className="whitespace-nowrap"
              >
                Contributo del datore di lavoro (%)
              </label>
              <Input
                id="employerExtraContribution"
                type="number"
                // suffix="%"
                inputMode="numeric"
                placeholder="€"
                value={formData.employerExtraContribution}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="fundReturn">Ritorno del fondo (%)</label>
              <Input
                id="fundReturn"
                type="number"
                // suffix="%"
                inputMode="numeric"
                placeholder="Ritorno del fondo"
                value={formData.fundReturn}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="fundEquity">Azionario (%)</label>
              <Input
                id="fundEquity"
                type="number"
                // suffix="%"
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
              <label htmlFor="fundBonds">Obbligazionario (%)</label>
              <Input
                id="fundBonds"
                type="number"
                // suffix="%"
                inputMode="numeric"
                placeholder="Obbligazionario"
                value={100 - formData.fundEquity}
                disabled
              />
            </div>
            <div>
              <label htmlFor="opportunityCostReturn">Costo opportunità (%)</label>
              <Input
                id="opportunityCostReturn"
                type="number"
                // suffix="%"
                inputMode="numeric"
                placeholder="%"
                value={formData.opportunityCostReturn}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="opportunityCostEquity">Azionario (%)</label>
              <Input
                id="opportunityCostEquity"
                type="number"
                // suffix="%"
                inputMode="numeric"
                placeholder="Azionario"
                value={formData.opportunityCostEquity}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="opportunityBonds">Obbligazionario (%)</label>
              <Input
                id="opportunityBonds"
                type="number"
                // suffix="%"
                inputMode="numeric"
                placeholder="Obbligazionario"
                value={100 - formData.opportunityCostEquity}
                disabled
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="w-full text-center gap-4 mt-4">
        {/* <Button onClick={toggleInputs}>
          {showInputs ? "Nascondi" : "Mostra"} opzioni avanzate
        </Button> */}
        <Button onClick={() => simulateTFR()}>Calcola</Button>
      </div>
    </div>
  );
}
