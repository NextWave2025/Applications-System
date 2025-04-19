import { Link } from "wouter";
import { type ProgramWithUniversity } from "@shared/schema";

interface ProgramCardProps {
  program: ProgramWithUniversity;
  className?: string;
}

export default function ProgramCard({ program, className }: ProgramCardProps) {
  return (
    <div className={`h-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="relative h-48 bg-gray-100">
        <img 
          src={program.imageUrl} 
          alt={program.name}
          className="h-full w-full object-cover"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        {/* University details */}
        <div className="absolute top-3 left-3 flex items-center">
          <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className="flex h-6 w-6 items-center justify-center rounded-full overflow-hidden bg-white">
              <img
                src={program.university.imageUrl}
                alt={program.university.name}
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="text-xs font-medium text-white">{program.university.name}</span>
          </div>
        </div>
        
        {/* Scholarship badge */}
        {program.hasScholarship && (
          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            Scholarship Available
          </div>
        )}
        
        {/* Program title */}
        <div className="absolute bottom-0 left-0 w-full p-3">
          <h3 className="font-bold text-lg text-white line-clamp-2">{program.name}</h3>
        </div>
      </div>
      
      <div className="bg-white p-4">
        {/* Program details */}
        <div className="grid grid-cols-2 gap-y-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">Degree</p>
            <p className="text-sm font-medium">{program.degree}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium">{program.duration}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tuition Fee</p>
            <p className="text-sm font-medium text-primary">{program.tuition}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Intake</p>
            <p className="text-sm font-medium">{program.intake}</p>
          </div>
        </div>
        
        {/* CTA */}
        <div className="flex justify-between items-center">
          <Link 
            href={`/programs/${program.id}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            View Details
          </Link>
          
          <button 
            className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
            </svg>
            <span className="sr-only">Save program</span>
          </button>
        </div>
      </div>
    </div>
  );
}
