import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { studyLevels, studyFields, uaeLocations, intakeOptions, topUniversities, type University } from "@shared/schema";

interface FilterState {
  universityIds: number[];
  tuitionMin: number;
  tuitionMax: number;
  degreeLevel: string[];
  location: string[];
  studyField: string[];
  intake: string[];
  hasScholarship: boolean;
}

interface EnhancedProgramFiltersProps {
  className?: string;
  onFiltersChange?: (filters: FilterState) => void;
  onResultsCountChange?: (count: number) => void;
}

export default function EnhancedProgramFilters({
  className,
  onFiltersChange,
  onResultsCountChange
}: EnhancedProgramFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    universityIds: [],
    tuitionMin: 0,
    tuitionMax: 80000,
    degreeLevel: [],
    location: [],
    studyField: [],
    intake: [],
    hasScholarship: false
  });

  const [universitySearchOpen, setUniversitySearchOpen] = useState(false);
  const [universitySearchValue, setUniversitySearchValue] = useState("");

  // Fetch universities
  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ['/api/universities']
  });

  // Sort universities with top universities first
  const sortedUniversities = universities.sort((a, b) => {
    const aIndex = topUniversities.indexOf(a.name);
    const bIndex = topUniversities.indexOf(b.name);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  // Filter universities based on search
  const filteredUniversities = sortedUniversities.filter(university =>
    university.name.toLowerCase().includes(universitySearchValue.toLowerCase())
  );

  const selectedUniversities = universities.filter(u => filters.universityIds.includes(u.id));

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle university selection
  const handleUniversitySelect = (universityId: number) => {
    const newIds = filters.universityIds.includes(universityId)
      ? filters.universityIds.filter(id => id !== universityId)
      : [...filters.universityIds, universityId];
    handleFilterChange('universityIds', newIds);
  };

  // Handle tuition preset buttons
  const handleTuitionPreset = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, tuitionMin: min, tuitionMax: max }));
    onFiltersChange?.({ ...filters, tuitionMin: min, tuitionMax: max });
  };

  // Reset all filters
  const resetFilters = () => {
    const resetState: FilterState = {
      universityIds: [],
      tuitionMin: 0,
      tuitionMax: 80000,
      degreeLevel: [],
      location: [],
      studyField: [],
      intake: [],
      hasScholarship: false
    };
    setFilters(resetState);
    onFiltersChange?.(resetState);
  };

  // Handle array filter changes
  const handleArrayFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    handleFilterChange(key, newArray);
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Reset All Filters
        </Button>
      </div>

      {/* University Filter - Searchable Dropdown */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">University</Label>
        <Popover open={universitySearchOpen} onOpenChange={setUniversitySearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={universitySearchOpen}
              className="w-full justify-between"
            >
              {selectedUniversities.length > 0 ? (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {selectedUniversities.slice(0, 2).map(uni => (
                    <Badge key={uni.id} variant="secondary" className="text-xs">
                      {uni.name}
                    </Badge>
                  ))}
                  {selectedUniversities.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedUniversities.length - 2} more
                    </Badge>
                  )}
                </div>
              ) : (
                "Select universities..."
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search universities..." 
                value={universitySearchValue}
                onValueChange={setUniversitySearchValue}
              />
              <CommandEmpty>No universities found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredUniversities.map((university) => (
                  <CommandItem
                    key={university.id}
                    value={university.name}
                    onSelect={() => handleUniversitySelect(university.id)}
                  >
                    <Checkbox
                      checked={filters.universityIds.includes(university.id)}
                      className="mr-2"
                    />
                    {university.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Selected universities with remove option */}
        {selectedUniversities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedUniversities.map(uni => (
              <Badge key={uni.id} variant="secondary" className="text-xs">
                {uni.name}
                <button
                  onClick={() => handleUniversitySelect(uni.id)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Tuition Fee Filter - Slider + Preset Buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Tuition Fee (AED)</Label>
        
        {/* Preset buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTuitionPreset(0, 30000)}
            className={cn(
              "text-xs",
              filters.tuitionMin === 0 && filters.tuitionMax === 30000 && "bg-primary text-primary-foreground"
            )}
          >
            Under AED 30,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTuitionPreset(30000, 50000)}
            className={cn(
              "text-xs",
              filters.tuitionMin === 30000 && filters.tuitionMax === 50000 && "bg-primary text-primary-foreground"
            )}
          >
            AED 30,000–50,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTuitionPreset(50000, 70000)}
            className={cn(
              "text-xs",
              filters.tuitionMin === 50000 && filters.tuitionMax === 70000 && "bg-primary text-primary-foreground"
            )}
          >
            AED 50,000–70,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTuitionPreset(70000, 80000)}
            className={cn(
              "text-xs",
              filters.tuitionMin === 70000 && filters.tuitionMax === 80000 && "bg-primary text-primary-foreground"
            )}
          >
            Above AED 70,000
          </Button>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>AED {filters.tuitionMin.toLocaleString()}</span>
            <span>AED {filters.tuitionMax.toLocaleString()}</span>
          </div>
          <Slider
            value={[filters.tuitionMin, filters.tuitionMax]}
            onValueChange={([min, max]) => {
              setFilters(prev => ({ ...prev, tuitionMin: min, tuitionMax: max }));
            }}
            onValueCommit={([min, max]) => {
              onFiltersChange?.({ ...filters, tuitionMin: min, tuitionMax: max });
            }}
            max={80000}
            min={0}
            step={1000}
            className="w-full"
          />
        </div>
      </div>

      {/* Degree Level Filter - Buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Degree Level</Label>
        <div className="grid grid-cols-1 gap-2">
          {studyLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`degree-${level}`}
                checked={filters.degreeLevel.includes(level)}
                onCheckedChange={(checked) => 
                  handleArrayFilterChange('degreeLevel', level, checked as boolean)
                }
              />
              <Label htmlFor={`degree-${level}`} className="text-sm font-normal">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Filter - Dropdown */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Location</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {uaeLocations.map((location) => (
              <SelectItem key={location} value={location}>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.location.includes(location)}
                    onCheckedChange={(checked) => 
                      handleArrayFilterChange('location', location, checked as boolean)
                    }
                  />
                  <span>{location}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Selected locations */}
        {filters.location.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.location.map(loc => (
              <Badge key={loc} variant="secondary" className="text-xs">
                {loc}
                <button
                  onClick={() => handleArrayFilterChange('location', loc, false)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Field of Study Filter - Multi-select */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Field of Study</Label>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {studyFields.map((field) => (
            <div key={field} className="flex items-center space-x-2">
              <Checkbox
                id={`field-${field}`}
                checked={filters.studyField.includes(field)}
                onCheckedChange={(checked) => 
                  handleArrayFilterChange('studyField', field, checked as boolean)
                }
              />
              <Label htmlFor={`field-${field}`} className="text-sm font-normal">
                {field}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Intake Filter - Checkboxes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Intake</Label>
        <div className="grid grid-cols-3 gap-2">
          {intakeOptions.map((intake) => (
            <div key={intake} className="flex items-center space-x-2">
              <Checkbox
                id={`intake-${intake}`}
                checked={filters.intake.includes(intake)}
                onCheckedChange={(checked) => 
                  handleArrayFilterChange('intake', intake, checked as boolean)
                }
              />
              <Label htmlFor={`intake-${intake}`} className="text-sm font-normal">
                {intake}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.universityIds.length > 0 || 
        filters.degreeLevel.length > 0 || 
        filters.location.length > 0 || 
        filters.studyField.length > 0 || 
        filters.intake.length > 0 || 
        filters.hasScholarship ||
        filters.tuitionMin > 0 || 
        filters.tuitionMax < 80000) && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear All
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {filters.universityIds.length > 0 && (
              <div>Universities: {filters.universityIds.length} selected</div>
            )}
            {(filters.tuitionMin > 0 || filters.tuitionMax < 80000) && (
              <div>Tuition: AED {filters.tuitionMin.toLocaleString()} - {filters.tuitionMax.toLocaleString()}</div>
            )}
            {filters.degreeLevel.length > 0 && (
              <div>Degree Level: {filters.degreeLevel.length} selected</div>
            )}
            {filters.location.length > 0 && (
              <div>Location: {filters.location.join(', ')}</div>
            )}
            {filters.studyField.length > 0 && (
              <div>Study Field: {filters.studyField.length} selected</div>
            )}
            {filters.intake.length > 0 && (
              <div>Intake: {filters.intake.join(', ')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}