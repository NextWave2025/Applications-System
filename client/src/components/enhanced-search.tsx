import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { type ProgramWithUniversity } from "@shared/schema";

interface EnhancedSearchProps {
  programs: ProgramWithUniversity[];
  onSearchResults: (results: ProgramWithUniversity[]) => void;
  className?: string;
}

export default function EnhancedSearch({ programs, onSearchResults, className }: EnhancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: "name", weight: 0.7 },
        { name: "university.name", weight: 0.5 },
        { name: "degree", weight: 0.3 },
        { name: "studyField", weight: 0.3 },
        { name: "requirements", weight: 0.1 }
      ],
      threshold: 0.4, // Lower = more strict, Higher = more fuzzy
      distance: 100,
      minMatchCharLength: 2,
      ignoreLocation: true,
      includeScore: true,
      includeMatches: true
    };
    
    return new Fuse(programs, options);
  }, [programs]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      onSearchResults(programs);
      return;
    }

    // Use fuzzy search
    const results = fuse.search(query);
    const searchResults = results.map(result => result.item);
    
    // Enhanced matching for specific terms
    const enhancedResults = enhanceSearchResults(query, searchResults, programs);
    
    onSearchResults(enhancedResults);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Search programs (e.g., 'AI program', 'MBA finance', 'computer science')"
        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-20 overflow-hidden">
          <div className="p-2 text-sm text-gray-600">
            Searching for: <span className="font-semibold">"{searchQuery}"</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced search results with semantic matching
function enhanceSearchResults(query: string, fuzzyResults: ProgramWithUniversity[], allPrograms: ProgramWithUniversity[]): ProgramWithUniversity[] {
  const queryLower = query.toLowerCase();
  
  // Define semantic mappings for common search terms
  const semanticMappings: Record<string, string[]> = {
    "ai": ["artificial intelligence", "machine learning", "data science", "ai", "ml"],
    "artificial intelligence": ["ai", "machine learning", "data science", "artificial intelligence"],
    "mba": ["master of business administration", "mba", "business administration"],
    "finance": ["financial", "economics", "accounting", "banking"],
    "computer": ["computing", "it", "information technology", "software", "programming"],
    "engineering": ["engineer", "technical", "technology"],
    "business": ["management", "administration", "commerce", "entrepreneurship"],
    "medicine": ["medical", "health", "healthcare", "clinical"],
    "law": ["legal", "jurisprudence", "attorney"],
    "psychology": ["psychological", "behavioral", "mental health"],
    "marketing": ["advertising", "digital marketing", "brand management"],
    "design": ["graphic design", "creative", "visual", "arts"]
  };

  // Get semantic matches
  const semanticMatches = new Set<ProgramWithUniversity>();
  
  Object.entries(semanticMappings).forEach(([key, synonyms]) => {
    if (queryLower.includes(key) || synonyms.some(synonym => queryLower.includes(synonym))) {
      const relatedPrograms = allPrograms.filter(program => {
        const programText = `${program.name} ${program.university?.name || ''} ${program.degree} ${program.studyField}`.toLowerCase();
        return synonyms.some(synonym => programText.includes(synonym)) || programText.includes(key);
      });
      relatedPrograms.forEach(program => semanticMatches.add(program));
    }
  });

  // Combine fuzzy results with semantic matches
  const combinedResults = [...fuzzyResults, ...Array.from(semanticMatches)];
  
  // Remove duplicates and sort by relevance
  const uniqueResults = combinedResults.filter((program, index, self) => 
    index === self.findIndex(p => p.id === program.id)
  );
  
  return uniqueResults;
}