import { ReactNode, useState } from "react";
import StudentSidebar from "@/polymet/components/student-sidebar";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
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
