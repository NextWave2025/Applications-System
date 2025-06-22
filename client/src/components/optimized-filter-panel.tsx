import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronDown, 
  X, 
  Filter, 
  DollarSign, 
  GraduationCap, 
  MapPin,
  Award,
  Building2,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { studyLevels, studyFields, uaeLocations, type University } from "@shared/schema";

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

interface OptimizedFilterPanelProps {
  className?: string;
  onFiltersChange?: (filters: FilterState) => void;
  onResultsCountChange?: (count: number) => void;
  isSearching?: boolean;
  searchResultsCount?: number;
}

export default function OptimizedFilterPanel({
  className,
  onFiltersChange,
  onResultsCountChange,
  isSearching = false,
  searchResultsCount = 0
}: OptimizedFilterPanelProps) {
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
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'notfound'>('idle');

  // Fetch universities
  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ['/api/universities']
  });

  // Sort universities alphabetically
  const sortedUniversities = universities.sort((a, b) => a.name.localeCompare(b.name));

  // Filter universities based on search
  const filteredUniversities = sortedUniversities.filter(university =>
    university.name.toLowerCase().includes(universitySearchValue.toLowerCase())
  );

  const selectedUniversities = universities.filter(u => filters.universityIds.includes(u.id));

  // Handle search animation
  useEffect(() => {
    if (isSearching) {
      setSearchStatus('searching');
    } else {
      if (searchResultsCount > 0) {
        setSearchStatus('found');
      } else {
        setSearchStatus('notfound');
      }
      
      // Reset status after animation
      const timer = setTimeout(() => {
        setSearchStatus('idle');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSearching, searchResultsCount]);

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

  // Calculate active filter count
  const activeFilterCount = 
    filters.universityIds.length +
    filters.degreeLevel.length +
    filters.location.length +
    filters.studyField.length +
    filters.intake.length +
    (filters.hasScholarship ? 1 : 0) +
    (filters.tuitionMin > 0 || filters.tuitionMax < 80000 ? 1 : 0);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Filter Programs
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs font-medium">
                  {activeFilterCount} Active
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          
          {/* Search Status Animation */}
          {searchStatus !== 'idle' && (
            <div className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-md transition-all duration-300",
              searchStatus === 'searching' && "bg-blue-50 text-blue-700",
              searchStatus === 'found' && "bg-green-50 text-green-700",
              searchStatus === 'notfound' && "bg-orange-50 text-orange-700"
            )}>
              {searchStatus === 'searching' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching programs...</span>
                </>
              )}
              {searchStatus === 'found' && (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{searchResultsCount} programs found</span>
                </>
              )}
              {searchStatus === 'notfound' && (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>No programs match your criteria</span>
                </>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* 1. Universities Filter */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-blue-500" />
              <Label className="text-sm font-semibold text-gray-900">Universities</Label>
            </div>
            
            <Popover open={universitySearchOpen} onOpenChange={setUniversitySearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={universitySearchOpen}
                  className="w-full justify-between text-left font-normal h-9 sm:h-10"
                >
                  <span className="truncate text-xs sm:text-sm">
                    {selectedUniversities.length > 0
                      ? `${selectedUniversities.length} selected`
                      : "Select universities..."}
                  </span>
                  <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search universities..."
                    value={universitySearchValue}
                    onValueChange={setUniversitySearchValue}
                    className="h-8 sm:h-9"
                  />
                  <CommandEmpty>No universities found.</CommandEmpty>
                  <CommandGroup className="max-h-48 sm:max-h-64 overflow-auto">
                    {filteredUniversities.map((university) => (
                      <CommandItem
                        key={university.id}
                        value={university.name}
                        onSelect={() => handleUniversitySelect(university.id)}
                        className="flex items-center space-x-2 cursor-pointer text-xs sm:text-sm"
                      >
                        <Checkbox
                          checked={filters.universityIds.includes(university.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="flex-1">{university.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected universities */}
            {selectedUniversities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedUniversities.map((university) => (
                  <Badge
                    key={university.id}
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    <span className="truncate max-w-[120px]">{university.name}</span>
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer flex-shrink-0"
                      onClick={() => handleUniversitySelect(university.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Study Field Filter */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
              <Label className="text-sm font-semibold text-gray-900">Study Field</Label>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
              {studyFields.slice(0, 12).map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field}`}
                    checked={filters.studyField.includes(field)}
                    onCheckedChange={(checked) => {
                      const newFields = checked
                        ? [...filters.studyField, field]
                        : filters.studyField.filter(f => f !== field);
                      handleFilterChange('studyField', newFields);
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`field-${field}`} className="text-xs sm:text-sm cursor-pointer">
                    {field}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Degree Level Filter */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
              <Label className="text-sm font-semibold text-gray-900">Degree Level</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {studyLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`degree-${level}`}
                    checked={filters.degreeLevel.includes(level)}
                    onCheckedChange={(checked) => {
                      const newLevels = checked
                        ? [...filters.degreeLevel, level]
                        : filters.degreeLevel.filter(l => l !== level);
                      handleFilterChange('degreeLevel', newLevels);
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`degree-${level}`} className="text-xs sm:text-sm font-medium cursor-pointer">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Tuition Range Filter */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <Label className="text-sm font-semibold text-gray-900">Tuition Range</Label>
            </div>
            
            <div className="space-y-3">
              <Slider
                value={[filters.tuitionMin, filters.tuitionMax]}
                onValueChange={([min, max]) => {
                  setFilters(prev => ({ ...prev, tuitionMin: min, tuitionMax: max }));
                  onFiltersChange?.({ ...filters, tuitionMin: min, tuitionMax: max });
                }}
                max={80000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
                <span>AED {filters.tuitionMin.toLocaleString()}</span>
                <span>AED {filters.tuitionMax.toLocaleString()}</span>
              </div>
            </div>

            {/* Tuition presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTuitionPreset(0, 20000)}
                className="text-xs h-7 sm:h-8"
              >
                Under 20K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTuitionPreset(20000, 40000)}
                className="text-xs h-7 sm:h-8"
              >
                20K - 40K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTuitionPreset(40000, 80000)}
                className="text-xs h-7 sm:h-8 col-span-2 sm:col-span-1"
              >
                40K+
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Location Filter */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-red-500" />
              <Label className="text-sm font-semibold text-gray-900">Location</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {uaeLocations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={filters.location.includes(location)}
                    onCheckedChange={(checked) => {
                      const newLocations = checked
                        ? [...filters.location, location]
                        : filters.location.filter(l => l !== location);
                      handleFilterChange('location', newLocations);
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`location-${location}`} className="text-xs sm:text-sm cursor-pointer">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scholarship Filter */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
            <Checkbox
              id="scholarship"
              checked={filters.hasScholarship}
              onCheckedChange={(checked) => handleFilterChange('hasScholarship', checked)}
              className="data-[state=checked]:bg-green-600"
            />
            <Label htmlFor="scholarship" className="text-xs sm:text-sm font-medium cursor-pointer flex items-center">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-600" />
              Scholarship Available
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}