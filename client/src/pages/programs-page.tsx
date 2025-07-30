import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import ProgramCard from "@/components/program-card";
import EnhancedSearch from "@/components/enhanced-search";
import PDFExport from "@/components/pdf-export";
import SelectableProgramCard from "@/components/selectable-program-card";
import ProgramCardNew from "@/components/program-card-new";
import OptimizedFilterPanel from "@/components/optimized-filter-panel";
import BulkCurrencyConverter from "@/components/bulk-currency-converter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { studyLevels, studyFields, durationOptions, type Program, type University, type ProgramWithUniversity } from "@shared/schema";

// Define the filter state interface
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

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
  const [currencyConversions, setCurrencyConversions] = useState<Record<number, Array<{currency: string, amount: number, rate: number}>>>({});
  const [filters, setFilters] = useState<FilterState>({
    universityIds: [],
    tuitionMin: 0,
    tuitionMax: 80000,
    degreeLevel: [],
    location: [],
    studyField: [],
    intake: [],
    hasScholarship: false,
  });
  
  const [resultsCount, setResultsCount] = useState(0);
  const queryClient = useQueryClient();

  // Aggressive caching for instant perceived loading
  const { data: allPrograms = [], isLoading: isLoadingPrograms, isFetching } = useQuery<ProgramWithUniversity[]>({
    queryKey: ['/api/programs'],
    staleTime: Infinity, // Never consider stale for immediate loading
    gcTime: Infinity, // Never garbage collect for session
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    networkMode: 'online', // Only fetch when online
  });

  // Prefetch data aggressively on component mount
  useEffect(() => {
    // Pre-warm the cache immediately
    if (!allPrograms.length && !isLoadingPrograms) {
      queryClient.prefetchQuery({
        queryKey: ['/api/programs'],
        staleTime: Infinity,
      });
    }
    
    // Also prefetch universities
    queryClient.prefetchQuery({
      queryKey: ['/api/universities'],
      staleTime: Infinity,
    });
  }, [queryClient, allPrograms.length, isLoadingPrograms]);

  // Client-side filtering for instant results
  const filteredPrograms = useMemo(() => {
    let filtered = [...allPrograms];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(program => 
        program.name.toLowerCase().includes(query) ||
        program.university?.name.toLowerCase().includes(query) ||
        program.studyField?.toLowerCase().includes(query) ||
        program.degree?.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (filters.degreeLevel.length > 0) {
      filtered = filtered.filter(program => 
        program.degree && filters.degreeLevel.includes(program.degree)
      );
    }

    if (filters.studyField.length > 0) {
      filtered = filtered.filter(program => 
        program.studyField && filters.studyField.includes(program.studyField)
      );
    }

    if (filters.universityIds.length > 0) {
      filtered = filtered.filter(program => 
        program.universityId && filters.universityIds.includes(program.universityId)
      );
    }

    if (filters.location.length > 0) {
      filtered = filtered.filter(program => 
        program.university?.city && filters.location.includes(program.university.city)
      );
    }

    if (filters.intake.length > 0) {
      filtered = filtered.filter(program => {
        if (!program.intake) return false;
        const intakes = program.intake.split(',').map((i: string) => i.trim());
        return filters.intake.some(filterIntake => 
          intakes.some((programIntake: string) => programIntake.includes(filterIntake))
        );
      });
    }

    // Apply tuition filters
    if (filters.tuitionMin > 0 || filters.tuitionMax < 80000) {
      filtered = filtered.filter(program => {
        const tuition = parseInt(program.tuition) || 0;
        return tuition >= filters.tuitionMin && tuition <= filters.tuitionMax;
      });
    }

    // Apply scholarship filter
    if (filters.hasScholarship) {
      filtered = filtered.filter(program => program.hasScholarship);
    }

    return filtered;
  }, [allPrograms, searchQuery, filters]);

  // Use filtered programs directly for instant results
  const programs = filteredPrograms;

  // Instant universities loading
  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ["/api/universities"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Update results count immediately
    setResultsCount(filteredPrograms.length);
  };

  const resetFilters = () => {
    setFilters({
      universityIds: [],
      tuitionMin: 0,
      tuitionMax: 80000,
      degreeLevel: [],
      location: [],
      studyField: [],
      intake: [],
      hasScholarship: false,
    });
    setSearchQuery("");
    setSelectedProgramIds([]);
  };

  const handleSearchResults = (results: ProgramWithUniversity[]) => {
    // Search is now handled by the filtered programs - no need for separate state
    setSearchQuery(searchQuery);
  };

  const handleProgramSelection = (programId: number, selected: boolean) => {
    setSelectedProgramIds(prev => 
      selected 
        ? [...prev, programId]
        : prev.filter(id => id !== programId)
    );
  };

  const handleSelectionChange = (programIds: number[]) => {
    setSelectedProgramIds(programIds);
  };

  const handleBulkConversionComplete = (results: Array<{programId: number, originalAmount: number, convertedAmount: number, currency: string, rate: number}>) => {
    try {
      const newConversions = { ...currencyConversions };
      
      results.forEach(result => {
        try {
          if (!newConversions[result.programId]) {
            newConversions[result.programId] = [];
          }
          
          // Remove existing conversion for this currency if any
          newConversions[result.programId] = newConversions[result.programId].filter(
            conversion => conversion.currency !== result.currency
          );
          
          // Add new conversion
          newConversions[result.programId].push({
            currency: result.currency,
            amount: result.convertedAmount,
            rate: result.rate
          });
        } catch (resultError) {
          console.error(`Error processing conversion result for program ${result.programId}:`, resultError);
        }
      });
      
      setCurrencyConversions(newConversions);
    } catch (error) {
      console.error('Error handling bulk conversion completion:', error);
    }
  };

  const selectedPrograms = programs.filter(program => selectedProgramIds.includes(program.id));

  return (
    <div>
      {/* Header */}
      <div className="border-b pb-4 sm:pb-6">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">Explore Programs</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Discover academic programs offered by top universities in the UAE</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Search bar */}
        <div className="max-w-full sm:max-w-xl mx-auto mb-6 sm:mb-8">
          <EnhancedSearch 
            programs={allPrograms}
            onSearchResults={handleSearchResults}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>

        {/* PDF Export and Bulk Currency Converter - Only show when programs are selected */}
        {selectedPrograms.length > 0 && (
          <div className="mb-4 sm:mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <PDFExport 
                selectedPrograms={selectedPrograms}
                onSelectionChange={handleSelectionChange}
                currencyConversions={currencyConversions}
                className="flex-1"
              />
              <BulkCurrencyConverter
                selectedPrograms={selectedPrograms}
                fromCurrency="AED"
                onConversionComplete={handleBulkConversionComplete}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Results Count and Active Filters */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            {programs.length} program{programs.length !== 1 ? 's' : ''} found
            {selectedProgramIds.length > 0 && ` · ${selectedProgramIds.length} selected`}
          </div>
          
          {/* Show active filter count */}
          {(filters.universityIds.length > 0 || 
            filters.degreeLevel.length > 0 || 
            filters.location.length > 0 || 
            filters.studyField.length > 0 || 
            filters.intake.length > 0 || 
            filters.hasScholarship ||
            filters.tuitionMin > 0 || 
            filters.tuitionMax < 80000) && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-500">Active filters:</span>
              <Badge variant="secondary" className="text-xs">
                {filters.universityIds.length + 
                 filters.degreeLevel.length + 
                 filters.location.length + 
                 filters.studyField.length + 
                 filters.intake.length + 
                 (filters.hasScholarship ? 1 : 0) +
                 ((filters.tuitionMin > 0 || filters.tuitionMax < 80000) ? 1 : 0)} applied
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs sm:text-sm">
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Filters and program cards */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
          {/* Optimized Sidebar filters - Narrower for better card display */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-4">
              {/* Filter Panel */}
              <OptimizedFilterPanel 
                onFiltersChange={handleFilterChange}
                onResultsCountChange={() => {}}
                isSearching={false}
                searchResultsCount={programs.length}
                className="w-full"
              />
            </div>
          </aside>

          {/* Main content - program cards */}
          <main className="flex-1 min-w-0">
            {(isLoadingPrograms && !allPrograms.length) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.2s_ease-in-out_infinite] h-64 sm:h-80"
                    style={{
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            ) : false ? (
              <div className="text-center py-12 sm:py-16">
                <div className="max-w-md mx-auto px-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error Loading Programs</h3>
                  <p className="text-sm sm:text-base text-gray-600">Unable to load programs. Please try again later.</p>
                </div>
              </div>
            ) : programs && programs.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Selection controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs sm:text-sm font-medium text-gray-700">
                    <span className="text-base sm:text-lg font-bold text-gray-900">{programs.length}</span> program{programs.length !== 1 ? 's' : ''} found
                    {selectedProgramIds.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                        {selectedProgramIds.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProgramIds(programs.map(p => p.id))}
                      className="text-xs font-medium flex-1 sm:flex-none"
                    >
                      Select All
                    </Button>
                    {selectedProgramIds.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProgramIds([])}
                        className="text-xs font-medium text-gray-600 hover:text-gray-800 flex-1 sm:flex-none"
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>
                </div>

                {/* Program cards with enhanced responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {programs.map(program => (
                    <ProgramCardNew 
                      key={program.id}
                      program={program}
                      isSelected={selectedProgramIds.includes(program.id)}
                      onSelectionChange={(programId, selected) => handleProgramSelection(programId, selected)}
                      showSelection={true}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="max-w-md mx-auto px-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Programs Found</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">No programs match your current criteria. Try adjusting your filters.</p>
                  {(filters.universityIds.length > 0 || 
                    filters.degreeLevel.length > 0 || 
                    filters.location.length > 0 || 
                    filters.studyField.length > 0 || 
                    filters.intake.length > 0 || 
                    filters.hasScholarship ||
                    filters.tuitionMin > 0 || 
                    filters.tuitionMax < 80000 ||
                    searchQuery.trim() !== "") && (
                    <Button 
                      onClick={resetFilters}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium w-full sm:w-auto"
                    >
                      Reset All Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}