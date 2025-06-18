import { Link } from "wouter";
import { type ProgramWithUniversity } from "@shared/schema";

interface ProgramCardNewProps {
  program: ProgramWithUniversity;
  isSelected?: boolean;
  onSelectionChange?: (programId: number, selected: boolean) => void;
  showSelection?: boolean;
}

export default function ProgramCardNew({ 
  program, 
  isSelected = false, 
  onSelectionChange, 
  showSelection = false 
}: ProgramCardNewProps) {
  
  const formatTuition = (tuition: string) => {
    if (!tuition || tuition === "0 AED/year") {
      return "Contact for pricing";
    }
    // Extract numbers from string to handle different formats
    const numericValue = tuition.replace(/[^0-9]/g, '');
    if (numericValue && numericValue !== "0") {
      const formattedValue = new Intl.NumberFormat('en-US').format(parseInt(numericValue));
      return `AED ${formattedValue}`;
    }
    return tuition;
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "Duration not specified";
    return duration.replace(/years?/g, 'years').replace(/year$/g, 'years');
  };

  const formatIntake = (intake: string) => {
    if (!intake) return "Contact for intake";
    return intake;
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelectionChange) {
      onSelectionChange(program.id, e.target.checked);
    }
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Selection checkbox */}
      {showSelection && (
        <div className="absolute top-3 right-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      )}

      {/* Program content */}
      <Link href={`/programs/${program.id}`}>
        <div className="p-6 cursor-pointer">
          {/* University logo and name */}
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-sm mr-3 flex items-center justify-center">
              {program.university?.imageUrl ? (
                <img
                  src={program.university.imageUrl}
                  alt={program.university.name}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              )}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {program.university?.name || 'University'}
            </span>
          </div>

          {/* Program title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
            {program.name}
          </h3>

          {/* Program details grid */}
          <div className="space-y-3">
            {/* Degree level */}
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span>{program.degree || "Degree"}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDuration(program.duration)}</span>
            </div>

            {/* Tuition fee */}
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="font-semibold text-gray-900">{formatTuition(program.tuition)}</span>
            </div>

            {/* Intake */}
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatIntake(program.intake)}</span>
            </div>
          </div>

          {/* Scholarship badge */}
          {program.hasScholarship && (
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Scholarship Available
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}