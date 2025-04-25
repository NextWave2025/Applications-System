import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  BookOpen, 
  FileText, 
  Settings, 
  Menu, 
  ChevronLeft,
  LogOut,
  User
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Check if a link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Programs", path: "/dashboard/programs", icon: <BookOpen size={20} /> },
    { name: "Applications", path: "/dashboard/applications", icon: <FileText size={20} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-primary text-white p-2 rounded-md"
        >
          <Menu size={20} />
        </button>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:relative z-30 h-full bg-primary text-white transition-all duration-300 ease-in-out
          ${sidebarExpanded ? 'w-64' : 'w-16'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex justify-between items-center p-4">
          <h1 className={`font-bold transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100 text-xl' : 'opacity-0 w-0 overflow-hidden'}`}>
            Guide
          </h1>
          <button 
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="text-white hover:bg-white/10 p-1 rounded-md"
          >
            <ChevronLeft size={20} className={`transform transition-transform duration-300 ${sidebarExpanded ? '' : 'rotate-180'}`} />
          </button>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`flex items-center py-2.5 px-3 rounded transition duration-200 hover:bg-white/10
                    ${isActiveLink(item.path) ? 'bg-white/20' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span 
                    className={`ml-3 transition-all duration-200 whitespace-nowrap 
                      ${sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
            <li className="lg:hidden">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full py-2.5 px-3 rounded transition duration-200 hover:bg-white/10 text-white"
              >
                <span className="flex-shrink-0"><LogOut size={20} /></span>
                <span 
                  className={`ml-3 transition-all duration-200 whitespace-nowrap text-left
                    ${sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}
                >
                  Sign out
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-16">
        <header className="bg-white border-b shadow-sm">
          <div className="flex items-center justify-end px-6 py-4">
            <div className="flex items-center" ref={profileRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center uppercase font-semibold">
                    {user?.username?.charAt(0) || 'A'}
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Home size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}