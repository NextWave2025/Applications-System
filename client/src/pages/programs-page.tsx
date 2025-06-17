import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import ProgramCard from "@/components/program-card";
import EnhancedSearch from "@/components/enhanced-search";
import PDFExport from "@/components/pdf-export";
import SelectableProgramCard from "@/components/selectable-program-card";
import { studyLevels, studyFields, durationOptions, type Program, type University, type ProgramWithUniversity } from "@shared/schema";

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedPrograms, setDisplayedPrograms] = useState<ProgramWithUniversity[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    universityIds: [] as number[],
    studyLevel: [] as string[],
    studyField: [] as string[],
    duration: [] as string[],
    hasScholarship: false,
    maxTuition: 200000,
  });

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
      filters.studyLevel.length > 0 || 
      filters.studyField.length > 0 || 
      filters.universityIds.length > 0 || 
      (filters.maxTuition < 200000) || 
      filters.duration.length > 0 || 
      filters.hasScholarship || 
      searchQuery.trim() !== "";

    // If no filters are active, just use the allPrograms data
    if (!hasActiveFilters) {
      return null;
    }

    // Otherwise, build filter params
    const params = new URLSearchParams();

    // Add study level filters
    if (filters.studyLevel.length > 0) {
      filters.studyLevel.forEach(level => params.append('degree', level));
    }

    // Add study field filters
    if (filters.studyField.length > 0) {
      filters.studyField.forEach(field => params.append('studyField', field));
    }

    // Add university filters
    if (filters.universityIds.length > 0) {
      filters.universityIds.forEach(id => params.append('university', id.toString()));
    }

    // Add tuition filter
    if (filters.maxTuition && filters.maxTuition < 200000) {
      params.append('maxTuition', filters.maxTuition.toString());
    }

    // Add duration filters
    if (filters.duration.length > 0) {
      filters.duration.forEach(duration => params.append('duration', duration));
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

  // Initialize displayed programs when base programs load
  useEffect(() => {
    if (basePrograms.length > 0 && displayedPrograms.length === 0) {
      setDisplayedPrograms(basePrograms);
    }
  }, [basePrograms, displayedPrograms.length]);

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

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      universityIds: [],
      studyLevel: [],
      studyField: [],
      duration: [],
      hasScholarship: false,
      maxTuition: 200000,
    });
    setSearchQuery("");
    setDisplayedPrograms([]);
    setSelectedProgramIds([]);
  };

  const handleSearchResults = (results: ProgramWithUniversity[]) => {
    setDisplayedPrograms(results);
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

        {/* Filters and program cards */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-1/4">
            <div className="bg-white p-6 border rounded-lg shadow-sm">
              <div className="flex items-center mb-6">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-lg font-medium">Filters</h2>
              </div>

              {/* Universities Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Universities</h3>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                  {Array.isArray(universities) && universities.map((university) => (
                    <div key={university.id} className="flex items-center">
                      <input 
                        id={`univ-${university.id}`} 
                        type="checkbox" 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={filters.universityIds.includes(university.id)}
                        onChange={(e) => {
                          const updatedIds = e.target.checked 
                            ? [...filters.universityIds, university.id]
                            : filters.universityIds.filter(id => id !== university.id);
                          handleFilterChange('universityIds', updatedIds);
                        }}
                      />
                      <label htmlFor={`univ-${university.id}`} className="ml-2 text-sm text-gray-700 truncate">{university.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tuition Fee Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Tuition Fee (AED)</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">0</span>
                  <span className="text-sm text-gray-500">{filters.maxTuition.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200000" 
                  value={filters.maxTuition}
                  onChange={(e) => handleFilterChange('maxTuition', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

              {/* Degree Level Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Degree Level</h3>
                <div className="space-y-2">
                  {studyLevels.map((level) => (
                    <div key={level} className="flex items-center">
                      <input 
                        id={`degree-${level}`} 
                        type="checkbox" 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={filters.studyLevel.includes(level)}
                        onChange={(e) => {
                          const updatedLevels = e.target.checked 
                            ? [...filters.studyLevel, level]
                            : filters.studyLevel.filter(l => l !== level);
                          handleFilterChange('studyLevel', updatedLevels);
                        }}
                      />
                      <label htmlFor={`degree-${level}`} className="ml-2 text-sm text-gray-700">{level}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Field Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Field of Study</h3>
                <div className="space-y-2">
                  {studyFields.map((field) => (
                    <div key={field} className="flex items-center">
                      <input 
                        id={`field-${field}`} 
                        type="checkbox" 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={filters.studyField.includes(field)}
                        onChange={(e) => {
                          const updatedFields = e.target.checked 
                            ? [...filters.studyField, field]
                            : filters.studyField.filter(f => f !== field);
                          handleFilterChange('studyField', updatedFields);
                        }}
                      />
                      <label htmlFor={`field-${field}`} className="ml-2 text-sm text-gray-700">{field}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Duration</h3>
                <div className="space-y-2">
                  {durationOptions.map((duration) => (
                    <div key={duration} className="flex items-center">
                      <input 
                        id={`duration-${duration}`} 
                        type="checkbox" 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={filters.duration.includes(duration)}
                        onChange={(e) => {
                          const updatedDurations = e.target.checked 
                            ? [...filters.duration, duration]
                            : filters.duration.filter(d => d !== duration);
                          handleFilterChange('duration', updatedDurations);
                        }}
                      />
                      <label htmlFor={`duration-${duration}`} className="ml-2 text-sm text-gray-700">{duration}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scholarships Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Scholarships</h3>
                <div className="relative">
                  <select 
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md appearance-none"
                    value={filters.hasScholarship ? "available" : "all"}
                    onChange={(e) => handleFilterChange('hasScholarship', e.target.value === 'available')}
                  >
                    <option value="all">All options</option>
                    <option value="available">Available</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="space-y-3">
                <button 
                  className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                  onClick={() => {
                    // Filters are already applied reactively
                  }}
                >
                  Apply Filters
                </button>
                <button 
                  className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
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
            ) : programs.length > 0 ? (
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
                      onSelectionChange={handleProgramSelection}
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