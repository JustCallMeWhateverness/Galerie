import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { exchangeRates, currencySymbols, currencies } from '../utils/currencyRates';
import type { Currency } from '../utils/currencyRates';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertCurrency: (amount: number) => number;
  convertToSEK: (amount: number) => number;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const storageKey = 'userCurrency';
const defaultCurrency: Currency = 'SEK';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && currencies.includes(saved as Currency)) {
      return saved as Currency;
    }
    return defaultCurrency;
  });

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(storageKey, newCurrency);
  };

  /**
   * Converts SEK amount to user's selected currency
   * @param amount - Amount in SEK (from backend)
   * @returns Amount in user's selected currency
   */
  const convertCurrency = (amount: number): number => {
    if (currency === 'SEK') return amount;
    const rate = exchangeRates[currency];
    const converted = amount * rate;
    return Math.round(converted * 100) / 100;
  };

  /**
   * Converts user's input amount (in selected currency) to SEK for backend submission
   * @param amount - Amount in user's selected currency
   * @returns Amount in SEK (for backend API)
   */
  const convertToSEK = (amount: number): number => {
    if (currency === 'SEK') return amount;
    const rate = exchangeRates[currency];
    const converted = amount / rate;
    return Math.round(converted * 100) / 100;
  };

  /**
   * Formats SEK amount as user's selected currency string
   * Backend always stores amounts in SEK, this converts and formats for display
   * @param amount - Amount in SEK (from backend)
   * @returns Formatted currency string in user's selected currency
   */
  const formatCurrency = (amount: number): string => {
    const converted = convertCurrency(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted);
  };

  /**
   * Gets the currency symbol for the user's selected currency
   * @returns Currency symbol string (e.g., '$', '€', 'kr')
   */
  const getCurrencySymbol = (): string => {
    return currencySymbols[currency];
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertCurrency,
        convertToSEK,
        formatCurrency,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

