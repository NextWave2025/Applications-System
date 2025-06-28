import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRightLeft, X, CheckCircle2 } from 'lucide-react';
import { useExchangeRates, SUPPORTED_CURRENCIES } from '@/hooks/use-exchange-rates';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BulkConversionResult {
  programId: number;
  originalAmount: number;
  convertedAmount: number;
  currency: string;
  rate: number;
}

interface BulkCurrencyConverterProps {
  selectedPrograms: Array<{
    id: number;
    name: string;
    tuitionFee?: number;
    tuition?: string;
  }>;
  fromCurrency?: string;
  onConversionComplete?: (results: BulkConversionResult[]) => void;
  className?: string;
}

export function BulkCurrencyConverter({
  selectedPrograms,
  fromCurrency = 'AED',
  onConversionComplete,
  className
}: BulkCurrencyConverterProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResults, setConversionResults] = useState<BulkConversionResult[]>([]);
  const [appliedCurrencies, setAppliedCurrencies] = useState<Set<string>>(new Set());

  const { 
    convertAmount, 
    formatCurrency, 
    getExchangeRate, 
    isLoading: ratesLoading, 
    error: ratesError 
  } = useExchangeRates(fromCurrency);

  // Extract tuition fee amount from program data
  const extractTuitionAmount = useCallback((program: any): number | null => {
    // Try tuitionFee first (numeric)
    if (typeof program.tuitionFee === 'number' && program.tuitionFee > 0) {
      return program.tuitionFee;
    }
    
    // Try parsing tuition string
    if (typeof program.tuition === 'string') {
      const numericValue = program.tuition.replace(/[^0-9]/g, '');
      if (numericValue) {
        return parseInt(numericValue);
      }
    }
    
    return null;
  }, []);

  const handleBulkConversion = useCallback(async () => {
    if (!selectedCurrency || selectedPrograms.length === 0) return;

    setIsConverting(true);
    const results: BulkConversionResult[] = [];

    try {
      for (const program of selectedPrograms) {
        try {
          const tuitionAmount = extractTuitionAmount(program);
          
          if (tuitionAmount && tuitionAmount > 0) {
            const convertedValue = convertAmount(tuitionAmount, fromCurrency, selectedCurrency);
            const rate = getExchangeRate(fromCurrency, selectedCurrency);
            
            if (convertedValue !== null && rate !== null) {
              results.push({
                programId: program.id,
                originalAmount: tuitionAmount,
                convertedAmount: convertedValue,
                currency: selectedCurrency,
                rate: rate
              });
            }
          }
        } catch (programError) {
          console.error(`Error converting program ${program.id}:`, programError);
          // Continue with other programs
        }
      }

      // Update results and add currency to applied set
      setConversionResults(prev => {
        const filtered = prev.filter(result => result.currency !== selectedCurrency);
        return [...filtered, ...results];
      });
      
      setAppliedCurrencies(prev => new Set(Array.from(prev).concat(selectedCurrency)));
      
      // Notify parent component with proper error handling
      try {
        onConversionComplete?.(results);
      } catch (callbackError) {
        console.error('Error in conversion callback:', callbackError);
      }
      
      // Reset selection
      setSelectedCurrency('');
    } catch (error) {
      console.error('Bulk conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  }, [selectedCurrency, selectedPrograms, convertAmount, getExchangeRate, fromCurrency, extractTuitionAmount, onConversionComplete]);

  const removeBulkConversion = useCallback((currency: string) => {
    setConversionResults(prev => prev.filter(result => result.currency !== currency));
    setAppliedCurrencies(prev => {
      const newArray = Array.from(prev).filter(code => code !== currency);
      return new Set(newArray);
    });
  }, []);

  const clearAllConversions = useCallback(() => {
    setConversionResults([]);
    setAppliedCurrencies(new Set());
  }, []);

  // Filter available currencies (exclude already applied and base currency)
  const availableCurrencies = SUPPORTED_CURRENCIES.filter(
    currency => !appliedCurrencies.has(currency.code) && currency.code !== fromCurrency
  );

  // Get programs with valid tuition fees
  const validPrograms = selectedPrograms.filter(program => {
    const amount = extractTuitionAmount(program);
    return amount && amount > 0;
  });

  // Group conversion results by currency
  const resultsByCurrency = conversionResults.reduce((acc, result) => {
    if (!acc[result.currency]) {
      acc[result.currency] = [];
    }
    acc[result.currency].push(result);
    return acc;
  }, {} as Record<string, BulkConversionResult[]>);

  if (selectedPrograms.length === 0) {
    return (
      <Card className={cn("border-dashed border-2", className)}>
        <CardContent className="p-6 text-center">
          <ArrowRightLeft className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Select programs to enable bulk currency conversion</p>
        </CardContent>
      </Card>
    );
  }

  if (ratesError) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="p-4">
          <p className="text-sm text-red-600">Exchange rates unavailable for bulk conversion</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Bulk Currency Converter
          <Badge variant="secondary" className="ml-2">
            {validPrograms.length} program{validPrograms.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conversion Controls */}
        <div className="flex items-center space-x-2">
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select currency to convert to..." />
            </SelectTrigger>
            <SelectContent>
              {/* Popular currencies first */}
              {availableCurrencies
                .filter(currency => ['USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR'].includes(currency.code))
                .map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center">
                      <span className="mr-2">{currency.flag}</span>
                      <span className="font-medium">{currency.code}</span>
                      <span className="ml-2 text-xs text-gray-500">{currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              
              {availableCurrencies.length > 6 && 
                availableCurrencies
                  .filter(currency => !['USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR'].includes(currency.code))
                  .map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center">
                        <span className="mr-2">{currency.flag}</span>
                        <span className="font-medium">{currency.code}</span>
                        <span className="ml-2 text-xs text-gray-500">{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleBulkConversion}
            disabled={!selectedCurrency || isConverting || ratesLoading}
            className="flex-shrink-0"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Convert All
              </>
            )}
          </Button>
        </div>

        {/* Conversion Summary */}
        {validPrograms.length !== selectedPrograms.length && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
            {selectedPrograms.length - validPrograms.length} program(s) excluded due to missing tuition information
          </div>
        )}

        {/* Applied Conversions */}
        {Object.keys(resultsByCurrency).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Applied Conversions</h4>
              {Object.keys(resultsByCurrency).length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllConversions}
                  className="text-xs text-gray-500"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {Object.entries(resultsByCurrency).map(([currency, results]) => {
              const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
              const totalConverted = results.reduce((sum, result) => sum + result.convertedAmount, 0);
              const avgRate = results.reduce((sum, result) => sum + result.rate, 0) / results.length;
              
              return (
                <div key={currency} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        {currencyInfo?.flag} {currency} - {results.length} program{results.length !== 1 ? 's' : ''}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Rate: 1 {fromCurrency} = {avgRate.toFixed(4)} {currency}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBulkConversion(currency)}
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-green-700">
                    <div className="flex justify-between items-center">
                      <span>Total converted amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(totalConverted, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Instructions */}
        {Object.keys(resultsByCurrency).length === 0 && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Select a currency from the dropdown above</li>
              <li>Click "Convert All" to apply conversion to all selected programs</li>
              <li>Converted amounts will appear on each program card</li>
              <li>You can convert to multiple currencies</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BulkCurrencyConverter;