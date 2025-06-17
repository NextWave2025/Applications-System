import { useState } from "react";
import { type ProgramWithUniversity } from "@shared/schema";

interface SelectableProgramCardProps {
  program: ProgramWithUniversity;
  isSelected: boolean;
  onSelectionChange: (programId: number, selected: boolean) => void;
}

export default function SelectableProgramCard({ program, isSelected, onSelectionChange }: SelectableProgramCardProps) {
  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange(program.id, e.target.checked);
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Selection checkbox */}
      <div className="absolute top-3 right-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectionChange}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      {/* Program image */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg relative overflow-hidden">
        {program.imageUrl ? (
          <img
            src={program.imageUrl}
            alt={program.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div className={`${program.imageUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Program</p>
          </div>
        </div>

        {/* University logo overlay */}
        {program.university?.imageUrl && (
          <div className="absolute bottom-2 left-2">
            <img
              src={program.university.imageUrl}
              alt={program.university.name}
              className="w-10 h-10 bg-white rounded-full p-1 shadow-sm object-contain"
            />
          </div>
        )}
      </div>

      {/* Program details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {program.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{program.university?.name || 'University'}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <span>{program.degree || 'Degree'}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{program.duration || 'Duration not specified'}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="font-medium text-gray-900">{program.tuition || 'Contact for pricing'}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{program.intake || 'Contact for intake information'}</span>
          </div>
        </div>

        {/* Scholarship badge */}
        {program.hasScholarship && (
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Scholarship Available
            </span>
          </div>
        )}
      </div>
    </div>
  );
}