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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  ChevronDown, 
  X, 
  Filter, 
  DollarSign, 
  GraduationCap, 
  MapPin, 
  Calendar,
  Award,
  Building2,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
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

interface ResponsiveFilterPanelProps {
  className?: string;
  onFiltersChange?: (filters: FilterState) => void;
  onResultsCountChange?: (count: number) => void;
  isSearching?: boolean;
  searchResultsCount?: number;
}

export default function ResponsiveFilterPanel({
  className,
  onFiltersChange,
  onResultsCountChange
}: ResponsiveFilterPanelProps) {
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
  const [expandedSections, setExpandedSections] = useState({
    university: true,
    tuition: true,
    academic: true,
    location: false,
    intake: false
  });

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

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
    <Card className={cn("w-full bg-white shadow-sm border-gray-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
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
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* University Filter */}
        <Collapsible open={expandedSections.university} onOpenChange={() => toggleSection('university')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0 hover:no-underline group">
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-blue-500" />
              <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
                Universities
              </Label>
            </div>
            {expandedSections.university ? 
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            }
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <Popover open={universitySearchOpen} onOpenChange={setUniversitySearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={universitySearchOpen}
                  className="w-full justify-between text-left font-normal h-10"
                >
                  <span className="truncate">
                    {selectedUniversities.length > 0
                      ? `${selectedUniversities.length} selected`
                      : "Select universities..."}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search universities..."
                    value={universitySearchValue}
                    onValueChange={setUniversitySearchValue}
                    className="h-9"
                  />
                  <CommandEmpty>No universities found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {filteredUniversities.map((university) => (
                      <CommandItem
                        key={university.id}
                        value={university.name}
                        onSelect={() => handleUniversitySelect(university.id)}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={filters.universityIds.includes(university.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="flex-1 text-sm">{university.name}</span>
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
                    {university.name}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => handleUniversitySelect(university.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Tuition Filter */}
        <Collapsible open={expandedSections.tuition} onOpenChange={() => toggleSection('tuition')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0 hover:no-underline group">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
                Tuition Range
              </Label>
            </div>
            {expandedSections.tuition ? 
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            }
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
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
              <div className="flex justify-between text-sm text-gray-600 font-medium">
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
                className="text-xs h-8"
              >
                Under 20K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTuitionPreset(20000, 40000)}
                className="text-xs h-8"
              >
                20K - 40K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTuitionPreset(40000, 80000)}
                className="text-xs h-8 col-span-2 sm:col-span-1"
              >
                40K+
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Academic Filters */}
        <Collapsible open={expandedSections.academic} onOpenChange={() => toggleSection('academic')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0 hover:no-underline group">
            <div className="flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
              <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
                Academic Details
              </Label>
            </div>
            {expandedSections.academic ? 
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            }
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* Degree Level */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Degree Level</Label>
              <div className="grid grid-cols-2 gap-2">
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
                    <Label htmlFor={`degree-${level}`} className="text-sm font-medium cursor-pointer">
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Field */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Study Field</Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {studyFields.slice(0, 8).map((field) => (
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
                    <Label htmlFor={`field-${field}`} className="text-sm cursor-pointer">
                      {field}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Scholarship Filter */}
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Checkbox
                id="scholarship"
                checked={filters.hasScholarship}
                onCheckedChange={(checked) => handleFilterChange('hasScholarship', checked)}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="scholarship" className="text-sm font-medium cursor-pointer flex items-center">
                <Award className="w-4 h-4 mr-2 text-green-600" />
                Scholarship Available
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Location Filter */}
        <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0 hover:no-underline group">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
                Location
              </Label>
            </div>
            {expandedSections.location ? 
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            }
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
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
                  <Label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Intake Filter */}
        <Collapsible open={expandedSections.intake} onOpenChange={() => toggleSection('intake')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0 hover:no-underline group">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-red-500" />
              <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
                Intake Period
              </Label>
            </div>
            {expandedSections.intake ? 
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            }
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
              {intakeOptions.map((intake) => (
                <div key={intake} className="flex items-center space-x-2">
                  <Checkbox
                    id={`intake-${intake}`}
                    checked={filters.intake.includes(intake)}
                    onCheckedChange={(checked) => {
                      const newIntakes = checked
                        ? [...filters.intake, intake]
                        : filters.intake.filter(i => i !== intake);
                      handleFilterChange('intake', newIntakes);
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`intake-${intake}`} className="text-sm cursor-pointer">
                    {intake}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}