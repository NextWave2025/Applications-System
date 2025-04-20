import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProgramCard from "@/components/program-card";
import { studyLevels, studyFields, durationOptions, type Program, type University, type ProgramWithUniversity } from "@shared/schema";

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    universityIds: [] as number[],
    studyLevel: [] as string[],
    studyField: [] as string[],
    duration: [] as string[],
    hasScholarship: false,
    maxTuition: 200000,
  });

  // Build query string for filters
  let queryString = '/api/programs?';
  if (filters.studyLevel.length > 0) {
    filters.studyLevel.forEach((level) => {
      queryString += `degree=${encodeURIComponent(level)}&`;
    });
  }
  
  if (filters.studyField.length > 0) {
    filters.studyField.forEach((field) => {
      queryString += `studyField=${encodeURIComponent(field)}&`;
    });
  }
  
  if (filters.universityIds.length > 0) {
    filters.universityIds.forEach((id) => {
      queryString += `university=${id}&`;
    });
  }
  
  if (filters.maxTuition && filters.maxTuition < 200000) {
    queryString += `maxTuition=${filters.maxTuition}&`;
  }
  
  if (filters.duration.length > 0) {
    filters.duration.forEach((duration) => {
      queryString += `duration=${encodeURIComponent(duration)}&`;
    });
  }
  
  if (filters.hasScholarship) {
    queryString += `hasScholarship=true&`;
  }

  if (searchQuery) {
    queryString += `search=${encodeURIComponent(searchQuery)}&`;
  }

  // Remove trailing ampersand
  queryString = queryString.endsWith('&') 
    ? queryString.slice(0, -1) 
    : queryString;

  // Fetch programs based on filters
  const { data: programs = [], isLoading } = useQuery<ProgramWithUniversity[]>({
    queryKey: [queryString],
    onSuccess: (data) => {
      console.log("Programs data:", data);
    }
  });

  // Fetch universities for filter
  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ['/api/universities'],
  });

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
  };

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
        {/* Search bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search programs or universities"
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

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
                  {universities.map((university) => (
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
            ) : programs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {programs.map(program => (
                  <div key={program.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-200 rounded-sm mr-2"></div>
                          <span className="text-sm text-gray-600">
                            {program.university ? program.university.name : `University ${program.universityId}`}
                          </span>
                        </div>
                        {program.hasScholarship && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Scholarship Available
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-4">{program.name}</h3>
                      <div className="grid grid-cols-2 gap-y-2 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm">{program.degree}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{program.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{program.intake}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{program.tuition}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Link 
                          to={`/programs/${program.id}`}
                          className="text-sm font-medium text-gray-700 hover:text-primary"
                        >
                          View Details
                        </Link>
                        <button className="p-2 rounded-full text-gray-400 hover:text-primary focus:outline-none">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No programs found matching your criteria. Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}