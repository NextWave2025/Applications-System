import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ProgramDetailTabs from "../components/program-detail-tabs";
import { useState } from "react";

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  
  const { data: program, isLoading } = useQuery({
    queryKey: ['/api/programs', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>
          
          {/* Title skeleton */}
          <div className="h-10 w-2/3 bg-gray-200 rounded mb-8"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* University info skeleton */}
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="ml-4 space-y-2">
                      <div className="h-6 w-48 bg-gray-200 rounded"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                
                {/* Tabs skeleton */}
                <div className="border-b">
                  <div className="flex overflow-x-auto space-x-6 px-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-10 w-32 bg-gray-200 rounded my-3"></div>
                    ))}
                  </div>
                </div>
                
                {/* Tab content skeleton */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar skeleton */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
                
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Program not found</h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            The program you're looking for doesn't exist or has been removed. Please check the URL or go back to browse all programs.
          </p>
          <div className="mt-6">
            <Link to="/programs" className="btn-primary">
              Browse All Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProgram = () => {
    setIsSaved(!isSaved);
    // In a real app, you would make an API call to save/unsave the program
  };

  // Check if program.intake is an array before using join
  const displayIntake = program.intake
    ? Array.isArray(program.intake)
      ? program.intake.join(', ')
      : program.intake
    : "Not specified";

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
          {/* Left content - tabs section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* University information */}
              {(program.universityName || program.universityLogo) && (
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    {program.universityLogo ? (
                      <img 
                        src={program.universityLogo} 
                        alt={program.universityName || "University logo"} 
                        className="h-16 w-auto"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900">{program.universityName || "University"}</h2>
                      <p className="text-gray-600">{program.universityLocation || "United Arab Emirates"}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Program detail tabs */}
              <ProgramDetailTabs 
                program={{
                  description: program.description || "No description available for this program. Please contact the university directly for more information about this program.",
                  entryRequirements: Array.isArray(program.entryRequirements) ? program.entryRequirements : ["Information not available."],
                  documentsNeeded: Array.isArray(program.documentsNeeded) ? program.documentsNeeded : ["Information not available."],
                  tuitionFee: program.tuitionFee || 0
                }}
              />
            </div>
            
            {/* Similar programs section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Programs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
                    <div className="flex items-start">
                      {program.universityLogo ? (
                        <img 
                          src={program.universityLogo} 
                          alt={program.universityName || "University"} 
                          className="h-10 w-auto mt-1"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded mt-1">
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">
                          {program.name && program.name.includes('BSc') 
                            ? program.name.replace('BSc', 'MSc') 
                            : program.name && program.name.includes('Bachelor') 
                              ? program.name.replace('Bachelor', 'Master') 
                              : `Similar Program ${item}`}
                        </h3>
                        <p className="text-sm text-gray-500">{program.universityName || "University"}</p>
                        <div className="mt-2 flex items-center">
                          <span className="text-sm font-medium text-primary">View Details</span>
                          <svg className="ml-1 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right sidebar - program details */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Program Overview</h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3 border-b">
                  <p className="text-sm text-gray-500">Degree Level</p>
                  <p className="font-medium">{program.degreeLevel || "Not specified"}</p>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{program.duration || "Not specified"}</p>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b">
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
                
                <div className="flex justify-between items-center pb-3 border-b">
                  <p className="text-sm text-gray-500">Intake</p>
                  <p className="font-medium">{displayIntake}</p>
                </div>
                
                <div className="flex justify-between items-center pb-3">
                  <p className="text-sm text-gray-500">Application Fee</p>
                  <p className="font-medium">AED 500</p>
                </div>
                
                {program.scholarship && (
                  <div className="py-3 px-4 bg-green-50 rounded-md flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-800 font-medium">Scholarship Available</span>
                  </div>
                )}
              </div>
              
              <div className="mt-8 space-y-4">
                <button className="btn-primary w-full flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Apply Now
                </button>
                <button 
                  className="btn-secondary w-full flex items-center justify-center"
                  onClick={handleSaveProgram}
                >
                  {isSaved ? (
                    <>
                      <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Save Program
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-6 flex items-center justify-center">
                <button className="text-sm text-gray-600 flex items-center hover:text-primary transition-colors">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need Help? Contact an Advisor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}