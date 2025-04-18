import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "../components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {Table, TableBody, TableCell, TableHeader, TableRow,} from "@/components/ui/table";
import {ComparisonChart} from "@/components/charts/ComparisonChart.tsx";
import {CapitalChart} from "@/components/charts/CapitalChart.tsx";
import {AssetType, TFRYearlyData, calculateTFR} from "@/utils/tax";

function Dashboard() {
    const [simulationResult, setSimulationResult] = useState([] as TFRYearlyData[]);
    const [formData, setFormData] = useState({
        years: 40,
        ral: 30000,
        personalExtraContribution: 0,
        employerExtraContribution: 0,
        equity: 0,
        fundReturn: 3,
        salaryGrowth: 0,
        inflation: 2,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: Number(value),
        }));
    };

    const simulateTFRWithInflation = () => {
        const salaryGrowth = formData.salaryGrowth / 100;
        const fundReturn = formData.fundReturn;
        const tfrIndexation = (1.5 + (0.75 * formData.inflation));
        let currentRAL = formData.ral;
        const additionalDeposit = currentRAL * (formData.personalExtraContribution / 100);
        if (formData.employerExtraContribution > 0) {
            currentRAL = currentRAL * (formData.employerExtraContribution / 100);
        }
        let totalTFR = 0;

        const history: TFRYearlyData[] = [];

        for (let year = 1; year <= formData.years; year++) {
            const annualTFR = currentRAL * 0.0691 + additionalDeposit;
            const totalNetFundTFR = history[year - 2]?.fund.netTFR ?? 0
            const totalNetCompanyTFR = history[year - 2]?.company.netTFR ?? 0
            totalTFR += annualTFR;
            history.push({
                ral: parseFloat(currentRAL.toFixed(0)),
                tfr: parseFloat(totalTFR.toFixed(0)),
                fund: calculateTFR(annualTFR, totalNetFundTFR, fundReturn, AssetType.FUND, formData.equity),
                company: calculateTFR(annualTFR, totalNetCompanyTFR, tfrIndexation, AssetType.COMPANY),
            });
            currentRAL *= 1 + salaryGrowth;
        }
        setSimulationResult(history);
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <Card>
                <CardHeader className="w-full">
                    <CardTitle>Simulazione della previdenza integrativa</CardTitle>
                </CardHeader>
                <CardContent className="justify-center items-center">
                    {/* <form> */}
                    <div className="flex flex-row justify-center gap-4 p-4">
                        <div>
                            <label htmlFor="years">Anni</label>
                            <Input
                                id="years"
                                type="number"
                                className="w-30"
                                placeholder="Anni"
                                value={formData.years}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="ral">RAL</label>
                            <Input
                                id="ral"
                                type="number"
                                className="w-30"
                                placeholder="RAL"
                                value={formData.ral}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="extraContribution">Versamento Aggiuntivo</label>
                            <Input
                                id="extraContribution"
                                type="number"
                                className="w-30"
                                placeholder="Versamento"
                                value={formData.personalExtraContribution}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="fundReturn">Ritorno del fond</label>
                            <Input
                                id="fundReturn"
                                type="number"
                                className="w-30"
                                placeholder="Ritorno del fondo"
                                value={formData.fundReturn}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="salaryGrowth">Incremento salariale</label>
                            <Input
                                id="salaryGrowth"
                                type="number"
                                className="w-30"
                                placeholder="Aumenti"
                                value={formData.salaryGrowth}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="inflation">Inflazione</label>
                            <Input
                                id="inflation"
                                type="number"
                                className="w-30"
                                placeholder="Inflazione"
                                value={formData.inflation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <Button onClick={() => simulateTFRWithInflation()}>Calcola</Button>
                    {/* </form> */}
                </CardContent>
            </Card>
            <div className="grid grid-flow-row grid-cols-4 gap-4 pt-2">
                <div className="col-span-2">
                    <CapitalChart data={simulationResult}/>
                </div>
                <div className="col-span-2">
                    <ComparisonChart/>
                </div>

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
                                            <TableCell>{parseFloat(item.fund.netTFR.toFixed(0))}</TableCell>
                                            <TableCell>{parseFloat(item.company.netTFR.toFixed(0))}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;