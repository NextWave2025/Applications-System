import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import ProgramCard from "@/components/program-card";
import EnhancedSearch from "@/components/enhanced-search";
import PDFExport from "@/components/pdf-export";
import SelectableProgramCard from "@/components/selectable-program-card";
import ProgramCardNew from "@/components/program-card-new";
import OptimizedFilterPanel from "@/components/optimized-filter-panel";
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
  const [displayedPrograms, setDisplayedPrograms] = useState<ProgramWithUniversity[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
  const [isFilterSearching, setIsFilterSearching] = useState(false);
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

  // Get all programs first without any filtering
  const { data: allPrograms = [], isLoading: isLoadingAllPrograms, isError: isErrorAllPrograms } = useQuery<ProgramWithUniversity[]>({
    queryKey: ['/api/programs']
  });

  console.log("All programs:", allPrograms);
  console.log("Programs loading state:", { isLoadingAllPrograms, isErrorAllPrograms });

  // Use the query client to manually fetch programs if needed
  const queryClient = useQueryClient();

  useEffect(() => {
    // Force fetch programs on component mount for reliability
    if (!isLoadingAllPrograms) {
      console.log("Manually fetching programs...");
      fetch('/api/programs')
        .then(res => res.json())
        .then(data => {
          console.log("Manually fetched programs:", data.length, "programs");
          queryClient.setQueryData(['/api/programs'], data);
        })
        .catch(err => {
          console.error("Error manually fetching programs:", err);
        });
    }
  }, [isLoadingAllPrograms, queryClient]);

  // Build filter query string using useMemo so it only recalculates when dependencies change
  const filterQuery = useMemo(() => {
    // Check if any filters are active
    const hasActiveFilters = 
      filters.degreeLevel.length > 0 || 
      filters.studyField.length > 0 || 
      filters.universityIds.length > 0 || 
      filters.location.length > 0 ||
      filters.intake.length > 0 ||
      (filters.tuitionMin > 0 || filters.tuitionMax < 80000) || 
      filters.hasScholarship || 
      searchQuery.trim() !== "";

    // If no filters are active, just use the allPrograms data
    if (!hasActiveFilters) {
      return null;
    }

    // Otherwise, build filter params
    const params = new URLSearchParams();

    // Add degree level filters
    if (filters.degreeLevel.length > 0) {
      filters.degreeLevel.forEach(level => params.append('degree', level));
    }

    // Add study field filters
    if (filters.studyField.length > 0) {
      filters.studyField.forEach(field => params.append('studyField', field));
    }

    // Add university filters
    if (filters.universityIds.length > 0) {
      filters.universityIds.forEach(id => params.append('university', id.toString()));
    }

    // Add location filters
    if (filters.location.length > 0) {
      filters.location.forEach(location => params.append('location', location));
    }

    // Add intake filters
    if (filters.intake.length > 0) {
      filters.intake.forEach(intake => params.append('intake', intake));
    }

    // Add tuition range filters
    if (filters.tuitionMin > 0) {
      params.append('minTuition', filters.tuitionMin.toString());
    }
    if (filters.tuitionMax < 80000) {
      params.append('maxTuition', filters.tuitionMax.toString());
    }

    // Add scholarship filter
    if (filters.hasScholarship) {
      params.append('hasScholarship', 'true');
    }

    // Add search query
    if (searchQuery) {
      params.append('search', searchQuery);
    }

    const queryStr = params.toString();
    return queryStr ? `/api/programs?${queryStr}` : '/api/programs';
  }, [filters, searchQuery]);

  // Fetch programs based on the memoized filter query
  // Fetch filtered programs only if there are filters active
  const { data: filteredPrograms = [], isLoading: isLoadingFiltered } = useQuery<ProgramWithUniversity[]>({
    queryKey: [filterQuery],
    // Skip this query if there are no active filters (filterQuery is null)
    enabled: filterQuery !== null
  });

  // Manually fetch filtered programs when the filter changes
  useEffect(() => {
    if (filterQuery !== null) {
      console.log("Manually fetching filtered programs with query:", filterQuery);
      fetch(filterQuery)
        .then(res => res.json())
        .then(data => {
          console.log("Manually fetched filtered programs:", data.length, "programs");
          queryClient.setQueryData([filterQuery], data);
        })
        .catch(err => {
          console.error("Error manually fetching filtered programs:", err);
        });
    }
  }, [filterQuery, queryClient]);

  // Determine which programs to display: filtered programs if filters are active, otherwise all programs
  const isLoading = filterQuery === null ? isLoadingAllPrograms : isLoadingFiltered;
  const basePrograms = filterQuery === null ? allPrograms : filteredPrograms;

  // Use displayed programs for search results, fallback to base programs
  const programs = displayedPrograms.length > 0 ? displayedPrograms : basePrograms;

  // Fetch universities for filters
  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ["/api/universities"],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Also fetch universities manually for reliability
  useEffect(() => {
    if (universities.length === 0) {
      console.log("Manually fetching universities...");
      fetch('/api/universities')
        .then(res => res.json())
        .then(data => {
          console.log("Manually fetched universities:", data.length, "universities");
          queryClient.setQueryData(['/api/universities'], data);
        })
        .catch(err => {
          console.error("Error manually fetching universities:", err);
        });
    }
  }, [universities.length, queryClient]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setDisplayedPrograms([]);
    setSelectedProgramIds([]);
    setIsFilterSearching(true);
    
    // Simulate search delay for animation
    setTimeout(() => {
      setIsFilterSearching(false);
    }, 1200);
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
    setDisplayedPrograms([]);
    setSelectedProgramIds([]);
  };

  const handleResultsCountChange = (count: number) => {
    setResultsCount(count);
  };

  const handleSearchResults = (results: ProgramWithUniversity[]) => {
    setDisplayedPrograms(results);
    // Clear selections when search results change
    setSelectedProgramIds([]);
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

  const selectedPrograms = programs.filter(program => selectedProgramIds.includes(program.id));

  return (
    <div>
      {/* Header */}
      <div className="border-b pb-4 sm:pb-6">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">Explore Programs</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Discover academic programs offered by top universities in the UAE</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Search bar */}
        <div className="max-w-full sm:max-w-xl mx-auto mb-6 sm:mb-8">
          <EnhancedSearch 
            programs={basePrograms}
            onSearchResults={handleSearchResults}
          />
        </div>

        {/* PDF Export Bar - Only show when programs are selected */}
        {selectedPrograms.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <PDFExport 
              selectedPrograms={selectedPrograms}
              onSelectionChange={handleSelectionChange}
            />
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
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <OptimizedFilterPanel 
                onFiltersChange={handleFilterChange}
                onResultsCountChange={handleResultsCountChange}
                isSearching={isFilterSearching}
                searchResultsCount={programs.length}
                className="w-full"
              />
            </div>
          </aside>

          {/* Main content - program cards */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-64 sm:h-80 rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : isErrorAllPrograms ? (
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
                  {filterQuery !== null && (
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