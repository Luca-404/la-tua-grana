import Papa from 'papaparse';

type FundRecord = {
  compartment: string;
  return: number;
  period: number;
};

type FundData = {
  [fund: string]: FundRecord[];
};

const closeFundPath = "/src/assets/fundCsv/fondi-chiusi-2023.csv";
const openFundPath = "/src/assets/fundCsv/fondi-aperti-2023.csv";

async function parseCSVWithPapaParse(filePath: string): Promise<FundData> {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to fetch the file: ${response.statusText}`);
  }
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const fundData: FundData = {};
        for (let i = 1; i < results.data.length; i++) {
          const cols = results.data[i];
          const fundName = cols[1]?.trim();
          const compartment = cols[2]?.trim();
          const tenYearReturnStr = cols[8]?.trim();

          // Assuming fundName is always present in the CSV
          if (!fundName) continue;

          const currentFund = fundName;
          if (!fundData[currentFund]) {
            fundData[currentFund] = [];
          }

          const tenYearReturn = parseFloat(tenYearReturnStr);

          if (compartment && !isNaN(tenYearReturn)) {
            fundData[currentFund].push({
              compartment: compartment,
              return: tenYearReturn,
              period: 10,
            });
          }
        }
        resolve(fundData);
      },
      error: (error: Error) => {
        console.error("Error parsing CSV:", error);
        reject(error);
      },
    });
  });
}

export async function getFundReturn(): Promise<FundData> {
    const closedFund = await parseCSVWithPapaParse(closeFundPath);
    const openFund = await parseCSVWithPapaParse(openFundPath);
    console.log("openFund Fund Data:", openFund);

    // Merge closedFund and openFund
    const mergedFundData: FundData = { ...closedFund };
    for (const [fund, records] of Object.entries(openFund)) {
        if (!mergedFundData[fund]) {
            mergedFundData[fund] = [];
        }
        mergedFundData[fund].push(...records);
    }

    return mergedFundData;
}