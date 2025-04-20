import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ProgramWithUniversity } from "@shared/schema";

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch program details from the API
  const { data: program, isLoading, isError } = useQuery<ProgramWithUniversity>({
    queryKey: [`/api/programs/${id}`],
    enabled: !!id,
  });

  // Manually fetch program details for reliability
  useEffect(() => {
    if (id) {
      console.log("Manually fetching program details for ID:", id);
      fetch(`/api/programs/${id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Manually fetched program details:", data);
          queryClient.setQueryData([`/api/programs/${id}`], data);
        })
        .catch(err => {
          console.error("Error manually fetching program details:", err);
        });
    }
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-6"></div>
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Program Not Found</h2>
            <p className="text-gray-600 mb-6">The program you're looking for could not be found or has been removed.</p>
            <Link to="/programs" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
              Back to All Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-primary">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link to="/programs" className="hover:text-primary">Programs</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">{program.name}</span>
            </li>
          </ol>
        </nav>
        
        {/* Program title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{program.name}</h1>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content - program details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Program Details</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsSaved(!isSaved)} 
                    className={`p-2 rounded-full ${isSaved ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary'}`}
                  >
                    <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">
                  No description available for this program. Please contact the university directly for more information.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Entry Requirements</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {program.requirements && Array.isArray(program.requirements) && program.requirements.length > 0 ? (
                    program.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))
                  ) : (
                    <li>Information not available.</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Field of Study</h3>
                <p className="text-gray-700">{program.studyField}</p>
              </div>
            </div>
          </div>
          
          {/* Right sidebar - application details */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Degree Level</span>
                  <span className="font-medium text-gray-900">{program.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{program.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intake</span>
                  <span className="font-medium text-gray-900">{program.intake}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuition Fee</span>
                  <span className="font-medium text-gray-900">{program.tuition}</span>
                </div>
                {program.hasScholarship && (
                  <div className="flex items-center text-green-600 mt-2">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Scholarship Available</span>
                  </div>
                )}
              </div>
              <button className="w-full mt-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                Apply Now
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">University Information</h3>
              <div className="flex items-center mb-4">
                {program.university?.imageUrl ? (
                  <img 
                    src={program.university.imageUrl} 
                    alt={program.university.name} 
                    className="h-12 w-12 mr-4 object-contain"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded-full mr-4"></div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{program.university?.name}</h4>
                  <p className="text-sm text-gray-600">{program.university?.location}</p>
                </div>
              </div>
              <Link to={`/universities/${program.universityId}`} className="text-primary hover:underline text-sm font-medium">
                View University Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}