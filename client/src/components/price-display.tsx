import React from 'react';
import { useCurrency } from '@/hooks/use-currency';

interface PriceDisplayProps {
  amountInAED: number;
  className?: string;
  showOriginal?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ 
  amountInAED, 
  className = '', 
  showOriginal = true,
  size = 'md'
}: PriceDisplayProps) {
  const { selectedCurrency, convertAmount, formatCurrency } = useCurrency();

  const convertedAmount = convertAmount(amountInAED);
  const formattedAED = new Intl.NumberFormat('en-US').format(amountInAED);
  const formattedConverted = formatCurrency(convertedAmount);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  // If selected currency is AED, show only AED
  if (selectedCurrency === 'AED') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <span className="text-primary font-medium">د.إ{formattedAED}</span>
      </div>
    );
  }

  // If conversion is available, show converted amount with AED reference
  if (convertedAmount !== amountInAED) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <span className="text-primary font-medium">{formattedConverted}</span>
        {showOriginal && (
          <span className="text-gray-500 text-sm ml-2">
            (~د.إ{formattedAED})
          </span>
        )}
      </div>
    );
  }

  // Fallback to AED if conversion fails
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <span className="text-primary font-medium">د.إ{formattedAED}</span>
      <span className="text-orange-500 text-xs ml-2">
        (Conversion unavailable)
      </span>
    </div>
  );
}