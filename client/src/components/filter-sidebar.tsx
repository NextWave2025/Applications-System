import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { University } from "@shared/schema";
import { studyLevels, studyFields, durationOptions } from "@shared/schema";

interface FilterSidebarProps {
  filters: {
    studyLevel: string[];
    studyField: string[];
    universityIds: number[];
    maxTuition: number | null;
    duration: string[];
    hasScholarship: boolean | null;
  };
  onFilterChange: (filters: any) => void;
}

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const [expanded, setExpanded] = useState({
    studyLevel: true,
    studyField: true,
    universities: true,
    duration: true,
    scholarship: true,
  });

  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ['/api/universities'],
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCheckboxChange = (
    filterType: 'studyLevel' | 'studyField' | 'duration',
    value: string
  ) => {
    const currentValues = [...filters[filterType]];
    const index = currentValues.indexOf(value);
    
    if (index === -1) {
      currentValues.push(value);
    } else {
      currentValues.splice(index, 1);
    }
    
    onFilterChange({ ...filters, [filterType]: currentValues });
  };

  const handleUniversityChange = (universityId: number) => {
    const currentValues = [...filters.universityIds];
    const index = currentValues.indexOf(universityId);
    
    if (index === -1) {
      currentValues.push(universityId);
    } else {
      currentValues.splice(index, 1);
    }
    
    onFilterChange({ ...filters, universityIds: currentValues });
  };

  const handleTuitionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onFilterChange({ ...filters, maxTuition: value });
  };

  const handleScholarshipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, hasScholarship: e.target.checked ? true : null });
  };

  const handleResetFilters = () => {
    onFilterChange({
      studyLevel: [],
      studyField: [],
      universityIds: [],
      maxTuition: 100000,
      duration: [],
      hasScholarship: null,
    });
  };

  return (
    <div className="lg:w-1/4 mb-6 lg:mb-0 lg:pr-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        
        {/* Study Level Filter */}
        <div className="mb-6">
          <h3 
            className="font-medium mb-3 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('studyLevel')}
          >
            Study Level
            <i className={`fas fa-chevron-${expanded.studyLevel ? 'down' : 'up'} text-sm text-gray-500`}></i>
          </h3>
          {expanded.studyLevel && (
            <div className="space-y-2">
              {studyLevels.map((level) => (
                <div className="flex items-center" key={level}>
                  <input
                    type="checkbox"
                    id={level.toLowerCase().replace(/['s ]/g, '-')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    checked={filters.studyLevel.includes(level)}
                    onChange={() => handleCheckboxChange('studyLevel', level)}
                  />
                  <label
                    htmlFor={level.toLowerCase().replace(/['s ]/g, '-')}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {level}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Study Fields Filter */}
        <div className="mb-6">
          <h3 
            className="font-medium mb-3 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('studyField')}
          >
            Study Fields
            <i className={`fas fa-chevron-${expanded.studyField ? 'down' : 'up'} text-sm text-gray-500`}></i>
          </h3>
          {expanded.studyField && (
            <div className="space-y-2">
              {studyFields.map((field) => (
                <div className="flex items-center" key={field}>
                  <input
                    type="checkbox"
                    id={field.toLowerCase().replace(/[& ]/g, '-')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    checked={filters.studyField.includes(field)}
                    onChange={() => handleCheckboxChange('studyField', field)}
                  />
                  <label
                    htmlFor={field.toLowerCase().replace(/[& ]/g, '-')}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {field}
                  </label>
                </div>
              ))}
            </div>
          )}
          <button className="text-primary text-sm mt-2">+ Show more</button>
        </div>
        
        {/* Universities Filter */}
        <div className="mb-6">
          <h3 
            className="font-medium mb-3 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('universities')}
          >
            Universities
            <i className={`fas fa-chevron-${expanded.universities ? 'down' : 'up'} text-sm text-gray-500`}></i>
          </h3>
          {expanded.universities && (
            <div className="space-y-2">
              {universities.slice(0, 4).map((university) => (
                <div className="flex items-center" key={university.id}>
                  <input
                    type="checkbox"
                    id={`university-${university.id}`}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    checked={filters.universityIds.includes(university.id)}
                    onChange={() => handleUniversityChange(university.id)}
                  />
                  <label
                    htmlFor={`university-${university.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {university.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          {universities.length > 4 && (
            <button className="text-primary text-sm mt-2">+ Show more</button>
          )}
        </div>
        
        {/* Tuition Fee Filter */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Tuition Fee (AED/year)</h3>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={filters.maxTuition || 100000}
              onChange={handleTuitionChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{filters.maxTuition?.toLocaleString() || '50,000'}</span>
              <span>100,000+</span>
            </div>
          </div>
        </div>
        
        {/* Duration Filter */}
        <div className="mb-6">
          <h3 
            className="font-medium mb-3 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('duration')}
          >
            Duration
            <i className={`fas fa-chevron-${expanded.duration ? 'down' : 'up'} text-sm text-gray-500`}></i>
          </h3>
          {expanded.duration && (
            <div className="space-y-2">
              {durationOptions.map((option) => (
                <div className="flex items-center" key={option}>
                  <input
                    type="checkbox"
                    id={option.replace(/ /g, '-')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    checked={filters.duration.includes(option)}
                    onChange={() => handleCheckboxChange('duration', option)}
                  />
                  <label
                    htmlFor={option.replace(/ /g, '-')}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Scholarship Filter */}
        <div className="mb-6">
          <h3 
            className="font-medium mb-3 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('scholarship')}
          >
            Scholarship
            <i className={`fas fa-chevron-${expanded.scholarship ? 'down' : 'up'} text-sm text-gray-500`}></i>
          </h3>
          {expanded.scholarship && (
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="scholarship"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={filters.hasScholarship === true}
                  onChange={handleScholarshipChange}
                />
                <label
                  htmlFor="scholarship"
                  className="ml-2 text-sm text-gray-700"
                >
                  Scholarship Available
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition flex-grow"
            onClick={() => onFilterChange(filters)}
          >
            Apply Filters
          </button>
          <button 
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
