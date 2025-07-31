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

  // Extended grace period for auth state propagation after login/registration
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthGracePeriod(false);
    }, 1500); // Increased delay for protected route synchronization
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Enhanced debug logging
    console.log("=== PROTECTED ROUTE CHECK ===", {
      hasUser: !!user,
      userRole: user?.role,
      isLoading,
      authGracePeriod,
      currentPath: window.location.pathname,
      location,
      cacheData: queryClient.getQueryData(["/api/user"]),
      timestamp: new Date().toISOString()
    });

    // Check for auth transition bypass
    const isInAuthTransition = sessionStorage.getItem('authTransition');
    
    if (isInAuthTransition && !user && !isLoading) {
      console.log("=== AUTH TRANSITION ACTIVE - WAITING ===");
      return; // Don't redirect during auth transition
    }

    // Only redirect after grace period and when not loading
    if (!isLoading && !user && !authGracePeriod) {
      console.log("=== PROTECTED ROUTE REDIRECT DEBUG ===");
      console.log("Protected route redirecting - no user after grace period");
      console.log("Current location:", location);
      
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
      // Clear auth transition flag when user is confirmed
      sessionStorage.removeItem('authTransition');
    }
  }, [user, isLoading, setLocation, redirectTo, location, authGracePeriod]);

  // Show loading while checking authentication, during grace period, or auth transition
  const isInAuthTransition = sessionStorage.getItem('authTransition');
  
  if (isLoading || authGracePeriod || (isInAuthTransition && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary-600">
            {isInAuthTransition ? "Completing authentication..." : "Verifying authentication..."}
          </p>
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