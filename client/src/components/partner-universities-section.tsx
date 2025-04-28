import React from 'react';
import { useQuery } from "@tanstack/react-query";

interface University {
  id: number;
  name: string;
  location: string;
  imageUrl?: string;
}

export default function PartnerUniversitiesSection() {
  const { data: universities = [], isLoading } = useQuery<University[]>({
    queryKey: ['/api/universities'],
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Partner Universities</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We work with the top universities across the UAE
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {isLoading ? (
            // Loading placeholders
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded animate-pulse flex items-center justify-center"></div>
            ))
          ) : (
            // Actual university logos
            universities.slice(0, 6).map((university, index: number) => (
              <div 
                key={index} 
                className="h-16 bg-white rounded shadow-sm hover:shadow-md transition-shadow flex items-center justify-center p-2"
              >
                {/* 
                  University logos should be placed in the client/src/assets/university-logos/ folder
                  and named with the university ID or a consistent naming pattern 
                */}
                {university.imageUrl ? (
                  <img 
                    src={university.imageUrl} 
                    alt={university.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-sm text-gray-700 p-2">
                    {university.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Note: Place university logo images in the 
            <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">client/src/assets/university-logos/</code> 
            folder
          </p>
        </div>
      </div>
    </section>
  );
}