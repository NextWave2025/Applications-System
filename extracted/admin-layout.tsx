import { ReactNode, useState } from "react";
import AdminSidebar from "@/polymet/components/admin-sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
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
