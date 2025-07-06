import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  FileText, 
  Settings, 
  Menu, 
  ChevronLeft,
  LogOut,
  User,
  Users,
  School,
  BookOpen,
  Building,
  TrendingUp,
  Shield
} from "lucide-react";
import NextWaveLogo from "@/components/nextwave-logo";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

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
    return location === path || location.startsWith(path + "/");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <Home size={20} /> },
    { name: "My Applications", path: "/admin/my-applications", icon: <FileText size={20} /> },
    { name: "Universities", path: "/admin/universities", icon: <Building size={20} /> },
    { name: "Programs", path: "/admin/programs", icon: <BookOpen size={20} /> },
    { name: "Agents", path: "/admin/agents", icon: <Users size={20} /> },
    { name: "Students", path: "/admin/students", icon: <School size={20} /> },
    { name: "Analytics", path: "/admin/analytics", icon: <TrendingUp size={20} /> },
    { name: "Admin Control", path: "/admin/control", icon: <Shield size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header with Menu Toggle and NextWave Logo */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-primary text-white px-4 py-3 flex justify-between items-center shadow-md">
        <NextWaveLogo size="sm" className="text-white" />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 rounded-md hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:relative z-30 h-full bg-primary text-white transition-all duration-300 ease-in-out
          ${sidebarExpanded ? 'w-64' : 'w-16'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:mt-0 mt-16`}
      >
        {/* Desktop Logo/Title */}
        <div className="hidden lg:flex justify-between items-center p-4 border-b border-white/10">
          <div className={`transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            <NextWaveLogo size="md" className="text-white" />
          </div>
          <button 
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="text-white hover:bg-white/10 p-1 rounded-md transition-colors"
          >
            <ChevronLeft size={20} className={`transform transition-transform duration-300 ${sidebarExpanded ? '' : 'rotate-180'}`} />
          </button>
        </div>
        
        <nav className="mt-4 lg:mt-8">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`flex items-center py-3 px-3 rounded-lg transition duration-200 hover:bg-white/10
                    ${isActiveLink(item.path) ? 'bg-white/20 font-medium' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex-shrink-0 min-w-[20px]">{item.icon}</span>
                  <span 
                    className={`ml-3 transition-all duration-200 whitespace-nowrap text-sm lg:text-base
                      ${sidebarExpanded ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden opacity-100'}`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
            <li className="lg:hidden border-t border-white/10 mt-4 pt-4">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full py-3 px-3 rounded-lg transition duration-200 hover:bg-white/10 text-white"
              >
                <span className="flex-shrink-0 min-w-[20px]"><LogOut size={20} /></span>
                <span className="ml-3 text-sm">Sign out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white border-b shadow-sm">
          <div className="flex items-center justify-end px-4 xl:px-6 py-4 w-full">
            <div className="flex items-center" ref={profileRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center uppercase font-semibold text-sm">
                    {(user as any)?.username?.charAt(0) || 'A'}
                  </div>
                  <span className="hidden xl:inline-block">{(user as any)?.username || 'Admin'}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border z-50">
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Home size={16} className="mr-2" />
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      User Dashboard
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}