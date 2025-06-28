import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Popular currencies supported by most exchange rate APIs
export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', flag: '🇱🇧' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
];

interface ExchangeRatesResponse {
  success: boolean;
  rates: Record<string, number>;
  timestamp: number;
  base: string;
}

async function fetchExchangeRates(baseCurrency: string = 'AED'): Promise<ExchangeRatesResponse> {
  // Using exchangerate-api.com which provides free tier with good limits
  // Alternative: Use fixer.io, currencylayer.com, or exchangerate.host
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    success: true,
    rates: data.rates,
    timestamp: data.time_last || Date.now(),
    base: data.base
  };
}

export function useExchangeRates(baseCurrency: string = 'AED') {
  const [error, setError] = useState<string | null>(null);

  const { 
    data: exchangeData, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['exchange-rates', baseCurrency],
    queryFn: () => fetchExchangeRates(baseCurrency),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const convertAmount = useCallback((
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ): number | null => {
    if (!exchangeData?.rates) return null;
    
    // If converting from AED to another currency
    if (fromCurrency === 'AED') {
      return amount * (exchangeData.rates[toCurrency] || 0);
    }
    
    // If converting from another currency to AED
    if (toCurrency === 'AED') {
      const rate = exchangeData.rates[fromCurrency];
      return rate ? amount / rate : null;
    }
    
    // If converting between two non-AED currencies
    const fromRate = exchangeData.rates[fromCurrency];
    const toRate = exchangeData.rates[toCurrency];
    
    if (!fromRate || !toRate) return null;
    
    // Convert to AED first, then to target currency
    const aedAmount = amount / fromRate;
    return aedAmount * toRate;
  }, [exchangeData]);

  const formatCurrency = useCallback((
    amount: number, 
    currencyCode: string, 
    includeSymbol: boolean = true
  ): string => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    
    // Format with proper decimal places based on currency
    const decimals = ['JPY', 'KRW', 'VND', 'IDR'].includes(currencyCode) ? 0 : 2;
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return includeSymbol ? `${symbol} ${formattedAmount}` : formattedAmount;
  }, []);

  const getExchangeRate = useCallback((
    fromCurrency: string, 
    toCurrency: string
  ): number | null => {
    if (!exchangeData?.rates) return null;
    
    if (fromCurrency === toCurrency) return 1;
    
    // If converting from AED
    if (fromCurrency === 'AED') {
      return exchangeData.rates[toCurrency] || null;
    }
    
    // If converting to AED
    if (toCurrency === 'AED') {
      const rate = exchangeData.rates[fromCurrency];
      return rate ? 1 / rate : null;
    }
    
    // Converting between two non-AED currencies
    const fromRate = exchangeData.rates[fromCurrency];
    const toRate = exchangeData.rates[toCurrency];
    
    if (!fromRate || !toRate) return null;
    
    return toRate / fromRate;
  }, [exchangeData]);

  const refreshRates = useCallback(() => {
    setError(null);
    refetch().catch((err) => {
      setError(err.message || 'Failed to refresh exchange rates');
    });
  }, [refetch]);

  useEffect(() => {
    if (isError) {
      setError('Failed to load exchange rates. Please check your internet connection.');
    } else {
      setError(null);
    }
  }, [isError]);

  return {
    exchangeRates: exchangeData?.rates || {},
    isLoading,
    error,
    convertAmount,
    formatCurrency,
    getExchangeRate,
    refreshRates,
    lastUpdated: exchangeData?.timestamp ? new Date(exchangeData.timestamp * 1000) : null,
    baseCurrency: exchangeData?.base || baseCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES
  };
}