import React from 'react';
import { Globe, AlertCircle } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrency, SUPPORTED_CURRENCIES } from '@/hooks/use-currency';

interface CurrencySelectorProps {
  className?: string;
  compact?: boolean;
}

export default function CurrencySelector({ className = '', compact = false }: CurrencySelectorProps) {
  const { selectedCurrency, setSelectedCurrency, isLoading, error } = useCurrency();

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-600" />
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-20 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">
          Currency
        </label>
      </div>
      
      <Select 
        value={selectedCurrency} 
        onValueChange={setSelectedCurrency}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{info.symbol}</span>
                <span>{code}</span>
                <span className="text-gray-500 text-xs">- {info.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <Alert className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="text-xs text-gray-500 mt-1">
          Loading exchange rates...
        </div>
      )}
    </div>
  );
}