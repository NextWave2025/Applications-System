import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Polymet</h1>
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
                to="/dashboard/commissions"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-white/10"
              >
                Commissions
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
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">Welcome, Agent</span>
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
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