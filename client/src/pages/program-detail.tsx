import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ProgramDetailTabs from "../components/program-detail-tabs";

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: program, isLoading } = useQuery({
    queryKey: ['/api/programs', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Program not found</h2>
        <p className="mt-2 text-gray-600">The program you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{program.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {program.universityLogo && (
              <div className="p-6 border-b">
                <div className="flex items-center">
                  <img 
                    src={program.universityLogo} 
                    alt={program.universityName} 
                    className="h-16 w-auto"
                  />
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">{program.universityName}</h2>
                    <p className="text-gray-600">{program.universityLocation}</p>
                  </div>
                </div>
              </div>
            )}
            
            <ProgramDetailTabs 
              program={{
                description: program.description || "No description available.",
                entryRequirements: program.entryRequirements || ["Information not available."],
                documentsNeeded: program.documentsNeeded || ["Information not available."],
                tuitionFee: program.tuitionFee || 0
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Overview</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Degree Level</p>
                <p className="font-medium">{program.degreeLevel || "Not specified"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{program.duration || "Not specified"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Tuition Fee</p>
                <p className="font-medium">
                  {program.tuitionFee 
                    ? new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'AED',
                        maximumFractionDigits: 0
                      }).format(program.tuitionFee)
                    : "Not specified"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Intake</p>
                <p className="font-medium">
                  {program.intake && program.intake.length > 0 
                    ? program.intake.join(', ') 
                    : "Not specified"}
                </p>
              </div>
              
              {program.scholarship && (
                <div className="mt-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Scholarship Available
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <button className="btn-primary w-full">Apply Now</button>
              <button className="btn-secondary w-full mt-4">Save Program</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}