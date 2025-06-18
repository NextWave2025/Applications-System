import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ApplicationWithDetails, ApplicationStatus } from "@shared/schema";

export default function DashboardPage() {
  const [location, navigate] = useLocation();
  
  // Fetch current user data
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Fetch user's applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
    enabled: !!user, // Only fetch if user is logged in
    retry: 1,
  });
  
  // Determine overall loading state
  const isLoading = isLoadingUser || isLoadingApplications;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate("/auth");
    }
  }, [isLoadingUser, user, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's an error or no user (and not currently redirecting), show error
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">Please log in to access this page.</p>
        <button
          onClick={() => navigate("/auth")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Calculate active applications (not in completed states)
  const activeApplicationsCount = applications?.filter(app => 
    !["approved", "rejected", "completed"].includes(app.status)
  ).length || 0;
  
  // Calculate completed applications
  const completedApplicationsCount = applications?.filter(app => 
    ["approved", "rejected", "completed"].includes(app.status)
  ).length || 0;

  // Get recent applications, sorted by creation date
  const recentApplications = applications ? 
    [...applications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5) : [];

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "draft": return "bg-gray-200 text-gray-800";
      case "submitted": return "bg-blue-200 text-blue-800";
      case "under-review": return "bg-yellow-200 text-yellow-800";
      case "approved": return "bg-green-200 text-green-800";
      case "rejected": return "bg-red-200 text-red-800";
      case "incomplete": return "bg-orange-200 text-orange-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user.agencyName || user.username}</h1>
          <p className="text-gray-600">
            This is your agent dashboard where you can manage your applications, explore programs, and update your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-primary mb-2">{activeApplicationsCount}</div>
            <div className="text-lg font-medium text-gray-800">Active Applications</div>
            <div className="mt-2">
              <button 
                onClick={() => navigate("/dashboard/applications")}
                className="text-sm text-primary hover:underline"
              >
                View all applications
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-primary mb-2">{completedApplicationsCount}</div>
            <div className="text-lg font-medium text-gray-800">Completed Applications</div>
            <div className="mt-2">
              <button 
                onClick={() => navigate("/dashboard/applications")}
                className="text-sm text-primary hover:underline"
              >
                View completed applications
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium text-gray-800">{app.program.name}</div>
                    <div className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(app.status)}`}>
                      {app.status.replace('-', ' ')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {app.studentFirstName} {app.studentLastName} • {app.program.universityName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Submitted on {format(new Date(app.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button 
                  onClick={() => navigate("/dashboard/applications")}
                  className="text-sm text-primary hover:underline"
                >
                  View all applications
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 italic">
              No recent activity to display. Start by browsing programs and submitting applications.
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer flex flex-col h-full"
              onClick={() => navigate("/programs")}
            >
              <h3 className="font-semibold text-gray-800 mb-2">Browse Programs</h3>
              <p className="text-gray-600 text-sm">
                Explore over 900 programs from top UAE universities.
              </p>
            </div>
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer flex flex-col h-full"
              onClick={() => navigate("/dashboard/settings")}
            >
              <h3 className="font-semibold text-gray-800 mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 text-sm">
                Add your agency details to enhance your partnership opportunities.
              </p>
            </div>
          </div>
        </div>
        
        {/* Admin Section - Only visible to admin users */}
        {user.role === "admin" && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Controls</h2>
            <p className="text-gray-600 mb-4">
              You have administrator privileges. Access the admin dashboard to manage users, applications, and view system statistics.
            </p>
            <button 
              onClick={() => navigate("/admin")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Go to Admin Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}