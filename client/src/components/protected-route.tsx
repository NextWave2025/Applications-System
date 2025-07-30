import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { queryClient } from "../lib/queryClient";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [authGracePeriod, setAuthGracePeriod] = useState(true);

  // Extended grace period for auth state propagation after registration
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthGracePeriod(false);
    }, 1000); // Extended delay to prevent race conditions
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Enhanced debug logging
    console.log("=== PROTECTED ROUTE CHECK DEBUG ===", {
      hasUser: !!user,
      isLoading,
      userRole: user?.role,
      currentPath: window.location.pathname,
      location,
      authGracePeriod,
      queryData: queryClient.getQueryData(["/api/user"])
    });

    // Only redirect after grace period and when not loading
    if (!isLoading && !user && !authGracePeriod) {
      console.log("=== PROTECTED ROUTE REDIRECT DEBUG ===");
      console.log("User not authenticated, current location:", location);
      console.log("Redirecting to appropriate auth page");
      
      // Store the intended destination for post-login redirect
      if (redirectTo && !location.startsWith("/auth")) {
        localStorage.setItem("redirectAfterLogin", redirectTo);
      }
      
      // Determine appropriate auth page based on current path
      if (location.startsWith("/admin")) {
        console.log("Redirecting to admin auth");
        setLocation("/auth/admin");
      } else if (location.startsWith("/agent-dashboard") || location.startsWith("/dashboard")) {
        console.log("Redirecting to agent auth");
        setLocation("/auth/agent");
      } else if (location.startsWith("/student-dashboard")) {
        console.log("Redirecting to student auth");
        setLocation("/auth/student");
      } else {
        // Default to student auth for general public pages
        console.log("Redirecting to default student auth");
        setLocation("/auth/student");
      }
    } else if (!isLoading && user) {
      console.log("=== PROTECTED ROUTE ALLOW ACCESS ===");
      console.log("User authenticated:", user.role, "at location:", location);
    }
  }, [user, isLoading, setLocation, redirectTo, location, authGracePeriod]);

  // Show loading while checking authentication or during grace period
  if (isLoading || authGracePeriod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (only after grace period)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}