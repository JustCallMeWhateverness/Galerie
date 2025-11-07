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

  const convertCurrency = (amount: number): number => {
    if (currency === 'SEK') return amount;
    const rate = exchangeRates[currency];
    const converted = amount * rate;
    return Math.round(converted * 100) / 100;
  };

  const convertToSEK = (amount: number): number => {
    if (currency === 'SEK') return amount;
    const rate = exchangeRates[currency];
    const converted = amount / rate;
    return Math.round(converted * 100) / 100;
  };

  const formatCurrency = (amount: number): string => {
    const converted = convertCurrency(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(converted);
  };

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

