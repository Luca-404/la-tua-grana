import { BuyVsRentResults } from "@/lib/investment/types";
import { CapitalCard } from "./CapitalCard";
import { formatNumber } from "@/lib/utils";

interface InitialCapitalDataProps {
  data: BuyVsRentResults;
}

export function InitialCapitalData({ data }: InitialCapitalDataProps) {
  const firstYear = data.annualOverView[0] ?? 0;
  const secondYear = data.annualOverView[1] ?? 0;
  return (
    <>
      <p className="text-center text-3xl font-bold text-foreground">Stato iniziale</p>
      <div className="grid grid-cols-4 gap-3">
        <CapitalCard title="Costi acquisto">
          <div className="text-loss font-bold text-2xl text-center">
            {formatNumber(data.initialPurchaseCosts)} €
          </div>
        </CapitalCard>
        <CapitalCard title="Costi mutuo">
          <div className="text-loss font-bold text-2xl text-center">
            {formatNumber(firstYear.purchase.mortgage?.openCosts ?? 0)} €
          </div>
        </CapitalCard>
        {/* )} */}
        <CapitalCard title="Costi affitto">
          <div className="text-loss font-bold text-2xl text-center">
            {formatNumber(firstYear.rent.cumulativeCost)} €
          </div>
        </CapitalCard>
        <CapitalCard title="Capitale">
          <div className="text-gain font-bold text-2xl text-center">{formatNumber(data.initialCapital)} €</div>
        </CapitalCard>
      </div>
      {firstYear.rent.opportunityCost && firstYear.purchase.opportunityCost && (
        <>
          <p className="text-center text-3xl font-bold text-foreground">Investimenti al termine del primo anno</p>
          <div className="grid grid-cols-2 gap-3">
            <CapitalCard title="Capitale investito con l'acquisto">
              <div className="flex flex-row justify-evenly">
                <div className="font-bold text-xl text-center">
                  Iniziale {formatNumber(firstYear.purchase.opportunityCost?.totalContributions)} €
                </div>
                <div className="font-bold text-xl text-center">
                  Annuale{" "}
                  {formatNumber(
                    (secondYear.purchase.opportunityCost?.totalContributions ?? 0) -
                      firstYear.purchase.opportunityCost.totalContributions
                  )}{" "}
                  €
                </div>
              </div>
            </CapitalCard>
            <CapitalCard title="Capitale investito in affitto">
              <div className="flex flex-row justify-evenly">
                <div className="font-bold text-xl text-center">
                  Iniziale {firstYear.rent.opportunityCost.totalContributions} €
                </div>
                <div className="font-bold text-xl text-center">
                  Annuale{" "}
                  {formatNumber(
                    (secondYear.rent.opportunityCost?.totalContributions ?? 0) -
                      firstYear.rent.opportunityCost.totalContributions
                  )}{" "}
                  €
                </div>
              </div>
            </CapitalCard>
          </div>
        </>
      )}
    </>
  );
}
