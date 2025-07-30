import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log("User not authenticated, redirecting to appropriate auth page");
      // Store the intended destination for post-login redirect
      if (redirectTo && !location.startsWith("/auth")) {
        localStorage.setItem("redirectAfterLogin", redirectTo);
      }
      
      // Determine appropriate auth page based on current path
      if (location.startsWith("/admin")) {
        setLocation("/auth/admin");
      } else if (location.startsWith("/agent-dashboard") || location.startsWith("/dashboard")) {
        setLocation("/auth/agent");
      } else if (location.startsWith("/student-dashboard")) {
        setLocation("/auth/student");
      } else {
        // Default to student auth for general public pages
        setLocation("/auth/student");
      }
    }
  }, [user, isLoading, setLocation, redirectTo, location]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}