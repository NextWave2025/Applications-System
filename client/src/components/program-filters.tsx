import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface ProgramFiltersProps {
  className?: string;
  onFiltersChange?: (filters: any) => void;
}

export default function ProgramFilters({
  className,
  onFiltersChange
}: ProgramFiltersProps) {
  const [filters, setFilters] = useState({
    university: "",
    degreeLevel: "",
    duration: "",
    tuitionRange: "",
    scholarship: false,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['/api/universities'],
  });

  const handleFilterChange = (filterName: string, value: string | boolean) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const resetFilters = () => {
    const resetValues = {
      university: "",
      degreeLevel: "",
      duration: "",
      tuitionRange: "",
      scholarship: false,
    };
    setFilters(resetValues);
    
    if (onFiltersChange) {
      onFiltersChange(resetValues);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 sticky top-6 ${className || ""}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm text-primary hover:text-primary/80"
        >
          Reset All
        </button>
      </div>
      
      <div className="space-y-6">
        {/* University Filter */}
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
            University
          </label>
          <select
            id="university"
            name="university"
            className="form-select"
            value={filters.university}
            onChange={(e) => handleFilterChange("university", e.target.value)}
          >
            <option value="">All Universities</option>
            {(universities as any[]).map((university: any) => (
              <option key={university.id} value={university.id}>
                {university.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Degree Level Filter */}
        <div>
          <label htmlFor="degreeLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Degree Level
          </label>
          <select
            id="degreeLevel"
            name="degreeLevel"
            className="form-select"
            value={filters.degreeLevel}
            onChange={(e) => handleFilterChange("degreeLevel", e.target.value)}
          >
            <option value="">Any Level</option>
            <option value="Bachelor">Bachelor's</option>
            <option value="Master">Master's</option>
            <option value="Doctorate">Doctorate</option>
            <option value="Diploma">Diploma</option>
          </select>
        </div>
        
        {/* Duration Filter */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            id="duration"
            name="duration"
            className="form-select"
            value={filters.duration}
            onChange={(e) => handleFilterChange("duration", e.target.value)}
          >
            <option value="">Any Duration</option>
            <option value="1-year">1 Year</option>
            <option value="2-years">2 Years</option>
            <option value="3-years">3 Years</option>
            <option value="4-years">4 Years</option>
            <option value="5-years">5+ Years</option>
          </select>
        </div>
        
        {/* Tuition Range Filter */}
        <div>
          <label htmlFor="tuitionRange" className="block text-sm font-medium text-gray-700 mb-2">
            Tuition Range
          </label>
          <select
            id="tuitionRange"
            name="tuitionRange"
            className="form-select"
            value={filters.tuitionRange}
            onChange={(e) => handleFilterChange("tuitionRange", e.target.value)}
          >
            <option value="">Any Range</option>
            <option value="0-25000">Under AED 25,000</option>
            <option value="25000-50000">AED 25,000 - 50,000</option>
            <option value="50000-75000">AED 50,000 - 75,000</option>
            <option value="75000-100000">AED 75,000 - 100,000</option>
            <option value="100000+">AED 100,000+</option>
          </select>
        </div>
        
        {/* Scholarship Filter */}
        <div className="flex items-center">
          <input
            id="scholarship"
            name="scholarship"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={filters.scholarship}
            onChange={(e) => handleFilterChange("scholarship", e.target.checked)}
          />
          <label htmlFor="scholarship" className="ml-2 block text-sm text-gray-700">
            Scholarship Available
          </label>
        </div>
      </div>
    </div>
  );
}