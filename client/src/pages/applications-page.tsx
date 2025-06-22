import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { formatDistanceToNow, format } from "date-fns";
import { ApplicationStatus } from "@shared/schema";
import { apiRequest } from "../lib/query-client";

// Helper function to format dates consistently
function formatDate(dateString: string | Date): { formatted: string; relative: string } {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return {
    formatted: format(date, 'PPP'), // 'Apr 29, 2023'
    relative: formatDistanceToNow(date, { addSuffix: true }) // '3 days ago'
  };
}

// Define types for application data
type ApplicationProgram = {
  name: string;
  universityName: string;
  universityLogo: string;
  degree: string;
};

type Application = {
  id: number;
  userId: number;
  programId: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  studentDateOfBirth: string;
  studentNationality: string;
  studentGender: string;
  highestQualification: string;
  qualificationName: string;
  institutionName: string;
  graduationYear: string;
  cgpa: string;
  intakeDate: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  program: ApplicationProgram;
  documents: any[];
};

export default function ApplicationsPage() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load applications manually
  useEffect(() => {
    async function fetchApplications() {
      if (!user) return;
      
      setIsLoading(true);
      setIsError(false);
      
      try {
        console.log("Fetching applications manually...");
        const response = await apiRequest("GET", "/api/applications");
        const data = await response.json();
        console.log("Manually fetched applications:", data);
        setApplications(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setIsError(true);
        setErrorMessage(error instanceof Error ? error.message : "Failed to load applications");
        setIsLoading(false);
      }
    }
    
    fetchApplications();
  }, [user]);

  // Filter applications based on status
  const filteredApplications = applications.filter(app => 
    filterStatus ? app.status === filterStatus : true
  );

  // Render status badge with appropriate color
  const StatusBadge = ({ status }: { status: string }) => {
    let color: string;
    let label: string;

    switch (status) {
      case "draft":
        color = "bg-gray-100 text-gray-800";
        label = "Draft";
        break;
      case "submitted":
        color = "bg-blue-100 text-blue-800";
        label = "Submitted";
        break;
      case "under-review":
        color = "bg-yellow-100 text-yellow-800";
        label = "Under Review";
        break;
      case "approved":
        color = "bg-green-100 text-green-800";
        label = "Approved";
        break;
      case "rejected":
        color = "bg-red-100 text-red-800";
        label = "Rejected";
        break;
      case "incomplete":
        color = "bg-blue-100 text-blue-800";
        label = "Incomplete";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
        label = status;
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your applications.</p>
        <button
          onClick={() => setLocation("/auth", { state: { redirectTo: "/dashboard/applications" } })}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and track your student applications</p>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Filter by status:</span>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => setFilterStatus(null)}
              className={`px-2 sm:px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === null 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {["draft", "submitted", "under-review", "approved", "rejected", "incomplete"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2 sm:px-3 py-1 text-xs rounded-full border transition-colors ${
                  filterStatus === status 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {status === "draft" ? "Draft" : ""}
                {status === "submitted" ? "Submitted" : ""}
                {status === "under-review" ? "Under Review" : ""}
                {status === "approved" ? "Approved" : ""}
                {status === "rejected" ? "Rejected" : ""}
                {status === "incomplete" ? "Incomplete" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Applications</h2>
          <p className="text-red-600 mb-4">
            {errorMessage || "There was a problem loading your applications. Please try again later."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : applications.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr 
                  key={application.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setLocation(`/dashboard/applications/${application.id}/edit`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {application.program?.universityLogo ? (
                        <img 
                          src={application.program.universityLogo} 
                          alt={application.program.universityName} 
                          className="h-10 w-10 mr-3 object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-500">
                          {application.program?.universityName?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{application.program?.name}</div>
                        <div className="text-sm text-gray-500">{application.program?.universityName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.studentFirstName} {application.studentLastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={application.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(application.createdAt).formatted}
                    <span className="text-xs text-gray-400 ml-1">
                      ({formatDate(application.createdAt).relative})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(application.updatedAt).formatted}
                    <span className="text-xs text-gray-400 ml-1">
                      ({formatDate(application.updatedAt).relative})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from triggering
                        setLocation(`/dashboard/applications/${application.id}`);
                      }}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from triggering
                        setLocation(`/dashboard/applications/${application.id}/edit`);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredApplications.map((application) => (
              <div 
                key={application.id}
                className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/dashboard/applications/${application.id}/edit`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1 min-w-0">
                    {application.program?.universityLogo ? (
                      <img 
                        src={application.program.universityLogo} 
                        alt={application.program.universityName} 
                        className="h-8 w-8 mr-3 object-contain flex-shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
                        {application.program?.universityName?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{application.program?.name}</div>
                      <div className="text-xs text-gray-500 truncate">{application.program?.universityName}</div>
                    </div>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Student:</span>
                    <span className="text-sm text-gray-900">{application.studentFirstName} {application.studentLastName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Submitted:</span>
                    <span className="text-xs text-gray-700">{formatDate(application.createdAt).relative}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Updated:</span>
                    <span className="text-xs text-gray-700">{formatDate(application.updatedAt).relative}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/dashboard/applications/${application.id}`);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/dashboard/applications/${application.id}/edit`);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start by creating your first student application.</p>
          <div className="mt-6">
            <button
              onClick={() => setLocation("/programs")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Browse Programs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}