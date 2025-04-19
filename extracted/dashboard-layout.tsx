import DashboardSidebar from "@/polymet/components/dashboard-sidebar";
import { ReactNode, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div
        className={`flex-1 overflow-auto transition-all ${
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <div className="container py-6">{children}</div>
      </div>
    </div>
  );
}
