import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { ApplicationWithDetails, ApplicationStatus } from "@shared/schema";

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch applications with added logging
  const { 
    data: applications, 
    isLoading, 
    isError,
    refetch 
  } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
    staleTime: 60000, // 1 minute
    retry: 3,
    enabled: !!user, // Only fetch if user is authenticated
  });

  // Log applications state for debugging
  console.log("Applications state:", { user, isLoading, isError, applications });
  
  // Log application data when it changes
  if (applications) {
    console.log("Successfully fetched applications:", applications);
  }
  
  // Log error when it occurs
  if (isError) {
    console.error("Error fetching applications");
  }

  // Filter applications based on status
  const filteredApplications = applications?.filter(app => 
    filterStatus ? app.status === filterStatus : true
  );

  // Render status badge with appropriate color
  const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
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
        color = "bg-orange-100 text-orange-800";
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
          onClick={() => navigate("/auth", { state: { redirectTo: "/dashboard/applications" } })}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Manage and track your student applications</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-2">
        <span className="text-sm text-gray-500">Filter by status:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-3 py-1 text-xs rounded-full border ${
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
              className={`px-3 py-1 text-xs rounded-full border ${
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Applications</h2>
          <p className="text-red-600 mb-4">There was a problem loading your applications. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : applications && applications.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications?.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
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
                    <StatusBadge status={application.status as ApplicationStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()} ({formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => navigate(`/dashboard/applications/${application.id}`)}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/applications/${application.id}/edit`)}
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
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
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
              onClick={() => navigate("/programs")}
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