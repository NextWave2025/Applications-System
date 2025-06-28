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
  error?: string;
}

async function fetchExchangeRates(baseCurrency: string = 'AED'): Promise<ExchangeRatesResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object' || !data.rates) {
      throw new Error('Invalid exchange rate response format');
    }
    
    return {
      success: true,
      rates: data.rates,
      timestamp: data.time_last || Date.now(),
      base: data.base || baseCurrency
    };
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    
    // Return fallback rates to prevent application crashes
    const fallbackRates: Record<string, number> = {
      'USD': 0.27, 'EUR': 0.25, 'GBP': 0.21, 'JPY': 30.2, 'CAD': 0.36,
      'AUD': 0.40, 'CHF': 0.24, 'CNY': 1.95, 'INR': 22.8, 'SAR': 1.02,
      'QAR': 0.99, 'KWD': 0.08, 'BHD': 0.10, 'OMR': 0.10, 'EGP': 8.5,
      'JOD': 0.19, 'LBP': 408, 'PKR': 75.2, 'BDT': 29.1, 'LKR': 84.5,
      'PHP': 15.1, 'SGD': 0.36, 'MYR': 1.21, 'THB': 9.2, 'VND': 6520,
      'KRW': 356, 'TWD': 8.6, 'HKD': 2.12, 'IDR': 4150, 'RUB': 25.8,
      'TRY': 9.1, 'ZAR': 4.8
    };
    
    return {
      success: false,
      rates: fallbackRates,
      timestamp: Date.now(),
      base: baseCurrency,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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
    queryFn: async () => {
      try {
        return await fetchExchangeRates(baseCurrency);
      } catch (error) {
        console.error('Exchange rate fetch error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch exchange rates');
        // Return fallback data instead of throwing
        return {
          success: false,
          rates: {
            'USD': 0.27, 'EUR': 0.25, 'GBP': 0.21, 'INR': 22.8, 'SAR': 1.02,
            'QAR': 0.99, 'KWD': 0.08, 'BHD': 0.10, 'OMR': 0.10
          },
          timestamp: Date.now(),
          base: baseCurrency,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent cascading errors
    throwOnError: false, // Prevent throwing errors
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