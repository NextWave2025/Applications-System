import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  // Example stats - this would come from an API in a real app
  const stats = {
    totalApplications: 25,
    pendingReviews: 8,
    approvedApplications: 12,
    activeAgents: 5,
    totalStudents: 45,
    totalUniversities: 17
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Total Applications</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Pending Reviews</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Approved Applications</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.approvedApplications}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Student Name {item}</p>
                      <p className="text-xs text-gray-500">Program Name {item}</p>
                    </div>
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Under Review</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                View All Applications
              </button>
            </div>
          </div>
        </div>
        
        {/* Universities */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Universities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">University Name {item}</p>
                      <p className="text-xs text-gray-500">{5 + item} programs</p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary/80 text-sm">
                    View
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                View All Universities
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}