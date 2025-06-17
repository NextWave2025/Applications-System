import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function SettingsPage() {
  const navigate = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  
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

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.agencyName || user?.username || "Agent";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Settings</h1>
          <p className="text-gray-600">
            Manage your profile information, security settings, and notification preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                  {user.username?.charAt(0) || 'A'}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-800">{displayName}</div>
                  <div className="text-sm text-gray-600">{user.username}</div>
                </div>
              </div>

              <nav>
                <ul className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
                  <li className="flex-shrink-0">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`w-full text-left px-4 py-2 rounded-md whitespace-nowrap ${
                        activeTab === "profile"
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Profile Information
                    </button>
                  </li>
                  <li className="flex-shrink-0">
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`w-full text-left px-4 py-2 rounded-md whitespace-nowrap ${
                        activeTab === "security"
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Security
                    </button>
                  </li>
                  <li className="flex-shrink-0">
                    <button
                      onClick={() => setActiveTab("notifications")}
                      className={`w-full text-left px-4 py-2 rounded-md whitespace-nowrap ${
                        activeTab === "notifications"
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Notifications
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                          placeholder="Your first name"
                          defaultValue={user.firstName || ""}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                          placeholder="Your last name"
                          defaultValue={user.lastName || ""}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary bg-gray-50"
                        value={user.username}
                        disabled
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Your email address is your username and cannot be changed.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Agency Name
                      </label>
                      <input
                        id="agencyName"
                        type="text"
                        className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Your agency name"
                        defaultValue={user.agencyName || ""}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          id="country"
                          type="text"
                          className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                          placeholder="Your country"
                          defaultValue={user.country || ""}
                        />
                      </div>
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          id="phoneNumber"
                          type="text"
                          className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                          placeholder="Your phone number"
                          defaultValue={user.phoneNumber || ""}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        id="website"
                        type="text"
                        className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Your agency website"
                        defaultValue={user.website || ""}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
                  
                  <form className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            id="currentPassword"
                            type="password"
                            className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            id="newPassword"
                            type="password"
                            className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            id="confirmPassword"
                            type="password"
                            className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h2>
                  
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium text-gray-800">Application Updates</h3>
                          <p className="text-sm text-gray-600">Receive notifications about application status changes</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="applicationUpdates"
                            type="checkbox"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="applicationUpdates" className="ml-2 text-sm text-gray-700">
                            Enabled
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium text-gray-800">New Programs</h3>
                          <p className="text-sm text-gray-600">Get notified when new programs are added</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="newPrograms"
                            type="checkbox"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="newPrograms" className="ml-2 text-sm text-gray-700">
                            Enabled
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium text-gray-800">Commission Updates</h3>
                          <p className="text-sm text-gray-600">Receive notifications about commission payments</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="commissionUpdates"
                            type="checkbox"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="commissionUpdates" className="ml-2 text-sm text-gray-700">
                            Enabled
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">Marketing Materials</h3>
                          <p className="text-sm text-gray-600">Receive updates about new marketing resources</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="marketingMaterials"
                            type="checkbox"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="marketingMaterials" className="ml-2 text-sm text-gray-700">
                            Enabled
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}