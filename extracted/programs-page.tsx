import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersIcon } from "lucide-react";
import ProgramCard from "@/polymet/components/program-card";
import ProgramFilters from "@/polymet/components/program-filters";
import SearchBar from "@/polymet/components/search-bar";
import { PROGRAMS_DATA } from "@/polymet/data/programs-data";
import { UNIVERSITIES_DATA } from "@/polymet/data/universities-data";

export default function ProgramsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPrograms, setFilteredPrograms] = useState(PROGRAMS_DATA);

  // Add university names to programs
  const programsWithUniversityNames = filteredPrograms.map((program) => {
    const university = UNIVERSITIES_DATA.find(
      (u) => u.id === program.university
    );
    return {
      ...program,
      universityName: university?.name || "",
      universityLogo: university?.logo || "",
    };
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Simple search implementation
    const filtered = PROGRAMS_DATA.filter(
      (program) =>
        program.name.toLowerCase().includes(term.toLowerCase()) ||
        UNIVERSITIES_DATA.find((u) => u.id === program.university)
          ?.name.toLowerCase()
          .includes(term.toLowerCase())
    );
    setFilteredPrograms(filtered);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Explore Programs</h1>
          <p className="text-muted-foreground">
            Discover academic programs offered by top universities in the UAE
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-full max-w-md">
            <SearchBar
              placeholder="Search programs or universities"
              onSearch={handleSearch}
            />
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersIcon className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <ProgramFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:block w-full md:w-64 flex-shrink-0">
            <ProgramFilters />
          </div>
          <div className="flex-1">
            {programsWithUniversityNames.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {programsWithUniversityNames.map((program, index) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No programs found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
