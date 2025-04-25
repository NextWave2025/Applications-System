import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Handle clicking outside profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/"; // Fully reload to clear React Query cache
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Display name logic
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.agencyName || user?.username || "Agent";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Guide</h1>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            <li>
              <Link 
                to="/dashboard"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-white/10"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard/programs"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-white/10"
              >
                Programs
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard/applications"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-white/10"
              >
                Applications
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard/settings"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-white/10"
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <div className="flex items-center" ref={profileRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span className="text-sm text-gray-600 mr-2">Welcome, {displayName}</span>
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center uppercase font-semibold">
                    {user?.username?.charAt(0) || 'A'}
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}