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
    intake: string[] | string;
    scholarship: boolean;
  };
}

export default function ProgramCard({ className, program }: ProgramCardProps) {
  const formatIntake = (intake: string[] | string | undefined) => {
    if (Array.isArray(intake) && intake.length > 0) {
      return intake.join(', ');
    } else if (typeof intake === 'string') {
      return intake;
    }
    return "September";
  };

  const formatTuition = (tuition: number) => {
    const formattedValue = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(tuition);
    return formattedValue.replace("AED", "").trim() + " AED/yr";
  };

  return (
    <div className={`bg-white border rounded-lg overflow-hidden shadow-sm ${className || ""}`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">{program.universityName || "University"}</span>
          </div>
          {program.scholarship && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Scholarship Available
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-4">{program.name}</h3>
        
        <div className="grid grid-cols-2 gap-y-2 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm">{program.degreeLevel}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{program.duration}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{formatIntake(program.intake)}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">
              {program.tuitionFee ? formatTuition(program.tuitionFee) : "Contact for info"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Link 
            to={`/programs/${program.id}`} 
            className="text-sm font-medium text-gray-700 hover:text-primary"
          >
            View Details
          </Link>
          <button className="p-2 rounded-full text-gray-400 hover:text-primary focus:outline-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}