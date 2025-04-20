import { useState } from "react";
import ProgramFilters from "../components/program-filters";
import ProgramCard from "../components/program-card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

export default function ProgramsPage() {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['/api/programs'],
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['/api/universities'],
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to programs
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section with search and breadcrumb */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li>
                    <Link to="/" className="hover:text-primary">Home</Link>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-900 font-medium">Programs</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">Find Your Perfect Program</h1>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search programs..."
                  className="form-input pr-10 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Total Programs</p>
              <p className="text-2xl font-semibold">{programs.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Universities</p>
              <p className="text-2xl font-semibold">{universities.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Degree Levels</p>
              <p className="text-2xl font-semibold">6</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Scholarships</p>
              <p className="text-2xl font-semibold">
                {(programs as any[]).filter((program: any) => program.scholarship).length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Main content with filters and program list */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-1/4">
            <ProgramFilters onFiltersChange={handleFiltersChange} />
          </aside>
          
          {/* Main content - program cards */}
          <main className="lg:w-3/4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-80 rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : programs.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{programs.length}</span> results
                  </p>
                  <div className="flex items-center">
                    <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
                    <select 
                      id="sort" 
                      className="form-select text-sm py-1 w-40"
                      defaultValue="popularity"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="tuition-low">Tuition (Low to High)</option>
                      <option value="tuition-high">Tuition (High to Low)</option>
                    </select>
                  </div>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(programs as any[]).map((program: any) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <nav className="inline-flex rounded-md shadow">
                    <a
                      href="#"
                      className="py-2 px-4 text-sm font-medium text-gray-500 bg-white rounded-l-md border border-gray-300 hover:bg-gray-50"
                    >
                      Previous
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 text-sm font-medium text-primary bg-blue-50 border-t border-b border-gray-300"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
                    >
                      2
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
                    >
                      3
                    </a>
                    <a
                      href="#"
                      className="py-2 px-4 text-sm font-medium text-gray-500 bg-white rounded-r-md border border-gray-300 hover:bg-gray-50"
                    >
                      Next
                    </a>
                  </nav>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md text-center py-12 px-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No programs found</h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your filters or search parameters to find programs.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setFilters({});
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}