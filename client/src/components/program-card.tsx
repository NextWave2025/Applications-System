import { Link } from "react-router-dom";

interface ProgramCardProps {
  className?: string;
  program: {
    id: number;
    name: string;
    university: number;
    universityName?: string;
    universityLogo?: string;
    degreeLevel: string;
    duration: string;
    tuitionFee: number;
    intake: string[];
    scholarship: boolean;
  };
}

export default function ProgramCard({ className, program }: ProgramCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className || ""}`}>
      <div className="p-6">
        {program.universityLogo && (
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-md overflow-hidden bg-gray-100 mr-2">
              <img
                src={program.universityLogo}
                alt={program.universityName || "University logo"}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-sm text-gray-600">{program.universityName}</span>
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link to={`/programs/${program.id}`} className="hover:text-primary">
            {program.name}
          </Link>
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {program.degreeLevel}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {program.duration}
          </span>
          {program.scholarship && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Scholarship Available
            </span>
          )}
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Tuition Fee</span>
            <span className="text-sm font-medium">
              {program.tuitionFee 
                ? new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'AED',
                    maximumFractionDigits: 0
                  }).format(program.tuitionFee)
                : "Contact for info"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Intake</span>
            <span className="text-sm font-medium">
              {program.intake && Array.isArray(program.intake) && program.intake.length > 0 
                ? program.intake.join(', ') 
                : program.intake || "Contact for info"}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/programs/${program.id}`}
            className="btn-primary flex-1 text-center"
          >
            View Details
          </Link>
          <button
            type="button"
            className="flex-none p-2 border border-gray-300 rounded-md text-gray-500 hover:text-primary hover:border-primary"
            aria-label="Save program"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}