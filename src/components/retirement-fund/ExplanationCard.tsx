import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export function ExplanationCard() {
  const [showExplanation, setShowExplanation] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Come funziona</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setShowExplanation(!showExplanation)}
          >
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full text-center text-balance" defaultValue={[]}>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-l md:text-xl">Tassazione dei Rendimenti</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <h1 className="font-bold">Azienda (Rivalutazione)</h1>
              <p>
                Il TFR lasciato in azienda viene rivalutato annualmente con un tasso fisso dell'1,5% a cui si
                aggiunge il 75% della variazione dell'indice ISTAT FOI. Su questa rivalutazione viene applicata
                un'imposta sostitutiva del 17% ogni anno.
              </p>
              <h1 className="font-bold">Fondo Pensione</h1>
              <p>
                I rendimenti generati dagli investimenti del fondo pensione sono soggetti a un'imposta sostitutiva
                annuale del 20%. Questa aliquota si riduce ulteriormente al 12,5% per la quota di rendimento
                derivante dal possesso di Titoli di Stato in paesi whitelistati (tra cui l'Italia). Questa
                tassazione è significativamente più favorevole rispetto al 26% applicato alla maggior parte delle
                altre forme di risparmio finanziario.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-l md:text-xl">Tassazione del TFR (Liquidazione Finale)</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <h1 className="font-bold">Azienda</h1>
              <p>
                Al momento della liquidazione, il TFR lasciato in azienda è soggetto a "tassazione separata", con
                un'aliquota che si basa sulla media IRPEF degli ultimi cinque anni di impiego del lavoratore.
                Questa aliquota può variare da un minimo del 23% a un massimo del 43%, risultando spesso più
                elevata rispetto a quella applicata alle prestazioni dei fondi pensione.
              </p>
              <h1 className="font-bold">Fondo pensione</h1>
              <p>
                Le somme erogate versate nel fondo pensione sono soggette a una ritenuta che varia in base alla
                permanenze nel fondo. In particolare l'aliquota base è del 15% se l'adesione è stata effettuata da
                almeno 15 anni. Inoltre, questa percentuale si riduce progressivamente dello 0,30% per ogni anno di
                partecipazione che eccede i 15 anni, fino a un'aliquota minima del 9% dopo 35 anni di adesione.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-l md:text-xl">Deducibilità dei Contributi al Fondo Pensione</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <p>
                I contributi versati a un fondo pensione complementare sono interamente deducibili dal reddito
                complessivo annuo dell'individuo, fino a un limite massimo di 5.164,57 €. Questo include sia i
                contributi volontari del lavoratore sia eventuali contributi del datore di lavoro. Il risparmio
                fiscale immediato dipende dall'aliquota marginale IRPEF del contribuente.
                <p>
                  <b>
                    N.B. In questo caso deducibili vuol dire che le imposte non si pagano ORA, ma le si pagheranno in futuro.
                  </b>
                </p>
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-l md:text-xl">Contributo Aggiuntivo del Datore di Lavoro</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <p>
                Solo i fondi pensione di categoria (negoziali) prevedono un contributo aggiuntivo da parte del
                datore di lavoro, spesso condizionato al versamento di un contributo volontario da parte del
                dipendente. Questo contributo rappresenta un beneficio finanziario diretto che aumenta il capitale
                accumulato e gode delle stesse agevolazioni fiscali previste per i versamenti volontari.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-l md:text-xl">
              Esenzioni Fiscali Aggiuntive del Fondo Pensione
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <p>
                I fondi pensione godono di ulteriori esenzioni fiscali: sono esenti dall'imposta di bollo
                (normalmente applicata ai conti correnti e depositi titoli). Inoltre, le somme accumulate non
                rilevano ai fini ISEE e, in caso di decesso dell'aderente, il capitale liquidato ai beneficiari è
                esente dall'imposta di successione.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-l md:text-xl">
              Costo Opportunità: Significato e Tassazione
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <p>
                Il <b>costo opportunità</b> rappresenta il rendimento potenziale che si sarebbe potuto ottenere investendo il TFR in strumenti alternativi rispetto al fondo pensione o lasciandolo in azienda. Ad esempio, investendo in azioni, obbligazioni o altri strumenti finanziari, si potrebbero ottenere rendimenti diversi, ma anche con rischi differenti.
              </p>
              <p>
                Dal punto di vista fiscale, i rendimenti ottenuti da investimenti alternativi (come azioni, fondi comuni, ETF) sono generalmente tassati con un'aliquota del 26%, superiore rispetto a quella applicata ai fondi pensione. Inoltre, questi investimenti non beneficiano delle deduzioni fiscali e delle altre agevolazioni previste per i fondi pensione.
              </p>
              <p>
                Valutare il costo opportunità aiuta a comprendere se conviene destinare il TFR a un fondo pensione oppure optare per altre forme di investimento, tenendo conto sia dei potenziali rendimenti sia della tassazione applicata.
                In particolare, in questo caso il costo opportunità <b>viene calcolato solo sui contributi volontari</b> che si versano al fondo pensione, quindi non viene calcolato sul TFR stesso.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
