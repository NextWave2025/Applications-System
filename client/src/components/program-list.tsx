import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ProgramWithUniversity } from "@shared/schema";
import ProgramCard from "./program-card";

interface ProgramListProps {
  filters: any;
  searchQuery: string | null;
}

export default function ProgramList({ filters, searchQuery }: ProgramListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const programsPerPage = 6;

  // Build query string for filters
  let queryString = '/api/programs?';
  if (filters.studyLevel?.length > 0) {
    filters.studyLevel.forEach((level: string) => {
      queryString += `studyLevel=${encodeURIComponent(level)}&`;
    });
  }
  
  if (filters.studyField?.length > 0) {
    filters.studyField.forEach((field: string) => {
      queryString += `studyField=${encodeURIComponent(field)}&`;
    });
  }
  
  if (filters.universityIds?.length > 0) {
    queryString += `universityIds=${filters.universityIds.join(',')}&`;
  }
  
  if (filters.maxTuition) {
    queryString += `maxTuition=${filters.maxTuition}&`;
  }
  
  if (filters.duration?.length > 0) {
    filters.duration.forEach((duration: string) => {
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

  const { data: programs = [], isLoading } = useQuery<ProgramWithUniversity[]>({
    queryKey: [queryString],
  });

  // Sort programs
  const sortedPrograms = [...programs];
  if (sortBy === "tuition-low") {
    sortedPrograms.sort((a, b) => {
      const aTuition = parseInt(a.tuition.replace(/[^0-9]/g, ''));
      const bTuition = parseInt(b.tuition.replace(/[^0-9]/g, ''));
      return isNaN(aTuition) || isNaN(bTuition) ? 0 : aTuition - bTuition;
    });
  } else if (sortBy === "tuition-high") {
    sortedPrograms.sort((a, b) => {
      const aTuition = parseInt(a.tuition.replace(/[^0-9]/g, ''));
      const bTuition = parseInt(b.tuition.replace(/[^0-9]/g, ''));
      return isNaN(aTuition) || isNaN(bTuition) ? 0 : bTuition - aTuition;
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedPrograms.length / programsPerPage);
  const indexOfLastProgram = currentPage * programsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
  const currentPrograms = sortedPrograms.slice(indexOfFirstProgram, indexOfLastProgram);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="w-full lg:w-3/4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
              <path d="M16.5 9.4 7.55 4.24"></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
              <circle cx="18.5" cy="15.5" r="2.5"></circle>
              <path d="M20.27 17.27 22 19"></path>
            </svg>
            <h2 className="text-2xl font-bold">Programs <span className="text-gray-500">({programs.length})</span></h2>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select 
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="relevance">Relevance</option>
              <option value="tuition-low">Tuition Fee: Low to High</option>
              <option value="tuition-high">Tuition Fee: High to Low</option>
            </select>
          </div>
        </div>
        
        {/* Active filters display */}
        {(filters.studyLevel.length > 0 || 
          filters.studyField.length > 0 || 
          filters.universityIds.length > 0 || 
          filters.duration.length > 0 || 
          filters.hasScholarship || 
          searchQuery) && (
          <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">Active filters:</span>
            </div>
            
            {filters.studyLevel.map((level: string) => (
              <span key={level} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {level}
                <button className="ml-1 h-3 w-3 inline-flex items-center justify-center rounded-full text-primary hover:bg-primary/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            ))}
            
            {filters.studyField.map((field: string) => (
              <span key={field} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {field}
                <button className="ml-1 h-3 w-3 inline-flex items-center justify-center rounded-full text-blue-700 hover:bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            ))}
            
            {filters.hasScholarship && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                Scholarship
                <button className="ml-1 h-3 w-3 inline-flex items-center justify-center rounded-full text-green-700 hover:bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            )}
            
            {searchQuery && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                "{searchQuery}"
                <button className="ml-1 h-3 w-3 inline-flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
        
        {/* Programs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-full rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 bg-white">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="grid grid-cols-2 gap-y-2 mb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="pr-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse mb-1"></div>
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-9 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <h3 className="text-xl font-semibold mb-2">No programs found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your filters or search criteria to find more programs.
            </p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button 
                className={`inline-flex items-center justify-center h-9 w-9 rounded-md border text-sm ${
                  currentPage === 1 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              
              {totalPages <= 5 ? (
                // Show all pages if 5 or less
                [...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`inline-flex items-center justify-center h-9 min-w-[2.25rem] rounded-md border text-sm font-medium ${
                      currentPage === index + 1 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))
              ) : (
                // Show limited pages with ellipsis for larger page counts
                <>
                  {/* First page */}
                  <button
                    className={`inline-flex items-center justify-center h-9 min-w-[2.25rem] rounded-md border text-sm font-medium ${
                      currentPage === 1 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                  
                  {/* Ellipsis or page 2 */}
                  {currentPage > 3 && (
                    <span className="inline-flex items-center justify-center h-9 min-w-[2.25rem] text-sm text-gray-500">
                      ...
                    </span>
                  )}
                  
                  {/* Current page and surrounding pages */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      (pageNumber !== 1 && pageNumber !== totalPages) && // Not first or last
                      (Math.abs(pageNumber - currentPage) <= 1) // Within 1 of current
                    ) {
                      return (
                        <button
                          key={index}
                          className={`inline-flex items-center justify-center h-9 min-w-[2.25rem] rounded-md border text-sm font-medium ${
                            currentPage === pageNumber 
                              ? 'bg-primary text-white border-primary' 
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Ellipsis or second-to-last page */}
                  {currentPage < totalPages - 2 && (
                    <span className="inline-flex items-center justify-center h-9 min-w-[2.25rem] text-sm text-gray-500">
                      ...
                    </span>
                  )}
                  
                  {/* Last page */}
                  <button
                    className={`inline-flex items-center justify-center h-9 min-w-[2.25rem] rounded-md border text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                className={`inline-flex items-center justify-center h-9 w-9 rounded-md border text-sm ${
                  currentPage === totalPages 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
