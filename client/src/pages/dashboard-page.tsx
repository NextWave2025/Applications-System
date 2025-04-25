import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Fetch current user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's an error or no user (and not currently redirecting), show error
  if (error || !user) {
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user.agencyName || user.username}</h1>
          <p className="text-gray-600">
            This is your agent dashboard where you can manage your applications, student profiles, and university partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-lg font-medium text-gray-800">Active Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-lg font-medium text-gray-800">Partner Universities</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-lg font-medium text-gray-800">Pending Commission</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="text-gray-600 italic">
            No recent activity to display. Start by browsing programs and submitting applications.
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate("/programs")}
            >
              <h3 className="font-semibold text-gray-800 mb-2">Browse Programs</h3>
              <p className="text-gray-600 text-sm">
                Explore over 900 programs from top UAE universities.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold text-gray-800 mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 text-sm">
                Add your agency details to enhance your partnership opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}