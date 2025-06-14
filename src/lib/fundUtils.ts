import Papa from 'papaparse';

export type Compartment = {
  name: string;
  return: number;
  period: number;
};

export type Fund = {
  [name: string]: {
    type: 'closed' | 'open';
    compartments: Compartment[];
  };
};

const closeFundPath = "/src/assets/fundCsv/fondi-chiusi-2023.csv";
const openFundPath = "/src/assets/fundCsv/fondi-aperti-2023.csv";

async function parseCSVWithPapaParse(filePath: string, type: 'closed' | 'open'): Promise<Fund> {
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
        const fundData: Fund = {};
        for (let i = 1; i < results.data.length; i++) {
          const cols = results.data[i];
          const fundName = cols[1]?.trim();
          const compartment = cols[2]?.trim();
          const tenYearReturnStr = cols[8]?.trim();

          if (!fundName) continue;

          if (!fundData[fundName]) {
            fundData[fundName] = { type: type, compartments: [] };
          }

          const tenYearReturn = parseFloat(tenYearReturnStr);

          if (compartment && !isNaN(tenYearReturn)) {
            fundData[fundName].compartments.push({
              name: compartment,
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

export async function getFundReturn(): Promise<Fund> {
    const closedFund = await parseCSVWithPapaParse(closeFundPath, 'closed');
    const openFund = await parseCSVWithPapaParse(openFundPath, 'open');

    // Merge closedFund and openFund
    const mergedFundData: Fund = { ...closedFund };
    for (const [fund, data] of Object.entries(openFund)) {
        if (!mergedFundData[fund]) {
            mergedFundData[fund] = data;
        } else {
            mergedFundData[fund].compartments.push(...data.compartments);
        }
    }

    return mergedFundData;
}