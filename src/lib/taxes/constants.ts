export const TAXATION = {
    CAPITAL_GAIN: 26,
    TRESURY_WHITELISTED: 12.5,
    FUND_CAPITAL_GAIN: 20,
    COMPANY_REVALUATION: 17,
    NO_TAXATION: 0,
    IVAFE: 0.2,
};

export const INCOME_TAX_BRACKETS = [
    { threshold: 0, rate: 23 },
    { threshold: 28000, rate: 35 },
    { threshold: 50000, rate: 43 },
];

export const FUND_TAX_CONFIG = {
    BASE_RATE: 23,
    MID_RATE: 15,
    MIN_RATE: 9,
    REDUCTION_PER_YEAR: 0.3,
    YEAR_REQUIRED_FOR_REDUCTION: 15,
};