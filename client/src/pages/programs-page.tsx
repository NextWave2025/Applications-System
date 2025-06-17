import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import ProgramCard from "@/components/program-card";
import EnhancedSearch from "@/components/enhanced-search";
import PDFExport from "@/components/pdf-export";
import SelectableProgramCard from "@/components/selectable-program-card";
import EnhancedProgramFilters from "@/components/enhanced-program-filters";
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
      <div className="border-b pb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-semibold text-gray-900">Explore Programs</h1>
          <p className="text-gray-600 mt-2">Discover academic programs offered by top universities in the UAE</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search bar */}
        <div className="max-w-xl mx-auto mb-8">
          <EnhancedSearch 
            programs={basePrograms}
            onSearchResults={handleSearchResults}
          />
        </div>

        {/* PDF Export Bar - Only show when programs are selected */}
        {selectedPrograms.length > 0 && (
          <div className="mb-6">
            <PDFExport 
              selectedPrograms={selectedPrograms}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        )}

        {/* Results Count and Active Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
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
              <span className="text-sm text-gray-500">Active filters:</span>
              <Badge variant="secondary">
                {filters.universityIds.length + 
                 filters.degreeLevel.length + 
                 filters.location.length + 
                 filters.studyField.length + 
                 filters.intake.length + 
                 (filters.hasScholarship ? 1 : 0) +
                 ((filters.tuitionMin > 0 || filters.tuitionMax < 80000) ? 1 : 0)} applied
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Filters and program cards */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar filters */}
          <aside className="lg:w-1/4">
            <EnhancedProgramFilters 
              onFiltersChange={handleFilterChange}
              onResultsCountChange={handleResultsCountChange}
              className="sticky top-6"
            />
          </aside>

          {/* Main content - program cards */}
          <main className="lg:w-3/4">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-64 rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : isErrorAllPrograms ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Error loading programs. Please try again later.</p>
              </div>
            ) : programs && programs.length > 0 ? (
              <div className="space-y-4">
                {/* Selection controls */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="text-sm text-gray-600">
                    {programs.length} program{programs.length !== 1 ? 's' : ''} found
                    {selectedProgramIds.length > 0 && ` · ${selectedProgramIds.length} selected`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedProgramIds(programs.map(p => p.id))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    {selectedProgramIds.length > 0 && (
                      <button
                        onClick={() => setSelectedProgramIds([])}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </div>

                {/* Program cards with selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {programs.map(program => (
                    <SelectableProgramCard 
                      key={program.id} 
                      program={program}
                      isSelected={selectedProgramIds.includes(program.id)}
                      onSelectionChange={(programId, selected) => handleProgramSelection(programId, selected)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No programs found matching your criteria. Try adjusting your filters.</p>
                {filterQuery !== null && (
                  <button 
                    onClick={resetFilters}
                    className="mt-4 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}