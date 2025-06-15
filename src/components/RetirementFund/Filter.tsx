import { useCallback, useEffect, useState } from "react";
import { TFR } from "@/lib/tax";
import { RetirementFundFormData } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Check, ChevronsUpDown, CircleCheckBig, CircleHelp, ShieldAlert } from "lucide-react";
import { Fund, getFundReturn } from "../../lib/fundUtils";
import { CCNLFund } from "../../model/fundMap";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type FilterProps = {
  formData: RetirementFundFormData;
  setFormData: React.Dispatch<React.SetStateAction<FilterProps["formData"]>>;
  isAdvancedOptionOn: boolean;
  toggleInputs: () => void;
  simulateTFR: () => void;
};

export function Filter({
  formData,
  setFormData,
  isAdvancedOptionOn: advancedOption,
  toggleInputs,
  simulateTFR,
}: FilterProps) {
  const [fundData, setFundData] = useState<Fund>({});
  const [fund, setFund] = useState<any>(null);
  const [compartment, setCompartment] = useState("");
  const [personalExtraContributionFixed, setPersonalExtraContributionFixed] = useState<number>(0);
  const [editingField, setEditingField] = useState<"percent" | "fixed" | null>(null);
  const [selectedCCNL, setSelectedCCNL] = useState("");

  useEffect(() => {
    async function fetchFundData() {
      const dataFundReturn = await getFundReturn();
      setFundData(dataFundReturn);
    }
    fetchFundData();
  }, []);

  useEffect(() => {
    if (editingField === "percent") {
      const personalExtraContribution = formData.ral * (formData.personalExtraContribution / 100);
      setPersonalExtraContributionFixed(parseFloat(personalExtraContribution.toFixed(2)));
    }
  }, [formData.personalExtraContribution, formData.ral, editingField]);

  useEffect(() => {
    if (editingField === "fixed") {
      const personalExtraContribution = (personalExtraContributionFixed / formData.ral) * 100;
      setFormData((prevState) => ({
        ...prevState,
        personalExtraContribution: parseFloat(personalExtraContribution.toFixed(2)),
      }));
    }
  }, [personalExtraContributionFixed, formData.ral, editingField, setFormData]);

  const changeCompartment = (compartment: string) => {
    setCompartment(compartment);
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [id]: parseFloat(Number(value).toFixed(2)),
      }));
    },
    [setFormData]
  );

  const compartiments = fund?.compartments || [];
  // @ts-expect-error: compatibilità parametro compartiment
  const compartmentSelect = fund?.compartments?.find((c) => c.name === compartment);

  useEffect(() => {
    handleChange({
      target: {
        id: "netFundReturn",
        value: compartmentSelect?.return?.toFixed(2) ?? "0",
      },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [compartmentSelect, handleChange]);

  const handleCCNLChange = (ccnl: string) => {
    setSelectedCCNL(ccnl);
    const fundName = CCNLFund[ccnl]?.name;
    if (ccnl === "OTHER") {
      setFund("");
    } else {
      setFund(fundData[fundName]);
    }
    setCompartment("");
    setEditingField("percent"); // allow to automatically set the fixed contribution percentage
    setFormData((prevState) => ({
      ...prevState,
      personalExtraContribution: CCNLFund[ccnl].min_employee_contribution,
      employerExtraContribution: CCNLFund[ccnl].employer_contribution,
    }));
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto text-center">
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
        {(fund?.type == "closed" || advancedOption) && (
          <>
            <div className="col-span-6 flex items-center md:col-span-2">
              <hr className="flex-grow border-t" />
              <span className="mx-2 text-muted-foreground">Versamento aggiuntivo</span>
              <hr className="flex-grow border-t" />
            </div>
            <div className="col-span-2 items-center hidden md:flex">
              <hr className="flex-grow border-t" />
              <span className="mx-2 text-muted-foreground">Datore di lavoro</span>
              <hr className="flex-grow border-t" />
            </div>
            <div className="col-span-2 items-center hidden md:flex">
              <hr className="flex-grow border-t" />
              <span className="mx-2 text-muted-foreground">Sommario</span>
              <hr className="flex-grow border-t" />
            </div>
            <div className="col-span-3 md:col-span-1">
              <label htmlFor="personalExtraContribution" className="whitespace-nowrap">
                Percentuale (%)
              </label>
              <Input
                id="personalExtraContribution"
                type="number"
                inputMode="numeric"
                placeholder="%"
                value={formData.personalExtraContribution}
                onChange={(e) => {
                  handleChange(e);
                  setEditingField("percent");
                }}
              />
            </div>
            <div className="col-span-3 md:col-span-1">
              <label htmlFor="personalExtraContribution" className="whitespace-nowrap">
                Fisso (€)
              </label>
              <Input
                id="personalExtraContribution"
                type="number"
                inputMode="numeric"
                placeholder="€"
                min={0}
                step={50}
                value={personalExtraContributionFixed}
                onChange={(e) => {
                  setPersonalExtraContributionFixed(Number(e.target?.value ?? 0));
                  setEditingField("fixed");
                }}
              />
            </div>
            <div className="col-span-6 items-center flex md:hidden md:col-span-2">
              <hr className="flex-grow border-t" />
              <span className="mx-2 text-muted-foreground">Datore di lavoro</span>
              <hr className="flex-grow border-t" />
            </div>
            <div className="col-span-3 md:col-span-1">
              <label htmlFor="employerExtraContribution" className="whitespace-nowrap">
                Contributo (%)
              </label>
              <Input
                id="employerExtraContribution"
                type="number"
                inputMode="numeric"
                placeholder="€"
                value={formData.employerExtraContribution}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-3 md:col-span-1">
              <label>Versato</label>
              <div className="rounded-lg min-h-9 flex items-center justify-center text-center bg-background">
                {formatNumber(formData.ral * (formData.employerExtraContribution / 100))} €
              </div>
            </div>
            <div className="col-span-6 md:col-span-2">
              <label>Contributo aggiuntivo totale</label>
              <div className="rounded-lg min-h-9 flex items-center bg-background relative">
                <span className="flex-1 text-center">
                  {formatNumber(
                    personalExtraContributionFixed + formData.ral * (formData.employerExtraContribution / 100),
                    2
                  )}{" "}
                  €
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  {personalExtraContributionFixed + formData.ral * (formData.employerExtraContribution / 100) <
                  TFR.MAX_DEDUCTION ? (
                    <HoverCard>
                      <HoverCardTrigger>
                        <CircleCheckBig className="text-green-500" />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        I contributi aggiuntivi sono sotto la soglia di {TFR.MAX_DEDUCTION} € per cui potranno
                        essere interamente dedotti
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <HoverCard>
                      <HoverCardTrigger>
                        <ShieldAlert className="text-yellow-500" />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        I contributi aggiuntivi sono sopra la soglia di {TFR.MAX_DEDUCTION} € per cui NON potranno
                        essere interamente dedotti
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </span>
              </div>
            </div>
          </>
        )}

        {!advancedOption && (
          <>
            <div className="col-span-6 md:col-span-6 flex flex-col min-h-9 relative">
              <label>CCNL</label>
              <span className="absolute right-2 -translate-y-1">
                <HoverCard>
                  <HoverCardTrigger>
                    <CircleHelp />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    La selezione del CCNL permette di impostare automaticamente il fondo di categoria e i relativi
                    contributi minimi applicati (non è vincolante e i valori sono modificabili)
                  </HoverCardContent>
                </HoverCard>
              </span>
              <Select value={selectedCCNL} onValueChange={handleCCNLChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona CCNL" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CCNLFund).map((fundKey) => (
                    <SelectItem key={fundKey} value={fundKey}>
                      {CCNLFund[fundKey].CCNL}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* <div className="col-span-6 md:col-span-1">
              <label
                htmlFor="additionalMin"
                className="whitespace-nowrap overflow-hidden text-ellipsis block max-w-full"
              >
                Contributo minimo?
              </label>
              <div className="min-h-9 bg-background flex items-center justify-center rounded-lg">
                <Checkbox id="additionalMin" className="scale-130" defaultChecked />
              </div>
            </div> */}
            <div className="col-span-6 md:col-span-2 flex flex-col">
              {/* Combobox: Fondo */}
              <label>Fondo Pensione</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    <span className="flex-grow overflow-hidden whitespace-nowrap text-ellipsis">
                      {fund ? Object.keys(fundData).find((k) => fundData[k] === fund) : "Seleziona un fondo"}
                    </span>
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
                            setFund(fundData[f]);
                            setCompartment("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              fund && fundData[f] === fund ? "opacity-100" : "opacity-0"
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
            <div className="col-span-6 md:col-span-2 flex flex-col min-h-9">
              {/* Comparto - Select */}
              {fund && (
                <div>
                  <label>Comparto</label>
                  <Select value={compartment} onValueChange={(value) => changeCompartment(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona un comparto" />
                    </SelectTrigger>
                    <SelectContent>
                      {compartiments.map((c: { name: string }) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="col-span-6 md:col-span-2 flex flex-col text-center min-h-9 justify-end">
              {compartmentSelect && (
                <>
                  <label className="mb-1">Rendimento netto ultimi {compartmentSelect.period} anni</label>
                  <div className="rounded-lg min-h-9 flex items-center justify-center text-center bg-background">
                    {formatNumber(compartmentSelect.return, 2)} %
                  </div>
                </>
              )}
            </div>
            <div className="col-span-6 text-sm text-muted-foreground">
              I rendimenti sono presi dal sito{" "}
              <a
                className="text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.covip.it/per-gli-operatori/fondi-pensione/costi-e-rendimenti-dei-fondi-pensione/elenco-dei-rendimenti"
              >
                Covip
              </a>{" "}
              e sono mostrati al netto degli oneri che gravano sul patrimonio del comparto. <br /> Inoltre si
              ricorda che i rendimenti passati sono indicazione e non garanzia di quelli futuri e che tutte le
              forme di investimento sono soggette ai rischi di mercato.
            </div>
          </>
        )}
      </div>

      <Collapsible className="text-center gap-4 mt-8">
        <CollapsibleTrigger onClick={toggleInputs} asChild>
          <Button variant="outline" className="text-lg px-8 py-3 font-semibold">
            Opzioni avanzate <ChevronsUpDown className="w-6 h-6 ml-2" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="grid grid-cols-4 gap-4 pt-4">
          <div className="col-span-4 flex items-center my-2">
            <hr className="flex-grow border-t" />
            <span className="mx-2 text-muted-foreground">Generali</span>
            <hr className="flex-grow border-t" />
          </div>
          <div className="col-span-4 md:col-span-2">
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
          <div className="col-span-4 md:col-span-2">
            <div className="flex items-center relative">
              <label htmlFor="employerExtraContribution">Variazione inflazione (%)</label>
              <HoverCard>
                <HoverCardTrigger className="absolute right-2 top-1/3 -translate-y-1/2">
                  <CircleHelp />
                </HoverCardTrigger>
                <HoverCardContent>
                  La variazione permette di aggiungere un valore casuale, diverso ogni anno, di +/- la percentuale
                  scelta. Ad esempio, se si sceglie 2%, ogni anno l'inflazione potrà crescere o diminuire di un
                  valore casuale compreso tra -2% e +2%.
                </HoverCardContent>
              </HoverCard>
            </div>
            <Input
              id="inflationRange"
              type="number"
              inputMode="numeric"
              placeholder="%"
              min={0}
              max={100}
              step={1}
              value={formData.inflationRange}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-4 flex items-center my-2">
            <hr className="flex-grow border-t" />
            <span className="mx-2 text-muted-foreground">Fondo</span>
            <hr className="flex-grow border-t" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="fundReturn">Ritorno lordo (%)</label>
            <Input
              id="fundReturn"
              type="number"
              inputMode="numeric"
              placeholder="Ritorno del fondo"
              value={formData.fundReturn}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center relative">
              <label htmlFor="employerExtraContribution">
                Variazione (%)
                <HoverCard>
                  <HoverCardTrigger className="absolute right-2 top-1/3 -translate-y-1/2">
                    <CircleHelp />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    La variazione permette di aggiungere un valore casuale, diverso ogni anno, di +/- la
                    percentuale scelta. Ad esempio, se si sceglie 2%, ogni anno il fondo potrà crescere o diminuire
                    di un valore casuale compreso tra -2% e +2%.
                  </HoverCardContent>
                </HoverCard>
              </label>
            </div>
            <Input
              id="fundReturnRange"
              type="number"
              inputMode="numeric"
              placeholder="%"
              min={0}
              max={100}
              step={1}
              value={formData.fundReturnRange}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="fundEquity">Azionario (%)</label>
            <Input
              id="fundEquity"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={1}
              placeholder="Azionario"
              value={formData.fundEquity}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="fundBonds">Obbligazionario (%)</label>
            <Input
              id="fundBonds"
              type="number"
              inputMode="numeric"
              placeholder="Obbligazionario"
              value={100 - formData.fundEquity}
              disabled
            />
          </div>
          <div className="col-span-4 flex items-center my-2">
            <hr className="flex-grow border-t" />
            <span className="mx-2 text-muted-foreground">Costo opportunità</span>
            <hr className="flex-grow border-t" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="opportunityCostReturn">Ritorno lordo (%)</label>
            <Input
              id="opportunityCostReturn"
              type="number"
              inputMode="numeric"
              placeholder="%"
              value={formData.opportunityCostReturn}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center relative">
              <label htmlFor="employerExtraContribution">
                Variazione (%)
                <HoverCard>
                  <HoverCardTrigger className="absolute right-2 top-1/3 -translate-y-1/2">
                    <CircleHelp />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    La variazione permette di aggiungere un valore casuale, diverso ogni anno, di +/- la
                    percentuale scelta. Ad esempio, se si sceglie 2%, ogni anno il costo opportunità potrà crescere
                    o diminuire di un valore casuale compreso tra -2% e +2%.
                  </HoverCardContent>
                </HoverCard>
              </label>
            </div>
            <Input
              id="opportunityCostRange"
              type="number"
              inputMode="numeric"
              placeholder="%"
              min={0}
              max={100}
              step={1}
              value={formData.opportunityCostRange}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="opportunityCostEquity">Azionario (%)</label>
            <Input
              id="opportunityCostEquity"
              type="number"
              inputMode="numeric"
              placeholder="Azionario"
              value={formData.opportunityCostEquity}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="opportunityBonds">Obbligazionario (%)</label>
            <Input
              id="opportunityBonds"
              type="number"
              inputMode="numeric"
              placeholder="Obbligazionario"
              value={100 - formData.opportunityCostEquity}
              disabled
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="w-full text-center gap-4 mt-8">
        <Button onClick={() => simulateTFR()} disabled={!advancedOption && !compartment}>
          Calcola
        </Button>
      </div>
    </div>
  );
}
