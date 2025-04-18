export const TAXATION = {
    CAPITAL_GAIN: 0.26,
    TRESURY_WHITELISTED: 0.125,
    FOUND_CAPITAL_GAIN: 0.20,
    COMPANY_REVALUATION: 0.17,
    IVAFE: 0.002
}

export type TFRPL = {
    capital: number;
    netCapital: number;
    taxes: number;
  };
  
export type TFRYearlyData = {
    year: number;
    ral: number;
    tfr: number;
    fund: TFRPL;
    company: TFRPL;
  };

export enum AssetType {
    FUND = 'fund',
    EQUITY = 'equity',
    BOND = 'bond',
    COMPANY = 'company'
}

export const getTaxRate = (assetType: AssetType): number => {
    switch (assetType) {
        case AssetType.EQUITY:
            return 26;

        case AssetType.BOND:
            return 12.5;

        case AssetType.FUND:
            return 20;

        case AssetType.COMPANY:
            return 17;

        default:
            return 26;
    }
};

/**
 * Calculate weighted tax rate based on equity percentage
 * @param assetType - Type of asset
 * @param equityPercentage - Percentage of equity in the asset (0-100)
 * @returns Weighted tax rate percentage
 */
const determineTaxRate = (assetType: AssetType, equityPercentage: number): number => {
    if (equityPercentage) {
        const equityRatio = equityPercentage / 100;
        // Weighted tax:  (equity portion * 26%) + (non-equity portion * 12.5%)
        const equityTax = equityRatio * 26;
        const bondTax = (1 - equityRatio) * 12.5;
        return equityTax + bondTax;
    }
    return getTaxRate(assetType);
}

export const calculateTFR = (capital: number, CAGR: number, assetType: AssetType, equityPercentage: number = 0) : TFRPL => {
    const taxRate: number = determineTaxRate(assetType, equityPercentage);

    const newCapital: number = capital * (1 + CAGR / 100);
    const taxes: number = capital * (taxRate / 100);
    const fundNet: number = newCapital - taxes;

    return {
        capital: parseFloat(newCapital.toFixed(0)),
        netCapital: parseFloat(fundNet.toFixed(0)),
        taxes: parseFloat(taxes.toFixed(0)),
    }
};