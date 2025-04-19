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
    <div className="lg:w-3/4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Programs ({programs.length})</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="relevance">Relevance</option>
              <option value="tuition-low">Tuition Fee: Low to High</option>
              <option value="tuition-high">Tuition Fee: High to Low</option>
            </select>
          </div>
        </div>
        
        {/* Programs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="flex flex-wrap gap-y-2 mb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1/2 pr-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse mb-1"></div>
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
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
          <div className="text-center py-8">
            <i className="fas fa-search text-4xl text-gray-300 mb-3"></i>
            <h3 className="text-xl font-semibold mb-2">No programs found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or search criteria to find more programs.
            </p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button 
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left mr-2"></i>
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === index + 1 ? 'text-white bg-primary border border-primary' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
