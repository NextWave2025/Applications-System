import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  exchangeRates: ExchangeRates;
  convertAmount: (amountInAED: number, toCurrency?: string) => number;
  formatCurrency: (amount: number, currency?: string) => string;
  isLoading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const SUPPORTED_CURRENCIES = {
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('AED');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exchange rates from exchangerate.host API
  const fetchExchangeRates = async () => {
    if (selectedCurrency === 'AED') {
      setExchangeRates({ AED: 1 });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all supported currencies except AED
      const currencies = Object.keys(SUPPORTED_CURRENCIES)
        .filter(code => code !== 'AED')
        .join(',');

      const response = await fetch(
        `https://api.exchangerate.host/latest?base=AED&symbols=${currencies}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();

      if (data.success) {
        setExchangeRates({
          AED: 1,
          ...data.rates
        });
      } else {
        throw new Error('Exchange rate API returned error');
      }
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError('Currency conversion is currently unavailable. Showing AED.');
      setExchangeRates({ AED: 1 });
      setSelectedCurrency('AED');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rates when component mounts or when currency changes
  useEffect(() => {
    fetchExchangeRates();
  }, [selectedCurrency]);

  const convertAmount = (amountInAED: number, toCurrency?: string): number => {
    const targetCurrency = toCurrency || selectedCurrency;
    
    if (targetCurrency === 'AED') {
      return amountInAED;
    }

    const rate = exchangeRates[targetCurrency];
    if (!rate) {
      return amountInAED;
    }

    return Math.round(amountInAED * rate);
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const targetCurrency = currency || selectedCurrency;
    const currencyInfo = SUPPORTED_CURRENCIES[targetCurrency as keyof typeof SUPPORTED_CURRENCIES];
    
    if (!currencyInfo) {
      return `${amount}`;
    }

    // Format number with commas for thousands
    const formattedAmount = new Intl.NumberFormat('en-US').format(amount);
    
    return `${currencyInfo.symbol}${formattedAmount}`;
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    convertAmount,
    formatCurrency,
    isLoading,
    error
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}