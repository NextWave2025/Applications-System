import { Link } from "wouter";
import { type ProgramWithUniversity } from "@shared/schema";

interface ProgramCardProps {
  program: ProgramWithUniversity;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div className="program-card bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
      <div className="h-40 bg-gray-200 relative">
        <img 
          src={program.imageUrl} 
          alt={program.university.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-50"></div>
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-bold">{program.university.name}</h3>
          <div className="flex items-center text-white text-xs">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{program.university.location}</span>
          </div>
        </div>
        {program.hasScholarship && (
          <div className="absolute top-3 right-3 bg-[#28A745] text-white text-xs py-1 px-2 rounded">
            Scholarship
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-bold text-lg mb-2">{program.name}</h4>
        <div className="flex flex-wrap gap-y-2 mb-3">
          <div className="w-1/2 flex items-start">
            <i className="fas fa-money-bill-wave text-gray-500 mr-2 mt-1"></i>
            <div>
              <p className="text-xs text-gray-500">Tuition Fee</p>
              <p className="text-sm font-medium">{program.tuition}</p>
            </div>
          </div>
          <div className="w-1/2 flex items-start">
            <i className="fas fa-clock text-gray-500 mr-2 mt-1"></i>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-medium">{program.duration}</p>
            </div>
          </div>
          <div className="w-1/2 flex items-start">
            <i className="fas fa-calendar-alt text-gray-500 mr-2 mt-1"></i>
            <div>
              <p className="text-xs text-gray-500">Intake</p>
              <p className="text-sm font-medium">{program.intake}</p>
            </div>
          </div>
          <div className="w-1/2 flex items-start">
            <i className="fas fa-graduation-cap text-gray-500 mr-2 mt-1"></i>
            <div>
              <p className="text-xs text-gray-500">Degree</p>
              <p className="text-sm font-medium">{program.degree.replace(/'/g, '\'')}</p>
            </div>
          </div>
        </div>
        <Link href={`/programs/${program.id}`}>
          <button className="w-full bg-primary text-white py-2 rounded font-medium hover:bg-opacity-90 transition">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
