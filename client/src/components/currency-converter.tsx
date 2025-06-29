import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useExchangeRates, SUPPORTED_CURRENCIES, CurrencyOption } from '@/hooks/use-exchange-rates';
import { cn } from '@/lib/utils';

interface ConvertedAmount {
  currency: string;
  amount: number;
  rate: number;
}

interface CurrencyConverterProps {
  amount: number;
  fromCurrency?: string;
  className?: string;
  variant?: 'compact' | 'full';
}

export function CurrencyConverter({ 
  amount, 
  fromCurrency = 'AED', 
  className,
  variant = 'compact' 
}: CurrencyConverterProps) {
  const [convertedAmounts, setConvertedAmounts] = useState<ConvertedAmount[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(new Set());

  const { 
    convertAmount, 
    formatCurrency, 
    getExchangeRate, 
    isLoading: ratesLoading, 
    error: ratesError,
    refreshRates 
  } = useExchangeRates(fromCurrency);

  const handleCurrencySelect = useCallback(async (currencyCode: string) => {
    // Prevent duplicate conversions
    if (selectedCurrencies.has(currencyCode) || currencyCode === fromCurrency) {
      return;
    }

    setIsConverting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 50)); // Prevent rapid-fire requests
      
      const convertedValue = convertAmount(amount, fromCurrency, currencyCode);
      const rate = getExchangeRate(fromCurrency, currencyCode);
      
      if (convertedValue !== null && rate !== null) {
        const newConversion: ConvertedAmount = {
          currency: currencyCode,
          amount: convertedValue,
          rate: rate
        };
        
        setConvertedAmounts(prev => [...prev, newConversion]);
        setSelectedCurrencies(prev => new Set(Array.from(prev).concat(currencyCode)));
      }
    } catch (error) {
      console.error('Currency conversion failed:', error);
      // Don't throw - handle gracefully
    } finally {
      setIsConverting(false);
    }
  }, [amount, fromCurrency, convertAmount, getExchangeRate, selectedCurrencies]);

  const removeCurrency = useCallback((currencyCode: string) => {
    setConvertedAmounts(prev => prev.filter(conversion => conversion.currency !== currencyCode));
    setSelectedCurrencies(prev => {
      const newArray = Array.from(prev).filter(code => code !== currencyCode);
      return new Set(newArray);
    });
  }, []);

  const clearAllConversions = useCallback(() => {
    setConvertedAmounts([]);
    setSelectedCurrencies(new Set());
  }, []);

  // Filter out already selected currencies and the base currency
  const availableCurrencies = SUPPORTED_CURRENCIES.filter(
    currency => !selectedCurrencies.has(currency.code) && currency.code !== fromCurrency
  );

  const getCurrencyInfo = (code: string): CurrencyOption | undefined => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  };

  if (ratesError) {
    return (
      <div className={cn("text-xs text-red-600 bg-red-50 p-2 rounded-md", className)}>
        <div className="flex items-center justify-between">
          <span>Exchange rates unavailable</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRates}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Convert Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "text-xs font-medium",
              variant === 'compact' ? "h-6 px-2" : "h-8 px-3"
            )}
            disabled={ratesLoading || availableCurrencies.length === 0}
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-1 h-3 w-3" />
                Convert
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Convert to Currency</span>
            {ratesLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Popular currencies first */}
          <div className="max-h-64 overflow-y-auto">
            {availableCurrencies
              .filter(currency => ['USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR'].includes(currency.code))
              .map(currency => (
                <DropdownMenuItem
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{currency.flag}</span>
                  <span className="font-medium">{currency.code}</span>
                  <span className="ml-2 text-xs text-gray-500">{currency.name}</span>
                </DropdownMenuItem>
              ))}
            
            {availableCurrencies.length > 6 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-gray-500">Other Currencies</DropdownMenuLabel>
                {availableCurrencies
                  .filter(currency => !['USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR'].includes(currency.code))
                  .map(currency => (
                    <DropdownMenuItem
                      key={currency.code}
                      onClick={() => handleCurrencySelect(currency.code)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{currency.flag}</span>
                      <span className="font-medium">{currency.code}</span>
                      <span className="ml-2 text-xs text-gray-500 truncate">{currency.name}</span>
                    </DropdownMenuItem>
                  ))}
              </>
            )}
          </div>
          
          {availableCurrencies.length === 0 && (
            <DropdownMenuItem disabled>
              <span className="text-xs text-gray-500">All currencies converted</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Converted Amounts Display */}
      {convertedAmounts.length > 0 && (
        <div className="space-y-1">
          {convertedAmounts.map(conversion => {
            const currencyInfo = getCurrencyInfo(conversion.currency);
            return (
              <div
                key={conversion.currency}
                className={cn(
                  "flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-2",
                  variant === 'compact' ? "text-xs" : "text-sm"
                )}
              >
                <div className="flex items-center space-x-2">
                  <span>{currencyInfo?.flag}</span>
                  <span className="font-medium text-green-800">
                    {formatCurrency(conversion.amount, conversion.currency)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    1 {fromCurrency} = {conversion.rate.toFixed(4)} {conversion.currency}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCurrency(conversion.currency)}
                  className="h-5 w-5 p-0 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          
          {/* Clear All Button */}
          {convertedAmounts.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllConversions}
              className={cn(
                "text-xs text-gray-500 hover:text-gray-700",
                variant === 'compact' ? "h-5" : "h-6"
              )}
            >
              Clear all conversions
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default CurrencyConverter;