export const exchangeRates = {
  SEK: 1.0,
  AED: 0.384,
  AUD: 0.16,
  CNY: 0.745,
  DKK: 0.68,
  EUR: 0.091,
  GBP: 0.08,
  HKD: 0.813,
  NOK: 1.068,
  USD: 0.105,
} as const;

export const lastUpdated = '2025-11-05';

export type Currency = keyof typeof exchangeRates;

export const currencies: Currency[] = ['SEK', 'AED', 'AUD', 'CNY', 'DKK', 'EUR', 'GBP', 'HKD', 'NOK', 'USD'];

export const currencySymbols: Record<Currency, string> = {
  SEK: 'kr',
  AED: 'AED',
  AUD: 'A$',
  CNY: '¥',
  DKK: 'kr',
  EUR: '€',
  GBP: '£',
  HKD: 'HK$',
  NOK: 'kr',
  USD: '$',
};

export const currencyNames: Record<Currency, string> = {
  SEK: 'Swedish Krona',
  AED: 'UAE Dirham',
  AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan',
  DKK: 'Danish Krone',
  EUR: 'Euro',
  GBP: 'British Pound',
  HKD: 'Hong Kong Dollar',
  NOK: 'Norwegian Krone',
  USD: 'US Dollar',
};

