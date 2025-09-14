import { CCNLFund, TFR } from "@/lib/investment/constants";
import { Fund, RetirementFundFormData } from "@/lib/investment/types";
import { cn, formatNumber } from "@/lib/utils";
import { Check, ChevronsUpDown, CircleCheckBig, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getFundReturn } from "../../lib/investment/utils";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TitleWithQuestionMark } from "./TitleWithQuestionMark";

type FilterProps = {
  formData: RetirementFundFormData;
  setFormData: React.Dispatch<React.SetStateAction<FilterProps["formData"]>>;
  isAdvancedOptionOn: boolean;
  toggleInputs: () => void;
  simulateTFR: () => void;
};

const QUESTION_MARK_VARIATION =
  "La variazione consente di introdurre un valore casuale, diverso per ogni anno, compreso tra ± la percentuale selezionata. <br /> Ad esempio, una variazione del 2%, il costo opportunità potrà aumentare o diminuire ogni anno di un valore casuale compreso tra -2% e +2%.";

export function Filter({
  formData,
  setFormData,
  isAdvancedOptionOn: advancedOption,
  toggleInputs,
  simulateTFR,
}: FilterProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [fundData, setFundData] = useState<Fund>({});
  const [fund, setFund] = useState<Fund[keyof Fund] | null>(null);
  const [compartment, setCompartment] = useState("");
  const [personalExtraContributionFixed, setPersonalExtraContributionFixed] = useState<number>(0);
  const [editingField, setEditingField] = useState<"percent" | "fixed" | null>(null);
  const [selectedCCNL, setSelectedCCNL] = useState("");
  const isCalculationDisabled = (!advancedOption && !compartment) || formData.ral < 1000 || formData.years < 5;

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
    if (editingField === "fixed") {
      const personalExtraContribution = (personalExtraContributionFixed / formData.ral) * 100;
      setFormData((prevState) => ({
        ...prevState,
        personalExtraContribution: parseFloat(personalExtraContribution.toFixed(2)),
      }));
    }
  }, [
    personalExtraContributionFixed,
    formData.personalExtraContribution,
    formData.ral,
    editingField,
    setFormData,
  ]);

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
      setFund(null);
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
        <div className="col-span-3 md:col-span-2">
          <label className="text-sm" htmlFor="years">Anni</label>
          <Input
            id="years"
            type="number"
            inputMode="numeric"
            min={5}
            max={100}
            step={5}
            placeholder="Anni"
            value={formData.years}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-3 md:col-span-2">
          <label className="text-sm" htmlFor="ral">RAL</label>
          <Input
            id="ral"
            type="number"
            inputMode="numeric"
            min={1000}
            step={1000}
            placeholder="RAL"
            value={formData.ral}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-3 md:col-span-1">
          <label className="text-sm" htmlFor="inflation">Inflazione</label>
          <Input
            id="inflation"
            type="number"
            inputMode="numeric"
            placeholder="Inflazione"
            value={formData.inflation}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-3 md:col-span-1">
          <label className="text-sm">TFR</label>
          <div className="rounded-lg min-h-9 flex items-center justify-center text-center bg-background">
            {formatNumber(formData.ral * TFR.MULTIPLIER)} €
          </div>
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
              <label className="text-sm whitespace-nowrap" htmlFor="personalExtraContribution">
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
              <label className="text-sm whitespace-nowrap" htmlFor="personalExtraContribution">
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
              <label className="text-sm" htmlFor="employerExtraContribution">Contributo (%)</label>
              <Input
                id="employerExtraContribution"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                value={formData.employerExtraContribution}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-3 md:col-span-1">
              <label className="text-sm">Versato</label>
              <div className="rounded-lg min-h-9 flex items-center justify-center text-center bg-background">
                {formatNumber(formData.ral * (formData.employerExtraContribution / 100))} €
              </div>
            </div>
            <div className="col-span-6 md:col-span-2">
              <label className="text-sm">Contributo aggiuntivo totale</label>
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
            <div className="col-span-6 md:col-span-6 flex flex-col min-h-9">
              <TitleWithQuestionMark title="CCNL">
                Il CCNL permette di impostare automaticamente il fondo di categoria e i relativi contributi minimi
                applicati. <br />
                N.B. non è vincolante e i valori sono modificabili
              </TitleWithQuestionMark>
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
            <div className="col-span-6 md:col-span-2 flex flex-col">
              {/* Combobox: Fondo */}
              <label className="text-sm">Fondo Pensione</label>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
                            setIsPopoverOpen(false);
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
                  <label className="text-sm">Comparto</label>
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
                  <label className="text-sm mb-1">Rendimento netto ultimi {compartmentSelect.period} anni</label>
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
            <label className="text-sm" htmlFor="salaryGrowth">Incremento salariale (%)</label>
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
            <TitleWithQuestionMark title="Variazione inflazione (%)">
              {QUESTION_MARK_VARIATION}
            </TitleWithQuestionMark>
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
            <label className="text-sm" htmlFor="fundReturn">Ritorno lordo (%)</label>
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
            <TitleWithQuestionMark title="Variazione inflazione (%)">
              {QUESTION_MARK_VARIATION}
            </TitleWithQuestionMark>
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
            <label className="text-sm" htmlFor="fundEquity">Azionario (%)</label>
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
            <label className="text-sm" htmlFor="fundBonds">Obbligazionario (%)</label>
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
            <label className="text-sm" htmlFor="opportunityCostReturn">Ritorno lordo (%)</label>
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
            <TitleWithQuestionMark title="Variazione (%)">{QUESTION_MARK_VARIATION}</TitleWithQuestionMark>
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
            <label className="text-sm" htmlFor="opportunityCostEquity">Azionario (%)</label>
            <Input
              id="opportunityCostEquity"
              type="number"
              inputMode="numeric"
              placeholder="Azionario"
              min={0}
              max={100}
              step={1}
              value={formData.opportunityCostEquity}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm" htmlFor="opportunityBonds">Obbligazionario (%)</label>
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
        <Button className="text-white" onClick={() => simulateTFR()} disabled={isCalculationDisabled}>
          Calcola
        </Button>
      </div>
    </div>
  );
}
