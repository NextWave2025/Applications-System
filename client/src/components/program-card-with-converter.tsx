import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GraduationCap, 
  Clock, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Bookmark,
  BookmarkCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CurrencyConverter from './currency-converter';

interface ProgramWithUniversity {
  id: number;
  name: string;
  degreeLevel: string;
  duration: string;
  intake: string;
  tuitionFee?: number;
  tuition?: string;
  description?: string;
  studyField?: string;
  hasScholarship?: boolean;
  isAvailable?: boolean;
  university?: {
    id: number;
    name: string;
    city?: string;
    logo?: string;
  };
  universityName?: string;
  universityLogo?: string;
}

interface ProgramCardWithConverterProps {
  program: ProgramWithUniversity;
  isSelected?: boolean;
  onSelectionChange?: (programId: number, selected: boolean) => void;
  showSelection?: boolean;
  className?: string;
}

export function ProgramCardWithConverter({
  program,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
  className
}: ProgramCardWithConverterProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Extract tuition amount for converter
  const getTuitionAmount = (): number => {
    if (typeof program.tuitionFee === 'number' && program.tuitionFee > 0) {
      return program.tuitionFee;
    }
    
    if (typeof program.tuition === 'string') {
      const numericValue = program.tuition.replace(/[^0-9]/g, '');
      if (numericValue) {
        return parseInt(numericValue);
      }
    }
    
    return 0;
  };

  const formatTuition = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(amount).replace('AED', '').trim() + ' AED/yr';
  };

  const tuitionAmount = getTuitionAmount();
  const displayTuition = tuitionAmount > 0 ? formatTuition(tuitionAmount) : 'Contact for pricing';
  const universityName = program.university?.name || program.universityName || 'University';
  const universityLogo = program.university?.logo || program.universityLogo;
  const cityName = program.university?.city || '';

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleSelectionChange = (checked: boolean) => {
    onSelectionChange?.(program.id, checked);
  };

  return (
    <Card className={cn(
      "h-full transition-all duration-200 hover:shadow-lg",
      isSelected && "ring-2 ring-primary ring-offset-2",
      className
    )}>
      {/* Selection Checkbox */}
      {showSelection && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectionChange}
            className="bg-white border-2 shadow-sm"
          />
        </div>
      )}

      {/* University Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {universityLogo && (
              <img
                src={universityLogo}
                alt={`${universityName} logo`}
                className="h-8 w-8 object-contain rounded"
              />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{universityName}</span>
              {cityName && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {cityName}
                </div>
              )}
            </div>
          </div>
          
          {/* Scholarship Badge */}
          {program.hasScholarship && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Scholarship Available
            </Badge>
          )}
        </div>

        {/* Program Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 mt-2">
          {program.name}
        </h3>
      </CardHeader>

      {/* Program Details */}
      <CardContent className="space-y-4">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm">{program.degreeLevel}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm">{program.duration}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm">{program.intake}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-primary">
              {displayTuition}
            </span>
          </div>
        </div>

        {/* Study Field */}
        {program.studyField && (
          <Badge variant="outline" className="text-xs">
            {program.studyField}
          </Badge>
        )}

        {/* Currency Converter */}
        {tuitionAmount > 0 && (
          <div className="border-t pt-3">
            <CurrencyConverter
              amount={tuitionAmount}
              fromCurrency="AED"
              variant="compact"
              className="w-full"
            />
          </div>
        )}

        {/* Description */}
        {program.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {program.description}
          </p>
        )}
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="flex justify-between pt-0">
        <Link href={`/programs/${program.id}`}>
          <Button variant="outline" size="sm" className="flex-1 mr-2">
            View Details
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveToggle}
          className="flex-shrink-0"
        >
          {isSaved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProgramCardWithConverter;