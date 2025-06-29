import { AssetType, InvestmentPerformance, LastYearData, RetirementSimulation, ValidAssetType, assetTaxRateMap } from "../taxes/types";
import { TFR } from "./constants";

export const calculateNextYearInvestment = ({
  lastYearData,
  cagr,
  assetType,
  year = 0,
  equityRatio = 0,
  taxFree = false,
}: {
  lastYearData: LastYearData;
  cagr: number;
  assetType: AssetType;
  year?: number;
  equityRatio?: number;
  taxFree?: boolean;
}): InvestmentPerformance => {
  if (
    lastYearData.netCapital === undefined ||
    lastYearData.gain === undefined ||
    lastYearData.cost === undefined
  ) {
    throw new Error("Last year data is required for TFR calculation");
  }
    const assetMetadata = assetTaxRateMap[assetType as ValidAssetType];
    if (!assetMetadata) {
    throw new Error(`AssetType ${assetType} not found in assetMetadataMapTest.`);
  }

  let taxRate: number;
  if (typeof assetMetadata.capitalGainTaxRate === 'function') {
    taxRate = assetMetadata.capitalGainTaxRate({ equityRatio, taxFree });
  } else {
    taxRate = assetMetadata.capitalGainTaxRate;
  }
  
  const grossGain = lastYearData.netCapital * (cagr / 100);
  let taxes = 0;

  if (grossGain < 0) {
    lastYearData.capitalLosses?.push({ amount: -grossGain, year: year });
  } else {
    taxes = grossGain * (taxRate / 100);
    for (const element of lastYearData.capitalLosses ?? []) {
      if (element.year >= year - TFR.MINUS_PRESCRIPTION_YEARS && element.amount > 0) {
        const remain = taxes - element.amount;
        if (remain > 0) {
          taxes = remain;
          element.amount = 0;
        } else {
          // all taxes are covered
          taxes = 0;
          element.amount = -remain;
          break;
        }
      }
    }
  }

  const totalGross = lastYearData.netCapital + lastYearData.newDeposit + grossGain;
  const totalNet = totalGross - taxes;

  return <InvestmentPerformance>{
    grossValue: totalGross,
    netValue: totalNet,
    gain: lastYearData.gain + grossGain - taxes,
    cost: lastYearData.cost + taxes,
    capitalLosses: lastYearData.capitalLosses,
  };
};

/**
 * Calculates the total net gain as net of the deposited capital + net over capital gain taxed
 * @param asset - The type of asset for which the tax is being calculated.
 * @param data - An array of yearly Assets data.
 * @param year - The year for which the tax rate is required.
 * @returns The toal gain at the specified year.
 */
export const getTotalNetValue = ({asset, data, year}: {asset: AssetType, data: RetirementSimulation[], year: number}): number => {
  const assetMetadata = assetTaxRateMap[asset as ValidAssetType];
  if (!assetMetadata) {
    throw new Error(`AssetType ${asset} not found in assetMetadataMapTest.`);
  }

  let assetDepositTaxRate: number;
  if (typeof assetMetadata.assetTaxRate === 'function') {
    assetDepositTaxRate = assetMetadata.assetTaxRate({ data, year });
  } else {
    assetDepositTaxRate = assetMetadata.assetTaxRate;
  }

  const lastYear = data[year - 1];
  let allDeposit = lastYear.despoited.baseAmount
  if (asset === AssetType.ENHANCED_RETIREMENT_FUND) {
    allDeposit += (lastYear.despoited.personalAddition ?? 0) + (lastYear.despoited.employerAddition ?? 0);
  }
  const netAssets = allDeposit * (1 - assetDepositTaxRate / 100);
  const assetPerformance = lastYear[assetMetadata.key] as InvestmentPerformance;
  return netAssets + assetPerformance.gain;
};
