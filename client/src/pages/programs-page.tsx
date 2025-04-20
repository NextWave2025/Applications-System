import { useState } from "react";
import ProgramFilters from "../components/program-filters";
import ProgramCard from "../components/program-card";
import { useQuery } from "@tanstack/react-query";

export default function ProgramsPage() {
  const [filters, setFilters] = useState({});
  
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['/api/programs'],
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to programs
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Programs</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ProgramFilters onFiltersChange={handleFiltersChange} />
          </aside>
          
          <main className="lg:w-3/4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-80 rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : programs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programs.map((program: any) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No programs found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your filters or check back later for more programs.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}